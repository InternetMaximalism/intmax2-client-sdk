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
  liquidity_contract: '0xdabB0Ba53714c0Ac6C674D1f7fC1E891d4D2c631',
  rollup_contract: '0x10C1f42F7E4899372deB3C49188057F19fd95305',
  rollup_contract_deployed_block_number: 0,
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://oimhddprvflxjsumnmmg.supabase.co/functions/v1/keyvault',
  tokens_url: 'https://dev.token.intmax.xyz/v1',
};

export const TESTNET_ENV: SDKUrls = {
  balance_prover_url: 'https://stage.prover.intmax.io/v1/balance-prover"',
  block_builder_url: 'https://stage.builder.node.intmax.io',
  block_validity_prover_url: 'https://stage.prover.intmax.io/v1/validity-prover',
  store_vault_server_url: 'https://stage.storevault.node.intmax.io',
  withdrawal_aggregator_url: 'https://stage.withdrawal.node.intmax.io',
  chain_id_l1: 11155111,
  chain_id_l2: 534351,
  liquidity_contract: '0x2e14c08Fcdfa0fcBf7557598cDe780D8C0F15dc0',
  rollup_contract: '0xc824c47C7c9038034b57bEb67B41e362581D8C3E',
  rollup_contract_deployed_block_number: 0,
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
  liquidity_contract: '0xdabB0Ba53714c0Ac6C674D1f7fC1E891d4D2c631',
  rollup_contract: '0x10C1f42F7E4899372deB3C49188057F19fd95305',
  rollup_contract_deployed_block_number: 0,
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://oimhddprvflxjsumnmmg.supabase.co/functions/v1/keyvault',
  tokens_url: 'https://dev.token.intmax.xyz/v1',
};
