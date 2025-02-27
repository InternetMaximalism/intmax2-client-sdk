/* tslint:disable */
/* eslint-disable */
export function fetch_deposit_history(config: Config, private_key: string, cursor: JsMetaDataCursor): Promise<JsDepositHistory>;
export function fetch_transfer_history(config: Config, private_key: string, cursor: JsMetaDataCursor): Promise<JsTransferHistory>;
export function fetch_tx_history(config: Config, private_key: string, cursor: JsMetaDataCursor): Promise<JsTxHistory>;
export function save_derive_path(config: Config, private_key: string, derive: JsDerive): Promise<string>;
export function get_derive_path_list(config: Config, private_key: string): Promise<JsDerive[]>;
/**
 * Decrypt the deposit data.
 */
export function decrypt_deposit_data(private_key: string, data: Uint8Array): Promise<JsDepositData>;
/**
 * Decrypt the transfer data. This is also used to decrypt the withdrawal data.
 */
export function decrypt_transfer_data(private_key: string, data: Uint8Array): Promise<JsTransferData>;
/**
 * Decrypt the tx data.
 */
export function decrypt_tx_data(private_key: string, data: Uint8Array): Promise<JsTxData>;
export function generate_auth_for_store_vault(private_key: string): Promise<JsAuth>;
export function fetch_encrypted_data(config: Config, auth: JsAuth, cursor: JsMetaDataCursor): Promise<JsEncryptedData[]>;
export function sign_message(private_key: string, message: Uint8Array): Promise<JsFlatG2>;
export function verify_signature(signature: JsFlatG2, public_key: string, message: Uint8Array): Promise<boolean>;
export function get_account_info(config: Config, public_key: string): Promise<JsAccountInfo>;
/**
 * Generate a new key pair from the given ethereum private key (32bytes hex string).
 */
export function generate_intmax_account_from_eth_key(eth_private_key: string): Promise<IntmaxAccount>;
/**
 * Function to take a backup before calling the deposit function of the liquidity contract.
 * You can also get the pubkey_salt_hash from the return value.
 */
export function prepare_deposit(config: Config, depositor: string, recipient: string, amount: string, token_type: number, token_address: string, token_id: string, is_mining: boolean): Promise<JsDepositResult>;
/**
 * Function to send a tx request to the block builder. The return value contains information to take a backup.
 */
export function send_tx_request(config: Config, block_builder_url: string, private_key: string, transfers: JsTransfer[], payment_memos: JsPaymentMemoEntry[], beneficiary?: string | null, fee?: JsFee | null, collateral_fee?: JsFee | null): Promise<JsTxRequestMemo>;
/**
 * Function to query the block proposal from the block builder, and
 * send the signed tx tree root to the block builder during taking a backup of the tx.
 */
export function query_and_finalize(config: Config, block_builder_url: string, private_key: string, tx_request_memo: JsTxRequestMemo): Promise<JsTxResult>;
export function get_tx_status(config: Config, pubkey: string, tx_tree_root: string): Promise<string>;
/**
 * Synchronize the user's balance proof. It may take a long time to generate ZKP.
 */
export function sync(config: Config, private_key: string): Promise<void>;
/**
 * Resynchronize the user's balance proof.
 */
export function resync(config: Config, private_key: string, is_deep: boolean): Promise<void>;
/**
 * Synchronize the user's withdrawal proof, and send request to the withdrawal aggregator.
 * It may take a long time to generate ZKP.
 */
export function sync_withdrawals(config: Config, private_key: string, fee_token_index: number): Promise<void>;
/**
 * Synchronize the user's claim of staking mining, and send request to the withdrawal aggregator.
 * It may take a long time to generate ZKP.
 */
export function sync_claims(config: Config, private_key: string, recipient: string, fee_token_index: number): Promise<void>;
/**
 * Get the user's data. It is recommended to sync before calling this function.
 */
export function get_user_data(config: Config, private_key: string): Promise<JsUserData>;
export function get_withdrawal_info(config: Config, private_key: string): Promise<JsWithdrawalInfo[]>;
export function get_withdrawal_info_by_recipient(config: Config, recipient: string): Promise<JsWithdrawalInfo[]>;
export function get_mining_list(config: Config, private_key: string): Promise<JsMining[]>;
export function get_claim_info(config: Config, private_key: string): Promise<JsClaimInfo[]>;
export function quote_transfer_fee(config: Config, block_builder_url: string, pubkey: string, fee_token_index: number): Promise<JsFeeQuote>;
export function quote_withdrawal_fee(config: Config, withdrawal_token_index: number, fee_token_index: number): Promise<JsFeeQuote>;
export function quote_claim_fee(config: Config, fee_token_index: number): Promise<JsFeeQuote>;
export function generate_withdrawal_transfers(config: Config, withdrawal_transfer: JsTransfer, fee_token_index: number, with_claim_fee: boolean): Promise<JsWithdrawalTransfers>;
/**
 * Generate fee payment memo from given transfers and fee transfer indices
 */
export function generate_fee_payment_memo(transfers: JsTransfer[], withdrawal_fee_transfer_index?: number | null, claim_fee_transfer_index?: number | null): JsPaymentMemoEntry[];
export class Config {
  free(): void;
  constructor(store_vault_server_url: string, balance_prover_url: string, validity_prover_url: string, withdrawal_server_url: string, deposit_timeout: bigint, tx_timeout: bigint, block_builder_request_interval: bigint, block_builder_request_limit: bigint, block_builder_query_wait_time: bigint, block_builder_query_interval: bigint, block_builder_query_limit: bigint, l1_rpc_url: string, l1_chain_id: bigint, liquidity_contract_address: string, l2_rpc_url: string, l2_chain_id: bigint, rollup_contract_address: string, rollup_contract_deployed_block_number: bigint, withdrawal_contract_address: string);
  /**
   * URL of the store vault server
   */
  store_vault_server_url: string;
  /**
   * URL of the balance prover
   */
  balance_prover_url: string;
  /**
   * URL of the block validity prover
   */
  validity_prover_url: string;
  /**
   * URL of the withdrawal aggregator
   */
  withdrawal_server_url: string;
  /**
   * Time to reach the rollup contract after taking a backup of the deposit
   * If this time is exceeded, the deposit backup will be ignored
   */
  deposit_timeout: bigint;
  /**
   * Time to reach the rollup contract after sending a tx request
   * If this time is exceeded, the tx request will be ignored
   */
  tx_timeout: bigint;
  /**
   * Interval between retries for tx requests
   */
  block_builder_request_interval: bigint;
  /**
   * Maximum number of retries for tx requests,
   */
  block_builder_request_limit: bigint;
  /**
   * Initial wait time for tx query
   */
  block_builder_query_wait_time: bigint;
  /**
   * Interval between retries for tx queries
   */
  block_builder_query_interval: bigint;
  /**
   * Maximum number of retries for tx queries
   */
  block_builder_query_limit: bigint;
  /**
   * URL of the Ethereum RPC
   */
  l1_rpc_url: string;
  /**
   * Chain ID of the Ethereum network
   */
  l1_chain_id: bigint;
  /**
   * Address of the liquidity contract
   */
  liquidity_contract_address: string;
  /**
   * URL of the Scroll RPC
   */
  l2_rpc_url: string;
  /**
   * Chain ID of the Scroll network
   */
  l2_chain_id: bigint;
  /**
   * Address of the rollup contract
   */
  rollup_contract_address: string;
  /**
   * Scroll block number when the rollup contract was deployed
   */
  rollup_contract_deployed_block_number: bigint;
  /**
   * Address of the withdrawal contract
   */
  withdrawal_contract_address: string;
}
export class IntmaxAccount {
  private constructor();
  free(): void;
  privkey: string;
  pubkey: string;
}
export class JsAccountInfo {
  private constructor();
  free(): void;
  get account_id(): bigint | undefined;
  set account_id(value: bigint | null | undefined);
  block_number: number;
  last_block_number: number;
}
export class JsAuth {
  private constructor();
  free(): void;
  pubkey: string;
  expiry: bigint;
  signature: JsFlatG2;
}
export class JsBlock {
  private constructor();
  free(): void;
  prev_block_hash: string;
  deposit_tree_root: string;
  signature_hash: string;
  timestamp: bigint;
  block_number: number;
}
export class JsBlockProposal {
  private constructor();
  free(): void;
  tx_tree_root(): string;
}
export class JsClaim {
  private constructor();
  free(): void;
  recipient: string;
  amount: string;
  nullifier: string;
  block_hash: string;
  block_number: number;
}
export class JsClaimInfo {
  private constructor();
  free(): void;
  status: string;
  claim: JsClaim;
}
export class JsContractWithdrawal {
  free(): void;
  constructor(recipient: string, token_index: number, amount: string, nullifier: string);
  hash(): string;
  recipient: string;
  token_index: number;
  amount: string;
  nullifier: string;
}
export class JsDepositData {
  private constructor();
  free(): void;
  deposit_salt: string;
  depositor: string;
  pubkey_salt_hash: string;
  amount: string;
  is_eligible: boolean;
  token_type: number;
  token_address: string;
  token_id: string;
  is_mining: boolean;
  get token_index(): number | undefined;
  set token_index(value: number | null | undefined);
}
export class JsDepositEntry {
  private constructor();
  free(): void;
  data: JsDepositData;
  status: JsEntryStatusWithBlockNumber;
  meta: JsMetaData;
}
export class JsDepositHistory {
  private constructor();
  free(): void;
  history: JsDepositEntry[];
  cursor_response: JsMetaDataCursorResponse;
}
export class JsDepositResult {
  private constructor();
  free(): void;
  deposit_data: JsDepositData;
  deposit_uuid: string;
}
export class JsDerive {
  free(): void;
  constructor(derive_path: number, redeposit_path: number);
  derive_path: number;
  redeposit_path: number;
}
export class JsEncryptedData {
  private constructor();
  free(): void;
  data: Uint8Array;
  uuid: string;
  timestamp: bigint;
  /**
   * Deposit, Transfer(Receive), Tx(Send)
   */
  data_type: string;
}
export class JsEntryStatusWithBlockNumber {
  private constructor();
  free(): void;
  /**
   * The status of the entry
   * - "settled": The entry has been on-chain but not yet incorporated into the proof
   * - "processed": The entry has been incorporated into the proof
   * - "pending": The entry is not yet on-chain
   * - "timeout": The entry is not yet on-chain and has timed out
   */
  status: string;
  get block_number(): number | undefined;
  set block_number(value: number | null | undefined);
}
export class JsFee {
  free(): void;
  constructor(amount: string, token_index: number);
  amount: string;
  token_index: number;
}
export class JsFeeInfo {
  private constructor();
  free(): void;
  get beneficiary(): string | undefined;
  set beneficiary(value: string | null | undefined);
  get registration_fee(): JsFee[] | undefined;
  set registration_fee(value: JsFee[] | null | undefined);
  get non_registration_fee(): JsFee[] | undefined;
  set non_registration_fee(value: JsFee[] | null | undefined);
  get registration_collateral_fee(): JsFee[] | undefined;
  set registration_collateral_fee(value: JsFee[] | null | undefined);
  get non_registration_collateral_fee(): JsFee[] | undefined;
  set non_registration_collateral_fee(value: JsFee[] | null | undefined);
}
export class JsFeeQuote {
  private constructor();
  free(): void;
  get beneficiary(): string | undefined;
  set beneficiary(value: string | null | undefined);
  get fee(): JsFee | undefined;
  set fee(value: JsFee | null | undefined);
  get collateral_fee(): JsFee | undefined;
  set collateral_fee(value: JsFee | null | undefined);
}
export class JsFlatG2 {
  free(): void;
  constructor(elements: string[]);
  elements: string[];
}
export class JsGenericAddress {
  free(): void;
  constructor(is_pubkey: boolean, data: string);
  /**
   * true if pubkey, false if ethereum address
   */
  is_pubkey: boolean;
  /**
   * hex string of 32 bytes (pubkey) or 20 bytes (ethereum address)
   */
  data: string;
}
export class JsMetaData {
  private constructor();
  free(): void;
  timestamp: bigint;
  uuid: string;
}
export class JsMetaDataCursor {
  free(): void;
  constructor(cursor: JsMetaData | null | undefined, order: string, limit?: number | null);
  get cursor(): JsMetaData | undefined;
  set cursor(value: JsMetaData | null | undefined);
  order: string;
  get limit(): number | undefined;
  set limit(value: number | null | undefined);
}
export class JsMetaDataCursorResponse {
  free(): void;
  constructor(next_cursor: JsMetaData | null | undefined, has_more: boolean, total_count: number);
  get next_cursor(): JsMetaData | undefined;
  set next_cursor(value: JsMetaData | null | undefined);
  has_more: boolean;
  total_count: number;
}
export class JsMining {
  private constructor();
  free(): void;
  meta: JsMetaData;
  deposit_data: JsDepositData;
  block: JsBlock;
  maturity: bigint;
  status: string;
}
export class JsPaymentMemoEntry {
  private constructor();
  free(): void;
  transfer_index: number;
  topic: string;
  memo: string;
}
export class JsTransfer {
  free(): void;
  constructor(recipient: JsGenericAddress, token_index: number, amount: string, salt: string);
  to_withdrawal(): JsContractWithdrawal;
  recipient: JsGenericAddress;
  token_index: number;
  amount: string;
  salt: string;
}
export class JsTransferData {
  private constructor();
  free(): void;
  sender: string;
  transfer: JsTransfer;
}
export class JsTransferEntry {
  private constructor();
  free(): void;
  data: JsTransferData;
  status: JsEntryStatusWithBlockNumber;
  meta: JsMetaData;
}
export class JsTransferHistory {
  private constructor();
  free(): void;
  history: JsTransferEntry[];
  cursor_response: JsMetaDataCursorResponse;
}
export class JsTx {
  private constructor();
  free(): void;
  transfer_tree_root: string;
  nonce: number;
}
export class JsTxData {
  private constructor();
  free(): void;
  tx: JsTx;
  transfers: JsTransfer[];
}
export class JsTxEntry {
  private constructor();
  free(): void;
  data: JsTxData;
  status: JsEntryStatusWithBlockNumber;
  meta: JsMetaData;
}
export class JsTxHistory {
  private constructor();
  free(): void;
  history: JsTxEntry[];
  cursor_response: JsMetaDataCursorResponse;
}
export class JsTxRequestMemo {
  private constructor();
  free(): void;
  tx(): JsTx;
  is_registration_block(): boolean;
}
export class JsTxResult {
  private constructor();
  free(): void;
  tx_tree_root: string;
  transfer_uuids: string[];
  withdrawal_uuids: string[];
}
export class JsUserData {
  private constructor();
  free(): void;
  /**
   * The user public key
   */
  pubkey: string;
  /**
   * The token balances of the user
   */
  balances: TokenBalance[];
  /**
   * The private commitment of the user
   */
  private_commitment: string;
  /**
   * The last unix timestamp of processed deposits
   */
  deposit_lpt: bigint;
  /**
   * The last unix timestamp of processed transfers
   */
  transfer_lpt: bigint;
  /**
   * The last unix timestamp of processed txs
   */
  tx_lpt: bigint;
  /**
   * The last unix timestamp of processed withdrawals
   */
  withdrawal_lpt: bigint;
  /**
   * Uuids of processed deposits
   */
  processed_deposit_uuids: string[];
  /**
   * Uuids of processed transfers
   */
  processed_transfer_uuids: string[];
  /**
   * Uuids of processed txs
   */
  processed_tx_uuids: string[];
  /**
   * Uuids of processed withdrawals
   */
  processed_withdrawal_uuids: string[];
}
export class JsWithdrawalInfo {
  private constructor();
  free(): void;
  status: string;
  contract_withdrawal: JsContractWithdrawal;
}
export class JsWithdrawalTransfers {
  private constructor();
  free(): void;
  transfers: JsTransfer[];
  get withdrawal_fee_transfer_index(): number | undefined;
  set withdrawal_fee_transfer_index(value: number | null | undefined);
  get claim_fee_transfer_index(): number | undefined;
  set claim_fee_transfer_index(value: number | null | undefined);
}
export class TokenBalance {
  private constructor();
  free(): void;
  /**
   * Token index of the balance
   */
  token_index: number;
  /**
   * The amount of the token. 10 base string
   */
  amount: string;
  /**
   * Flag indicating whether the balance is insufficient for that token index.
   * If true, subsequent transfers or withdrawals for that token index will be impossible.
   */
  is_insufficient: boolean;
}
