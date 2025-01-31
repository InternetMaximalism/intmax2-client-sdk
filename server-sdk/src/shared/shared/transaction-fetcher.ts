import { Abi, createPublicClient, http, PublicClient } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import { Config, get_withdrawal_info } from '../../wasm/node';
import { DEVNET_ENV, LiquidityAbi, MAINNET_ENV, TESTNET_ENV } from '../constants';
import { ContractWithdrawal, IntMaxEnvironment, WithdrawalsStatus } from '../types';
import { getWithdrawHash } from '../utils';

export class TransactionFetcher {
  readonly #publicClient: PublicClient;
  readonly #liquidityContractAddress: string;

  constructor(environment: IntMaxEnvironment) {
    this.#liquidityContractAddress =
      environment === 'mainnet'
        ? MAINNET_ENV.liquidity_contract
        : environment === 'testnet'
          ? TESTNET_ENV.liquidity_contract
          : DEVNET_ENV.liquidity_contract;

    this.#publicClient = createPublicClient({
      chain: environment === 'mainnet' ? mainnet : sepolia,
      transport: http(),
    });
  }

  async fetchPendingWithdrawals(
    config: Config,
    privateKey: string,
  ): Promise<Record<WithdrawalsStatus, ContractWithdrawal[]>> {
    const pendingWithdrawals = {
      [WithdrawalsStatus.Failed]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.NeedClaim]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.Relayed]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.Requested]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.Success]: [] as ContractWithdrawal[],
    };

    const withdrawalInfo = await get_withdrawal_info(config, privateKey);

    withdrawalInfo.forEach(({ contract_withdrawal, status }) => {
      pendingWithdrawals[status as WithdrawalsStatus].push({
        recipient: contract_withdrawal.recipient as `0x${string}`,
        nullifier: contract_withdrawal.nullifier as `0x${string}`,
        amount: contract_withdrawal.amount,
        tokenIndex: contract_withdrawal.token_index,
      });
    });

    pendingWithdrawals[WithdrawalsStatus.NeedClaim] = Array.from(
      new Map(pendingWithdrawals[WithdrawalsStatus.NeedClaim].map((w) => [w.nullifier, w])).values(),
    );

    if (pendingWithdrawals[WithdrawalsStatus.NeedClaim].length > 0) {
      const withdrawalHashes = new Set(pendingWithdrawals[WithdrawalsStatus.NeedClaim].map(getWithdrawHash));
      const results = await this.#publicClient.multicall({
        contracts: [...withdrawalHashes].map((hash) => ({
          abi: LiquidityAbi as Abi,
          address: this.#liquidityContractAddress as `0x${string}`,
          functionName: 'claimableWithdrawals',
          args: [hash],
        })),
      });
      const updatedWithdrawalsToClaim: ContractWithdrawal[] = [];
      results.forEach((result, i: number) => {
        if (result.status === 'success' && result.result) {
          updatedWithdrawalsToClaim.push({
            ...pendingWithdrawals[WithdrawalsStatus.NeedClaim][i],
          });
        }
      });
      pendingWithdrawals[WithdrawalsStatus.NeedClaim] = updatedWithdrawalsToClaim;
    }

    return pendingWithdrawals;
  }
}
