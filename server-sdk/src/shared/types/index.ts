// General

import { JsMetaData } from '../../wasm/node/testnet';

export interface FetchItemsRequest {
  cursor: JsMetaData | null;
  limit?: number;
}

export interface FetchItemsResponse<T> {
  items: T[];
  pagination: PaginationCursor;
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
  price?: number;
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
export type FetchTransactionsRequest = FetchItemsRequest;
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
  pollInterval?: number; // in milliseconds
}

export interface WaitForTransactionConfirmationResponse {
  status: 'not_found' | 'success' | 'confirmed' | 'pending' | 'failed';
}

// // Deposit
// export interface Deposit extends Transaction {}
// type FetchDepositsRequest = FetchItemsRequest<Deposit>;
// type FetchDepositsResponse = FetchItemsResponse<Deposit>;

export interface PrepareDepositTransactionRequest {
  token: Token;
  amount: number;
  address: string;
  skipConfirmation?: boolean;
}

export interface PrepareEstimateDepositTransactionRequest
  extends Omit<PrepareDepositTransactionRequest, 'skipConfirmation'> {
  isGasEstimation: boolean;
}

export interface PrepareDepositTransactionResponse {
  txHash: `0x${string}`;
  status: TransactionStatus;
}

export type PaginationCursor = {
  next_cursor: bigint | null | JsMetaData;
  has_more: boolean;
  total_count: number;
};

// Withdrawal
export type FetchWithdrawalsResponse = {
  withdrawals: Record<WithdrawalsStatus, ContractWithdrawal[]>;
  pagination: PaginationCursor;
};
export type FetchWithdrawalsRequest = {
  cursor?: bigint | null;
  limit?: number;
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
  urls?: UrlConfig;
  showLogs?: boolean;
}

export interface INTMAXClient {
  // properties
  isLoggedIn: boolean;
  address: string; // IntMax public_key
  tokenBalances: TokenBalance[] | undefined;

  // account
  login: () => Promise<LoginResponse>;
  logout: () => Promise<void>;
  getPrivateKey: () => Promise<string | undefined>;
  signMessage: (data: string) => Promise<SignMessageResponse>;
  verifySignature: (signature: SignMessageResponse, message: string | Uint8Array) => Promise<boolean>;
  sync: () => Promise<void>;
  updatePublicClientRpc: (url: string) => void;

  // token
  getTokensList: () => Promise<Token[]>;
  fetchTokenBalances: () => Promise<TokenBalancesResponse>;
  getPaginatedTokens: (params: {
    tokenIndexes?: number[];
    perPage?: number;
    cursor?: string;
  }) => Promise<PaginatedResponse<Token>>;

  // transaction
  fetchTransactions: (params?: FetchTransactionsRequest) => Promise<FetchTransactionsResponse>;
  broadcastTransaction: (
    rawTransfers: BroadcastTransactionRequest[],
    isWithdrawal?: boolean,
  ) => Promise<BroadcastTransactionResponse>;
  waitForTransactionConfirmation: (
    params: WaitForTransactionConfirmationRequest,
  ) => Promise<WaitForTransactionConfirmationResponse>;

  //receiveTxs
  fetchTransfers: (params?: FetchTransactionsRequest) => Promise<FetchTransactionsResponse>;

  // deposit
  estimateDepositGas: (params: PrepareEstimateDepositTransactionRequest) => Promise<bigint>;
  deposit: (params: PrepareDepositTransactionRequest) => Promise<PrepareDepositTransactionResponse>;
  fetchDeposits: (params?: FetchTransactionsRequest) => Promise<FetchTransactionsResponse>;

  // withdrawal
  fetchWithdrawals: (params: FetchWithdrawalsRequest) => Promise<FetchWithdrawalsResponse>;
  withdraw: (params: WithdrawRequest) => Promise<WithdrawalResponse>;
  claimWithdrawal: (params: ContractWithdrawal[]) => Promise<ClaimWithdrawalTransactionResponse>;

  // Fees
  getTransferFee: () => Promise<FeeResponse>;
  getWithdrawalFee: (token: Token) => Promise<FeeResponse>;
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
  use_private_zkp_server?: boolean;
}

export type UrlConfig = {
  balance_prover_url?: string;
  use_private_zkp_server?: boolean;
  rpc_url_l1?: string;
  rpc_url_l2?: string;
};

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

export interface Fee {
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
