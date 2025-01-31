/* tslint:disable */
/* eslint-disable */
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
export function send_tx_request(config: Config, block_builder_url: string, private_key: string, transfers: (JsTransfer)[]): Promise<JsTxRequestMemo>;
/**
 * Function to query the block proposal from the block builder, and
 * send the signed tx tree root to the block builder during taking a backup of the tx.
 */
export function query_and_finalize(config: Config, block_builder_url: string, private_key: string, tx_request_memo: JsTxRequestMemo): Promise<JsTxResult>;
/**
 * Synchronize the user's balance proof. It may take a long time to generate ZKP.
 */
export function sync(config: Config, private_key: string): Promise<void>;
/**
 * Synchronize the user's withdrawal proof, and send request to the withdrawal aggregator.
 * It may take a long time to generate ZKP.
 */
export function sync_withdrawals(config: Config, private_key: string): Promise<void>;
/**
 * Synchronize the user's claim of staking mining, and send request to the withdrawal aggregator.
 * It may take a long time to generate ZKP.
 */
export function sync_claim(config: Config, private_key: string, recipient: string): Promise<void>;
/**
 * Get the user's data. It is recommended to sync before calling this function.
 */
export function get_user_data(config: Config, private_key: string): Promise<JsUserData>;
export function get_withdrawal_info(config: Config, private_key: string): Promise<(JsWithdrawalInfo)[]>;
export function get_withdrawal_info_by_recipient(config: Config, recipient: string): Promise<(JsWithdrawalInfo)[]>;
export function get_mining_list(config: Config, private_key: string): Promise<(JsMining)[]>;
export function get_claim_info(config: Config, private_key: string): Promise<(JsClaimInfo)[]>;
export function fetch_deposit_history(config: Config, private_key: string): Promise<(JsDepositEntry)[]>;
export function fetch_transfer_history(config: Config, private_key: string): Promise<(JsTransferEntry)[]>;
export function fetch_tx_history(config: Config, private_key: string): Promise<(JsTxEntry)[]>;
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
export function fetch_encrypted_data(config: Config, auth: JsAuth, timestamp: bigint | undefined, uuid: string | undefined, limit: number | undefined, order: string): Promise<(JsEncryptedData)[]>;
export class Config {
  free(): void;
  constructor(store_vault_server_url: string, balance_prover_url: string, validity_prover_url: string, withdrawal_server_url: string, deposit_timeout: bigint, tx_timeout: bigint, block_builder_request_interval: bigint, block_builder_request_limit: bigint, block_builder_query_wait_time: bigint, block_builder_query_interval: bigint, block_builder_query_limit: bigint, l1_rpc_url: string, l1_chain_id: bigint, liquidity_contract_address: string, l2_rpc_url: string, l2_chain_id: bigint, rollup_contract_address: string, rollup_contract_deployed_block_number: bigint);
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
}
export class IntmaxAccount {
  private constructor();
  free(): void;
  privkey: string;
  pubkey: string;
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
  token_index?: number;
}
export class JsDepositEntry {
  private constructor();
  free(): void;
  data: JsDepositData;
  status: JsEntryStatusWithBlockNumber;
  meta: JsMetaData;
}
export class JsDepositResult {
  private constructor();
  free(): void;
  deposit_data: JsDepositData;
  deposit_uuid: string;
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
  block_number?: number;
}
export class JsFlatG2 {
  private constructor();
  free(): void;
  elements: (string)[];
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
export class JsMining {
  private constructor();
  free(): void;
  meta: JsMetaData;
  deposit_data: JsDepositData;
  block: JsBlock;
  maturity: bigint;
  status: string;
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
  transfers: (JsTransfer)[];
}
export class JsTxEntry {
  private constructor();
  free(): void;
  data: JsTxData;
  status: JsEntryStatusWithBlockNumber;
  meta: JsMetaData;
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
  transfer_uuids: (string)[];
  withdrawal_uuids: (string)[];
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
  balances: (TokenBalance)[];
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
  processed_deposit_uuids: (string)[];
  /**
   * Uuids of processed transfers
   */
  processed_transfer_uuids: (string)[];
  /**
   * Uuids of processed txs
   */
  processed_tx_uuids: (string)[];
  /**
   * Uuids of processed withdrawals
   */
  processed_withdrawal_uuids: (string)[];
}
export class JsWithdrawalInfo {
  private constructor();
  free(): void;
  status: string;
  contract_withdrawal: JsContractWithdrawal;
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
  readonly __wbg_get_jstransferdata_sender: (a: number) => [number, number];
  readonly __wbg_set_jstransferdata_sender: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstransferdata_transfer: (a: number) => number;
  readonly __wbg_set_jstransferdata_transfer: (a: number, b: number) => void;
  readonly __wbg_jstxdata_free: (a: number, b: number) => void;
  readonly __wbg_get_jstxdata_tx: (a: number) => number;
  readonly __wbg_set_jstxdata_tx: (a: number, b: number) => void;
  readonly __wbg_get_jstxdata_transfers: (a: number) => [number, number];
  readonly __wbg_set_jstxdata_transfers: (a: number, b: number, c: number) => void;
  readonly __wbg_jsdepositresult_free: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositresult_deposit_data: (a: number) => number;
  readonly __wbg_set_jsdepositresult_deposit_data: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositresult_deposit_uuid: (a: number) => [number, number];
  readonly __wbg_set_jsdepositresult_deposit_uuid: (a: number, b: number, c: number) => void;
  readonly __wbg_jstxresult_free: (a: number, b: number) => void;
  readonly __wbg_get_jstxresult_transfer_uuids: (a: number) => [number, number];
  readonly __wbg_set_jstxresult_transfer_uuids: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstxresult_withdrawal_uuids: (a: number) => [number, number];
  readonly __wbg_set_jstxresult_withdrawal_uuids: (a: number, b: number, c: number) => void;
  readonly __wbg_jsuserdata_free: (a: number, b: number) => void;
  readonly __wbg_get_jsuserdata_pubkey: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_pubkey: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_balances: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_balances: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_private_commitment: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_private_commitment: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_deposit_lpt: (a: number) => bigint;
  readonly __wbg_set_jsuserdata_deposit_lpt: (a: number, b: bigint) => void;
  readonly __wbg_get_jsuserdata_transfer_lpt: (a: number) => bigint;
  readonly __wbg_set_jsuserdata_transfer_lpt: (a: number, b: bigint) => void;
  readonly __wbg_get_jsuserdata_tx_lpt: (a: number) => bigint;
  readonly __wbg_set_jsuserdata_tx_lpt: (a: number, b: bigint) => void;
  readonly __wbg_get_jsuserdata_withdrawal_lpt: (a: number) => bigint;
  readonly __wbg_set_jsuserdata_withdrawal_lpt: (a: number, b: bigint) => void;
  readonly __wbg_get_jsuserdata_processed_deposit_uuids: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_processed_deposit_uuids: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_processed_transfer_uuids: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_processed_transfer_uuids: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_processed_tx_uuids: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_processed_tx_uuids: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_processed_withdrawal_uuids: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_processed_withdrawal_uuids: (a: number, b: number, c: number) => void;
  readonly __wbg_tokenbalance_free: (a: number, b: number) => void;
  readonly __wbg_get_tokenbalance_token_index: (a: number) => number;
  readonly __wbg_set_tokenbalance_token_index: (a: number, b: number) => void;
  readonly __wbg_get_tokenbalance_is_insufficient: (a: number) => number;
  readonly __wbg_set_tokenbalance_is_insufficient: (a: number, b: number) => void;
  readonly jstxrequestmemo_tx: (a: number) => [number, number, number];
  readonly jstxrequestmemo_is_registration_block: (a: number) => [number, number, number];
  readonly __wbg_jsblockproposal_free: (a: number, b: number) => void;
  readonly jsblockproposal_tx_tree_root: (a: number) => [number, number, number, number];
  readonly __wbg_jstxrequestmemo_free: (a: number, b: number) => void;
  readonly __wbg_set_jstxresult_tx_tree_root: (a: number, b: number, c: number) => void;
  readonly __wbg_set_tokenbalance_amount: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstxresult_tx_tree_root: (a: number) => [number, number];
  readonly __wbg_get_tokenbalance_amount: (a: number) => [number, number];
  readonly __wbg_intmaxaccount_free: (a: number, b: number) => void;
  readonly __wbg_get_intmaxaccount_privkey: (a: number) => [number, number];
  readonly __wbg_set_intmaxaccount_privkey: (a: number, b: number, c: number) => void;
  readonly __wbg_get_intmaxaccount_pubkey: (a: number) => [number, number];
  readonly __wbg_set_intmaxaccount_pubkey: (a: number, b: number, c: number) => void;
  readonly generate_intmax_account_from_eth_key: (a: number, b: number) => any;
  readonly prepare_deposit: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => any;
  readonly send_tx_request: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => any;
  readonly query_and_finalize: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
  readonly sync: (a: number, b: number, c: number) => any;
  readonly sync_withdrawals: (a: number, b: number, c: number) => any;
  readonly sync_claim: (a: number, b: number, c: number, d: number, e: number) => any;
  readonly get_user_data: (a: number, b: number, c: number) => any;
  readonly get_withdrawal_info: (a: number, b: number, c: number) => any;
  readonly get_withdrawal_info_by_recipient: (a: number, b: number, c: number) => any;
  readonly get_mining_list: (a: number, b: number, c: number) => any;
  readonly get_claim_info: (a: number, b: number, c: number) => any;
  readonly fetch_deposit_history: (a: number, b: number, c: number) => any;
  readonly fetch_transfer_history: (a: number, b: number, c: number) => any;
  readonly fetch_tx_history: (a: number, b: number, c: number) => any;
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
  readonly __wbg_get_jstx_nonce: (a: number) => number;
  readonly __wbg_set_jstx_nonce: (a: number, b: number) => void;
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
  readonly __wbg_jsclaiminfo_free: (a: number, b: number) => void;
  readonly __wbg_get_jsclaiminfo_claim: (a: number) => number;
  readonly __wbg_set_jsclaiminfo_claim: (a: number, b: number) => void;
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
  readonly __wbg_get_jsmining_maturity: (a: number) => bigint;
  readonly __wbg_set_jsmining_maturity: (a: number, b: bigint) => void;
  readonly __wbg_get_jsmining_status: (a: number) => [number, number];
  readonly __wbg_set_jsmining_status: (a: number, b: number, c: number) => void;
  readonly __wbg_jsencrypteddata_free: (a: number, b: number) => void;
  readonly __wbg_get_jsencrypteddata_data: (a: number) => [number, number];
  readonly __wbg_jstx_free: (a: number, b: number) => void;
  readonly __wbg_get_jsmetadata_timestamp: (a: number) => bigint;
  readonly __wbg_get_jsclaim_block_number: (a: number) => number;
  readonly __wbg_get_jsencrypteddata_timestamp: (a: number) => bigint;
  readonly __wbg_set_jstx_transfer_tree_root: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsgenericaddress_data: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jscontractwithdrawal_recipient: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jscontractwithdrawal_amount: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jscontractwithdrawal_nullifier: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jswithdrawalinfo_status: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsclaiminfo_status: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsmetadata_uuid: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsclaim_nullifier: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsencrypteddata_data: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsencrypteddata_uuid: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsencrypteddata_data_type: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsmetadata_timestamp: (a: number, b: bigint) => void;
  readonly __wbg_set_jsclaim_block_number: (a: number, b: number) => void;
  readonly __wbg_set_jsencrypteddata_timestamp: (a: number, b: bigint) => void;
  readonly __wbg_get_jstx_transfer_tree_root: (a: number) => [number, number];
  readonly __wbg_get_jsgenericaddress_data: (a: number) => [number, number];
  readonly __wbg_get_jscontractwithdrawal_recipient: (a: number) => [number, number];
  readonly __wbg_get_jscontractwithdrawal_amount: (a: number) => [number, number];
  readonly __wbg_get_jscontractwithdrawal_nullifier: (a: number) => [number, number];
  readonly __wbg_get_jsmetadata_uuid: (a: number) => [number, number];
  readonly __wbg_get_jswithdrawalinfo_status: (a: number) => [number, number];
  readonly __wbg_get_jsclaiminfo_status: (a: number) => [number, number];
  readonly __wbg_get_jsclaim_amount: (a: number) => [number, number];
  readonly __wbg_get_jsclaim_nullifier: (a: number) => [number, number];
  readonly __wbg_get_jsclaim_block_hash: (a: number) => [number, number];
  readonly __wbg_get_jsencrypteddata_uuid: (a: number) => [number, number];
  readonly __wbg_get_jsencrypteddata_data_type: (a: number) => [number, number];
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
  readonly __wbg_get_config_block_builder_request_interval: (a: number) => bigint;
  readonly __wbg_set_config_block_builder_request_interval: (a: number, b: bigint) => void;
  readonly __wbg_get_config_block_builder_request_limit: (a: number) => bigint;
  readonly __wbg_set_config_block_builder_request_limit: (a: number, b: bigint) => void;
  readonly __wbg_get_config_block_builder_query_wait_time: (a: number) => bigint;
  readonly __wbg_set_config_block_builder_query_wait_time: (a: number, b: bigint) => void;
  readonly __wbg_get_config_block_builder_query_interval: (a: number) => bigint;
  readonly __wbg_set_config_block_builder_query_interval: (a: number, b: bigint) => void;
  readonly __wbg_get_config_block_builder_query_limit: (a: number) => bigint;
  readonly __wbg_set_config_block_builder_query_limit: (a: number, b: bigint) => void;
  readonly __wbg_get_config_l1_rpc_url: (a: number) => [number, number];
  readonly __wbg_set_config_l1_rpc_url: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_l1_chain_id: (a: number) => bigint;
  readonly __wbg_set_config_l1_chain_id: (a: number, b: bigint) => void;
  readonly __wbg_get_config_liquidity_contract_address: (a: number) => [number, number];
  readonly __wbg_set_config_liquidity_contract_address: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_l2_rpc_url: (a: number) => [number, number];
  readonly __wbg_set_config_l2_rpc_url: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_l2_chain_id: (a: number) => bigint;
  readonly __wbg_set_config_l2_chain_id: (a: number, b: bigint) => void;
  readonly __wbg_get_config_rollup_contract_address: (a: number) => [number, number];
  readonly __wbg_set_config_rollup_contract_address: (a: number, b: number, c: number) => void;
  readonly __wbg_get_config_rollup_contract_deployed_block_number: (a: number) => bigint;
  readonly __wbg_set_config_rollup_contract_deployed_block_number: (a: number, b: bigint) => void;
  readonly config_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: bigint, j: bigint, k: bigint, l: bigint, m: bigint, n: bigint, o: bigint, p: number, q: number, r: bigint, s: number, t: number, u: number, v: number, w: bigint, x: number, y: number, z: bigint) => number;
  readonly __wbg_jsflatg2_free: (a: number, b: number) => void;
  readonly __wbg_get_jsflatg2_elements: (a: number) => [number, number];
  readonly __wbg_set_jsflatg2_elements: (a: number, b: number, c: number) => void;
  readonly __wbg_jsauth_free: (a: number, b: number) => void;
  readonly __wbg_get_jsauth_pubkey: (a: number) => [number, number];
  readonly __wbg_set_jsauth_pubkey: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsauth_signature: (a: number) => number;
  readonly __wbg_set_jsauth_signature: (a: number, b: number) => void;
  readonly __wbg_get_jsauth_expiry: (a: number) => bigint;
  readonly __wbg_set_jsauth_expiry: (a: number, b: bigint) => void;
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
  readonly __wbg_get_jstxentry_meta: (a: number) => number;
  readonly __wbg_set_jstxentry_meta: (a: number, b: number) => void;
  readonly decrypt_deposit_data: (a: number, b: number, c: number, d: number) => any;
  readonly decrypt_transfer_data: (a: number, b: number, c: number, d: number) => any;
  readonly decrypt_tx_data: (a: number, b: number, c: number, d: number) => any;
  readonly generate_auth_for_store_vault: (a: number, b: number) => any;
  readonly fetch_encrypted_data: (a: number, b: number, c: number, d: bigint, e: number, f: number, g: number, h: number, i: number) => any;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_6: WebAssembly.Table;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h14f4dbbe7ce8d72f: (a: number, b: number) => void;
  readonly closure683_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure1392_externref_shim: (a: number, b: number, c: any, d: any) => void;
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
