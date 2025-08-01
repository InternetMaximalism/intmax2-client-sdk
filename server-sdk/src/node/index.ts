import { AxiosInstance } from 'axios';
import {
  Abi,
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  erc721Abi,
  http,
  isAddress,
  parseEther,
  parseUnits,
  PrivateKeyAccount,
  PublicClient,
  sha256,
  WriteContractParameters,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

import {
  axiosClientInit,
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
  checkIsValidBlockBuilderFee,
  ClaimWithdrawalTransactionResponse,
  ConstructorNodeParams,
  ContractWithdrawal,
  DEVNET_ENV,
  FeeResponse,
  FetchTransactionsRequest,
  FetchTransactionsResponse,
  FetchWithdrawalsRequest,
  FetchWithdrawalsResponse,
  generateEncryptionKey,
  generateEntropy,
  getPkFromEntropy,
  IndexerFetcher,
  INTMAXClient,
  IntMaxEnvironment,
  IntMaxTxBroadcast,
  LiquidityAbi,
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
import {
  await_tx_sendable,
  Config,
  fetch_deposit_history,
  fetch_transfer_history,
  fetch_tx_history,
  generate_fee_payment_memo,
  generate_intmax_account_from_eth_key,
  generate_withdrawal_transfers,
  get_balances_without_sync,
  get_user_data,
  JsFeeQuote,
  JsFlatG2,
  JsMetaData,
  JsMetaDataCursor,
  JsTransferFeeQuote,
  JsTransferRequest,
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
  TokenBalance as WasmTokenBalance,
} from '../wasm/node';

export class IntMaxNodeClient implements INTMAXClient {
  #intervalId: number | null | NodeJS.Timeout = null;
  #isSyncInProgress: boolean = false;
  readonly #config: Config;
  readonly #tokenFetcher: TokenFetcher;
  readonly #indexerFetcher: IndexerFetcher;
  readonly #txFetcher: TransactionFetcher;
  readonly #publicClient: PublicClient;
  readonly #vaultHttpClient: AxiosInstance;
  readonly #predicateFetcher: PredicateFetcher;
  readonly #environment: IntMaxEnvironment;
  readonly #urls: SDKUrls;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  readonly #cacheMap: Map<string, any> = new Map();
  readonly #ethAccount: PrivateKeyAccount;
  #privateKey: string = '';
  #spendKey: string = '';
  #spendPub: string = '';
  #viewKey: string = '';
  #userData: JsUserData | undefined;

  isLoggedIn: boolean = false;
  address: string = '';
  tokenBalances: TokenBalance[] = [];

  constructor(params: ConstructorNodeParams) {
    if (params.environment === 'mainnet') {
      throw new Error('Mainnet is not supported yet');
    }

    this.validateConstructorParams(params);
    const { environment, eth_private_key, l1_rpc_url } = params;

    this.#cacheMap.set('user_data_fetch', []);
    this.#ethAccount = privateKeyToAccount(eth_private_key);

    this.#publicClient = createPublicClient({
      // chain: environment === 'mainnet' ? mainnet : sepolia,
      chain: sepolia,
      transport: l1_rpc_url ? http(l1_rpc_url) : http(),
    });

    // this.#vaultHttpClient = axiosClientInit({
    //   baseURL:
    //     environment === 'mainnet'
    //       ? MAINNET_ENV.key_vault_url
    //       : environment === 'testnet'
    //         ? TESTNET_ENV.key_vault_url
    //         : DEVNET_ENV.key_vault_url,
    // });
    this.#vaultHttpClient = axiosClientInit({
      baseURL: environment === 'testnet' ? TESTNET_ENV.key_vault_url : DEVNET_ENV.key_vault_url,
    });

    this.#environment = environment;
    // this.#urls = environment === 'mainnet' ? MAINNET_ENV : environment === 'testnet' ? TESTNET_ENV : DEVNET_ENV;
    const defaultUrls = environment === 'testnet' ? TESTNET_ENV : DEVNET_ENV;
    this.#urls = {
      ...defaultUrls,
      ...params.urls,
    }

    this.#config = this.#generateConfig(environment);
    this.#txFetcher = new TransactionFetcher(environment);
    this.#tokenFetcher = new TokenFetcher(environment);
    this.#indexerFetcher = new IndexerFetcher(environment);
    this.#predicateFetcher = new PredicateFetcher(environment);

    //run sync job
    this.#startPeriodicUserDataUpdate(30_000);
  }

  private validateConstructorParams({ environment, eth_private_key, l1_rpc_url }: ConstructorNodeParams) {
    if (environment !== 'mainnet' && environment !== 'testnet' && environment !== 'devnet') {
      throw new Error('Invalid environment. Must be "mainnet", "testnet", or "devnet"');
    }

    if (!eth_private_key || typeof eth_private_key !== 'string' || !eth_private_key.startsWith('0x')) {
      throw new Error('Invalid Ethereum private key. Must be a string starting with "0x"');
    }

    if (!l1_rpc_url || typeof l1_rpc_url !== 'string' || !l1_rpc_url.startsWith('http')) {
      throw new Error('Invalid L1 RPC URL. Must be a string starting with "http" or "https"');
    }
  }

  async login() {
    this.isLoggedIn = false;

    const address = this.#ethAccount.address;

    const signNetwork = await this.#ethAccount.signMessage({
      message: networkMessage(address),
    });

    const challenge = await this.#vaultHttpClient.post<
      {},
      {
        message: string;
      }
    >('/challenge', {
      address,
      type: 'login',
    });

    const challengeSignature = await this.#ethAccount.signMessage({
      message: challenge.message,
    });

    const hashedNetworkMessage = await this.#vaultHttpClient.post<
      {},
      {
        hashedNetworkMessage: string | null;
        walletProviderType: string | null;
      }
    >('/wallet/hashed-network-message', {
      address,
      challengeSignature,
    });

    if (hashedNetworkMessage.hashedNetworkMessage !== null) {
      if (hashedNetworkMessage.hashedNetworkMessage !== sha256(sha256(signNetwork))) {
        this.logout();
        const isIntmaxWallet = false;
        const isProviderIntmax = hashedNetworkMessage.walletProviderType === 'intmax wallet';

        if (isIntmaxWallet && isProviderIntmax) {
          throw new Error(
            'Different Google account detected. Please use the same Google account you used during initial setup.',
          );
        } else if (isIntmaxWallet && !isProviderIntmax) {
          throw new Error(
            'Wallet type mismatch. You initially used a different wallet. Please switch back to your original wallet provider or contact support.',
          );
        } else if (!isIntmaxWallet && isProviderIntmax) {
          throw new Error(
            'Wallet type mismatch. You initially used INTMAX Wallet. Please switch back to INTMAX Wallet or contact support.',
          );
        }
      }
    }

    const { hashedSignature, nonce, accessToken } = await this.#vaultHttpClient.post<
      {},
      {
        hashedSignature: string;
        encryptedEntropy: string;
        nonce: number;
        accessToken: string;
      }
    >('/wallet/login', {
      address,
      challengeSignature,
      securitySeed: sha256(signNetwork),
      walletProviderType: hashedNetworkMessage.walletProviderType || 'unknown',
    });

    await this.#entropy(signNetwork, hashedSignature);

    const encryptionKeyBytes = await generateEncryptionKey(signNetwork, nonce);
    const encryptionKey = uint8ToBase64(encryptionKeyBytes);

    this.isLoggedIn = true;

    return {
      address: this.address,
      isLoggedIn: this.isLoggedIn,
      nonce,
      encryptionKey,
      accessToken,
    };
  }

  async getPrivateKey(): Promise<string> {
    const address = this.#ethAccount.address;

    const signNetwork = await this.#ethAccount.signMessage({
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

    let wasm_balances: WasmTokenBalance[] = [];
    wasm_balances = await get_balances_without_sync(this.#config, this.#viewKey);

    if (!wasm_balances.length) {
      const userData = await this.#fetchUserData();
      wasm_balances = userData.balances;
    } else {
      this.#fetchUserData();
    }

    let tokens = this.#tokenFetcher.tokens;
    if (tokens.length === 0) {
      tokens = await this.#tokenFetcher.fetchTokens();
    }

    const nftIds = wasm_balances.reduce((acc, tb): number[] => {
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

    const balances = wasm_balances.map((balance): TokenBalance => {
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
      let amount = `${transfer.amount}`;
      if (transfer.token.decimals) {
        amount = parseUnits(transfer.amount.toString(), transfer.token.decimals).toString();
      }

      if (isWithdrawal) {
        if (!isAddress(transfer.address)) {
          throw Error('Invalid address to withdraw');
        }

        return new JsTransferRequest(transfer.address, transfer.token.tokenIndex, amount, null);
      }

      if (!isWithdrawal && isAddress(transfer.address)) {
        throw Error('Invalid address to transfer');
      }

      return new JsTransferRequest(transfer.address, transfer.token.tokenIndex, amount, null);
    });

    let privateKey = '';
    let pubKey = this.#spendPub;
    let viewPair = this.#viewKey;

    try {
      await this.getPrivateKey();
      privateKey = this.#privateKey;
      pubKey = this.#spendPub;
      viewPair = this.#viewKey;
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
      if (fee.fee) {
        if (!checkIsValidBlockBuilderFee(fee.fee, fee.is_registration_block)) {
          await this.#indexerFetcher.fetchBlockBuilderUrl();
          throw new Error('Invalid fee from block builder. Try again...');
        }
      }

      let withdrawalTransfers: JsWithdrawalTransfers | undefined;

      if (isWithdrawal) {
        withdrawalTransfers = await generate_withdrawal_transfers(this.#config, transfers[0], 0, true);
      }

      await await_tx_sendable(this.#config, viewPair, transfers, fee);

      // send the tx request
      memo = await send_tx_request(
        this.#config,
        await this.#indexerFetcher.getBlockBuilderUrl(),
        privateKey,
        withdrawalTransfers ? withdrawalTransfers.transfer_requests : transfers,
        generate_fee_payment_memo(
          withdrawalTransfers?.transfer_requests ?? [],
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
          await sync_claims(this.#config, viewPair, rawTransfers[0].claim_beneficiary, 0);
        } catch (e) {
          console.error(e);
          throw e;
        }
      }
      await sleep(40000);
      await retryWithAttempts(async () => await sync_withdrawals(this.#config, viewPair, 0), 1000, 5);
    }

    return {
      txTreeRoot: tx.tx_tree_root,
      transferDigests: tx.tx_data.transfer_digests,
    };
  }

  // Send/Withdrawals
  async fetchTransactions(
    { cursor, limit }: FetchTransactionsRequest = { cursor: null, limit: 256 },
  ): Promise<FetchTransactionsResponse> {
    this.#checkAllowanceToExecuteMethod();
    if (limit && limit > 256) {
      throw new Error('Limit cannot be greater than 256');
    }

    const data = await fetch_tx_history(this.#config, this.#viewKey, new JsMetaDataCursor(cursor, 'desc', limit));

    return {
      pagination: {
        next_cursor: data.cursor_response.next_cursor ?? null,
        has_more: data.cursor_response.has_more,
        total_count: data.cursor_response.total_count,
      },
      items: data.history
        .map((tx) => {
          return wasmTxToTx(
            this.#config,
            {
              data: tx.data,
              meta: tx.meta,
              status: tx.status,
              txType: TransactionType.Send,
              free: tx.free,
            },
            this.#tokenFetcher.tokens,
            this.address,
          );
        })
        .filter(Boolean) as Transaction[],
    };
  }

  // Receive
  async fetchTransfers(
    { cursor, limit }: FetchTransactionsRequest = { cursor: null, limit: 256 },
  ): Promise<FetchTransactionsResponse> {
    this.#checkAllowanceToExecuteMethod();
    if (limit && limit > 256) {
      throw new Error('Limit cannot be greater than 256');
    }

    const data = await fetch_transfer_history(this.#config, this.#viewKey, new JsMetaDataCursor(cursor, 'desc', limit));

    return {
      pagination: {
        next_cursor: data.cursor_response.next_cursor ?? null,
        has_more: data.cursor_response.has_more,
        total_count: data.cursor_response.total_count,
      },
      items: data.history
        .map((tx) => {
          return wasmTxToTx(
            this.#config,
            {
              data: tx.data,
              meta: tx.meta,
              status: tx.status,
              txType: TransactionType.Receive,
              free: tx.free,
            },
            this.#tokenFetcher.tokens,
            this.address,
          );
        })
        .filter(Boolean) as Transaction[],
    };
  }

  // Deposit
  async fetchDeposits(
    { cursor, limit }: FetchTransactionsRequest = { cursor: null, limit: 256 },
  ): Promise<FetchTransactionsResponse> {
    this.#checkAllowanceToExecuteMethod();
    if (limit && limit > 256) {
      throw new Error('Limit cannot be greater than 256');
    }

    const data = await fetch_deposit_history(
      this.#config,
      this.#viewKey,
      new JsMetaDataCursor(cursor as JsMetaData, 'desc'),
    );

    return {
      pagination: {
        next_cursor: data.cursor_response.next_cursor ?? null,
        has_more: data.cursor_response.has_more,
        total_count: data.cursor_response.total_count,
      },
      items: data.history
        .map((tx) => {
          return wasmTxToTx(
            this.#config,
            {
              data: tx.data,
              meta: tx.meta,
              status: tx.status,
              txType: TransactionType.Deposit,
              free: tx.free,
            },
            this.#tokenFetcher.tokens,
            this.address,
          );
        })
        .filter(Boolean) as Transaction[],
    };
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
    this.#spendPub = '';
    this.#viewKey = '';
    this.#userData = undefined;
    await this.#vaultHttpClient.post('/wallet/logout', {});
    return;
  }

  async estimateDepositGas(params: PrepareEstimateDepositTransactionRequest): Promise<bigint> {
    const txConfig = await this.#prepareDepositToken(params);

    if (txConfig.functionName !== 'depositNativeToken') {
      const isValidApproval = await this.#validateApproval({
        tokenAddress: txConfig?.args?.[0] as `0x${string}`,
        amount: BigInt(txConfig?.args?.[2] as string),
        functionName: txConfig.functionName,
      });

      if (!isValidApproval) {
        switch (txConfig.functionName) {
          case 'depositERC20':
            await this.#getAllowance(txConfig?.args?.[0] as `0x${string}`, BigInt(txConfig?.args?.[2] as string));
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
    const { gas, maxPriorityFeePerGas, maxFeePerGas } = await this.#estimateFee(txConfig);
    const encodeData = encodeFunctionData({
      abi: txConfig.abi,
      functionName: txConfig.functionName,
      args: txConfig.args,
    });

    const signedTx = await this.#ethAccount.signTransaction({
      type: 'eip1559',
      chainId: this.#publicClient.chain?.id as number,
      data: encodeData,
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce: await this.#publicClient.getTransactionCount({
        address: this.#ethAccount.address,
      }),
      to: txConfig.address,
      value: txConfig.value,
    });

    const depositHash = await this.#publicClient.sendRawTransaction({
      serializedTransaction: signedTx,
    });

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

  waitForTransactionConfirmation(
    _params: WaitForTransactionConfirmationRequest,
  ): Promise<WaitForTransactionConfirmationResponse> {
    throw Error('Not implemented!');
  }

  async signMessage(message: string): Promise<SignMessageResponse> {
    const data = Buffer.from(message);
    const signature = await sign_message(this.#spendKey, data);
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
    return await verify_signature(newSignature, this.#spendPub, data);
  }

  async getTokensList(): Promise<Token[]> {
    if (!this.#tokenFetcher.tokens) {
      return this.#tokenFetcher.fetchTokens();
    }
    return this.#tokenFetcher.tokens;
  }

  async fetchWithdrawals({ cursor }: FetchWithdrawalsRequest = { cursor: null }): Promise<FetchWithdrawalsResponse> {
    return this.#txFetcher.fetchWithdrawals(this.#config, this.#viewKey, cursor);
  }

  async claimWithdrawal(needClaimWithdrawals: ContractWithdrawal[]): Promise<ClaimWithdrawalTransactionResponse> {
    const address = this.#ethAccount.address;

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
      const encodedData = encodeFunctionData({
        abi: LiquidityAbi,
        functionName: 'claimWithdrawals',
        args: [withdrawalsToClaim],
      });

      const { maxFeePerGas, maxPriorityFeePerGas, gas } = await this.#estimateFee({
        chain: this.#publicClient.chain,
        address: this.#config.liquidity_contract_address as `0x${string}`,
        abi: LiquidityAbi as Abi,
        functionName: 'claimWithdrawals',
        args: [withdrawalsToClaim],
        account: address as `0x${string}`,
        value: 0n,
      });

      const signedTx = await this.#ethAccount.signTransaction({
        type: 'eip1559',
        chainId: this.#publicClient.chain?.id as number,
        data: encodedData,
        gas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce: await this.#publicClient.getTransactionCount({
          address: this.#ethAccount.address,
        }),
        to: this.#config.liquidity_contract_address as `0x${string}`,
        value: 0n,
      });

      const txHash = await this.#publicClient.sendRawTransaction({
        serializedTransaction: signedTx,
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

  async getTransferFee(): Promise<FeeResponse> {
    const transferFee = (await quote_transfer_fee(
      this.#config,
      await this.#indexerFetcher.getBlockBuilderUrl(),
      this.#spendPub as string,
      0,
    )) as JsTransferFeeQuote;

    if (transferFee.fee) {
      if (!checkIsValidBlockBuilderFee(transferFee.fee, transferFee.is_registration_block)) {
        await this.#indexerFetcher.fetchBlockBuilderUrl();
        throw new Error('Invalid fee from block builder. Try again...');
      }
    }

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
    const urls = this.#urls;

    const isFasterMining = env === 'devnet';
    return new Config(
      env,
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
      urls.use_private_zkp_server ?? true, // use_private_zkp_server
      true, // use_s3
      120, // private_zkp_server_max_retries
      5n, // private_zkp_server_retry_interval
    );
  }

  #checkAllowanceToExecuteMethod() {
    if (!this.isLoggedIn && !this.address) {
      throw Error('Not logged in');
    }
  }

  async #entropy(networkSignedMessage: `0x${string}`, hashedSignature: string) {
    const entropy = generateEntropy(networkSignedMessage as `0x${string}`, hashedSignature);
    const hdKey = getPkFromEntropy(entropy);
    if (!hdKey) {
      throw new Error("Can't get private key from mnemonic");
    }

    let isLegacy = false;
    if (this.#environment !== 'mainnet') {
      const resp = await this.#vaultHttpClient.get<
        {},
        {
          meta: {
            isLegacy: boolean;
          };
        }
      >(`/wallet/meta/${this.#ethAccount.address}`);
      isLegacy = resp.meta.isLegacy;
    }

    const keySet = await generate_intmax_account_from_eth_key(this.#config.network, hdKey, isLegacy);

    this.address = keySet.address;
    this.#privateKey = keySet.key_pair;
    this.#spendKey = keySet.spend_key;
    this.#spendPub = keySet.spend_pub;
    this.#viewKey = keySet.view_pair;
  }

  async #syncUserData() {
    if (this.#isSyncInProgress) {
      return;
    }
    console.info('user_data_sync start');
    this.#isSyncInProgress = true;

    const prevFetchData = this.#cacheMap.get('user_data_fetch');
    const prevFetchDateObj = prevFetchData?.find(
      (data: { fetchDate: number; address: string }) => data?.address?.toLowerCase() === this.address.toLowerCase(),
    );

    if (prevFetchDateObj && prevFetchDateObj.address.toLowerCase() === this.address.toLowerCase()) {
      const prevFetchDate = prevFetchDateObj.fetchDate;
      const currentDate = new Date().getTime();
      const diff = currentDate - prevFetchDate;
      if (diff < 180_000) {
        this.#isSyncInProgress = false;
        console.info('user_data_sync done');
        return;
      }
    }

    try {
      // sync the account's balance proof
      await retryWithAttempts(
        () => {
          return sync(this.#config, this.#viewKey);
        },
        10000,
        5,
      );
      console.info('Synced account balance proof');

      // sync withdrawals
      console.info('Start sync withdrawals');
      await retryWithAttempts(
        () => {
          return sync_withdrawals(this.#config, this.#viewKey, 0);
        },
        10000,
        5,
      );
      console.info('Synced withdrawals');
    } catch (e) {
      console.info('Failed to sync account balance proof', e);
    }

    this.#userData = await get_user_data(this.#config, this.#viewKey);

    const prevFetchDataArr =
      prevFetchData?.filter(
        (data: { fetchDate: number; address: string }) => data.address.toLowerCase() !== this.address?.toLowerCase(),
      ) ?? [];
    prevFetchDataArr.push({
      fetchDate: Date.now(),
      address: this.address,
    });
    this.#cacheMap.set('user_data_fetch', prevFetchDataArr);
    this.#isSyncInProgress = false;
    console.info('user_data_sync done');
  }

  async #fetchUserData(): Promise<JsUserData> {
    const prevFetchData = this.#cacheMap.get('user_data_fetch');
    const prevFetchDateObj = prevFetchData?.find(
      (data: { fetchDate: number; address: string }) => data?.address?.toLowerCase() === this.address.toLowerCase(),
    );

    let userdata: JsUserData;
    if (prevFetchDateObj && prevFetchDateObj.address.toLowerCase() === this.address.toLowerCase()) {
      const prevFetchDate = prevFetchDateObj.fetchDate;
      const currentDate = new Date().getTime();
      const diff = currentDate - prevFetchDate;
      if (diff < 180_000 && this.#userData) {
        console.info('Skipping user data fetch');
        return this.#userData;
      } else if (diff < 180_000) {
        console.info('Fetching user data without sync');
        userdata = await get_user_data(this.#config, this.#viewKey);
        this.#userData = userdata;

        return userdata;
      }
    }

    userdata = await get_user_data(this.#config, this.#viewKey);
    this.#syncUserData();

    return userdata;
  }

  async #prepareDepositToken({ token, isGasEstimation, amount, address }: PrepareEstimateDepositTransactionRequest) {
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
          depositor: this.#ethAccount.address,
          pubkey: address,
          amountInDecimals,
          tokenIndex: token.tokenIndex,
          token_type: token.tokenType,
          token_address: token.contractAddress as `0x${string}`,
        });

    const predicateBody = this.#predicateFetcher.generateBody({
      recipientSaltHash: salt,
      tokenType: token.tokenType,
      amountInWei: amountInDecimals,
      tokenAddress: token.contractAddress,
      tokenId: token.tokenIndex,
    });
    const predicateMessage = await this.#predicateFetcher.fetchPredicateSignature({
      data: predicateBody,
      from: this.#ethAccount.address as `0x${string}`,
      to: this.#urls.predicate_contract_address as `0x${string}`,
      msg_value: token.tokenType === TokenType.NATIVE ? amountInDecimals.toString() : '0',
    });

    if (!predicateMessage.is_compliant) {
      throw new Error('AML check failed');
    }

    const amlPermission = this.#predicateFetcher.encodePredicateSignature(predicateMessage);

    return this.#prepareTransaction({
      recipientSaltHash: salt,
      tokenType: token.tokenType,
      amountInWei: amountInDecimals,
      tokenAddress: token.contractAddress,
      tokenId: token.tokenIndex,
      account: this.#ethAccount.address,
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
  }): WriteContractParameters {
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
    const address = this.#ethAccount.address;

    // Check if we need to approve the contract to spend the token
    try {
      if (functionName === 'depositERC20') {
        const currentAllowance = await this.#publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address, this.#config.liquidity_contract_address as `0x${string}`],
        });

        isApproved = currentAllowance >= amount;
      } else if (functionName === 'depositERC721' || functionName === 'depositERC1155') {
        isApproved = await this.#publicClient.readContract({
          address: tokenAddress,
          abi: erc721Abi,
          functionName: 'isApprovedForAll',
          args: [address, this.#config.liquidity_contract_address as `0x${string}`],
        });
      }
    } catch (e) {
      console.error(e);
      throw e;
    }

    return isApproved;
  }

  async #getAllowance(tokenAddress: `0x${string}`, amount: bigint) {
    const address = this.#ethAccount.address;

    const currentAllowance = await this.#publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [address, this.#config.liquidity_contract_address as `0x${string}`],
    });

    if (currentAllowance < amount) {
      try {
        const encodedData = encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [this.#config.liquidity_contract_address as `0x${string}`, amount],
        });
        const { maxFeePerGas, maxPriorityFeePerGas, gas } = await this.#estimateFee({
          chain: this.#publicClient.chain,
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [this.#config.liquidity_contract_address as `0x${string}`, amount],
          account: this.#ethAccount.address,
          value: 0n,
        });

        const signedTx = await this.#ethAccount.signTransaction({
          type: 'eip1559',
          chainId: this.#publicClient.chain?.id as number,
          data: encodedData,
          gas,
          maxFeePerGas,
          maxPriorityFeePerGas,
          nonce: await this.#publicClient.getTransactionCount({
            address: this.#ethAccount.address,
          }),
          to: tokenAddress,
          value: 0n,
        });

        const approveTx = await this.#publicClient.sendRawTransaction({
          serializedTransaction: signedTx,
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
    const address = this.#ethAccount.address;

    const currentApproval = await this.#publicClient.readContract({
      address: tokenAddress,
      abi: erc721Abi,
      functionName: 'isApprovedForAll',
      args: [address, this.#config.liquidity_contract_address as `0x${string}`],
    });

    if (!currentApproval) {
      try {
        const encodedData = encodeFunctionData({
          abi: erc721Abi,
          functionName: 'setApprovalForAll',
          args: [this.#config.liquidity_contract_address as `0x${string}`, true],
        });

        const { maxFeePerGas, maxPriorityFeePerGas, gas } = await this.#estimateFee({
          chain: this.#publicClient.chain,
          address: tokenAddress,
          abi: erc721Abi,
          functionName: 'setApprovalForAll',
          args: [this.#config.liquidity_contract_address as `0x${string}`, true],
          account: this.#ethAccount.address,
          value: 0n,
        });

        const signedTx = await this.#ethAccount.signTransaction({
          type: 'eip1559',
          chainId: this.#publicClient.chain?.id as number,
          data: encodedData,
          gas,
          maxFeePerGas,
          maxPriorityFeePerGas,
          nonce: await this.#publicClient.getTransactionCount({
            address: this.#ethAccount.address,
          }),
          to: tokenAddress,
          value: 0n,
        });

        const approveTx = await this.#publicClient.sendRawTransaction({
          serializedTransaction: signedTx,
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

  async #estimateFee(txConfig: WriteContractParameters): Promise<{
    gas: bigint;
    maxPriorityFeePerGas: bigint;
    maxFeePerGas: bigint;
  }> {
    const gas = await this.#publicClient.estimateContractGas({
      address: txConfig.address,
      abi: txConfig.abi,
      functionName: txConfig.functionName,
      args: txConfig.args,
      account: txConfig.account as `0x${string}`,
      value: txConfig.value,
    });

    const block = await this.#publicClient.getBlock();
    const baseFee = block.baseFeePerGas ?? 0n;

    const maxPriorityFeePerGas = await this.#publicClient.estimateMaxPriorityFeePerGas();
    const maxFeePerGas = baseFee * 2n + maxPriorityFeePerGas;

    return {
      gas,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  }

  #startPeriodicUserDataUpdate(interval: number) {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
    }
    this.#intervalId = setInterval(async () => {
      if (this.isLoggedIn && this.#viewKey) {
        await this.#syncUserData();
      }
    }, interval);
  }
}
