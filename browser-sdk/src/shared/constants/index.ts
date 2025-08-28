import { getAddress } from 'viem';

import { SDKUrls } from '../types';

export * from './abis';

export const networkMessage = (address: string) =>
  `\nThis signature on this message will be used to access the INTMAX network. \nYour address: ${getAddress(address)}\nCaution: Please make sure that the domain you are connected to is correct.`;

export const spendFundsMessage = (amount: string, address: string) =>
  `\nThis signature on this message will be used to send ETH to your mining address via INTMAX network.\n Amount: ${amount} ETH\nYour mining address: ${getAddress(address)}\nCaution: Please make sure that the domain you are connected to is correct.`;

export const MAINNET_ENV: SDKUrls = {
  balance_prover_url: 'https://api.private.zkp.intmax.io',
  indexer_url: 'https://api.indexer.intmax.io/v1/indexer',
  validity_prover_url: 'https://api.node.intmax.io/validity-prover',
  store_vault_server_url: 'https://api.node.intmax.io/store-vault-server',
  withdrawal_aggregator_url: 'https://api.node.intmax.io/withdrawal-server',
  predicate_url: 'https://api.predicate.intmax.io/v1/predicate',
  chain_id_l1: 1,
  chain_id_l2: 534352,
  //
  liquidity_contract: '0xF65e73aAc9182e353600a916a6c7681F810f79C3',
  rollup_contract: '0x16f4BFeb925e748ef4Af8ce96E48d4B78Ec9da47',
  withdrawal_contract_address: '0xe8562B27634A738Eb64C9baBE9efe993B5243295',
  predicate_contract_address: '0x11D58231A79D866674EaAa043Fdaeae9A3dF4c0E',
  //
  rpc_url_l1: 'https://api.rpc.intmax.io?network=ethereum',
  rpc_url_l2: 'https://api.rpc.intmax.io?network=scroll',
  key_vault_url: 'https://api.keyvault.intmax.io/v1/external',
  tokens_url: 'https://api.token.intmax.io/v1',
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
  predicate_contract_address: '0x447ec9373d600C144C9bf9A9d4413BD59a7763AB',
  //
  rpc_url_l1: 'https://sepolia.gateway.tenderly.co',
  rpc_url_l2: 'https://sepolia-rpc.scroll.io',
  key_vault_url: 'https://stage.api.keyvault.intmax.io/v1/external',
  tokens_url: 'https://stage.api.token.intmax.io/v1',
};
