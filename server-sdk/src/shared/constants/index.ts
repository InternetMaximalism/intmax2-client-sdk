import { SDKUrls } from '../types';

export * from './abis';

export const networkMessage = (address: string) =>
  `\nThis signature on this message will be used to access the INTMAX network. \nYour address: ${address}\nCaution: Please make sure that the domain you are connected to is correct.`;

export const MAINNET_ENV: SDKUrls = {
  balance_prover_url: 'https://stage.api.private.zkp.intmax.io',
  indexer_url: 'https://stage.api.indexer.intmax.io/v1/indexer',
  validity_prover_url: 'https://stage.api.node.intmax.io/validity-prover',
  store_vault_server_url: 'https://stage.api.node.intmax.io/store-vault-server',
  withdrawal_aggregator_url: 'https://stage.api.node.intmax.io/withdrawal-server',
  predicate_url: 'https://stage.api.predicate.intmax.io/v1/predicate',
  chain_id_l1: 11155111,
  chain_id_l2: 534351,
  //
  liquidity_contract: '0x81f3843aF1FBaB046B771f0d440C04EBB2b7513F',
  rollup_contract: '0xcEC03800074d0ac0854bF1f34153cc4c8bAEeB1E',
  withdrawal_contract_address: '0x914aBB5c7ea6352B618eb5FF61F42b96AD0325e7',
  predicate_contract_address: '0x4D9B3CF9Cb04B27C5D221c82B428D9dE990D3e3a',
  //
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://slxcnfhgxpfokwtathje.supabase.co/functions/v1/keyvault/external',
  tokens_url: 'https://stage.api.token.intmax.io/v1',
};

export const TESTNET_ENV: SDKUrls = {
  balance_prover_url: 'https://stage.api.private.zkp.intmax.io',
  indexer_url: 'https://stage.api.indexer.intmax.io/v1/indexer',
  validity_prover_url: 'https://stage.api.node.intmax.io/validity-prover',
  store_vault_server_url: 'https://stage.api.node.intmax.io/store-vault-server',
  withdrawal_aggregator_url: 'https://stage.api.node.intmax.io/withdrawal-server',
  predicate_url: 'https://stage.api.predicate.intmax.io/v1/predicate',
  chain_id_l1: 11155111,
  chain_id_l2: 534351,
  //
  liquidity_contract: '0x81f3843aF1FBaB046B771f0d440C04EBB2b7513F',
  rollup_contract: '0xcEC03800074d0ac0854bF1f34153cc4c8bAEeB1E',
  withdrawal_contract_address: '0x914aBB5c7ea6352B618eb5FF61F42b96AD0325e7',
  predicate_contract_address: '0x4D9B3CF9Cb04B27C5D221c82B428D9dE990D3e3a',
  //
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://slxcnfhgxpfokwtathje.supabase.co/functions/v1/keyvault/external',
  tokens_url: 'https://stage.api.token.intmax.io/v1',
};

export const DEVNET_ENV: SDKUrls = {
  balance_prover_url: 'https://dev.api.private.zkp.intmax.xyz',
  indexer_url: 'https://dev.api.indexer.intmax.xyz/v1/indexer',
  validity_prover_url: 'https://dev.api.node.intmax.xyz/validity-prover',
  store_vault_server_url: 'https://dev.api.node.intmax.xyz/store-vault-server',
  withdrawal_aggregator_url: 'https://dev.api.node.intmax.xyz/withdrawal-server',
  predicate_url: 'https://dev.api.predicate.intmax.xyz/v1/predicate',
  chain_id_l1: 11155111,
  chain_id_l2: 534351,
  //
  liquidity_contract: '0xb2444035331beB6f77aEB973D892eA99ED9af11C',
  rollup_contract: '0x89ce460949Bd7CDbC30BA48EbA59eC36AdFBE04f',
  withdrawal_contract_address: '0x12c07A77cfB597C74a5eA1a3EecFc1D4D138dbD0',
  predicate_contract_address: '0x4D9B3CF9Cb04B27C5D221c82B428D9dE990D3e3a',
  //
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://oimhddprvflxjsumnmmg.supabase.co/functions/v1/keyvault',
  tokens_url: 'https://dev.api.token.intmax.xyz/v1',
};
