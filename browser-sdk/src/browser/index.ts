import { AxiosInstance } from 'axios';
import {
  Abi,
  createPublicClient,
  createWalletClient,
  custom,
  erc20Abi,
  erc721Abi,
  formatEther,
  Hex,
  http,
  isAddress,
  parseEther,
  parseUnits,
  PublicClient,
  sha256,
  toHex,
  WalletClient,
  WriteContractParameters,
  zeroAddress,
} from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import {
  axiosClientInit,
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
  ClaimWithdrawalTransactionResponse,
  ConstructorParams,
  ContractWithdrawal,
  decryptedToWASMTx,
  DEVNET_ENV,
  EncryptedDataItem,
  FetchTransactionsRequest,
  FetchWithdrawalsResponse,
  getPkFromMnemonic,
  INTMAXClient,
  IntMaxEnvironment,
  IntMaxTxBroadcast,
  jsTransferToTransfer,
  LiquidityAbi,
  localStorageManager,
  MAINNET_ENV,
  networkMessage,
  PrepareDepositTransactionRequest,
  PrepareDepositTransactionResponse,
  PrepareEstimateDepositTransactionRequest,
  randomBytesHex,
  retryWithAttempts,
  SDKUrls,
  SignMessageResponse,
  sleep,
  TESTNET_ENV,
  Token,
  TokenBalance,
  TokenBalancesResponse,
  TokenFetcher,
  TokenType,
  Transaction,
  TransactionFetcher,
  transactionMapper,
  TransactionStatus,
  TransactionType,
  WaitForTransactionConfirmationRequest,
  WaitForTransactionConfirmationResponse,
  wasmTxToTx,
  WithdrawalResponse,
  WithdrawalsStatus,
  WithdrawRequest,
} from '../shared';
import {
  Config,
  decrypt_deposit_data,
  decrypt_transfer_data,
  decrypt_tx_data,
  generate_intmax_account_from_eth_key,
  get_user_data,
  initSync,
  JsGenericAddress,
  JsTransfer,
  JsTxRequestMemo,
  JsTxResult,
  JsUserData,
  prepare_deposit,
  query_and_finalize,
  send_tx_request,
  sync,
  sync_withdrawals,
} from '../wasm/browser/intmax2_wasm_lib';
import wasmBytes from '../wasm/browser/intmax2_wasm_lib_bg.wasm?url';

export class IntMaxClient implements INTMAXClient {
  readonly #config: Config;
  readonly #tokenFetcher: TokenFetcher;
  readonly #txFetcher: TransactionFetcher;
  readonly #walletClient: WalletClient;
  readonly #publicClient: PublicClient;
  readonly #vaultHttpClient: AxiosInstance;
  #privateKey: string = '';
  #userData: JsUserData | undefined;
  #urls: SDKUrls;

  isLoggedIn: boolean = false;
  address: string = '';
  tokenBalances: TokenBalance[] = [];

  constructor({ async_params, environment }: ConstructorParams) {
    if (typeof async_params === 'undefined') {
      throw new Error('Cannot be called directly');
    }
    initSync(async_params);

    this.#walletClient = createWalletClient({
      chain: environment === 'mainnet' ? mainnet : sepolia,
      transport: custom(window.ethereum!),
    });

    this.#publicClient = createPublicClient({
      chain: environment === 'mainnet' ? mainnet : sepolia,
      transport: http(),
    });

    this.#vaultHttpClient = axiosClientInit({
      baseURL:
        environment === 'mainnet'
          ? MAINNET_ENV.key_vault_url
          : environment === 'testnet'
            ? TESTNET_ENV.key_vault_url
            : DEVNET_ENV.key_vault_url,
    });

    this.#urls = environment === 'mainnet' ? MAINNET_ENV : environment === 'testnet' ? TESTNET_ENV : DEVNET_ENV;
    this.#config = this.#generateConfig(environment);
    this.#txFetcher = new TransactionFetcher(environment);
    this.#tokenFetcher = new TokenFetcher(environment);
  }

  static async init({ environment }: ConstructorParams): Promise<IntMaxClient> {
    try {
      const bytes = await fetch(wasmBytes).then((response) => {
        return response.arrayBuffer();
      });
      return new IntMaxClient({ async_params: bytes, environment });
    } catch (e) {
      console.error(e);
      throw new Error('Failed to load wasm');
    }
  }

  async login() {
    this.isLoggedIn = false;

    await this.#walletClient.requestAddresses();

    const [address] = await this.#walletClient.getAddresses();
    const signNetwork = await this.#walletClient.signMessage({
      account: address,
      message: networkMessage(address),
    });

    const data = await this.#vaultHttpClient.post<
      {},
      {
        message: string;
      }
    >('/challenge', {
      address,
      type: 'login',
    });

    const challengeSignature = await this.#walletClient.signMessage({
      account: address,
      message: data.message,
    });

    const { hashedSignature } = await this.#vaultHttpClient.post<
      {},
      {
        hashedSignature: string;
        encryptedEntropy: string;
      }
    >('/wallet/login', {
      address,
      challengeSignature,
      securitySeed: sha256(signNetwork),
    });

    await this.#entropy(signNetwork, hashedSignature);

    this.isLoggedIn = true;

    return {
      address: this.address,
      isLoggedIn: this.isLoggedIn,
    };
  }

  async getPrivateKey(): Promise<string> {
    const [address] = await this.#walletClient.getAddresses();

    const signNetwork = await this.#walletClient.signMessage({
      account: address,
      message: networkMessage(address),
    });

    try {
      const valid = await this.#publicClient.verifyMessage({
        address: address,
        message: networkMessage(address),
        signature: signNetwork,
      });
      if (valid) {
        return this.#privateKey;
      }
    } catch (e) {
      console.error(e);
    }

    throw Error('Signature is wrong');
  }

  async fetchTokenBalances(): Promise<TokenBalancesResponse> {
    if (!this.isLoggedIn) {
      throw Error('Not logged in');
    }
    const userData = await this.#fetchUserData();

    let tokens = this.#tokenFetcher.tokens;
    if (tokens.length === 0) {
      tokens = await this.#tokenFetcher.fetchTokens();
    }

    const nftIds = userData.balances.reduce((acc, tb): number[] => {
      const token = tokens.find((t) => t.tokenIndex === tb.token_index);

      if (!token) {
        return [...acc, tb.token_index];
      }
      return acc;
    }, [] as number[]);

    const nftTokensResponse = await this.#tokenFetcher.getTokensById(nftIds);
    const nftTokens = nftTokensResponse.reduce((acc, { result, status }, idx): Token[] => {
      if (status !== 'success') {
        return acc;
      }
      return [
        ...acc,
        {
          price: 0,
          tokenIndex: nftIds[idx],
          tokenType: result.tokenType,
          contractAddress: result.tokenAddress,
        } as Token,
      ];
    }, [] as Token[]);

    const balances = userData.balances.map((balance): TokenBalance => {
      const token = tokens.find((t) => t.tokenIndex === balance.token_index);

      if (!token) {
        const nftToken = nftTokens.find((t) => t.tokenIndex === balance.token_index);
        return {
          token: nftToken as Token,
          amount: BigInt(balance.amount),
        };
      }

      return {
        token: { ...token, tokenType: token.tokenIndex !== 0 ? TokenType.ERC20 : TokenType.NATIVE },
        amount: BigInt(balance.amount),
      };
    });

    return {
      balances,
    };
  }

  async broadcastTransaction(
    rawTransfers: BroadcastTransactionRequest[],
    isWithdrawal: boolean = false,
  ): Promise<BroadcastTransactionResponse> {
    if (!this.isLoggedIn) {
      throw Error('Not logged in');
    }

    const transfers = rawTransfers.map((transfer) => {
      const salt = `0x${randomBytesHex(32)}`;
      let amount = `${transfer.amount}`;
      if (transfer.token.decimals) {
        amount = parseUnits(transfer.amount.toString(), transfer.token.decimals).toString();
      }

      if (isWithdrawal) {
        if (!isAddress(transfer.address)) {
          throw Error('Invalid address to withdraw');
        }

        return new JsTransfer(
          new JsGenericAddress(!isWithdrawal, transfer.address),
          transfer.token.tokenIndex,
          amount,
          salt,
        );
      }

      if (!isWithdrawal && isAddress(transfer.address)) {
        throw Error('Invalid address to transfer');
      }

      return new JsTransfer(
        new JsGenericAddress(!isWithdrawal, transfer.address),
        transfer.token.tokenIndex,
        amount,
        salt,
      );
    });

    let privateKey = '';
    try {
      privateKey = await this.getPrivateKey();
    } catch (e) {
      console.error(e);
      throw Error('No private key found');
    }

    let memo: JsTxRequestMemo;
    try {
      // send the tx request
      memo = (await send_tx_request(
        this.#config,
        this.#urls.block_builder_url,
        privateKey,
        transfers,
      )) as JsTxRequestMemo;

      if (!memo) {
        throw new Error('Failed to send tx request');
      }

      memo.tx();
    } catch (e) {
      console.error(e);
      throw new Error('Failed to send tx request');
    }

    let tx: JsTxResult | undefined;
    try {
      tx = await query_and_finalize(this.#config, this.#urls.block_builder_url, privateKey, memo);
    } catch (e) {
      console.error(e);
      throw new Error('Failed to finalize tx');
    }

    if (isWithdrawal) {
      await sleep(40000);
      await sync_withdrawals(this.#config, privateKey);
    }

    return {
      txTreeRoot: tx.tx_tree_root,
      transferUUIDs: tx.transfer_uuids,
      withdrawalUUIDs: tx.withdrawal_uuids,
    };
  }

  // Send/Withdrawals
  async fetchTransactions(_params: FetchTransactionsRequest): Promise<Transaction[]> {
    this.#checkAllowanceToExecuteMethod();

    const data = await this.#txFetcher.fetchTx({
      address: this.address,
    });
    const pendingWithdrawals = await this.#txFetcher.fetchPendingWithdrawals(this.address);

    return this.#decryptTransactionData(data, TransactionType.Send, pendingWithdrawals);
  }

  // Receive
  async fetchTransfers(_params: FetchTransactionsRequest): Promise<Transaction[]> {
    this.#checkAllowanceToExecuteMethod();

    const data = await this.#txFetcher.fetchTransfers({
      address: this.address,
    });

    return this.#decryptTransactionData(data, TransactionType.Receive);
  }

  // Deposit
  async fetchDeposits(_params: FetchTransactionsRequest): Promise<Transaction[]> {
    this.#checkAllowanceToExecuteMethod();

    const data = await this.#txFetcher.fetchDeposits({
      address: this.address,
    });
    return this.#decryptTransactionData(data, TransactionType.Deposit);
  }

  async withdraw({ amount, address, token }: WithdrawRequest): Promise<WithdrawalResponse> {
    return this.broadcastTransaction(
      [
        {
          amount,
          address,
          token,
        },
      ],
      true,
    );
  }

  async logout(): Promise<void> {
    this.isLoggedIn = false;
    this.#privateKey = '';
    this.address = '';
    this.#userData = undefined;
    await this.#vaultHttpClient.post('/wallet/logout', {});
    return;
  }

  async estimateDepositGas(params: PrepareEstimateDepositTransactionRequest): Promise<bigint> {
    const txConfig = await this.#prepareDepositToken(params);

    if (txConfig.functionName !== 'depositNativeToken') {
      const isValidApproval = await this.#validateApproval({
        tokenAddress: txConfig.args?.[0] as `0x${string}`,
        amount: BigInt(txConfig.args?.[2] as string),
        functionName: txConfig.functionName,
      });

      if (!isValidApproval) {
        switch (txConfig.functionName) {
          case 'depositERC20':
            await this.#getAllowance(txConfig.args?.[0] as `0x${string}`, BigInt(txConfig.args?.[2] as string));
            break;
          case 'depositERC721':
          case 'depositERC1155':
            await this.#checkApproval(txConfig.args?.[0] as `0x${string}`);
            break;
        }
      }
    }

    const estimatedGas = await this.#publicClient.estimateContractGas({
      address: txConfig.address,
      abi: txConfig.abi,
      functionName: txConfig.functionName,
      args: txConfig.args,
      account: txConfig.account as `0x${string}`,
      value: txConfig.value,
    });

    const gasPrice = await this.#publicClient.getGasPrice();

    return parseEther((gasPrice ?? 0n * estimatedGas).toString());
  }

  async deposit(params: PrepareDepositTransactionRequest): Promise<PrepareDepositTransactionResponse> {
    const txConfig = await this.#prepareDepositToken({ ...params, isGasEstimation: false });

    const depositHash = await this.#walletClient.writeContract(txConfig);

    let status: TransactionStatus = TransactionStatus.Processing;
    while (status === TransactionStatus.Processing) {
      await sleep(3000);
      try {
        const tx = await this.#publicClient.getTransactionReceipt({
          hash: depositHash,
        });
        if (tx) {
          status = tx.status === 'success' ? TransactionStatus.Completed : TransactionStatus.Rejected;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return {
      status,
      txHash: depositHash,
    };
  }

  async fetchPendingWithdrawals(): Promise<FetchWithdrawalsResponse> {
    return this.#txFetcher.fetchPendingWithdrawals(this.address);
  }

  async claimWithdrawal(needClaimWithdrawals: ContractWithdrawal[]): Promise<ClaimWithdrawalTransactionResponse> {
    const [address] = await this.#walletClient.getAddresses();

    const withdrawalsToClaim = needClaimWithdrawals
      .filter((w) => w.recipient.toLowerCase() === address.toLowerCase())
      .map((w) => ({
        ...w,
        amount: BigInt(w.amount),
        tokenIndex: BigInt(w.tokenIndex),
      }));
    if (withdrawalsToClaim.length === 0) {
      throw new Error('No withdrawals to claim');
    }

    await sleep(500);

    try {
      const txHash = await this.#walletClient.writeContract({
        address: this.#config.liquidity_contract_address as `0x${string}`,
        abi: LiquidityAbi,
        functionName: 'claimWithdrawals',
        args: [withdrawalsToClaim],
        account: address as `0x${string}`,
        chain: this.#walletClient.chain,
      });

      let status: TransactionStatus = TransactionStatus.Processing;
      while (status === TransactionStatus.Processing) {
        await sleep(1500);
        try {
          const tx = await this.#publicClient.getTransactionReceipt({
            hash: txHash,
          });
          if (tx) {
            status = tx.status === 'success' ? TransactionStatus.Completed : TransactionStatus.Rejected;
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (status === TransactionStatus.Rejected) {
        throw new Error('Transaction rejected');
      }

      return {
        status: TransactionStatus.Completed,
        txHash,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  waitForTransactionConfirmation(
    _params: WaitForTransactionConfirmationRequest,
  ): Promise<WaitForTransactionConfirmationResponse> {
    throw Error('Not implemented!');
  }

  signMessage(_data: string): Promise<SignMessageResponse> {
    throw Error('Not implemented!');
  }

  async getTokensList(): Promise<Token[]> {
    if (!this.#tokenFetcher.tokens) {
      return this.#tokenFetcher.fetchTokens();
    }
    return this.#tokenFetcher.tokens;
  }

  // PRIVATE METHODS
  #generateConfig(env: IntMaxEnvironment): Config {
    const urls = env === 'mainnet' ? MAINNET_ENV : env === 'testnet' ? TESTNET_ENV : DEVNET_ENV;

    return new Config(
      urls.store_vault_server_url,
      urls.balance_prover_url,
      urls.block_validity_prover_url,
      urls.withdrawal_aggregator_url,
      BigInt(60), // Deposit Timeout
      BigInt(60), // Tx timeout
      // ---------------------
      BigInt(10), // Block Builder Request Interval
      BigInt(6), // Block Builder Request Limit
      BigInt(5), // Block Builder Query Wait Time
      BigInt(5), // Block Builder Query Interval
      BigInt(20), // Block Builder Query Limit
      // ---------------------
      urls.rpc_url_l1, // L1 RPC URL
      BigInt(urls.chain_id_l1), // L1 Chain ID
      urls.liquidity_contract, // Liquidity Contract Address
      urls.rpc_url_l2, // L2 RPC URL
      BigInt(urls.chain_id_l2), // L2 Chain ID
      urls.rollup_contract, // Rollup Contract Address
      BigInt(urls.rollup_contract_deployed_block_number), // Rollup Contract Deployed Block Number
    );
  }

  #checkAllowanceToExecuteMethod() {
    if (!this.isLoggedIn && !this.address) {
      throw Error('Not logged in');
    }

    if (!this.#userData) {
      throw Error('User data not found');
    }
  }

  async #decryptTransactionData(
    data: EncryptedDataItem[],
    variant: TransactionType,
    pendingWithdrawals?: Record<WithdrawalsStatus, ContractWithdrawal[]>,
  ): Promise<Transaction[]> {
    const rawTransactions = data.map((t) => transactionMapper(t, variant));
    const txsPromises = rawTransactions.map(async (tx) => {
      switch (tx.txType) {
        case TransactionType.Deposit:
        case TransactionType.Mining:
          return await decrypt_deposit_data(this.#privateKey, tx.data);
        case TransactionType.Send:
        case TransactionType.Withdraw:
          return await decrypt_tx_data(this.#privateKey, tx.data);
        case TransactionType.Receive:
          return await decrypt_transfer_data(this.#privateKey, tx.data);
      }
    });
    const decryptedData = await Promise.all(txsPromises);
    const formattedTxs = decryptedData.map((tx, idx) =>
      decryptedToWASMTx(tx, rawTransactions[idx].uuid, rawTransactions[idx].txType, rawTransactions[idx].timestamp),
    );

    const tokens = await this.#tokenFetcher.fetchTokens();

    return formattedTxs
      .map((tx) => wasmTxToTx(tx, this.#userData as unknown as JsUserData, tokens, pendingWithdrawals))
      .filter(Boolean) as Transaction[];
  }

  async #entropy(networkSignedMessage: `0x${string}`, hashedSignature: string) {
    const securitySeed = sha256(networkSignedMessage);
    const entropyPreImage = (securitySeed + hashedSignature.slice(2)) as Hex;
    const entropy = sha256(entropyPreImage);
    const hdKey = getPkFromMnemonic(entropy);
    if (!hdKey) {
      throw Error('No key found');
    }

    const keySet = await generate_intmax_account_from_eth_key(toHex(hdKey));

    if (!keySet) {
      throw new Error('No key found');
    }

    this.address = keySet.pubkey;
    this.#privateKey = keySet.privkey;

    return;
  }

  async #fetchUserData(): Promise<JsUserData> {
    const prevFetchData = localStorageManager.getItem<
      {
        fetchDate: number;
        address: string;
      }[]
    >('user_data_fetch');
    const prevFetchDateObj = prevFetchData?.find((data) => data.address.toLowerCase() === this.address.toLowerCase());

    if (prevFetchDateObj && prevFetchDateObj.address.toLowerCase() === this.address.toLowerCase()) {
      const prevFetchDate = prevFetchDateObj.fetchDate;
      const currentDate = new Date().getTime();
      const diff = currentDate - prevFetchDate;
      if (diff < 180_000 && this.#userData) {
        console.info('Skipping user data fetch');
        return this.#userData;
      } else if (diff < 180_000) {
        console.info('Fetching user data without sync');
        const userdata = await get_user_data(this.#config, this.#privateKey);
        this.#userData = userdata;

        return userdata;
      }
    }

    try {
      // sync the account's balance proof
      await retryWithAttempts(
        () => {
          return sync(this.#config, this.#privateKey);
        },
        10000,
        5,
      );
      console.info('Synced account balance proof');

      // sync withdrawals
      await retryWithAttempts(
        () => {
          return sync_withdrawals(this.#config, this.#privateKey);
        },
        10000,
        5,
      );
      console.info('Synced withdrawals');
    } catch (e) {
      console.info('Failed to sync account balance proof', e);
    }

    const userData = await get_user_data(this.#config, this.#privateKey);
    this.#userData = userData;

    const prevFetchDataArr =
      prevFetchData?.filter((data) => data.address.toLowerCase() !== this.address?.toLowerCase()) ?? [];
    prevFetchDataArr.push({
      fetchDate: Date.now(),
      address: this.address,
    });
    localStorageManager.setItem('user_data_fetch', prevFetchDataArr);

    return userData;
  }

  async #prepareDepositToken({ token, isGasEstimation, amount, address }: PrepareEstimateDepositTransactionRequest) {
    const accounts = await this.#walletClient.getAddresses();
    const salt = isGasEstimation
      ? randomBytesHex(16)
      : await this.#depositToAccount({
          depositor: accounts[0],
          pubkey: address,
          amountInDecimals:
            token.tokenType === TokenType.NATIVE
              ? parseEther(`${amount}`)
              : token.tokenType === TokenType.ERC20
                ? parseUnits(`${amount}`, token.decimals ?? 18)
                : BigInt(amount),
          tokenIndex: token.tokenIndex,
          token_type: token.tokenType,
          token_address: token.contractAddress as `0x${string}`,
        });

    return this.#prepareTransaction({
      salt,
      tokenType: token.tokenType,
      amountInWei:
        token.tokenType === TokenType.NATIVE
          ? parseEther(`${amount}`)
          : token.tokenType === TokenType.ERC20
            ? parseUnits(`${amount}`, token.decimals ?? 18)
            : BigInt(amount),
      tokenAddress: token.contractAddress,
      tokenId: token.tokenIndex,
      account: accounts[0],
    });
  }

  #prepareTransaction({
    salt,
    tokenType,
    amountInWei,
    tokenAddress,
    tokenId,
    account,
  }: {
    salt: string;
    tokenType: TokenType;
    amountInWei: bigint | string;
    tokenAddress: string;
    tokenId: number;
    account: `0x${string}`;
  }) {
    const returnObj: WriteContractParameters = {
      args: [],
      functionName: '',
      account,
      chain: this.#publicClient.chain,
      abi: LiquidityAbi as Abi,
      address: this.#config.liquidity_contract_address as `0x${string}`,
      value: 0n,
    };
    switch (tokenType) {
      case TokenType.NATIVE:
        returnObj.functionName = 'depositNativeToken';
        returnObj.args = [salt];
        returnObj.value = BigInt(amountInWei);
        break;
      case TokenType.ERC20:
        returnObj.functionName = 'depositERC20';
        returnObj.args = [tokenAddress, salt, amountInWei];
        break;
      case TokenType.ERC721:
        returnObj.functionName = 'depositERC721';
        returnObj.args = [tokenAddress, salt, tokenId];
        break;
      case TokenType.ERC1155:
        returnObj.functionName = 'depositERC1155';
        returnObj.args = [tokenAddress, salt, tokenId, amountInWei];
        break;
    }
    return returnObj;
  }

  async #depositToAccount({
    tokenIndex,
    amountInDecimals,
    pubkey,
    token_type,
    token_address,
    depositor,
  }: Required<IntMaxTxBroadcast>) {
    const depositResult = await prepare_deposit(
      this.#config,
      depositor,
      pubkey,
      amountInDecimals.toString(),
      token_type,
      token_address,
      tokenIndex.toString(),
      token_type === TokenType.NATIVE
        ? [0.1, 0.5, 1.0].includes(Number(parseEther(amountInDecimals.toString())))
        : false,
    );
    if (!depositResult) {
      throw new Error('Failed to prepare deposit');
    }
    return depositResult.deposit_data.pubkey_salt_hash;
  }

  async #validateApproval({
    tokenAddress,
    amount,
    functionName,
  }: {
    tokenAddress: `0x${string}`;
    amount: bigint;
    functionName: string;
  }): Promise<boolean> {
    let isApproved = false;
    const addresses = await this.#walletClient.getAddresses();

    // Check if we need to approve the contract to spend the token
    try {
      if (functionName === 'depositERC20') {
        const currentAllowance = await this.#publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [addresses[0], this.#config.liquidity_contract_address as `0x${string}`],
        });

        isApproved = currentAllowance >= amount;
      } else if (functionName === 'depositERC721' || functionName === 'depositERC1155') {
        isApproved = await this.#publicClient.readContract({
          address: tokenAddress,
          abi: erc721Abi,
          functionName: 'isApprovedForAll',
          args: [addresses[0], this.#config.liquidity_contract_address as `0x${string}`],
        });
      }
    } catch (e) {
      console.error(e);
      throw e;
    }

    return isApproved;
  }

  async #getAllowance(tokenAddress: `0x${string}`, amount: bigint) {
    const addresses = await this.#walletClient.getAddresses();

    const currentAllowance = await this.#publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [addresses[0], this.#config.liquidity_contract_address as `0x${string}`],
    });

    if (currentAllowance < amount) {
      try {
        const approveTx = await this.#walletClient.writeContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [this.#config.liquidity_contract_address as `0x${string}`, amount],
          account: addresses[0],
          chain: this.#walletClient.chain,
        });

        await this.#publicClient.waitForTransactionReceipt({
          hash: approveTx,
        });
      } catch (approveError) {
        console.error('Approval failed', approveError);
        throw approveError;
      }
    }
  }

  async #checkApproval(tokenAddress: `0x${string}`) {
    const addresses = await this.#walletClient.getAddresses();

    const currentApproval = await this.#publicClient.readContract({
      address: tokenAddress,
      abi: erc721Abi,
      functionName: 'isApprovedForAll',
      args: [addresses[0], this.#config.liquidity_contract_address as `0x${string}`],
    });

    if (!currentApproval) {
      try {
        const approveTx = await this.#walletClient.writeContract({
          address: tokenAddress,
          abi: erc721Abi,
          functionName: 'setApprovalForAll',
          args: [this.#config.liquidity_contract_address as `0x${string}`, true],
          account: addresses[0],
          chain: this.#walletClient.chain,
        });

        await this.#publicClient.waitForTransactionReceipt({
          hash: approveTx,
        });
      } catch (approveError) {
        console.error('Approval failed', approveError);
        throw approveError;
      }
    }
  }
}
