import { ConsolaInstance, createConsola } from 'consola';

import { formatError } from '../shared';
import { JsUserData } from '../wasm/browser/testnet';

function convertUserDataToPlainObject(userData: JsUserData) {
  return {
    pubkey: userData.pubkey,
    balances:
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

const ctx: Worker = self as unknown as Worker;
let logger: ConsolaInstance;

async function start({
  configArgs,
  viewPair,
  shouldSync,
  loggerLevel = 'none',
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configArgs: any; // just for testing
  viewPair: string;
  shouldSync: boolean;
  loggerLevel?: 'error' | 'warn' | 'info' | 'none';
}) {
  logger = createConsola({
    level: loggerLevel === 'none' ? -999 : loggerLevel === 'error' ? 0 : loggerLevel === 'warn' ? 1 : 3,
    fancy: true,
  });
  const {
    default: init,
    get_user_data,
    sync,
    sync_withdrawals,
    resync,
    Config,
  } = configArgs.network === 'mainnet'
    ? await import('../wasm/browser/mainnet')
    : await import('../wasm/browser/testnet');
  try {
    await init();
  } catch (error) {
    logger.error('Error initializing Wasm module in Worker:', error);
    return;
  }

  let config;
  try {
    config = new Config(
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
    logger.info('%cConfig initialized', 'color: #4CAF50; font-weight: bold;');
  } catch (error) {
    logger.error('Config creation failed:', error);
    return;
  }

  logger.info('%cWasm worker started...', 'color: #4CAF50; font-weight: bold;');

  if (shouldSync) {
    try {
      await sync(config, viewPair);
    } catch (error) {
      const errMsg = formatError(error);
      logger.error('Error during sync from worker:', errMsg);

      if (error instanceof Error && error.message.includes('unreachable')) {
        try {
          await resync(config, viewPair, false);
        } catch (error) {
          const errMsg = formatError(error);
          logger.error('Error during resync from worker:', errMsg);
        }
      }
    }

    try {
      await sync_withdrawals(config, viewPair, 0);
    } catch (error) {
      const errMsg = formatError(error);
      logger.error('Error during withdrawals sync from worker:', errMsg);
    }
  }

  try {
    const userData = await get_user_data(config, viewPair);
    ctx.postMessage({
      target: 'intamax_sdk',
      type: 'user_data',
      data: convertUserDataToPlainObject(userData),
      shouldSaveTime: shouldSync,
      viewPair,
    });
  } catch (error) {
    const errMsg = formatError(error);
    logger.error('Error getting user data from worker:', errMsg);
  }
  logger.info('%cWasm worker finished sync', 'color: #4CAF50; font-weight: bold;');
}

ctx.addEventListener('message', (evt) => {
  if (evt.data.type && evt.data.target === 'intamax_sdk_worker') {
    const { loggerLevel = 'none' } = evt.data;
    logger = createConsola({
      level: loggerLevel === 'none' ? -999 : loggerLevel === 'error' ? 0 : loggerLevel === 'warn' ? 1 : 3,
      fancy: true,
    });

    logger.info(`%cWasm worker received message:`, 'color: #4CAF50; font-weight: bold;');
    logger.info(evt.data);
  } else {
    return;
  }

  switch (evt.data.type) {
    case 'start_sync':
      logger.info(`%cWasm worker received start message`, 'color: #4CAF50; font-weight: bold;');
      start(evt.data.data);
      return;
  }
});
