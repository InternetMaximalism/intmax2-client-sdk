// General

export interface FetchItemsRequest<T> {
  page?: number;
  pageSize?: number;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
}

export interface FetchItemsResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export enum TokenType {
  NATIVE,
  ERC20,
  ERC721,
  ERC1155,
}

export enum TransactionStatus {
  ReadyToClaim,
  Processing,
  Completed,
  Rejected,
  NeedToClaim,
}

export enum WithdrawalsStatus {
  Requested = 'requested',
  Relayed = 'relayed',
  Success = 'success',
  NeedClaim = 'need_claim',
  Failed = 'failed',
}

export interface ContractWithdrawal {
  recipient: `0x${string}`;
  tokenIndex: number;
  amount: string | bigint;
  nullifier: `0x${string}`;
}

export enum TransactionType {
  Mining = 'Mining',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Send = 'Send',
  Receive = 'Receive',
}

// Token
export interface Token {
  contractAddress: string;
  decimals?: number;
  image?: string;
  price: number;
  symbol?: string;
  tokenIndex: number;
  tokenType: TokenType;
}

// Account
export interface TokenBalancesResponse {
  balances: TokenBalance[];
}

export interface TokenBalance {
  token: Token;
  amount: bigint;
}

export type SignMessageResponse = [string, string, string, string];

export interface DerivePath {
  derive_path: number;
  redeposit_path: number;
}

// Transaction
export interface Transaction {
  digest: string;
  amount: string;
  from: string;
  to: string;
  status: TransactionStatus;
  timestamp: number;
  transfers: Transfer[];
  tokenType?: TokenType;
  tokenIndex: number;
  txType: TransactionType;
  tokenAddress?: string;
}
export type FetchTransactionsRequest = FetchItemsRequest<Transaction>;
export type FetchTransactionsResponse = FetchItemsResponse<Transaction>;

export interface BroadcastTransactionRequest {
  address: string;
  amount: number | string;
  token: Token;
  claim_beneficiary?: `0x${string}`;
}
export interface BroadcastTransactionResponse extends TransactionResult {}

export interface TransactionResult {
  txTreeRoot: string;
  transferDigests: string[];
}

export interface TransferData {
  sender: string;
  transfer: Transfer;
}

export interface Transfer {
  recipient: string;
  tokenIndex: number;
  amount: string;
  salt: string;
  to?: string;
  isWithdrawal?: boolean;
  nullifier?: string;
}

// export interface ContractWithdrawal {
//   recipient: string;
//   tokenIndex: number;
//   amount: string;
//   nullifier: string;
// }

export interface WaitForTransactionConfirmationRequest {
  txTreeRoot: string;
  pollingInterval?: number;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface WaitForTransactionConfirmationResponse {
  status: 'not_found' | 'success' | 'confirmed';
  blockNumber: number | null;
}

// // Deposit
// export interface Deposit extends Transaction {}
// type FetchDepositsRequest = FetchItemsRequest<Deposit>;
// type FetchDepositsResponse = FetchItemsResponse<Deposit>;

export interface PrepareDepositTransactionRequest {
  token: Token;
  amount: number;
  address: string;
}

export interface PrepareEstimateDepositTransactionRequest extends PrepareDepositTransactionRequest {
  isGasEstimation: boolean;
}

export interface PrepareDepositTransactionResponse {
  txHash: `0x${string}`;
  status: TransactionStatus;
}

// Withdrawal
export type FetchWithdrawalsResponse = Record<WithdrawalsStatus, ContractWithdrawal[]>;
export type FetchWithdrawalsRequest = {
  pubkey: string;
  signature: [string, string, string, string];
};

export interface ClaimWithdrawalTransactionResponse {
  txHash: `0x${string}`;
  status: TransactionStatus;
}

export interface WithdrawalResponse extends TransactionResult {}

export interface WithdrawRequest {
  address: `0x${string}`;
  token: Token;
  amount: number | string;
  claim_beneficiary?: `0x${string}`;
}
export interface LoginResponse {
  address: string;
  isLoggedIn: boolean;
  nonce: number;
  encryptionKey: string; // base64
  accessToken?: string;
}

export type IntMaxEnvironment = 'testnet' | 'mainnet' | 'devnet';

export interface ConstructorParams {
  environment: IntMaxEnvironment;
  async_params?: ArrayBuffer;
}

export interface ConstructorNodeParams extends ConstructorParams {
  eth_private_key: `0x${string}`;
  l1_rpc_url?: string;
}

export interface INTMAXClient {
  // properties
  tokenBalances: TokenBalance[] | undefined;
  address: string; // IntMax public_key
  isLoggedIn: boolean;

  // account
  fetchTokenBalances: () => Promise<TokenBalancesResponse>;
  getPrivateKey: () => Promise<string | undefined>;
  signMessage: (data: string) => Promise<SignMessageResponse>;
  verifySignature: (signature: SignMessageResponse, message: string | Uint8Array) => Promise<boolean>;

  // transaction
  fetchTransactions: (params: FetchTransactionsRequest) => Promise<Transaction[]>;
  broadcastTransaction: (
    rawTransfers: BroadcastTransactionRequest[],
    isWithdrawal: boolean,
  ) => Promise<BroadcastTransactionResponse>;
  waitForTransactionConfirmation: (
    params: WaitForTransactionConfirmationRequest,
  ) => Promise<WaitForTransactionConfirmationResponse>;

  // deposit
  deposit: (params: PrepareDepositTransactionRequest) => Promise<PrepareDepositTransactionResponse>;
  fetchDeposits: (params: FetchTransactionsRequest) => Promise<(Transaction | null)[]>;

  // withdrawal
  fetchPendingWithdrawals: (params: FetchWithdrawalsRequest) => Promise<FetchWithdrawalsResponse>;
  withdraw: (params: WithdrawRequest) => Promise<WithdrawalResponse>;
  claimWithdrawal: (params: ContractWithdrawal[]) => Promise<ClaimWithdrawalTransactionResponse>;

  // Fees
  getTransferFee: () => Promise<FeeResponse>;
  getWithdrawalFee: (token: Token) => Promise<FeeResponse>;
  getClaimFee: () => Promise<FeeResponse>;

  // additional services
  login: () => Promise<LoginResponse>;
  logout: () => Promise<void>;
  getTokensList: () => Promise<Token[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: null | string;
  total: number;
}

export interface SDKUrls {
  balance_prover_url: string;
  indexer_url: string;
  predicate_url: string;
  validity_prover_url: string;
  chain_id_l1: number;
  chain_id_l2: number;
  key_vault_url: string;
  liquidity_contract: string;
  rollup_contract: string;
  rpc_url_l1: string;
  rpc_url_l2: string;
  store_vault_server_url: string;
  tokens_url: string;
  withdrawal_aggregator_url: string;
  withdrawal_contract_address: string;
  predicate_contract_address: string;
}

export interface MetadataItem {
  uuid: string;
  timestamp: string;
  blockNumber: string;
}
export type EncryptedDataItem = [MetadataItem, Uint8Array];

export interface RawTransaction {
  uuid: string;
  txType: TransactionType;
  timestamp: number;
  data: Uint8Array;
}

export interface WithdrawalRequestItem {
  status: WithdrawalsStatus;
  contractWithdrawal: ContractWithdrawal;
}

export interface WithdrawalsInfoResponse {
  withdrawalInfo: WithdrawalRequestItem[];
}

export interface IntMaxTxBroadcast {
  pubkey: string;
  amountInDecimals: bigint | number;
  tokenIndex: number;
  token_type?: TokenType;
  token_address?: `0x${string}`;
  depositor?: `0x${string}`;
}

interface Fee {
  amount: string;
  token_index: number;
}

export interface FeeResponse {
  beneficiary: string | undefined;
  fee: Fee | undefined;
  collateral_fee: Fee | undefined;
}

export interface BlockBuilderResponse {
  address: `0x${string}`;
  url: string;
}

export interface PredicateSignatureRequest {
  from: `0x${string}`;
  to: `0x${string}`;
  data: string;
  msg_value: string;
}

export interface PredicateSignatureResponse {
  is_compliant: boolean;
  signers: string[];
  signature: string[];
  expiry_block: number;
  task_id: string;
}
