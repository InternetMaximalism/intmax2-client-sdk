import { SDKUrls } from '../types';

export * from './abis';

export const networkMessage = (address: string) =>
  `\nThis signature on this message will be used to access the INTMAX network. \nYour address: ${address}\nCaution: Do not sign if requested on any domain other than intmax.io`;

export const MAINNET_ENV = {
  balance_prover_url: 'https://dev.private.zkp.intmax.xyz',
  block_builder_url: 'https://dev.builder.node.intmax.xyz',
  block_validity_prover_url: 'https://dev.prover.intmax.xyz/v1/validity-prover',
  store_vault_server_url: 'https://dev.storevault.node.intmax.xyz',
  withdrawal_aggregator_url: 'https://dev.withdrawal.node.intmax.xyz',
  chain_id_l1: 11155111,
  chain_id_l2: 534351,
  liquidity_contract: '0x91eDF393F1Bda1f29fb6705F410e31a24078E627',
  rollup_contract: '0x860AE2Fb3bAa580c992E2aFf047E96741aD9E3e3',
  withdrawal_contract_address: '0x2801BE131c514ec30C37b202b230CBFAEB561167',
  rollup_contract_deployed_block_number: 8310254,
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
  liquidity_contract: '0x2e14c08Fcdfa0fcBf7557598cDe780D8C0F15dc0',
  rollup_contract: '0xc824c47C7c9038034b57bEb67B41e362581D8C3E',
  withdrawal_contract_address: '0xe10d0de8e7f8bf83af823ae7ff5905096c0808e8',
  rollup_contract_deployed_block_number: 7525872,
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://rnnqrmgdfhixidkoxlim.supabase.co/functions/v1/keyvault',
  tokens_url: 'https://stage.token.intmax.io/v1',
};

export const DEVNET_ENV: SDKUrls = {
  balance_prover_url: 'https://dev.private.zkp.intmax.xyz',
  block_builder_url: 'https://dev.builder.node.intmax.xyz',
  block_validity_prover_url: 'https://dev.prover.intmax.xyz/v1/validity-prover',
  store_vault_server_url: 'https://dev.storevault.node.intmax.xyz',
  withdrawal_aggregator_url: 'https://dev.withdrawal.node.intmax.xyz',
  chain_id_l1: 11155111,
  chain_id_l2: 534351,
  liquidity_contract: '0x91eDF393F1Bda1f29fb6705F410e31a24078E627',
  rollup_contract: '0x860AE2Fb3bAa580c992E2aFf047E96741aD9E3e3',
  withdrawal_contract_address: '0x2801BE131c514ec30C37b202b230CBFAEB561167',
  rollup_contract_deployed_block_number: 8310254,
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://oimhddprvflxjsumnmmg.supabase.co/functions/v1/keyvault',
  tokens_url: 'https://dev.token.intmax.xyz/v1',
};
