/* tslint:disable */
/* eslint-disable */
/**
 * Generate a new key pair from the given ethereum private key (32bytes hex string).
 */
export function generate_intmax_account_from_eth_key(eth_private_key: string): Promise<IntmaxAccount>;
/**
 * Function to take a backup before calling the deposit function of the liquidity contract.
 *
 * You can also get the pubkey_salt_hash from the return value.
 */
export function prepare_deposit(config: Config, recipient: string, amount: string, token_type: number, token_address: string, token_id: string): Promise<JsDepositResult>;
/**
 * Function to send a tx request to the block builder. The return value contains information to take a backup.
 */
export function send_tx_request(config: Config, block_builder_url: string, private_key: string, transfers: (JsTransfer)[]): Promise<JsTxRequestMemo>;
/**
 * Function to query the block proposal from the block builder.
 * The return value is the block proposal or null if the proposal is not found.
 * If got an invalid proposal, it will return an error.
 */
export function query_proposal(config: Config, block_builder_url: string, private_key: string, is_registration_block: boolean, tx: JsTx): Promise<JsBlockProposal | undefined>;
/**
 * Send the signed tx tree root to the block builder during taking a backup of the tx.
 *
 * You need to call send_tx_request before calling this function.
 * The return value is the tx result, which contains the tx tree root and transfer data.
 */
export function finalize_tx(config: Config, block_builder_url: string, private_key: string, tx_request_memo: JsTxRequestMemo, proposal: JsBlockProposal): Promise<JsTxResult>;
/**
 * Batch function of query_proposal and finalize_tx.
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
 * Get the user's data. It is recommended to sync before calling this function.
 */
export function get_user_data(config: Config, private_key: string): Promise<JsUserData>;
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
export class JsBlockProposal {
  private constructor();
  free(): void;
  tx_tree_root(): string;
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
  pubkey_salt_hash: string;
  amount: string;
  token_type: number;
  token_address: string;
  token_id: string;
}
export class JsDepositResult {
  private constructor();
  free(): void;
  deposit_data: JsDepositData;
  deposit_uuid: string;
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
  transfer_data_vec: (JsTransferData)[];
  withdrawal_data_vec: (JsTransferData)[];
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
   * The block number of the user data
   */
  block_number: number;
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
  readonly __wbg_get_jsdepositdata_pubkey_salt_hash: (a: number) => [number, number];
  readonly __wbg_set_jsdepositdata_pubkey_salt_hash: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdepositdata_amount: (a: number) => [number, number];
  readonly __wbg_set_jsdepositdata_amount: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdepositdata_token_type: (a: number) => number;
  readonly __wbg_set_jsdepositdata_token_type: (a: number, b: number) => void;
  readonly __wbg_get_jsdepositdata_token_address: (a: number) => [number, number];
  readonly __wbg_set_jsdepositdata_token_address: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsdepositdata_token_id: (a: number) => [number, number];
  readonly __wbg_set_jsdepositdata_token_id: (a: number, b: number, c: number) => void;
  readonly __wbg_jstransferdata_free: (a: number, b: number) => void;
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
  readonly __wbg_get_jstxresult_transfer_data_vec: (a: number) => [number, number];
  readonly __wbg_set_jstxresult_transfer_data_vec: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstxresult_withdrawal_data_vec: (a: number) => [number, number];
  readonly __wbg_set_jstxresult_withdrawal_data_vec: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstxresult_transfer_uuids: (a: number) => [number, number];
  readonly __wbg_set_jstxresult_transfer_uuids: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstxresult_withdrawal_uuids: (a: number) => [number, number];
  readonly __wbg_set_jstxresult_withdrawal_uuids: (a: number, b: number, c: number) => void;
  readonly __wbg_jsuserdata_free: (a: number, b: number) => void;
  readonly __wbg_get_jsuserdata_pubkey: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_pubkey: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jsuserdata_block_number: (a: number) => number;
  readonly __wbg_set_jsuserdata_block_number: (a: number, b: number) => void;
  readonly __wbg_get_jsuserdata_balances: (a: number) => [number, number];
  readonly __wbg_set_jsuserdata_balances: (a: number, b: number, c: number) => void;
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
  readonly __wbg_set_jstransferdata_sender: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jstxresult_tx_tree_root: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsuserdata_private_commitment: (a: number, b: number, c: number) => void;
  readonly __wbg_set_tokenbalance_amount: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstransferdata_sender: (a: number) => [number, number];
  readonly __wbg_get_jstxresult_tx_tree_root: (a: number) => [number, number];
  readonly __wbg_get_jsuserdata_private_commitment: (a: number) => [number, number];
  readonly __wbg_get_tokenbalance_amount: (a: number) => [number, number];
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
  readonly __wbg_intmaxaccount_free: (a: number, b: number) => void;
  readonly __wbg_get_intmaxaccount_privkey: (a: number) => [number, number];
  readonly __wbg_set_intmaxaccount_privkey: (a: number, b: number, c: number) => void;
  readonly __wbg_get_intmaxaccount_pubkey: (a: number) => [number, number];
  readonly __wbg_set_intmaxaccount_pubkey: (a: number, b: number, c: number) => void;
  readonly generate_intmax_account_from_eth_key: (a: number, b: number) => any;
  readonly prepare_deposit: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => any;
  readonly send_tx_request: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => any;
  readonly query_proposal: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => any;
  readonly finalize_tx: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => any;
  readonly query_and_finalize: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
  readonly sync: (a: number, b: number, c: number) => any;
  readonly sync_withdrawals: (a: number, b: number, c: number) => any;
  readonly get_user_data: (a: number, b: number, c: number) => any;
  readonly decrypt_deposit_data: (a: number, b: number, c: number, d: number) => any;
  readonly decrypt_transfer_data: (a: number, b: number, c: number, d: number) => any;
  readonly decrypt_tx_data: (a: number, b: number, c: number, d: number) => any;
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
  readonly __wbg_get_jscontractwithdrawal_recipient: (a: number) => [number, number];
  readonly __wbg_set_jscontractwithdrawal_recipient: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jscontractwithdrawal_token_index: (a: number) => number;
  readonly __wbg_set_jscontractwithdrawal_token_index: (a: number, b: number) => void;
  readonly __wbg_get_jscontractwithdrawal_amount: (a: number) => [number, number];
  readonly __wbg_set_jscontractwithdrawal_amount: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jscontractwithdrawal_nullifier: (a: number) => [number, number];
  readonly __wbg_set_jscontractwithdrawal_nullifier: (a: number, b: number, c: number) => void;
  readonly jscontractwithdrawal_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly jscontractwithdrawal_hash: (a: number) => [number, number, number, number];
  readonly jstxrequestmemo_tx: (a: number) => [number, number, number];
  readonly jstxrequestmemo_is_registration_block: (a: number) => [number, number, number];
  readonly __wbg_jsblockproposal_free: (a: number, b: number) => void;
  readonly jsblockproposal_tx_tree_root: (a: number) => [number, number, number, number];
  readonly __wbg_jstx_free: (a: number, b: number) => void;
  readonly __wbg_jstxrequestmemo_free: (a: number, b: number) => void;
  readonly __wbg_set_jstx_transfer_tree_root: (a: number, b: number, c: number) => void;
  readonly __wbg_set_jsgenericaddress_data: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jstx_transfer_tree_root: (a: number) => [number, number];
  readonly __wbg_get_jsgenericaddress_data: (a: number) => [number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_6: WebAssembly.Table;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h6ae869d73bf0119d: (a: number, b: number) => void;
  readonly closure632_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure962_externref_shim: (a: number, b: number, c: any, d: any) => void;
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
