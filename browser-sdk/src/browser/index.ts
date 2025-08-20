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
  checkIsValidBlockBuilderFee,
  checkValidLocalTime,
  ClaimWithdrawalTransactionResponse,
  ConstructorParams,
  ContractWithdrawal,
  FeeResponse,
  FetchTransactionsRequest,
  FetchTransactionsResponse,
  FetchWithdrawalsRequest,
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
  PaginatedResponse,
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
import { generateEncryptionKey } from '../shared/shared/generate-encryption-key';
import * as mainnetWasm from '../wasm/browser/mainnet';
import {
  JsFeeQuote,
  JsFlatG2,
  JsMetaData,
  JsMetaDataCursor,
  JsTransferFeeQuote,
  JsTxResult,
  JsUserData,
} from '../wasm/browser/mainnet';
import wasmBytesMain from '../wasm/browser/mainnet/intmax2_wasm_lib_bg.wasm?url';
import * as testnetWasm from '../wasm/browser/testnet';
import wasmBytes from '../wasm/browser/testnet/intmax2_wasm_lib_bg.wasm?url';

const whiteListedKeys = [
  'isCoinbaseWallet',
  'isMetaMask',
  'isTrustWallet',
  'isBitKeep',
  'isBitKeepChrome',
  'isRabby',
  'isPLC',
] as const;

const supportedWallets = {
  'coinbase wallet': ['isCoinbaseWallet'],
  'trust wallet': ['isTrustWallet'],
  'bitget wallet': ['isBitKeep', 'isMetaMask'],
  'rabby wallet': ['isRabby'],
  'okx wallet': ['isPLC', 'isMetaMask'],
  'intmax wallet': ['isIntmaxWallet'],
  metamask: ['isMetaMask'],
};

const getWalletProviderType = (): string => {
  const provider = { ...window.ethereum };
  let walletProviderName = 'unknown';
  if (Object.keys(provider).length === 0) {
    return walletProviderName;
  }

  const findKeys = Object.keys(provider).filter((key) =>
    whiteListedKeys.includes(key as (typeof whiteListedKeys)[number]),
  );

  if (Object.prototype.hasOwnProperty.call(provider, '_metamask')) {
    return 'metamask';
  }

  if (findKeys.length === 0) {
    return walletProviderName;
  }

  for (const [walletName, keys] of Object.entries(supportedWallets)) {
    if (keys.every((key) => findKeys.includes(key))) {
      if (keys.every((key) => provider[key] === true)) {
        walletProviderName = walletName;
        break;
      } else if (walletName === 'metamask' && Object.prototype.hasOwnProperty.call(provider, '_metamask')) {
        walletProviderName = walletName;
        break;
      }
    }
  }
  return walletProviderName;
};

interface IFunctions {
  sign_message: typeof mainnetWasm.sign_message | typeof testnetWasm.sign_message;
  verify_signature: typeof mainnetWasm.verify_signature | typeof testnetWasm.verify_signature;
  await_tx_sendable: typeof mainnetWasm.await_tx_sendable | typeof testnetWasm.await_tx_sendable;
  decrypt_deposit_data: typeof mainnetWasm.decrypt_deposit_data | typeof testnetWasm.decrypt_deposit_data;
  decrypt_transfer_data: typeof mainnetWasm.decrypt_transfer_data | typeof testnetWasm.decrypt_transfer_data;
  decrypt_tx_data: typeof mainnetWasm.decrypt_tx_data | typeof testnetWasm.decrypt_tx_data;
  fetch_deposit_history: typeof mainnetWasm.fetch_deposit_history | typeof testnetWasm.fetch_deposit_history;
  fetch_encrypted_data: typeof mainnetWasm.fetch_encrypted_data | typeof testnetWasm.fetch_encrypted_data;
  fetch_transfer_history: typeof mainnetWasm.fetch_transfer_history | typeof testnetWasm.fetch_transfer_history;
  fetch_tx_history: typeof mainnetWasm.fetch_tx_history | typeof testnetWasm.fetch_tx_history;
  generate_auth_for_store_vault:
    | typeof mainnetWasm.generate_auth_for_store_vault
    | typeof testnetWasm.generate_auth_for_store_vault;
  generate_fee_payment_memo:
    | typeof mainnetWasm.generate_fee_payment_memo
    | typeof testnetWasm.generate_fee_payment_memo;
  generate_intmax_account_from_eth_key:
    | typeof mainnetWasm.generate_intmax_account_from_eth_key
    | typeof testnetWasm.generate_intmax_account_from_eth_key;
  generate_transfer_receipt:
    | typeof mainnetWasm.generate_transfer_receipt
    | typeof testnetWasm.generate_transfer_receipt;
  generate_withdrawal_transfers:
    | typeof mainnetWasm.generate_withdrawal_transfers
    | typeof testnetWasm.generate_withdrawal_transfers;
  get_balances_without_sync:
    | typeof mainnetWasm.get_balances_without_sync
    | typeof testnetWasm.get_balances_without_sync;
  get_claim_info: typeof mainnetWasm.get_claim_info | typeof testnetWasm.get_claim_info;
  get_deposit_hash: typeof mainnetWasm.get_deposit_hash | typeof testnetWasm.get_deposit_hash;
  get_deposit_info: typeof mainnetWasm.get_deposit_info | typeof testnetWasm.get_deposit_info;
  get_derive_path_list: typeof mainnetWasm.get_derive_path_list | typeof testnetWasm.get_derive_path_list;
  get_intmax_address_from_public_pair:
    | typeof mainnetWasm.get_intmax_address_from_public_pair
    | typeof testnetWasm.get_intmax_address_from_public_pair;
  get_mining_list: typeof mainnetWasm.get_mining_list | typeof testnetWasm.get_mining_list;
  get_user_data: typeof mainnetWasm.get_user_data | typeof testnetWasm.get_user_data;
  get_withdrawal_info: typeof mainnetWasm.get_withdrawal_info | typeof testnetWasm.get_withdrawal_info;
  get_withdrawal_info_by_recipient:
    | typeof mainnetWasm.get_withdrawal_info_by_recipient
    | typeof testnetWasm.get_withdrawal_info_by_recipient;
  make_history_backup: typeof mainnetWasm.make_history_backup | typeof testnetWasm.make_history_backup;
  prepare_deposit: typeof mainnetWasm.prepare_deposit | typeof testnetWasm.prepare_deposit;
  query_and_finalize: typeof mainnetWasm.query_and_finalize | typeof testnetWasm.query_and_finalize;
  quote_claim_fee: typeof mainnetWasm.quote_claim_fee | typeof testnetWasm.quote_claim_fee;
  quote_transfer_fee: typeof mainnetWasm.quote_transfer_fee | typeof testnetWasm.quote_transfer_fee;
  quote_withdrawal_fee: typeof mainnetWasm.quote_withdrawal_fee | typeof testnetWasm.quote_withdrawal_fee;
  resync: typeof mainnetWasm.resync | typeof testnetWasm.resync;
  save_derive_path: typeof mainnetWasm.save_derive_path | typeof testnetWasm.save_derive_path;
  send_tx_request: typeof mainnetWasm.send_tx_request | typeof testnetWasm.send_tx_request;
  sync: typeof mainnetWasm.sync | typeof testnetWasm.sync;
  sync_claims: typeof mainnetWasm.sync_claims | typeof testnetWasm.sync_claims;
  sync_withdrawals: typeof mainnetWasm.sync_withdrawals | typeof testnetWasm.sync_withdrawals;
  validate_transfer_receipt:
    | typeof mainnetWasm.validate_transfer_receipt
    | typeof testnetWasm.validate_transfer_receipt;
  get_tx_status: typeof mainnetWasm.get_tx_status | typeof testnetWasm.get_tx_status;
}

export class IntMaxClient implements INTMAXClient {
  readonly #environment: IntMaxEnvironment;
  #intervalId: number | null | NodeJS.Timeout = null;
  #isSyncInProgress: boolean = false;
  readonly #config: mainnetWasm.Config | testnetWasm.Config;
  readonly #tokenFetcher: TokenFetcher;
  readonly #indexerFetcher: IndexerFetcher;
  readonly #txFetcher: TransactionFetcher;
  readonly #walletClient: WalletClient;
  #publicClient: PublicClient;
  readonly #vaultHttpClient: AxiosInstance;
  readonly #predicateFetcher: PredicateFetcher;
  readonly #urls: SDKUrls;
  readonly #walletProviderType: string = 'unknown';
  #privateKey: string = '';
  #spendKey: string = '';
  #spendPub: string = '';
  #viewKey: string = '';
  #userData: (mainnetWasm.JsUserData | undefined) | (testnetWasm.JsUserData | undefined);
  #userDataWorker: Worker | undefined;
  #broadcastInProgress: boolean = false;
  #functions: IFunctions;
  #showLogs: boolean = true;
  #boundUserDataWorkerMessageHandler: (event: MessageEvent) => void;

  isLoggedIn: boolean = false;
  address: string = '';
  tokenBalances: TokenBalance[] = [];

  constructor({ async_params, environment, urls, showLogs }: ConstructorParams) {
    if (typeof async_params === 'undefined') {
      throw new Error('Cannot be called directly');
    }
    if (!showLogs) {
      this.#showLogs = false;
      console.info = () => {};
      console.warn = () => {};
    }

    if (environment === 'mainnet') {
      mainnetWasm.initSync(async_params);
      this.#functions = {
        sign_message: mainnetWasm.sign_message,
        verify_signature: mainnetWasm.verify_signature,
        await_tx_sendable: mainnetWasm.await_tx_sendable,
        decrypt_deposit_data: mainnetWasm.decrypt_deposit_data,
        decrypt_transfer_data: mainnetWasm.decrypt_transfer_data,
        decrypt_tx_data: mainnetWasm.decrypt_tx_data,
        fetch_deposit_history: mainnetWasm.fetch_deposit_history,
        fetch_encrypted_data: mainnetWasm.fetch_encrypted_data,
        fetch_transfer_history: mainnetWasm.fetch_transfer_history,
        fetch_tx_history: mainnetWasm.fetch_tx_history,
        generate_auth_for_store_vault: mainnetWasm.generate_auth_for_store_vault,
        generate_fee_payment_memo: mainnetWasm.generate_fee_payment_memo,
        generate_intmax_account_from_eth_key: mainnetWasm.generate_intmax_account_from_eth_key,
        generate_transfer_receipt: mainnetWasm.generate_transfer_receipt,
        generate_withdrawal_transfers: mainnetWasm.generate_withdrawal_transfers,
        get_balances_without_sync: mainnetWasm.get_balances_without_sync,
        get_claim_info: mainnetWasm.get_claim_info,
        get_deposit_hash: mainnetWasm.get_deposit_hash,
        get_deposit_info: mainnetWasm.get_deposit_info,
        get_derive_path_list: mainnetWasm.get_derive_path_list,
        get_intmax_address_from_public_pair: mainnetWasm.get_intmax_address_from_public_pair,
        get_mining_list: mainnetWasm.get_mining_list,
        get_user_data: mainnetWasm.get_user_data,
        get_withdrawal_info: mainnetWasm.get_withdrawal_info,
        get_withdrawal_info_by_recipient: mainnetWasm.get_withdrawal_info_by_recipient,
        make_history_backup: mainnetWasm.make_history_backup,
        prepare_deposit: mainnetWasm.prepare_deposit,
        query_and_finalize: mainnetWasm.query_and_finalize,
        quote_claim_fee: mainnetWasm.quote_claim_fee,
        quote_transfer_fee: mainnetWasm.quote_transfer_fee,
        quote_withdrawal_fee: mainnetWasm.quote_withdrawal_fee,
        resync: mainnetWasm.resync,
        save_derive_path: mainnetWasm.save_derive_path,
        send_tx_request: mainnetWasm.send_tx_request,
        sync: mainnetWasm.sync,
        sync_claims: mainnetWasm.sync_claims,
        sync_withdrawals: mainnetWasm.sync_withdrawals,
        validate_transfer_receipt: mainnetWasm.validate_transfer_receipt,
        get_tx_status: mainnetWasm.get_tx_status,
      };
    } else {
      testnetWasm.initSync(async_params);
      this.#functions = {
        sign_message: testnetWasm.sign_message,
        verify_signature: testnetWasm.verify_signature,
        await_tx_sendable: testnetWasm.await_tx_sendable,
        decrypt_deposit_data: testnetWasm.decrypt_deposit_data,
        decrypt_transfer_data: testnetWasm.decrypt_transfer_data,
        decrypt_tx_data: testnetWasm.decrypt_tx_data,
        fetch_deposit_history: testnetWasm.fetch_deposit_history,
        fetch_encrypted_data: testnetWasm.fetch_encrypted_data,
        fetch_transfer_history: testnetWasm.fetch_transfer_history,
        fetch_tx_history: testnetWasm.fetch_tx_history,
        generate_auth_for_store_vault: testnetWasm.generate_auth_for_store_vault,
        generate_fee_payment_memo: testnetWasm.generate_fee_payment_memo,
        generate_intmax_account_from_eth_key: testnetWasm.generate_intmax_account_from_eth_key,
        generate_transfer_receipt: testnetWasm.generate_transfer_receipt,
        generate_withdrawal_transfers: testnetWasm.generate_withdrawal_transfers,
        get_balances_without_sync: testnetWasm.get_balances_without_sync,
        get_claim_info: testnetWasm.get_claim_info,
        get_deposit_hash: testnetWasm.get_deposit_hash,
        get_deposit_info: testnetWasm.get_deposit_info,
        get_derive_path_list: testnetWasm.get_derive_path_list,
        get_intmax_address_from_public_pair: testnetWasm.get_intmax_address_from_public_pair,
        get_mining_list: testnetWasm.get_mining_list,
        get_user_data: testnetWasm.get_user_data,
        get_withdrawal_info: testnetWasm.get_withdrawal_info,
        get_withdrawal_info_by_recipient: testnetWasm.get_withdrawal_info_by_recipient,
        make_history_backup: testnetWasm.make_history_backup,
        prepare_deposit: testnetWasm.prepare_deposit,
        query_and_finalize: testnetWasm.query_and_finalize,
        quote_claim_fee: testnetWasm.quote_claim_fee,
        quote_transfer_fee: testnetWasm.quote_transfer_fee,
        quote_withdrawal_fee: testnetWasm.quote_withdrawal_fee,
        resync: testnetWasm.resync,
        save_derive_path: testnetWasm.save_derive_path,
        send_tx_request: testnetWasm.send_tx_request,
        sync: testnetWasm.sync,
        sync_claims: testnetWasm.sync_claims,
        sync_withdrawals: testnetWasm.sync_withdrawals,
        validate_transfer_receipt: testnetWasm.validate_transfer_receipt,
        get_tx_status: testnetWasm.get_tx_status,
      };
    }

    this.#walletClient = createWalletClient({
      chain: environment === 'mainnet' ? mainnet : sepolia,
      transport: urls?.rpc_url_l1 ? http(urls.rpc_url_l1) : custom(window.ethereum!),
    });
    this.#walletProviderType = getWalletProviderType();

    this.#publicClient = createPublicClient({
      chain: environment === 'mainnet' ? mainnet : sepolia,
      transport: urls?.rpc_url_l1 ? http(urls.rpc_url_l1) : http(),
    });

    this.#environment = environment;
    const defaultUrls = environment === 'mainnet' ? MAINNET_ENV : TESTNET_ENV;

    // Merge default URLs with provided URLs
    this.#urls = {
      ...defaultUrls,
      ...urls,
    };

    this.#vaultHttpClient = axiosClientInit({
      baseURL: environment === 'mainnet' ? MAINNET_ENV.key_vault_url : TESTNET_ENV.key_vault_url,
    });

    this.#config = this.#generateConfig(environment);
    this.#txFetcher = new TransactionFetcher(environment);
    this.#tokenFetcher = new TokenFetcher(environment);
    this.#indexerFetcher = new IndexerFetcher(environment);
    this.#predicateFetcher = new PredicateFetcher(environment);

    this.#boundUserDataWorkerMessageHandler = this.#userDataWorkerMessageHandler.bind(this);

    //run sync job
    this.#startPeriodicUserDataUpdate(30_000);
  }

  static async init({ environment, urls }: ConstructorParams): Promise<IntMaxClient> {
    try {
      const bytes = await fetch(environment === 'mainnet' ? wasmBytesMain : wasmBytes).then((response) => {
        return response.arrayBuffer();
      });

      return new IntMaxClient({ async_params: bytes, environment, urls });
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

    if (!Object.keys(supportedWallets).includes(this.#walletProviderType)) {
      const checkSignature = await this.#walletClient.signMessage({
        account: address,
        message: challengeData.message,
      });

      if (checkSignature !== challengeSignature) {
        this.logout();
        throw new Error('Signature verification failed. You are using an unsupported wallet provider.');
      }
    }

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
        const isIntmaxWallet = this.#walletProviderType === 'intmax wallet';
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
      walletProviderType: this.#walletClient.name,
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

    let wasm_balances: (testnetWasm.TokenBalance | mainnetWasm.TokenBalance)[] = [];
    wasm_balances = await this.#functions.get_balances_without_sync(this.#config, this.#viewKey);

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
    if (await checkValidLocalTime(this.#environment)) {
      throw Error('Local time is not valid. Please check your device time settings.');
    }

    this.#broadcastInProgress = true;

    const transfers = rawTransfers.map((transfer) => {
      let amount = `${transfer.amount}`;
      if (transfer.token.decimals) {
        amount = parseUnits(transfer.amount.toString(), transfer.token.decimals).toString();
      }

      if (isWithdrawal) {
        if (!isAddress(transfer.address)) {
          this.#broadcastInProgress = false;
          throw Error('Invalid address to withdraw');
        }

        return this.#environment === 'mainnet'
          ? new mainnetWasm.JsTransferRequest(transfer.address, transfer.token.tokenIndex, amount, null)
          : new testnetWasm.JsTransferRequest(transfer.address, transfer.token.tokenIndex, amount, null);
      }

      if (!isWithdrawal && isAddress(transfer.address)) {
        this.#broadcastInProgress = false;
        throw Error('Invalid address to transfer');
      }

      return this.#environment === 'mainnet'
        ? new mainnetWasm.JsTransferRequest(transfer.address, transfer.token.tokenIndex, amount, null)
        : new testnetWasm.JsTransferRequest(transfer.address, transfer.token.tokenIndex, amount, null);
    });

    let privateKey = '';
    let viewPair = this.#viewKey;

    try {
      await this.getPrivateKey();
      privateKey = this.#privateKey;
      viewPair = this.#viewKey;
    } catch (e) {
      console.error(e);
      this.#broadcastInProgress = false;
      throw Error('No private key found');
    }
    this.#terminateSyncUserData();

    let memo: mainnetWasm.JsTxRequestMemo | testnetWasm.JsTxRequestMemo;
    try {
      const fee = await this.#getTransferFee();

      if (!fee) {
        this.#broadcastInProgress = false;
        throw new Error('Failed to quote transfer fee');
      }

      let withdrawalTransfers:
        | (mainnetWasm.JsWithdrawalTransfers | undefined)
        | (testnetWasm.JsWithdrawalTransfers | undefined);

      if (isWithdrawal) {
        try {
          withdrawalTransfers = await this.#functions.generate_withdrawal_transfers(
            this.#config,
            transfers[0],
            0,
            false, // no claim fee
          );
        } catch (e) {
          console.error(e);
          this.#broadcastInProgress = false;
          throw new Error('Failed to generate withdrawal');
        }
      }

      try {
        await this.#functions.await_tx_sendable(this.#config, viewPair, transfers, fee);
      } catch (e) {
        console.error(e);
      }

      // send the tx request
      memo = await this.#functions.send_tx_request(
        this.#config,
        await this.#indexerFetcher.getBlockBuilderUrl(),
        privateKey,
        withdrawalTransfers ? withdrawalTransfers.transfer_requests : transfers,
        this.#functions.generate_fee_payment_memo(
          withdrawalTransfers?.transfer_requests ?? [],
          withdrawalTransfers?.withdrawal_fee_transfer_index,
          withdrawalTransfers?.claim_fee_transfer_index,
        ),
        fee,
      );

      if (!memo) {
        this.#broadcastInProgress = false;
        throw new Error('Failed to send tx request');
      }

      memo.tx();
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes(
          'save-snapshot failed with status:500 Internal Server Error, error:Lock error: prev_digest mismatch with stored digest',
        )
      ) {
        if (this.#showLogs) console.error(e);
      } else {
        console.error(e);
      }
      this.#broadcastInProgress = false;
      throw new Error('Failed to send tx request');
    }

    let tx: JsTxResult | undefined;
    try {
      tx = await this.#functions.query_and_finalize(
        this.#config,
        await this.#indexerFetcher.getBlockBuilderUrl(),
        privateKey,
        memo,
      );
      await this.#indexerFetcher.fetchBlockBuilderUrl();
    } catch (e) {
      console.error(e);
      this.#broadcastInProgress = false;
      throw new Error('Failed to finalize tx');
    }

    if (isWithdrawal) {
      await sleep(40000);
      if (rawTransfers[0].claim_beneficiary) {
        try {
          await this.#functions.sync_claims(this.#config, viewPair, rawTransfers[0].claim_beneficiary, 0);
        } catch (e) {
          if (
            e instanceof Error &&
            e.message.includes(
              'save-snapshot failed with status:500 Internal Server Error, error:Lock error: prev_digest mismatch with stored digest',
            )
          ) {
            if (this.#showLogs) console.error(e);
          } else {
            console.error(e);
          }
          this.#broadcastInProgress = false;
          throw e;
        }
      }
      await sleep(40000);
      await retryWithAttempts(async () => await this.#functions.sync_withdrawals(this.#config, viewPair, 0), 1000, 5);
      this.#broadcastInProgress = false;
    }

    this.#broadcastInProgress = false;

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

    const data = await this.#functions.fetch_tx_history(
      this.#config,
      this.#viewKey,
      new JsMetaDataCursor(cursor, 'desc', limit),
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

    const data = await this.#functions.fetch_transfer_history(
      this.#config,
      this.#viewKey,
      new JsMetaDataCursor(cursor, 'desc', limit),
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

    const data = await this.#functions.fetch_deposit_history(
      this.#config,
      this.#viewKey,
      new JsMetaDataCursor(cursor as JsMetaData, 'desc', limit),
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
    this.#userData = undefined;
    this.#spendPub = '';
    this.#viewKey = '';
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

  async deposit({
    skipConfirmation = false,
    ...params
  }: PrepareDepositTransactionRequest): Promise<PrepareDepositTransactionResponse> {
    const address = params.address;
    if (params.token.tokenType === TokenType.ERC20) {
      // eslint-disable-next-line no-param-reassign
      params.token = await this.#tokenFetcher.getTokenChainInfo(params.token.contractAddress as `0x${string}`);
    }

    const txConfig = await this.#prepareDepositToken({ ...params, address, isGasEstimation: false });
    const chainId = await this.#walletClient.getChainId();
    if (this.#config.network === 'mainnet' && chainId !== 1) {
      await this.#walletClient.switchChain({
        id: mainnet.id,
      });
    }

    const depositHash = await this.#walletClient.writeContract(txConfig);

    if (skipConfirmation) {
      return {
        status: TransactionStatus.Processing,
        txHash: depositHash,
      };
    }

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
        if (e instanceof Error && e.message.includes('Transaction receipt with hash')) {
          continue;
        }
        console.error(e);
      }
    }

    return {
      status,
      txHash: depositHash,
    };
  }

  async fetchWithdrawals(
    { cursor, limit }: FetchWithdrawalsRequest = { cursor: null, limit: 256 },
  ): Promise<FetchWithdrawalsResponse> {
    return this.#txFetcher.fetchWithdrawals(this.#config, this.#viewKey, cursor, limit);
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

  async waitForTransactionConfirmation({
    txTreeRoot,
    timeout = 5000,
  }: WaitForTransactionConfirmationRequest): Promise<WaitForTransactionConfirmationResponse> {
    if (!this.isLoggedIn || !this.#spendPub) {
      throw new Error('Not logged in');
    }

    let status: WaitForTransactionConfirmationResponse['status'] = 'not_found';
    do {
      try {
        status = (await this.#functions.get_tx_status(
          this.#config,
          this.#spendPub,
          txTreeRoot,
        )) as WaitForTransactionConfirmationResponse['status'];
      } catch (e) {
        if (this.#showLogs) {
          console.error('Error while fetching transaction status:', e);
        }
        return {
          status: 'not_found',
        };
      }
      await sleep(timeout);
    } while (status === 'not_found' || status === 'pending');

    return {
      status,
    };
  }

  async signMessage(message: string): Promise<SignMessageResponse> {
    const data = Buffer.from(message);
    const signature = await this.#functions.sign_message(this.#spendKey, data);
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
    return await this.#functions.verify_signature(newSignature, this.#spendPub, data);
  }

  async getTokensList(): Promise<Token[]> {
    if (!this.#tokenFetcher.tokens) {
      return this.#tokenFetcher.fetchTokens();
    }
    return this.#tokenFetcher.tokens;
  }

  async getPaginatedTokens(params: {
    tokenIndexes?: number[];
    perPage?: number;
    cursor?: string;
  }): Promise<PaginatedResponse<Token>> {
    return this.#tokenFetcher.fetchPaginatedTokens(params);
  }

  async getTransferFee(): Promise<FeeResponse> {
    const transferFee = await this.#getTransferFee();

    if (!transferFee) {
      throw new Error('Failed to quote transfer fee');
    }

    return {
      beneficiary: transferFee.beneficiary,
      fee: transferFee.fee,
      collateral_fee: transferFee.collateral_fee,
    };
  }

  async getWithdrawalFee(token: Token): Promise<FeeResponse> {
    const withdrawalFee = (await this.#functions.quote_withdrawal_fee(this.#config, token.tokenIndex, 0)) as JsFeeQuote;
    return {
      beneficiary: withdrawalFee.beneficiary,
      fee: withdrawalFee.fee,
      collateral_fee: withdrawalFee.collateral_fee,
    };
  }

  async getClaimFee(): Promise<FeeResponse> {
    const claim_fee = await this.#functions.quote_claim_fee(this.#config, 0);

    return {
      beneficiary: claim_fee.beneficiary,
      fee: claim_fee.fee,
      collateral_fee: claim_fee.collateral_fee,
    };
  }

  async sync(): Promise<void> {
    if (this.#isSyncInProgress) {
      throw Error('Sync already in progress');
    }
    this.#isSyncInProgress = true;

    if (!this.isLoggedIn) {
      this.#isSyncInProgress = false;
      throw Error('Not logged in yet.');
    }
    return await this.#functions.sync(this.#config, this.#viewKey).finally(() => {
      this.#isSyncInProgress = false;
    });
  }

  updatePublicClientRpc(url: string): void {
    const httpRegex =
      //eslint-disable-next-line
      /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

    if (!url || !httpRegex.test(url)) {
      throw new Error('Invalid url');
    }

    this.#publicClient = createPublicClient({
      chain: this.#environment === 'mainnet' ? mainnet : sepolia,
      transport: http(url),
    });
  }

  // PRIVATE METHODS
  #generateConfig(env: IntMaxEnvironment): mainnetWasm.Config | testnetWasm.Config {
    const urls = this.#urls;

    const isFasterMining = env === 'devnet';
    const args = [
      env, // Network
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
    ];
    // eslint-disable-next-line
    // @ts-ignore
    return env === 'mainnet' ? new mainnetWasm.Config(...args) : new testnetWasm.Config(...args);
  }

  async #getTransferFee() {
    let fee: JsTransferFeeQuote | undefined;
    let attempts = 0;
    const maxAttempts = 3;
    let urlBlockBuilderUrl = await this.#indexerFetcher.getBlockBuilderUrl();

    while (attempts < maxAttempts) {
      try {
        if (!urlBlockBuilderUrl) {
          const blockBuilderResponse = await this.#indexerFetcher.fetchBlockBuilderUrls();
          const randomIndex = Math.floor((blockBuilderResponse?.length ?? 0) * Math.random());
          if (blockBuilderResponse?.length) {
            urlBlockBuilderUrl = blockBuilderResponse[randomIndex].url;
          }
        }
        fee = await this.#functions.quote_transfer_fee(this.#config, urlBlockBuilderUrl, this.#spendPub, 0);

        if (fee && fee.fee && !fee.collateral_fee && checkIsValidBlockBuilderFee(fee.fee, fee.is_registration_block)) {
          break;
        }
        fee = undefined;
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
      }

      attempts++;
      if (attempts < maxAttempts) {
        const blockBuilderResponse = await this.#indexerFetcher.fetchBlockBuilderUrls();
        const randomIndex = Math.floor((blockBuilderResponse?.length ?? 0) * Math.random());
        if (blockBuilderResponse?.length) {
          urlBlockBuilderUrl = blockBuilderResponse[randomIndex].url;
        }
      }
    }
    this.#indexerFetcher.setBlockBuilderUrl(urlBlockBuilderUrl);

    return fee;
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

    const [address] = await this.#walletClient.getAddresses();

    if (!isAddress(address)) {
      throw new Error('Invalid address');
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
      >(`/wallet/meta/${address}`);
      isLegacy = resp.meta.isLegacy;
    }

    const keySet = await this.#functions.generate_intmax_account_from_eth_key(this.#config.network, hdKey, isLegacy);

    this.address = keySet.address;
    this.#privateKey = keySet.key_pair;
    this.#spendKey = keySet.spend_key;
    this.#spendPub = keySet.spend_pub;
    this.#viewKey = keySet.view_pair;
  }

  #terminateSyncUserData() {
    if (this.#userDataWorker) {
      console.info('Terminating worker...');
      this.#userDataWorker.terminate();
      this.#userDataWorker = undefined;
      this.#isSyncInProgress = false;
      window.removeEventListener('message', this.#boundUserDataWorkerMessageHandler);
    }
  }

  async #restartSyncUserData() {
    console.info('Restarting worker...');
    this.#terminateSyncUserData();

    setTimeout(() => {
      this.#startSyncUserData();
    }, 100);
  }

  async #createSyncUserDataWorker() {
    // Create a new worker instance using the worker file directly
    // eslint-disable-next-line
    // @ts-ignore
    const { syncWorkerCode } = await import('../workers/sync.worker');

    const blob = new Blob([syncWorkerCode], {
      type: 'application/javascript',
    });
    const workerUrl = URL.createObjectURL(blob);

    this.#userDataWorker = new Worker(workerUrl, {
      name: 'syncUserDataWorker',
      credentials: 'same-origin',
    });

    if (!this.#userDataWorker) {
      throw Error('No sync user data worker');
    }

    window.addEventListener('message', this.#boundUserDataWorkerMessageHandler);

    return this.#userDataWorker;
  }

  async #userDataWorkerMessageHandler(
    event: MessageEvent<{
      target: 'intamax_sdk';
      data: JsUserData;
      type: 'user_data' | 'error';
      shouldSaveTime: boolean;
      viewPair: string;
    }>,
  ) {
    if (event.data.type && event.data.target === 'intamax_sdk') {
      console.info('Worker message execution received:', event.data);
    } else {
      return;
    }

    switch (event.data.type) {
      case 'user_data':
        this.#userData = event.data.data;
        if (event.data.shouldSaveTime) {
          const prevFetchData = localStorageManager.getItem<
            {
              fetchDate: number;
              address: string;
            }[]
          >('userDataFetch');
          const [address] = await this.#walletClient.getAddresses();
          const prevFetchDataArr =
            prevFetchData?.filter((data) => data.address?.toLowerCase() !== address.toLowerCase()) ?? [];
          prevFetchDataArr.push({
            fetchDate: Date.now(),
            address: address as string,
          });
          localStorageManager.setItem('userDataFetch', prevFetchDataArr);

          const items = localStorageManager.getItem<string[]>('sync_withdrawal');
          if (items) {
            const filteredItems = items.filter((item) => item.toLowerCase() !== event.data.viewPair.toLowerCase());
            localStorageManager.setItem('sync_withdrawal', filteredItems);
          }
        }

        break;
      case 'error':
        break;
    }

    if (event.data.type) {
      this.#isSyncInProgress = false;
    }
  }

  async #startSyncUserData() {
    if (this.#isSyncInProgress) {
      return;
    }
    console.info('user_data_sync start');
    this.#isSyncInProgress = true;
    const shouldSync = true;

    const prevFetchData = localStorageManager.getItem<
      {
        fetchDate: number;
        address: string;
      }[]
    >('user_data_fetch');
    const [address] = await this.#walletClient.getAddresses();
    const prevFetchDateObj = prevFetchData?.find((data) => data.address.toLowerCase() === address.toLowerCase());

    if (prevFetchDateObj && prevFetchDateObj.address.toLowerCase() === address.toLowerCase()) {
      const prevFetchDate = prevFetchDateObj.fetchDate;
      const currentDate = new Date().getTime();
      const diff = currentDate - prevFetchDate;
      if (diff < 180_000) {
        this.#isSyncInProgress = false;
      }
    }
    if (!this.#userDataWorker) {
      this.#userDataWorker = await this.#createSyncUserDataWorker();
    }

    postMessage({
      target: 'intamax_sdk_worker',
      type: 'start_sync',
      data: {
        viewPair: this.#viewKey,
        shouldSync,
        configArgs: {
          network: this.#config.network.toLowerCase(),
          store_vault_server_url: this.#config.store_vault_server_url,
          balance_prover_url: this.#config.balance_prover_url,
          validity_prover_url: this.#config.validity_prover_url,
          withdrawal_server_url: this.#config.withdrawal_server_url,
          deposit_timeout: this.#config.tx_timeout,
          tx_timeout: this.#config.tx_timeout,
          // --------------------
          is_faster_mining: this.#config.is_faster_mining,
          block_builder_query_wait_time: this.#config.block_builder_query_wait_time,
          block_builder_query_interval: this.#config.block_builder_query_interval,
          block_builder_query_limit: this.#config.block_builder_query_limit,
          // ----------------------
          l1_rpc_url: this.#config.l1_rpc_url,
          liquidity_contract_address: this.#config.liquidity_contract_address,
          l2_rpc_url: this.#config.l2_rpc_url,
          rollup_contract_address: this.#config.rollup_contract_address,
          withdrawal_contract_address: this.#config.withdrawal_contract_address,
          use_private_zkp_server: this.#config.use_private_zkp_server,
          use_s3: this.#config.use_s3,
          private_zkp_server_max_retires: this.#config.private_zkp_server_max_retires,
          private_zkp_server_retry_interval: this.#config.private_zkp_server_retry_interval,
        },
      },
    });
  }

  async #fetchUserData(): Promise<JsUserData> {
    const prevFetchData = localStorageManager.getItem<
      {
        fetchDate: number;
        address: string;
      }[]
    >('user_data_fetch');
    const prevFetchDateObj = prevFetchData?.find((data) => data.address.toLowerCase() === this.address.toLowerCase());

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
        userdata = await this.#functions.get_user_data(this.#config, this.#viewKey);
        this.#userData = userdata;
        return userdata;
      }
    }
    userdata = await this.#functions.get_user_data(this.#config, this.#viewKey);

    return userdata;
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

    const amlPermission = this.#predicateFetcher.encodePredicateSignature(predicateMessage);

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
    const depositResult = await this.#functions.prepare_deposit(
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

  #startPeriodicUserDataUpdate(interval: number) {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
    }
    this.#intervalId = setInterval(async () => {
      if (this.isLoggedIn && this.#viewKey && !this.#broadcastInProgress) {
        await this.#restartSyncUserData();
      }
    }, interval);
  }
}
