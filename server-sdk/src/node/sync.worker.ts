import { parentPort } from 'worker_threads';

// @ts-expect-error A type error is occurring, but this is a measure to resolve the build error
import * as mainnetWasm from './mainnet';
// @ts-expect-error A type error is occurring, but this is a measure to resolve the build error
import * as testnetWasm from './testnet';

function convertUserDataToPlainObject(userData: mainnetWasm.JsUserData | testnetWasm.JsUserData) {
  return {
    pubkey: userData.pubkey,
    balances:
      // @ts-expect-error A type error is occurring, but this is a measure to resolve the build error
      userData.balances?.map((v) => ({
        token_index: v.token_index,
        amount: v.amount,
        is_insufficient: v.is_insufficient,
      })) || [],
    private_commitment: userData.private_commitment,
    deposit_lpt: userData.deposit_lpt,
    transfer_lpt: userData.transfer_lpt,
    tx_lpt: userData.tx_lpt,
    withdrawal_lpt: userData.withdrawal_lpt,
    processed_deposit_digests: userData.processed_deposit_digests || [],
    processed_transfer_digests: userData.processed_transfer_digests || [],
    processed_tx_digests: userData.processed_tx_digests || [],
    processed_withdrawal_digests: userData.processed_withdrawal_digests || [],
  };
}

async function start({
  configArgs,
  viewPair,
  shouldSync,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configArgs: any; // just for testing
  viewPair: string;
  shouldSync: boolean;
}) {
  let config: mainnetWasm.Config | testnetWasm.Config;
  const isMainnet = configArgs.network === 'mainnet';

  try {
    if (isMainnet) {
      config = new mainnetWasm.Config(
        configArgs.network,
        configArgs.store_vault_server_url,
        configArgs.balance_prover_url,
        configArgs.validity_prover_url,
        configArgs.withdrawal_server_url,
        configArgs.deposit_timeout,
        configArgs.tx_timeout,
        // ---------------------
        configArgs.is_faster_mining,
        configArgs.block_builder_query_wait_time,
        configArgs.block_builder_query_interval,
        configArgs.block_builder_query_limit,
        // -----------------------
        configArgs.l1_rpc_url,
        configArgs.liquidity_contract_address,
        configArgs.l2_rpc_url,
        configArgs.rollup_contract_address,
        configArgs.withdrawal_contract_address,
        configArgs.use_private_zkp_server,
        configArgs.use_s3,
        configArgs.private_zkp_server_max_retires,
        configArgs.private_zkp_server_retry_interval,
      );
    } else {
      config = new testnetWasm.Config(
        configArgs.network,
        configArgs.store_vault_server_url,
        configArgs.balance_prover_url,
        configArgs.validity_prover_url,
        configArgs.withdrawal_server_url,
        configArgs.deposit_timeout,
        configArgs.tx_timeout,
        // ---------------------
        configArgs.is_faster_mining,
        configArgs.block_builder_query_wait_time,
        configArgs.block_builder_query_interval,
        configArgs.block_builder_query_limit,
        // -----------------------
        configArgs.l1_rpc_url,
        configArgs.liquidity_contract_address,
        configArgs.l2_rpc_url,
        configArgs.rollup_contract_address,
        configArgs.withdrawal_contract_address,
        configArgs.use_private_zkp_server,
        configArgs.use_s3,
        configArgs.private_zkp_server_max_retires,
        configArgs.private_zkp_server_retry_interval,
      );
    }
    console.info('%cConfig initialized', 'color: #4CAF50; font-weight: bold;');
  } catch (error) {
    console.error('Config creation failed:', error);
    return;
  }

  console.info('%cWasm worker started...', 'color: #4CAF50; font-weight: bold;');

  if (shouldSync) {
    try {
      if (isMainnet) {
        await mainnetWasm.sync(config, viewPair);
      } else {
        await testnetWasm.sync(config, viewPair);
      }
    } catch (error) {
      console.error('Error during sync from worker:', error);

      if (error instanceof Error && error.message.includes('unreachable')) {
        try {
          if (isMainnet) {
            await mainnetWasm.resync(config, viewPair, false);
          } else {
            await testnetWasm.resync(config, viewPair, false);
          }
        } catch (error) {
          console.error('Error during resync from worker:', error);
        }
      }
    }

    try {
      if (isMainnet) {
        await mainnetWasm.sync_withdrawals(config, viewPair, 0);
      } else {
        await testnetWasm.sync_withdrawals(config, viewPair, 0);
      }
    } catch (error) {
      console.error('Error during withdrawals sync from worker:', error);
    }
  }

  try {
    const userData = isMainnet
      ? await mainnetWasm.get_user_data(config, viewPair)
      : await testnetWasm.get_user_data(config, viewPair);
    parentPort?.postMessage({
      type: 'user_data',
      data: convertUserDataToPlainObject(userData),
      shouldSaveTime: shouldSync,
      viewPair,
    });
  } catch (error) {
    console.error('Error getting user data from worker:', error);
  }
  console.info('%cWasm worker finished sync', 'color: #4CAF50; font-weight: bold;');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
parentPort?.on('message', (data: any) => {
  console.info(`%cWasm worker received message:`, 'color: #4CAF50; font-weight: bold;');
  console.info(data);
  switch (data.type) {
    case 'start_sync':
      console.info(`%cWasm worker received start message`, 'color: #4CAF50; font-weight: bold;');
      start(data.data);
      return;
  }
});
