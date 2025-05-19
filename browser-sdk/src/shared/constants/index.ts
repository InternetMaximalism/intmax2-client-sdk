import { SDKUrls } from '../types';

export * from './abis';

export const networkMessage = (address: string) =>
  `\nThis signature on this message will be used to access the INTMAX network. \nYour address: ${address}\nCaution: Please make sure that the domain you are connected to is correct.`;

export const spendFundsMessage = (amount: string, address: string) =>
  `\nThis signature on this message will be used to send ETH to your mining address via INTMAX network.\n Amount: ${amount} ETH\nYour mining address: ${address}\nCaution: Please make sure that the domain you are connected to is correct.`;

export const MAINNET_ENV: SDKUrls = {
  balance_prover_url: 'https://dev.private.zkp.intmax.xyz',
  indexer_url: 'https://dev.indexer.intmax.xyz/v1/indexer',
  validity_prover_url: 'https://dev.node.api.intmax.xyz/validity-prover',
  store_vault_server_url: 'https://dev.node.api.intmax.xyz/store-vault-server',
  withdrawal_aggregator_url: 'https://dev.node.api.intmax.xyz/withdrawal-server',
  predicate_url: 'https://dev.predicate.intmax.xyz/v1/predicate',
  chain_id_l1: 11155111,
  chain_id_l2: 534351,
  //
  liquidity_contract: '0x9e60b235CF6d6cb63670b3fFC4f98fB56ba91409',
  rollup_contract: '0xD315383e78E8dDee60e3BdaD8b278e5f10386557',
  withdrawal_contract_address: '0xC2AD2B9720330D005B137f3A841F343C60A7a2F6',
  predicate_contract_address: '0x4D9B3CF9Cb04B27C5D221c82B428D9dE990D3e3a',
  //
  rollup_contract_deployed_block_number: 8803282,
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://oimhddprvflxjsumnmmg.supabase.co/functions/v1/keyvault/external',
  tokens_url: 'https://dev.token.intmax.xyz/v1',
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
  liquidity_contract: '0xCd81CCC2d3f20DCEa1740aDD7C4a56Fd08471009',
  rollup_contract: '0xB7846197B64222Bd1510464a11E1611Cd3b94D4c',
  withdrawal_contract_address: '0xCB0886301d5524fA37656670C67fc1a26DBC4F98',
  predicate_contract_address: '0x4D9B3CF9Cb04B27C5D221c82B428D9dE990D3e3a',
  //
  rollup_contract_deployed_block_number: 8869965,
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
  liquidity_contract: '0xd018F2F944dFa7f8b14E6889a33AfA56B61E4A83',
  rollup_contract: '0xa91c5e8E63bc88a3f4ED9a125F3a8308C0c1aF6C',
  withdrawal_contract_address: '0x1cc9381E21BBef00dd2b2242Df5031cEd67Dd66A',
  predicate_contract_address: '0x4D9B3CF9Cb04B27C5D221c82B428D9dE990D3e3a',
  //
  rollup_contract_deployed_block_number: 9007032,
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://oimhddprvflxjsumnmmg.supabase.co/functions/v1/keyvault',
  tokens_url: 'https://dev.api.token.intmax.xyz/v1',
};
