/* tslint:disable */
/* eslint-disable */
export function save_derive_path(config: Config, private_key: string, derive: JsDerive): Promise<string>;
export function get_derive_path_list(config: Config, private_key: string): Promise<JsDerive[]>;
/**
 * Generate a new key pair from the given ethereum private key (32bytes hex string).
 */
export function generate_intmax_account_from_eth_key(eth_private_key: string): Promise<IntmaxAccount>;
/**
 * Get the hash of the deposit.
 */
export function get_deposit_hash(depositor: string, recipient_salt_hash: string, token_index: number, amount: string, is_eligible: boolean): string;
/**
 * Function to take a backup before calling the deposit function of the liquidity contract.
 * You can also get the pubkey_salt_hash from the return value.
 */
export function prepare_deposit(config: Config, depositor: string, recipient: string, amount: string, token_type: number, token_address: string, token_id: string, is_mining: boolean): Promise<JsDepositResult>;
/**
 * Wait for the tx to be sendable. Wait for the sync of validity prover and balance proof.
 */
export function await_tx_sendable(config: Config, private_key: string, transfers: any, fee_quote: JsTransferFeeQuote): Promise<void>;
/**
 * Function to send a tx request to the block builder. The return value contains information to take a backup.
 */
export function send_tx_request(config: Config, block_builder_url: string, private_key: string, transfers: any, payment_memos: any, fee_quote: JsTransferFeeQuote): Promise<JsTxRequestMemo>;
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
export function quote_transfer_fee(config: Config, block_builder_url: string, pubkey: string, fee_token_index: number): Promise<JsTransferFeeQuote>;
export function quote_withdrawal_fee(config: Config, withdrawal_token_index: number, fee_token_index: number): Promise<JsFeeQuote>;
export function quote_claim_fee(config: Config, fee_token_index: number): Promise<JsFeeQuote>;
export function make_history_backup(config: Config, private_key: string, from: bigint, chunk_size: number): Promise<string[]>;
export function generate_transfer_receipt(config: Config, private_key: string, tx_digest: string, transfer_index: number): Promise<string>;
export function validate_transfer_receipt(config: Config, private_key: string, transfer_receipt: string): Promise<JsTransferData>;
export function get_balances_without_sync(config: Config, private_key: string): Promise<TokenBalance[]>;
export function check_validity_prover(config: Config): Promise<void>;
export function generate_withdrawal_transfers(config: Config, withdrawal_transfer: JsTransfer, fee_token_index: number, with_claim_fee: boolean): Promise<JsWithdrawalTransfers>;
/**
 * Generate fee payment memo from given transfers and fee transfer indices
 */
export function generate_fee_payment_memo(transfers: JsTransfer[], withdrawal_fee_transfer_index?: number | null, claim_fee_transfer_index?: number | null): JsPaymentMemoEntry[];
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
export function generate_auth_for_store_vault(private_key: string, use_s3: boolean): Promise<JsAuth>;
export function fetch_encrypted_data(config: Config, auth: JsAuth, cursor: JsMetaDataCursor): Promise<JsEncryptedData[]>;
export function get_account_info(config: Config, public_key: string): Promise<JsAccountInfo>;
export function get_deposit_info(config: Config, pubkey_salt_hash: string): Promise<JsDepositInfo | undefined>;
export function sign_message(private_key: string, message: Uint8Array): Promise<JsFlatG2>;
export function verify_signature(signature: JsFlatG2, public_key: string, message: Uint8Array): Promise<boolean>;
export function calc_simple_aggregated_pubkey(signers: string[]): string;
export function encrypt_message(pubkey: string, data: Uint8Array): Uint8Array;
export function decrypt_bls_interaction_step1(client_key: string, encrypted_data: Uint8Array): JsMultiEciesStep1Response;
export function decrypt_bls_interaction_step2(server_key: string, step1_response: JsMultiEciesStep1Response): JsMultiEciesStep2Response;
export function decrypt_bls_interaction_step3(client_key: string, step1_response: JsMultiEciesStep1Response, step2_response: JsMultiEciesStep2Response): JsMultiEciesStep3Response;
export function multi_signature_interaction_step1(client_private_key: string, message: Uint8Array): JsMultisigStep1Response;
export function multi_signature_interaction_step2(server_private_key: string, step1_response: JsMultisigStep1Response): JsMultisigStep2Response;
export function multi_signature_interaction_step3(client_private_key: string, step1_response: JsMultisigStep1Response, step2_response: JsMultisigStep2Response): JsMultisigStep3Response;
export function fetch_deposit_history(config: Config, private_key: string, cursor: JsMetaDataCursor): Promise<JsDepositHistory>;
export function fetch_transfer_history(config: Config, private_key: string, cursor: JsMetaDataCursor): Promise<JsTransferHistory>;
export function fetch_tx_history(config: Config, private_key: string, cursor: JsMetaDataCursor): Promise<JsTxHistory>;
export class Config {
  free(): void;
  constructor(store_vault_server_url: string, balance_prover_url: string, validity_prover_url: string, withdrawal_server_url: string, deposit_timeout: bigint, tx_timeout: bigint, is_faster_mining: boolean, block_builder_query_wait_time: bigint, block_builder_query_interval: bigint, block_builder_query_limit: bigint, l1_rpc_url: string, liquidity_contract_address: string, l2_rpc_url: string, rollup_contract_address: string, withdrawal_contract_address: string, use_private_zkp_server: boolean, use_s3: boolean, private_zkp_server_max_retires?: number | null, private_zkp_server_retry_interval?: bigint | null);
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
  is_faster_mining: boolean;
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
   * Address of the liquidity contract
   */
  liquidity_contract_address: string;
  /**
   * URL of the Scroll RPC
   */
  l2_rpc_url: string;
  /**
   * Address of the rollup contract
   */
  rollup_contract_address: string;
  /**
   * Address of the withdrawal contract
   */
  withdrawal_contract_address: string;
  use_private_zkp_server: boolean;
  use_s3: boolean;
  get private_zkp_server_max_retires(): number | undefined;
  set private_zkp_server_max_retires(value: number | null | undefined);
  get private_zkp_server_retry_interval(): bigint | undefined;
  set private_zkp_server_retry_interval(value: bigint | null | undefined);
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
  get submit_claim_proof_tx_hash(): string | undefined;
  set submit_claim_proof_tx_hash(value: string | null | undefined);
  get l1_tx_hash(): string | undefined;
  set l1_tx_hash(value: string | null | undefined);
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
export class JsDepositInfo {
  private constructor();
  free(): void;
  deposit_id: bigint;
  token_index: number;
  deposit_hash: string;
  get block_number(): number | undefined;
  set block_number(value: number | null | undefined);
  get deposit_index(): number | undefined;
  set deposit_index(value: number | null | undefined);
  l1_deposit_tx_hash: string;
}
export class JsDepositResult {
  private constructor();
  free(): void;
  deposit_data: JsDepositData;
  deposit_digest: string;
  backup_csv: string;
}
export class JsDerive {
  free(): void;
  constructor(derive_path: number, redeposit_path: number);
  derive_path: number;
  redeposit_path: number;
}
export class JsEllipticCurvePoint {
  private constructor();
  free(): void;
  x: string;
  y_parity: boolean;
}
export class JsEncryptedData {
  private constructor();
  free(): void;
  data: Uint8Array;
  digest: string;
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
  digest: string;
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
  get block(): JsBlock | undefined;
  set block(value: JsBlock | null | undefined);
  get maturity(): bigint | undefined;
  set maturity(value: bigint | null | undefined);
  status: string;
}
export class JsMultiEciesStep1Response {
  private constructor();
  free(): void;
  encrypted_data: Uint8Array;
  client_pubkey: string;
}
export class JsMultiEciesStep2Response {
  private constructor();
  free(): void;
  server_ecdh_share: JsEllipticCurvePoint;
  server_proof: JsZKProofForEcdhShare;
  server_pubkey: string;
}
export class JsMultiEciesStep3Response {
  private constructor();
  free(): void;
  message: Uint8Array;
}
export class JsMultisigStep1Response {
  private constructor();
  free(): void;
  client_pubkey: string;
  message: Uint8Array;
}
export class JsMultisigStep2Response {
  private constructor();
  free(): void;
  server_signature: JsFlatG2;
  server_pubkey: string;
}
export class JsMultisigStep3Response {
  private constructor();
  free(): void;
  aggregated_signature: JsFlatG2;
  aggregated_pubkey: string;
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
export class JsTransferFeeQuote {
  private constructor();
  free(): void;
  get beneficiary(): string | undefined;
  set beneficiary(value: string | null | undefined);
  get fee(): JsFee | undefined;
  set fee(value: JsFee | null | undefined);
  get collateral_fee(): JsFee | undefined;
  set collateral_fee(value: JsFee | null | undefined);
  block_builder_address: string;
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
  transfer_digests: string[];
  transfer_types: string[];
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
  tx_digest: string;
  tx_data: JsTxData;
  transfer_data_vec: JsTransferData[];
  backup_csv: string;
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
   * Digests of processed deposits
   */
  processed_deposit_digests: string[];
  /**
   * Digests of processed transfers
   */
  processed_transfer_digests: string[];
  /**
   * Digests of processed txs
   */
  processed_tx_digests: string[];
  /**
   * Digests of processed withdrawals
   */
  processed_withdrawal_digests: string[];
}
export class JsWithdrawalInfo {
  private constructor();
  free(): void;
  status: string;
  contract_withdrawal: JsContractWithdrawal;
  get l1_tx_hash(): string | undefined;
  set l1_tx_hash(value: string | null | undefined);
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
export class JsZKProofForEcdhShare {
  private constructor();
  free(): void;
  a: JsEllipticCurvePoint;
  b: JsEllipticCurvePoint;
  z: string;
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

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_jsmultieciesstep1response_free: (a: number, b: number) => void;
  readonly __wbg_get_jsmultieciesstep1response_encrypted_data: (a: number) => [number, number];
  readonly __wbg_get_jsmultieciesstep1response_client_pubkey: (a: number) => [number, number];
  readonly __wbg_set_jsmultieciesstep1response_client_pubkey: (a: number, b: number, c: number) => void;
  readonly __wbg_jsellipticcurvepoint_free: (a: number, b: number) => void;
  readonly __wbg_get_jsellipticcurvepoint_x: (a: number) => [number, number];
  readonly __wbg_set_jsellipticcurvepoint_x: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsellipticcurvepoint_y_parity: (a: number) => number;
  readonly __wbg_set_jsellipticcurvepoint_y_parity: (a: number, b: number) => void;
  readonly __wbg_jszkproofforecdhshare_free: (a: number, b: number) => void;
  readonly __wbg_get_jszkproofforecdhshare_b: (a: number) => number;
  readonly __wbg_set_jszkproofforecdhshare_b: (a: number, b: number) => void;
  readonly __wbg_get_jszkproofforecdhshare_z: (a: number) => [number, number];
  readonly __wbg_set_jszkproofforecdhshare_z: (a: number, b: number, c: number) => void;
  readonly __wbg_jsmultieciesstep2response_free: (a: number, b: number) => void;
  readonly __wbg_get_jsmultieciesstep2response_server_ecdh_share: (a: number) => number;
  readonly __wbg_set_jsmultieciesstep2response_server_ecdh_share: (a: number, b: number) => void;
  readonly __wbg_get_jsmultieciesstep2response_server_proof: (a: number) => number;
  readonly __wbg_set_jsmultieciesstep2response_server_proof: (a: number, b: number) => void;
  readonly __wbg_get_jsmultieciesstep2response_server_pubkey: (a: number) => [number, number];
  readonly __wbg_set_jsmultieciesstep2response_server_pubkey: (a: number, b: number, c: number) => void;
  readonly __wbg_jsmultieciesstep3response_free: (a: number, b: number) => void;
  readonly __wbg_jsmultisigstep1response_free: (a: number, b: number) => void;
  readonly __wbg_get_jsmultisigstep1response_message: (a: number) => [number, number];
  readonly __wbg_jsmultisigstep2response_free: (a: number, b: number) => void;
  readonly __wbg_get_jsmultisigstep2response_server_signature: (a: number) => number;
  readonly __wbg_set_jsmultisigstep2response_server_signature: (a: number, b: number) => void;
  readonly __wbg_jsmultisigstep3response_free: (a: number, b: number) => void;
  readonly __wbg_get_jsmultisigstep3response_aggregated_signature: (a: number) => number;
  readonly __wbg_set_jsmultieciesstep1response_encrypted_data: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsmultieciesstep3response_message: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsmultisigstep1response_client_pubkey: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsmultisigstep1response_message: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsmultisigstep2response_server_pubkey: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsmultisigstep3response_aggregated_pubkey: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsmultisigstep3response_aggregated_signature: (a: number, b: number) => void;
  readonly __wbg_get_jsmultisigstep1response_client_pubkey: (a: number) => [number, number];
  readonly __wbg_get_jsmultisigstep2response_server_pubkey: (a: number) => [number, number];
  readonly __wbg_get_jsmultisigstep3response_aggregated_pubkey: (a: number) => [number, number];
  readonly __wbg_set_jszkproofforecdhshare_a: (a: number, b: number) => void;
  readonly __wbg_get_jsmultieciesstep3response_message: (a: number) => [number, number];
  readonly __wbg_get_jszkproofforecdhshare_a: (a: number) => number;
  readonly __wbg_jsdepositinfo_free: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositinfo_deposit_id: (a: number) => bigint;
  readonly __wbg_set_jsdepositinfo_deposit_id: (a: number, b: bigint) => void;
  readonly __wbg_get_jsdepositinfo_token_index: (a: number) => number;
  readonly __wbg_set_jsdepositinfo_token_index: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositinfo_deposit_hash: (a: number) => [number, number];
  readonly __wbg_set_jsdepositinfo_deposit_hash: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdepositinfo_block_number: (a: number) => number;
  readonly __wbg_set_jsdepositinfo_block_number: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositinfo_deposit_index: (a: number) => number;
  readonly __wbg_set_jsdepositinfo_deposit_index: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositinfo_l1_deposit_tx_hash: (a: number) => [number, number];
  readonly __wbg_set_jsdepositinfo_l1_deposit_tx_hash: (a: number, b: number, c: number) => void;
  readonly __wbg_jspaymentmemoentry_free: (a: number, b: number) => void;
  readonly __wbg_get_jspaymentmemoentry_transfer_index: (a: number) => number;
  readonly __wbg_set_jspaymentmemoentry_transfer_index: (a: number, b: number) => void;
  readonly __wbg_get_jspaymentmemoentry_topic: (a: number) => [number, number];
  readonly __wbg_set_jspaymentmemoentry_topic: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jspaymentmemoentry_memo: (a: number) => [number, number];
  readonly __wbg_set_jspaymentmemoentry_memo: (a: number, b: number, c: number) => void;
  readonly __wbg_jsderive_free: (a: number, b: number) => void;
  readonly __wbg_get_jsderive_derive_path: (a: number) => number;
  readonly __wbg_set_jsderive_derive_path: (a: number, b: number) => void;
  readonly __wbg_get_jsderive_redeposit_path: (a: number) => number;
  readonly __wbg_set_jsderive_redeposit_path: (a: number, b: number) => void;
  readonly jsderive_new: (a: number, b: number) => number;
  readonly save_derive_path: (a: number, b: number, c: number, d: number) => any;
  readonly get_derive_path_list: (a: number, b: number, c: number) => any;
  readonly __wbg_jsaccountinfo_free: (a: number, b: number) => void;
  readonly __wbg_get_jsaccountinfo_account_id: (a: number) => [number, bigint];
  readonly __wbg_set_jsaccountinfo_account_id: (a: number, b: number, c: bigint) => void;
  readonly __wbg_get_jsaccountinfo_block_number: (a: number) => number;
  readonly __wbg_set_jsaccountinfo_block_number: (a: number, b: number) => void;
  readonly __wbg_get_jsaccountinfo_last_block_number: (a: number) => number;
  readonly __wbg_set_jsaccountinfo_last_block_number: (a: number, b: number) => void;
  readonly __wbg_jsgenericaddress_free: (a: number, b: number) => void;
  readonly __wbg_get_jsgenericaddress_is_pubkey: (a: number) => number;
  readonly __wbg_set_jsgenericaddress_is_pubkey: (a: number, b: number) => void;
  readonly jsgenericaddress_new: (a: number, b: number, c: number) => [number, number, number];
  readonly __wbg_jstransfer_free: (a: number, b: number) => void;
  readonly __wbg_get_jstransfer_recipient: (a: number) => number;
  readonly __wbg_set_jstransfer_recipient: (a: number, b: number) => void;
  readonly __wbg_get_jstransfer_token_index: (a: number) => number;
  readonly __wbg_set_jstransfer_token_index: (a: number, b: number) => void;
  readonly __wbg_get_jstransfer_amount: (a: number) => [number, number];
  readonly __wbg_set_jstransfer_amount: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstransfer_salt: (a: number) => [number, number];
  readonly __wbg_set_jstransfer_salt: (a: number, b: number, c: number) => void;
  readonly jstransfer_new: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly jstransfer_to_withdrawal: (a: number) => [number, number, number];
  readonly __wbg_jstx_free: (a: number, b: number) => void;
  readonly __wbg_jscontractwithdrawal_free: (a: number, b: number) => void;
  readonly __wbg_get_jscontractwithdrawal_token_index: (a: number) => number;
  readonly __wbg_set_jscontractwithdrawal_token_index: (a: number, b: number) => void;
  readonly jscontractwithdrawal_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly jscontractwithdrawal_hash: (a: number) => [number, number, number, number];
  readonly __wbg_jsclaim_free: (a: number, b: number) => void;
  readonly __wbg_get_jsclaim_recipient: (a: number) => [number, number];
  readonly __wbg_set_jsclaim_recipient: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsclaim_amount: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsclaim_block_hash: (a: number, b: number, c: number) => void;
  readonly __wbg_jsmetadata_free: (a: number, b: number) => void;
  readonly __wbg_jswithdrawalinfo_free: (a: number, b: number) => void;
  readonly __wbg_get_jswithdrawalinfo_contract_withdrawal: (a: number) => number;
  readonly __wbg_set_jswithdrawalinfo_contract_withdrawal: (a: number, b: number) => void;
  readonly __wbg_get_jswithdrawalinfo_l1_tx_hash: (a: number) => [number, number];
  readonly __wbg_set_jswithdrawalinfo_l1_tx_hash: (a: number, b: number, c: number) => void;
  readonly __wbg_jsclaiminfo_free: (a: number, b: number) => void;
  readonly __wbg_get_jsclaiminfo_claim: (a: number) => number;
  readonly __wbg_set_jsclaiminfo_claim: (a: number, b: number) => void;
  readonly __wbg_get_jsclaiminfo_submit_claim_proof_tx_hash: (a: number) => [number, number];
  readonly __wbg_set_jsclaiminfo_submit_claim_proof_tx_hash: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsclaiminfo_l1_tx_hash: (a: number) => [number, number];
  readonly __wbg_set_jsclaiminfo_l1_tx_hash: (a: number, b: number, c: number) => void;
  readonly __wbg_jsblock_free: (a: number, b: number) => void;
  readonly __wbg_get_jsblock_prev_block_hash: (a: number) => [number, number];
  readonly __wbg_set_jsblock_prev_block_hash: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsblock_deposit_tree_root: (a: number) => [number, number];
  readonly __wbg_set_jsblock_deposit_tree_root: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsblock_signature_hash: (a: number) => [number, number];
  readonly __wbg_set_jsblock_signature_hash: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsblock_timestamp: (a: number) => bigint;
  readonly __wbg_set_jsblock_timestamp: (a: number, b: bigint) => void;
  readonly __wbg_get_jsblock_block_number: (a: number) => number;
  readonly __wbg_set_jsblock_block_number: (a: number, b: number) => void;
  readonly __wbg_jsmining_free: (a: number, b: number) => void;
  readonly __wbg_get_jsmining_meta: (a: number) => number;
  readonly __wbg_set_jsmining_meta: (a: number, b: number) => void;
  readonly __wbg_get_jsmining_deposit_data: (a: number) => number;
  readonly __wbg_set_jsmining_deposit_data: (a: number, b: number) => void;
  readonly __wbg_get_jsmining_block: (a: number) => number;
  readonly __wbg_set_jsmining_block: (a: number, b: number) => void;
  readonly __wbg_get_jsmining_status: (a: number) => [number, number];
  readonly __wbg_set_jsmining_status: (a: number, b: number, c: number) => void;
  readonly __wbg_jsdepositdata_free: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositdata_deposit_salt: (a: number) => [number, number];
  readonly __wbg_set_jsdepositdata_deposit_salt: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdepositdata_depositor: (a: number) => [number, number];
  readonly __wbg_set_jsdepositdata_depositor: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdepositdata_pubkey_salt_hash: (a: number) => [number, number];
  readonly __wbg_set_jsdepositdata_pubkey_salt_hash: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdepositdata_amount: (a: number) => [number, number];
  readonly __wbg_set_jsdepositdata_amount: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdepositdata_is_eligible: (a: number) => number;
  readonly __wbg_set_jsdepositdata_is_eligible: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositdata_token_type: (a: number) => number;
  readonly __wbg_set_jsdepositdata_token_type: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositdata_token_address: (a: number) => [number, number];
  readonly __wbg_set_jsdepositdata_token_address: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdepositdata_token_id: (a: number) => [number, number];
  readonly __wbg_set_jsdepositdata_token_id: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdepositdata_is_mining: (a: number) => number;
  readonly __wbg_set_jsdepositdata_is_mining: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositdata_token_index: (a: number) => number;
  readonly __wbg_set_jsdepositdata_token_index: (a: number, b: number) => void;
  readonly __wbg_jstransferdata_free: (a: number, b: number) => void;
  readonly __wbg_get_jstransferdata_transfer: (a: number) => number;
  readonly __wbg_set_jstransferdata_transfer: (a: number, b: number) => void;
  readonly __wbg_jstxdata_free: (a: number, b: number) => void;
  readonly __wbg_get_jstxdata_tx: (a: number) => number;
  readonly __wbg_get_jstxdata_transfers: (a: number) => [number, number];
  readonly __wbg_set_jstxdata_transfers: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstxdata_transfer_digests: (a: number) => [number, number];
  readonly __wbg_set_jstxdata_transfer_digests: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstxdata_transfer_types: (a: number) => [number, number];
  readonly __wbg_set_jstxdata_transfer_types: (a: number, b: number, c: number) => void;
  readonly __wbg_jsdepositresult_free: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositresult_deposit_data: (a: number) => number;
  readonly __wbg_set_jsdepositresult_deposit_data: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositresult_deposit_digest: (a: number) => [number, number];
  readonly __wbg_set_jsdepositresult_deposit_digest: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdepositresult_backup_csv: (a: number) => [number, number];
  readonly __wbg_set_jsdepositresult_backup_csv: (a: number, b: number, c: number) => void;
  readonly __wbg_jstxresult_free: (a: number, b: number) => void;
  readonly __wbg_get_jstxresult_tx_data: (a: number) => number;
  readonly __wbg_set_jstxresult_tx_data: (a: number, b: number) => void;
  readonly __wbg_get_jstxresult_transfer_data_vec: (a: number) => [number, number];
  readonly __wbg_set_jstxresult_transfer_data_vec: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstxresult_backup_csv: (a: number) => [number, number];
  readonly __wbg_set_jstxresult_backup_csv: (a: number, b: number, c: number) => void;
  readonly __wbg_jsuserdata_free: (a: number, b: number) => void;
  readonly __wbg_get_jsuserdata_balances: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_balances: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_private_commitment: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_private_commitment: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_transfer_lpt: (a: number) => bigint;
  readonly __wbg_set_jsuserdata_transfer_lpt: (a: number, b: bigint) => void;
  readonly __wbg_get_jsuserdata_tx_lpt: (a: number) => bigint;
  readonly __wbg_set_jsuserdata_tx_lpt: (a: number, b: bigint) => void;
  readonly __wbg_get_jsuserdata_withdrawal_lpt: (a: number) => bigint;
  readonly __wbg_set_jsuserdata_withdrawal_lpt: (a: number, b: bigint) => void;
  readonly __wbg_get_jsuserdata_processed_deposit_digests: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_processed_deposit_digests: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_processed_transfer_digests: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_processed_transfer_digests: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_processed_tx_digests: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_processed_tx_digests: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_processed_withdrawal_digests: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_processed_withdrawal_digests: (a: number, b: number, c: number) => void;
  readonly __wbg_tokenbalance_free: (a: number, b: number) => void;
  readonly __wbg_get_tokenbalance_is_insufficient: (a: number) => number;
  readonly __wbg_set_tokenbalance_is_insufficient: (a: number, b: number) => void;
  readonly __wbg_jsfee_free: (a: number, b: number) => void;
  readonly __wbg_get_jsfee_token_index: (a: number) => number;
  readonly __wbg_set_jsfee_token_index: (a: number, b: number) => void;
  readonly jsfee_new: (a: number, b: number, c: number) => number;
  readonly __wbg_jstransferfeequote_free: (a: number, b: number) => void;
  readonly __wbg_get_jstransferfeequote_beneficiary: (a: number) => [number, number];
  readonly __wbg_set_jstransferfeequote_beneficiary: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstransferfeequote_fee: (a: number) => number;
  readonly __wbg_set_jstransferfeequote_fee: (a: number, b: number) => void;
  readonly __wbg_get_jstransferfeequote_collateral_fee: (a: number) => number;
  readonly __wbg_set_jstransferfeequote_collateral_fee: (a: number, b: number) => void;
  readonly __wbg_jsfeequote_free: (a: number, b: number) => void;
  readonly __wbg_get_jsfeequote_fee: (a: number) => number;
  readonly __wbg_set_jsfeequote_fee: (a: number, b: number) => void;
  readonly __wbg_get_jsfeequote_collateral_fee: (a: number) => number;
  readonly __wbg_set_jsfeequote_collateral_fee: (a: number, b: number) => void;
  readonly __wbg_jsfeeinfo_free: (a: number, b: number) => void;
  readonly __wbg_get_jsfeeinfo_beneficiary: (a: number) => [number, number];
  readonly __wbg_set_jsfeeinfo_beneficiary: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsfeeinfo_registration_fee: (a: number) => [number, number];
  readonly __wbg_set_jsfeeinfo_registration_fee: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsfeeinfo_non_registration_fee: (a: number) => [number, number];
  readonly __wbg_set_jsfeeinfo_non_registration_fee: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsfeeinfo_registration_collateral_fee: (a: number) => [number, number];
  readonly __wbg_set_jsfeeinfo_registration_collateral_fee: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsfeeinfo_non_registration_collateral_fee: (a: number) => [number, number];
  readonly __wbg_set_jsfeeinfo_non_registration_collateral_fee: (a: number, b: number, c: number) => void;
  readonly __wbg_jswithdrawaltransfers_free: (a: number, b: number) => void;
  readonly __wbg_get_jswithdrawaltransfers_transfers: (a: number) => [number, number];
  readonly __wbg_get_jswithdrawaltransfers_claim_fee_transfer_index: (a: number) => number;
  readonly __wbg_set_jswithdrawaltransfers_claim_fee_transfer_index: (a: number, b: number) => void;
  readonly __wbg_set_jstx_transfer_tree_root: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsgenericaddress_data: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jscontractwithdrawal_recipient: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jscontractwithdrawal_amount: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jscontractwithdrawal_nullifier: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jswithdrawalinfo_status: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsclaiminfo_status: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsmetadata_digest: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsclaim_nullifier: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jstransferdata_sender: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jstxresult_tx_tree_root: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jstxresult_tx_digest: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsuserdata_pubkey: (a: number, b: number, c: number) => void;
  readonly __wbg_set_tokenbalance_amount: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsfee_amount: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jstransferfeequote_block_builder_address: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jswithdrawaltransfers_transfers: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsmetadata_timestamp: (a: number, b: bigint) => void;
  readonly __wbg_set_jsclaim_block_number: (a: number, b: number) => void;
  readonly __wbg_set_jsuserdata_deposit_lpt: (a: number, b: bigint) => void;
  readonly __wbg_set_tokenbalance_token_index: (a: number, b: number) => void;
  readonly __wbg_set_jstx_nonce: (a: number, b: number) => void;
  readonly __wbg_set_jsfeequote_beneficiary: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsmining_maturity: (a: number) => [number, bigint];
  readonly __wbg_get_jsfeequote_beneficiary: (a: number) => [number, number];
  readonly __wbg_get_jsmetadata_timestamp: (a: number) => bigint;
  readonly __wbg_get_jsclaim_block_number: (a: number) => number;
  readonly __wbg_get_jsuserdata_deposit_lpt: (a: number) => bigint;
  readonly __wbg_get_tokenbalance_token_index: (a: number) => number;
  readonly __wbg_get_jstx_nonce: (a: number) => number;
  readonly __wbg_get_jstx_transfer_tree_root: (a: number) => [number, number];
  readonly __wbg_get_jsgenericaddress_data: (a: number) => [number, number];
  readonly __wbg_get_jscontractwithdrawal_recipient: (a: number) => [number, number];
  readonly __wbg_get_jscontractwithdrawal_amount: (a: number) => [number, number];
  readonly __wbg_get_jscontractwithdrawal_nullifier: (a: number) => [number, number];
  readonly __wbg_get_jsmetadata_digest: (a: number) => [number, number];
  readonly __wbg_get_jswithdrawalinfo_status: (a: number) => [number, number];
  readonly __wbg_get_jsclaiminfo_status: (a: number) => [number, number];
  readonly __wbg_get_jsclaim_amount: (a: number) => [number, number];
  readonly __wbg_get_jsclaim_nullifier: (a: number) => [number, number];
  readonly __wbg_get_jsclaim_block_hash: (a: number) => [number, number];
  readonly __wbg_get_jstransferdata_sender: (a: number) => [number, number];
  readonly __wbg_get_jstxresult_tx_tree_root: (a: number) => [number, number];
  readonly __wbg_get_jstxresult_tx_digest: (a: number) => [number, number];
  readonly __wbg_get_jsuserdata_pubkey: (a: number) => [number, number];
  readonly __wbg_get_tokenbalance_amount: (a: number) => [number, number];
  readonly __wbg_get_jsfee_amount: (a: number) => [number, number];
  readonly __wbg_get_jstransferfeequote_block_builder_address: (a: number) => [number, number];
  readonly __wbg_set_jswithdrawaltransfers_withdrawal_fee_transfer_index: (a: number, b: number) => void;
  readonly __wbg_set_jstxdata_tx: (a: number, b: number) => void;
  readonly __wbg_set_jsmining_maturity: (a: number, b: number, c: bigint) => void;
  readonly __wbg_get_jswithdrawaltransfers_withdrawal_fee_transfer_index: (a: number) => number;
  readonly __wbg_config_free: (a: number, b: number) => void;
  readonly __wbg_get_config_store_vault_server_url: (a: number) => [number, number];
  readonly __wbg_set_config_store_vault_server_url: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_balance_prover_url: (a: number) => [number, number];
  readonly __wbg_set_config_balance_prover_url: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_validity_prover_url: (a: number) => [number, number];
  readonly __wbg_set_config_validity_prover_url: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_withdrawal_server_url: (a: number) => [number, number];
  readonly __wbg_set_config_withdrawal_server_url: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_deposit_timeout: (a: number) => bigint;
  readonly __wbg_set_config_deposit_timeout: (a: number, b: bigint) => void;
  readonly __wbg_get_config_tx_timeout: (a: number) => bigint;
  readonly __wbg_set_config_tx_timeout: (a: number, b: bigint) => void;
  readonly __wbg_get_config_is_faster_mining: (a: number) => number;
  readonly __wbg_set_config_is_faster_mining: (a: number, b: number) => void;
  readonly __wbg_get_config_block_builder_query_wait_time: (a: number) => bigint;
  readonly __wbg_set_config_block_builder_query_wait_time: (a: number, b: bigint) => void;
  readonly __wbg_get_config_block_builder_query_interval: (a: number) => bigint;
  readonly __wbg_set_config_block_builder_query_interval: (a: number, b: bigint) => void;
  readonly __wbg_get_config_block_builder_query_limit: (a: number) => bigint;
  readonly __wbg_set_config_block_builder_query_limit: (a: number, b: bigint) => void;
  readonly __wbg_get_config_l1_rpc_url: (a: number) => [number, number];
  readonly __wbg_set_config_l1_rpc_url: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_liquidity_contract_address: (a: number) => [number, number];
  readonly __wbg_set_config_liquidity_contract_address: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_l2_rpc_url: (a: number) => [number, number];
  readonly __wbg_set_config_l2_rpc_url: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_rollup_contract_address: (a: number) => [number, number];
  readonly __wbg_set_config_rollup_contract_address: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_withdrawal_contract_address: (a: number) => [number, number];
  readonly __wbg_set_config_withdrawal_contract_address: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_use_private_zkp_server: (a: number) => number;
  readonly __wbg_set_config_use_private_zkp_server: (a: number, b: number) => void;
  readonly __wbg_get_config_use_s3: (a: number) => number;
  readonly __wbg_set_config_use_s3: (a: number, b: number) => void;
  readonly __wbg_get_config_private_zkp_server_max_retires: (a: number) => number;
  readonly __wbg_set_config_private_zkp_server_max_retires: (a: number, b: number) => void;
  readonly __wbg_get_config_private_zkp_server_retry_interval: (a: number) => [number, bigint];
  readonly __wbg_set_config_private_zkp_server_retry_interval: (a: number, b: number, c: bigint) => void;
  readonly config_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: bigint, j: bigint, k: number, l: bigint, m: bigint, n: bigint, o: number, p: number, q: number, r: number, s: number, t: number, u: number, v: number, w: number, x: number, y: number, z: number, a1: number, b1: number, c1: bigint) => number;
  readonly __wbg_intmaxaccount_free: (a: number, b: number) => void;
  readonly __wbg_get_intmaxaccount_privkey: (a: number) => [number, number];
  readonly __wbg_set_intmaxaccount_privkey: (a: number, b: number, c: number) => void;
  readonly __wbg_get_intmaxaccount_pubkey: (a: number) => [number, number];
  readonly __wbg_set_intmaxaccount_pubkey: (a: number, b: number, c: number) => void;
  readonly generate_intmax_account_from_eth_key: (a: number, b: number) => any;
  readonly get_deposit_hash: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
  readonly prepare_deposit: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => any;
  readonly await_tx_sendable: (a: number, b: number, c: number, d: any, e: number) => any;
  readonly send_tx_request: (a: number, b: number, c: number, d: number, e: number, f: any, g: any, h: number) => any;
  readonly query_and_finalize: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
  readonly get_tx_status: (a: number, b: number, c: number, d: number, e: number) => any;
  readonly sync: (a: number, b: number, c: number) => any;
  readonly resync: (a: number, b: number, c: number, d: number) => any;
  readonly sync_withdrawals: (a: number, b: number, c: number, d: number) => any;
  readonly sync_claims: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
  readonly get_user_data: (a: number, b: number, c: number) => any;
  readonly get_withdrawal_info: (a: number, b: number, c: number) => any;
  readonly get_withdrawal_info_by_recipient: (a: number, b: number, c: number) => any;
  readonly get_mining_list: (a: number, b: number, c: number) => any;
  readonly get_claim_info: (a: number, b: number, c: number) => any;
  readonly quote_transfer_fee: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
  readonly quote_withdrawal_fee: (a: number, b: number, c: number) => any;
  readonly quote_claim_fee: (a: number, b: number) => any;
  readonly make_history_backup: (a: number, b: number, c: number, d: bigint, e: number) => any;
  readonly generate_transfer_receipt: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
  readonly validate_transfer_receipt: (a: number, b: number, c: number, d: number, e: number) => any;
  readonly get_balances_without_sync: (a: number, b: number, c: number) => any;
  readonly check_validity_prover: (a: number) => any;
  readonly generate_withdrawal_transfers: (a: number, b: number, c: number, d: number) => any;
  readonly generate_fee_payment_memo: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly decrypt_deposit_data: (a: number, b: number, c: number, d: number) => any;
  readonly decrypt_transfer_data: (a: number, b: number, c: number, d: number) => any;
  readonly decrypt_tx_data: (a: number, b: number, c: number, d: number) => any;
  readonly generate_auth_for_store_vault: (a: number, b: number, c: number) => any;
  readonly fetch_encrypted_data: (a: number, b: number, c: number) => any;
  readonly get_account_info: (a: number, b: number, c: number) => any;
  readonly get_deposit_info: (a: number, b: number, c: number) => any;
  readonly sign_message: (a: number, b: number, c: number, d: number) => any;
  readonly verify_signature: (a: number, b: number, c: number, d: number, e: number) => any;
  readonly calc_simple_aggregated_pubkey: (a: number, b: number) => [number, number, number, number];
  readonly encrypt_message: (a: number, b: number, c: number, d: number) => [number, number];
  readonly decrypt_bls_interaction_step1: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly decrypt_bls_interaction_step2: (a: number, b: number, c: number) => [number, number, number];
  readonly decrypt_bls_interaction_step3: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly multi_signature_interaction_step1: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly multi_signature_interaction_step2: (a: number, b: number, c: number) => [number, number, number];
  readonly multi_signature_interaction_step3: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly __wbg_jsdeposithistory_free: (a: number, b: number) => void;
  readonly __wbg_get_jsdeposithistory_history: (a: number) => [number, number];
  readonly __wbg_set_jsdeposithistory_history: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdeposithistory_cursor_response: (a: number) => number;
  readonly __wbg_set_jsdeposithistory_cursor_response: (a: number, b: number) => void;
  readonly __wbg_jstransferhistory_free: (a: number, b: number) => void;
  readonly __wbg_get_jstransferhistory_history: (a: number) => [number, number];
  readonly __wbg_set_jstransferhistory_history: (a: number, b: number, c: number) => void;
  readonly __wbg_jstxhistory_free: (a: number, b: number) => void;
  readonly __wbg_get_jstxhistory_history: (a: number) => [number, number];
  readonly __wbg_set_jstxhistory_history: (a: number, b: number, c: number) => void;
  readonly fetch_deposit_history: (a: number, b: number, c: number, d: number) => any;
  readonly fetch_transfer_history: (a: number, b: number, c: number, d: number) => any;
  readonly fetch_tx_history: (a: number, b: number, c: number, d: number) => any;
  readonly __wbg_jsflatg2_free: (a: number, b: number) => void;
  readonly __wbg_get_jsflatg2_elements: (a: number) => [number, number];
  readonly __wbg_set_jsflatg2_elements: (a: number, b: number, c: number) => void;
  readonly jsflatg2_new: (a: number, b: number) => number;
  readonly __wbg_jsauth_free: (a: number, b: number) => void;
  readonly __wbg_get_jsauth_pubkey: (a: number) => [number, number];
  readonly __wbg_set_jsauth_pubkey: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsauth_expiry: (a: number) => bigint;
  readonly __wbg_set_jsauth_expiry: (a: number, b: bigint) => void;
  readonly __wbg_get_jsauth_signature: (a: number) => number;
  readonly __wbg_set_jsauth_signature: (a: number, b: number) => void;
  readonly __wbg_jsentrystatuswithblocknumber_free: (a: number, b: number) => void;
  readonly __wbg_get_jsentrystatuswithblocknumber_status: (a: number) => [number, number];
  readonly __wbg_set_jsentrystatuswithblocknumber_status: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsentrystatuswithblocknumber_block_number: (a: number) => number;
  readonly __wbg_set_jsentrystatuswithblocknumber_block_number: (a: number, b: number) => void;
  readonly __wbg_jsdepositentry_free: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositentry_data: (a: number) => number;
  readonly __wbg_set_jsdepositentry_data: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositentry_status: (a: number) => number;
  readonly __wbg_set_jsdepositentry_status: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositentry_meta: (a: number) => number;
  readonly __wbg_set_jsdepositentry_meta: (a: number, b: number) => void;
  readonly __wbg_jstransferentry_free: (a: number, b: number) => void;
  readonly __wbg_get_jstransferentry_data: (a: number) => number;
  readonly __wbg_set_jstransferentry_data: (a: number, b: number) => void;
  readonly __wbg_get_jstransferentry_status: (a: number) => number;
  readonly __wbg_set_jstransferentry_status: (a: number, b: number) => void;
  readonly __wbg_get_jstransferentry_meta: (a: number) => number;
  readonly __wbg_set_jstransferentry_meta: (a: number, b: number) => void;
  readonly __wbg_jstxentry_free: (a: number, b: number) => void;
  readonly __wbg_get_jstxentry_data: (a: number) => number;
  readonly __wbg_set_jstxentry_data: (a: number, b: number) => void;
  readonly __wbg_get_jstxentry_status: (a: number) => number;
  readonly __wbg_set_jstxentry_status: (a: number, b: number) => void;
  readonly __wbg_set_jstransferhistory_cursor_response: (a: number, b: number) => void;
  readonly __wbg_set_jstxhistory_cursor_response: (a: number, b: number) => void;
  readonly __wbg_set_jstxentry_meta: (a: number, b: number) => void;
  readonly __wbg_get_jstransferhistory_cursor_response: (a: number) => number;
  readonly __wbg_get_jstxhistory_cursor_response: (a: number) => number;
  readonly __wbg_get_jstxentry_meta: (a: number) => number;
  readonly __wbg_jsmetadatacursor_free: (a: number, b: number) => void;
  readonly __wbg_get_jsmetadatacursor_cursor: (a: number) => number;
  readonly __wbg_set_jsmetadatacursor_cursor: (a: number, b: number) => void;
  readonly __wbg_get_jsmetadatacursor_limit: (a: number) => number;
  readonly __wbg_set_jsmetadatacursor_limit: (a: number, b: number) => void;
  readonly jsmetadatacursor_new: (a: number, b: number, c: number, d: number) => number;
  readonly __wbg_jsmetadatacursorresponse_free: (a: number, b: number) => void;
  readonly __wbg_get_jsmetadatacursorresponse_next_cursor: (a: number) => number;
  readonly __wbg_set_jsmetadatacursorresponse_next_cursor: (a: number, b: number) => void;
  readonly __wbg_get_jsmetadatacursorresponse_has_more: (a: number) => number;
  readonly __wbg_set_jsmetadatacursorresponse_has_more: (a: number, b: number) => void;
  readonly __wbg_get_jsmetadatacursorresponse_total_count: (a: number) => number;
  readonly __wbg_set_jsmetadatacursorresponse_total_count: (a: number, b: number) => void;
  readonly jsmetadatacursorresponse_new: (a: number, b: number, c: number) => number;
  readonly __wbg_jsencrypteddata_free: (a: number, b: number) => void;
  readonly __wbg_get_jsencrypteddata_data: (a: number) => [number, number];
  readonly __wbg_set_jsencrypteddata_data: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsencrypteddata_digest: (a: number) => [number, number];
  readonly __wbg_set_jsencrypteddata_digest: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsencrypteddata_timestamp: (a: number) => bigint;
  readonly __wbg_set_jsencrypteddata_timestamp: (a: number, b: bigint) => void;
  readonly __wbg_get_jsencrypteddata_data_type: (a: number) => [number, number];
  readonly __wbg_set_jsencrypteddata_data_type: (a: number, b: number, c: number) => void;
  readonly __wbg_jstxrequestmemo_free: (a: number, b: number) => void;
  readonly jstxrequestmemo_tx: (a: number) => [number, number, number];
  readonly jstxrequestmemo_is_registration_block: (a: number) => [number, number, number];
  readonly __wbg_jsblockproposal_free: (a: number, b: number) => void;
  readonly jsblockproposal_tx_tree_root: (a: number) => [number, number, number, number];
  readonly __wbg_set_jsmetadatacursor_order: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsmetadatacursor_order: (a: number) => [number, number];
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_4: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_6: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h7b1ee111f31eaefa: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hd85ae587763e801d: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__haf279ec2a748ebef: (a: number, b: number) => void;
  readonly closure1793_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure2113_externref_shim: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
