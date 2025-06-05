import { AxiosInstance } from 'axios';
import {
  Abi,
  createPublicClient,
  createWalletClient,
  custom,
  erc20Abi,
  erc721Abi,
  http,
  isAddress,
  parseEther,
  parseUnits,
  PublicClient,
  sha256,
  WalletClient,
  WriteContractParameters,
} from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import {
  axiosClientInit,
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
  ClaimWithdrawalTransactionResponse,
  ConstructorParams,
  ContractWithdrawal,
  DEVNET_ENV,
  FeeResponse,
  FetchTransactionsRequest,
  FetchWithdrawalsResponse,
  generateEntropy,
  getPkFromEntropy,
  IndexerFetcher,
  INTMAXClient,
  IntMaxEnvironment,
  IntMaxTxBroadcast,
  LiquidityAbi,
  localStorageManager,
  LoginResponse,
  MAINNET_ENV,
  networkMessage,
  PredicateFetcher,
  PrepareDepositTransactionRequest,
  PrepareDepositTransactionResponse,
  PrepareEstimateDepositTransactionRequest,
  randomBytesHex,
  retryWithAttempts,
  SDKUrls,
  SignMessageResponse,
  sleep,
  spendFundsMessage,
  TESTNET_ENV,
  Token,
  TokenBalance,
  TokenBalancesResponse,
  TokenFetcher,
  TokenType,
  Transaction,
  TransactionFetcher,
  TransactionStatus,
  TransactionType,
  uint8ToBase64,
  WaitForTransactionConfirmationRequest,
  WaitForTransactionConfirmationResponse,
  wasmTxToTx,
  WithdrawalResponse,
  WithdrawRequest,
} from '../shared';
import { generateEncryptionKey } from '../shared/shared/generate-encryption-key';
import {
  await_tx_sendable,
  Config,
  fetch_deposit_history,
  fetch_transfer_history,
  fetch_tx_history,
  generate_fee_payment_memo,
  generate_intmax_account_from_eth_key,
  generate_withdrawal_transfers,
  get_user_data,
  initSync,
  JsFeeQuote,
  JsFlatG2,
  JsGenericAddress,
  JsMetaDataCursor,
  JsTransfer,
  JsTxRequestMemo,
  JsTxResult,
  JsUserData,
  JsWithdrawalTransfers,
  prepare_deposit,
  query_and_finalize,
  quote_claim_fee,
  quote_transfer_fee,
  quote_withdrawal_fee,
  send_tx_request,
  sign_message,
  sync,
  sync_claims,
  sync_withdrawals,
  verify_signature,
} from '../wasm/browser/intmax2_wasm_lib';
import wasmBytes from '../wasm/browser/intmax2_wasm_lib_bg.wasm?url';

export class IntMaxClient implements INTMAXClient {
  readonly #config: Config;
  readonly #tokenFetcher: TokenFetcher;
  readonly #indexerFetcher: IndexerFetcher;
  readonly #txFetcher: TransactionFetcher;
  readonly #walletClient: WalletClient;
  readonly #publicClient: PublicClient;
  readonly #vaultHttpClient: AxiosInstance;
  readonly #predicateFetcher: PredicateFetcher;
  readonly #urls: SDKUrls;
  #privateKey: string = '';
  #userData: JsUserData | undefined;

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

    this.#urls = environment === 'mainnet' ? MAINNET_ENV : environment === 'testnet' ? TESTNET_ENV : DEVNET_ENV;

    this.#vaultHttpClient = axiosClientInit({
      baseURL:
        environment === 'mainnet'
          ? MAINNET_ENV.key_vault_url
          : environment === 'testnet'
            ? TESTNET_ENV.key_vault_url
            : DEVNET_ENV.key_vault_url,
    });

    this.#config = this.#generateConfig(environment);
    this.#txFetcher = new TransactionFetcher(environment);
    this.#tokenFetcher = new TokenFetcher(environment);
    this.#indexerFetcher = new IndexerFetcher(environment);
    this.#predicateFetcher = new PredicateFetcher(environment);
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

  async login(): Promise<LoginResponse> {
    this.isLoggedIn = false;

    await this.#walletClient.requestAddresses();

    const [address] = await this.#walletClient.getAddresses();
    const signNetwork = await this.#walletClient.signMessage({
      account: address,
      message: networkMessage(address),
    });

    const challengeData = await this.#vaultHttpClient.post<
      {},
      {
        message: string;
        nonce?: string;
      }
    >('/challenge', {
      address,
      type: 'login',
    });

    const challengeSignature = await this.#walletClient.signMessage({
      account: address,
      message: challengeData.message,
    });

    const loginResponse = await this.#vaultHttpClient.post<
      {},
      {
        hashedSignature: string;
        encryptedEntropy: string;
        nonce: number;
        accessToken?: string;
      }
    >('/wallet/login', {
      address,
      challengeSignature,
      securitySeed: sha256(signNetwork),
    });

    await this.#entropy(signNetwork, loginResponse.hashedSignature);

    const encryptionKeyBytes = await generateEncryptionKey(signNetwork, loginResponse.nonce);
    const encryptionKey = uint8ToBase64(encryptionKeyBytes);

    this.isLoggedIn = true;

    return {
      address: this.address,
      isLoggedIn: this.isLoggedIn,
      nonce: loginResponse.nonce,
      encryptionKey,
      accessToken: loginResponse.accessToken,
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
    let pubKey = this.address;

    try {
      await this.getPrivateKey();
      privateKey = this.#privateKey;
      pubKey = this.address;
    } catch (e) {
      console.error(e);
      throw Error('No private key found');
    }

    let memo: JsTxRequestMemo;
    try {
      const fee = await quote_transfer_fee(this.#config, await this.#indexerFetcher.getBlockBuilderUrl(), pubKey, 0);

      if (!fee) {
        throw new Error('Failed to quote transfer fee');
      }

      let withdrawalTransfers: JsWithdrawalTransfers | undefined;

      if (isWithdrawal) {
        withdrawalTransfers = await generate_withdrawal_transfers(this.#config, transfers[0], 0, true);
      }

      await await_tx_sendable(this.#config, privateKey, transfers, fee);

      // send the tx request
      memo = await send_tx_request(
        this.#config,
        await this.#indexerFetcher.getBlockBuilderUrl(),
        privateKey,
        withdrawalTransfers ? withdrawalTransfers.transfers : transfers,
        generate_fee_payment_memo(
          withdrawalTransfers?.transfers ?? [],
          withdrawalTransfers?.withdrawal_fee_transfer_index,
          withdrawalTransfers?.claim_fee_transfer_index,
        ),
        fee,
      );

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
      tx = await query_and_finalize(this.#config, await this.#indexerFetcher.getBlockBuilderUrl(), privateKey, memo);
      await this.#indexerFetcher.fetchBlockBuilderUrl();
    } catch (e) {
      console.error(e);
      throw new Error('Failed to finalize tx');
    }

    if (isWithdrawal) {
      await sleep(40000);
      if (rawTransfers[0].claim_beneficiary) {
        try {
          await sync_claims(this.#config, privateKey, rawTransfers[0].claim_beneficiary, 0);
        } catch (e) {
          console.error(e);
          throw e;
        }
      }
      await sleep(40000);
      await retryWithAttempts(async () => await sync_withdrawals(this.#config, privateKey, 0), 1000, 5);
    }

    return {
      txTreeRoot: tx.tx_tree_root,
      transferDigests: tx.tx_data.transfer_digests,
    };
  }

  // Send/Withdrawals
  async fetchTransactions(_params: FetchTransactionsRequest): Promise<Transaction[]> {
    this.#checkAllowanceToExecuteMethod();

    const data = await fetch_tx_history(this.#config, this.#privateKey, new JsMetaDataCursor(null, 'desc'));

    return data.history
      .map((tx) => {
        return wasmTxToTx(
          {
            data: tx.data,
            meta: tx.meta,
            status: tx.status,
            txType: TransactionType.Send,
            free: tx.free,
          },
          this.#tokenFetcher.tokens,
        );
      })
      .filter(Boolean) as Transaction[];
  }

  // Receive
  async fetchTransfers(_params: FetchTransactionsRequest): Promise<Transaction[]> {
    this.#checkAllowanceToExecuteMethod();

    const data = await fetch_transfer_history(this.#config, this.#privateKey, new JsMetaDataCursor(null, 'desc'));

    return data.history
      .map((tx) => {
        return wasmTxToTx(
          {
            data: tx.data,
            meta: tx.meta,
            status: tx.status,
            txType: TransactionType.Receive,
            free: tx.free,
          },
          this.#tokenFetcher.tokens,
        );
      })
      .filter(Boolean) as Transaction[];
  }

  // Deposit
  async fetchDeposits(_params: FetchTransactionsRequest): Promise<Transaction[]> {
    this.#checkAllowanceToExecuteMethod();

    const data = await fetch_deposit_history(this.#config, this.#privateKey, new JsMetaDataCursor(null, 'desc'));

    return data.history
      .map((tx) => {
        return wasmTxToTx(
          {
            data: tx.data,
            meta: tx.meta,
            status: tx.status,
            txType: TransactionType.Deposit,
            free: tx.free,
          },
          this.#tokenFetcher.tokens,
        );
      })
      .filter(Boolean) as Transaction[];
  }

  async withdraw({ amount, address, token, claim_beneficiary }: WithdrawRequest): Promise<WithdrawalResponse> {
    return this.broadcastTransaction(
      [
        {
          amount,
          address,
          token,
          claim_beneficiary,
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

    return (gasPrice ?? 0n) * estimatedGas;
  }

  async deposit(params: PrepareDepositTransactionRequest): Promise<PrepareDepositTransactionResponse> {
    const address = params.address;
    if (params.token.tokenType === TokenType.ERC20) {
      // eslint-disable-next-line no-param-reassign
      params.token = await this.#tokenFetcher.getTokenChainInfo(params.token.contractAddress as `0x${string}`);
    }

    const txConfig = await this.#prepareDepositToken({ ...params, address, isGasEstimation: false });

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
    return this.#txFetcher.fetchPendingWithdrawals(this.#config, this.#privateKey);
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

  async signMessage(message: string): Promise<SignMessageResponse> {
    const data = Buffer.from(message);
    const signature = await sign_message(this.#privateKey, data);
    return signature.elements as SignMessageResponse;
  }

  async verifySignature(signature: SignMessageResponse, message: string | Uint8Array): Promise<boolean> {
    let data: Uint8Array;
    if (typeof message === 'string') {
      data = Buffer.from(message);
    } else {
      data = message;
    }

    const newSignature = new JsFlatG2(signature);
    return await verify_signature(newSignature, this.address, data);
  }

  async getTokensList(): Promise<Token[]> {
    if (!this.#tokenFetcher.tokens) {
      return this.#tokenFetcher.fetchTokens();
    }
    return this.#tokenFetcher.tokens;
  }

  async getTransferFee(): Promise<FeeResponse> {
    const transferFee = (await quote_transfer_fee(
      this.#config,
      await this.#indexerFetcher.getBlockBuilderUrl(),
      this.address as string,
      0,
    )) as JsFeeQuote;
    return {
      beneficiary: transferFee.beneficiary,
      fee: transferFee.fee,
      collateral_fee: transferFee.collateral_fee,
    };
  }

  async getWithdrawalFee(token: Token): Promise<FeeResponse> {
    const withdrawalFee = (await quote_withdrawal_fee(this.#config, token.tokenIndex, 0)) as JsFeeQuote;
    return {
      beneficiary: withdrawalFee.beneficiary,
      fee: withdrawalFee.fee,
      collateral_fee: withdrawalFee.collateral_fee,
    };
  }

  async getClaimFee(): Promise<FeeResponse> {
    const claim_fee = await quote_claim_fee(this.#config, 0);

    return {
      beneficiary: claim_fee.beneficiary,
      fee: claim_fee.fee,
      collateral_fee: claim_fee.collateral_fee,
    };
  }

  // PRIVATE METHODS
  #generateConfig(env: IntMaxEnvironment): Config {
    const urls = env === 'mainnet' ? MAINNET_ENV : env === 'testnet' ? TESTNET_ENV : DEVNET_ENV;

    const isFasterMining = env === 'devnet';
    return new Config(
      urls.store_vault_server_url,
      urls.balance_prover_url,
      urls.validity_prover_url,
      urls.withdrawal_aggregator_url,
      BigInt(180), // Deposit Timeout
      BigInt(80), // Tx timeout
      // ---------------------
      isFasterMining,
      BigInt(5), // Block Builder Query Wait Time
      BigInt(5), // Block Builder Query Interval
      BigInt(20), // Block Builder Query Limit
      // ---------------------
      urls.rpc_url_l1, // L1 RPC URL
      urls.liquidity_contract, // Liquidity Contract Address
      urls.rpc_url_l2, // L2 RPC URL
      urls.rollup_contract, // Rollup Contract Address
      urls.withdrawal_contract_address, // Withdrawal Contract Address
      true, // use_private_zkp_server
      true, // use_s3
      120, // private_zkp_server_max_retries
      5n, // private_zkp_server_retry_interval
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

  async #entropy(networkSignedMessage: `0x${string}`, hashedSignature: string) {
    const entropy = generateEntropy(networkSignedMessage as `0x${string}`, hashedSignature);
    const hdKey = getPkFromEntropy(entropy);
    if (!hdKey) {
      throw new Error("Can't get private key from mnemonic");
    }

    const keySet = await generate_intmax_account_from_eth_key(hdKey);

    this.address = keySet.pubkey;
    this.#privateKey = keySet.privkey;
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
          return sync_withdrawals(this.#config, this.#privateKey, 0);
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
    const amountStr = amount.toLocaleString('en-us', {
      maximumFractionDigits: token.decimals ?? 18,
      minimumFractionDigits: 0,
    });

    const amountInDecimals =
      token.tokenType === TokenType.NATIVE
        ? parseEther(`${amountStr}`)
        : token.tokenType === TokenType.ERC20
          ? parseUnits(`${amountStr}`, token.decimals ?? 18)
          : BigInt(amountStr);
    const salt = isGasEstimation
      ? randomBytesHex(16)
      : await this.#depositToAccount({
          amountInDecimals,
          depositor: accounts[0],
          pubkey: address,
          tokenIndex: token.tokenIndex,
          token_address: token.contractAddress as `0x${string}`,
          token_type: token.tokenType,
        });

    let amlPermission: `0x${string}` = '0x';
    if (!isGasEstimation) {
      const predicateBody = this.#predicateFetcher.generateBody({
        recipientSaltHash: salt,
        tokenType: token.tokenType,
        amountInWei: amountInDecimals,
        tokenAddress: token.contractAddress,
        tokenId: token.tokenIndex,
      });
      const [from] = await this.#walletClient.getAddresses();
      const predicateMessage = await this.#predicateFetcher.fetchPredicateSignature({
        data: predicateBody,
        from: from as `0x${string}`,
        to: this.#urls.predicate_contract_address as `0x${string}`,
        msg_value: token.tokenType === TokenType.NATIVE ? amountInDecimals.toString() : '0',
      });

      if (!predicateMessage.is_compliant) {
        throw new Error('AML check failed');
      }

      amlPermission = this.#predicateFetcher.encodePredicateSignature(predicateMessage);
    }

    return this.#prepareTransaction({
      recipientSaltHash: salt,
      tokenType: token.tokenType,
      amountInWei: amountInDecimals,
      tokenAddress: token.contractAddress,
      tokenId: token.tokenIndex,
      account: accounts[0],
      amlPermission,
    });
  }

  #prepareTransaction({
    recipientSaltHash,
    tokenType,
    amountInWei,
    tokenAddress,
    tokenId,
    account,
    amlPermission,
  }: {
    recipientSaltHash: string;
    tokenType: TokenType;
    amountInWei: bigint | string;
    tokenAddress: string;
    tokenId: number;
    account: `0x${string}`;
    amlPermission: `0x${string}`;
  }) {
    const eligibilityPermission = '0x';

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
        returnObj.args = [recipientSaltHash, amlPermission, eligibilityPermission];
        returnObj.value = BigInt(amountInWei);
        break;
      case TokenType.ERC20:
        returnObj.functionName = 'depositERC20';
        returnObj.args = [tokenAddress, recipientSaltHash, amountInWei, amlPermission, eligibilityPermission];
        break;
      case TokenType.ERC721:
        returnObj.functionName = 'depositERC721';
        returnObj.args = [tokenAddress, recipientSaltHash, tokenId, amlPermission, eligibilityPermission];
        break;
      case TokenType.ERC1155:
        returnObj.functionName = 'depositERC1155';
        returnObj.args = [tokenAddress, recipientSaltHash, tokenId, amountInWei, amlPermission, eligibilityPermission];
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
      false,
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

  async #signConfimationFundsMessage(amount: string, miningAddress: string) {
    await this.#walletClient.requestAddresses();

    const [address] = await this.#walletClient.getAddresses();
    const signature = await this.#walletClient.signMessage({
      account: address,
      message: spendFundsMessage(amount, miningAddress),
    });

    const verified = await this.#publicClient.verifyMessage({
      address,
      message: spendFundsMessage(amount, miningAddress),
      signature,
    });

    if (!verified) {
      throw new Error('Signature verification failed');
    }

    return verified;
  }
}
