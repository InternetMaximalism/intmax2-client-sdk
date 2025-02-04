import { SDKUrls } from '../types';

export * from './abis';

export const networkMessage = (address: string) =>
  `\nThis signature on this message will be used to access the INTMAX network. \nYour address: ${address}\nCaution: Do not sign if requested on any domain other than intmax.io`;

export const MAINNET_ENV = {
  balance_prover_url: 'https://dev.prover.intmax.xyz/v1/balance-prover',
  block_builder_url: 'https://dev.builder.node.intmax.xyz',
  block_validity_prover_url: 'https://dev.prover.intmax.xyz/v1/validity-prover',
  store_vault_server_url: 'https://dev.storevault.node.intmax.xyz',
  withdrawal_aggregator_url: 'https://dev.withdrawal.node.intmax.xyz',
  chain_id_l1: 11155111,
  chain_id_l2: 534351,
  liquidity_contract: '0x839d6f2E545d87C09abb95771AaB0603B461cD7e',
  rollup_contract: '0x600ace41d9c427C50BaB2CEdF1ae3Bf04bB72a50',
  rollup_contract_deployed_block_number: 8011128,
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://oimhddprvflxjsumnmmg.supabase.co/functions/v1/keyvault',
  tokens_url: 'https://dev.token.intmax.xyz/v1',
};

export const TESTNET_ENV: SDKUrls = {
  balance_prover_url: 'https://stage.prover.intmax.io/v1/balance-prover',
  block_builder_url: 'https://stage.builder.node.intmax.io',
  block_validity_prover_url: 'https://stage.prover.intmax.io/v1/validity-prover',
  store_vault_server_url: 'https://stage.storevault.node.intmax.io',
  withdrawal_aggregator_url: 'https://stage.withdrawal.node.intmax.io',
  chain_id_l1: 11155111,
  chain_id_l2: 534351,
  liquidity_contract: '0x839d6f2E545d87C09abb95771AaB0603B461cD7e',
  rollup_contract: '0x600ace41d9c427C50BaB2CEdF1ae3Bf04bB72a50',
  rollup_contract_deployed_block_number: 8011128,
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://rnnqrmgdfhixidkoxlim.supabase.co/functions/v1/keyvault',
  tokens_url: 'https://stage.token.intmax.io/v1',
};

export const DEVNET_ENV: SDKUrls = {
  balance_prover_url: 'https://dev.prover.intmax.xyz/v1/balance-prover',
  block_builder_url: 'https://dev.builder.node.intmax.xyz',
  block_validity_prover_url: 'https://dev.prover.intmax.xyz/v1/validity-prover',
  store_vault_server_url: 'https://dev.storevault.node.intmax.xyz',
  withdrawal_aggregator_url: 'https://dev.withdrawal.node.intmax.xyz',
  chain_id_l1: 11155111,
  chain_id_l2: 534351,
  liquidity_contract: '0x839d6f2E545d87C09abb95771AaB0603B461cD7e',
  rollup_contract: '0x600ace41d9c427C50BaB2CEdF1ae3Bf04bB72a50',
  rollup_contract_deployed_block_number: 8011128,
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://oimhddprvflxjsumnmmg.supabase.co/functions/v1/keyvault',
  tokens_url: 'https://dev.token.intmax.xyz/v1',
};
