import { Abi, createPublicClient, http, PublicClient } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import { Config, get_withdrawal_info, JsTimestampCursor } from '../../wasm/node';
import { DEVNET_ENV, LiquidityAbi, MAINNET_ENV, TESTNET_ENV } from '../constants';
import { ContractWithdrawal, FetchWithdrawalsResponse, IntMaxEnvironment, WithdrawalsStatus } from '../types';
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

  async fetchWithdrawals(
    config: Config,
    privateKey: string,
    cursor: bigint | null = null,
  ): Promise<FetchWithdrawalsResponse> {
    const withdrawals = {
      [WithdrawalsStatus.Failed]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.NeedClaim]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.Relayed]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.Requested]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.Success]: [] as ContractWithdrawal[],
    };

    const { info: withdrawalInfo, cursor_response } = await get_withdrawal_info(
      config,
      privateKey,
      new JsTimestampCursor(cursor, 'desc', 256),
    );

    withdrawalInfo.forEach(({ contract_withdrawal, status }) => {
      withdrawals[status as WithdrawalsStatus].push({
        recipient: contract_withdrawal.recipient as `0x${string}`,
        nullifier: contract_withdrawal.nullifier as `0x${string}`,
        amount: contract_withdrawal.amount,
        tokenIndex: contract_withdrawal.token_index,
      });
    });

    withdrawals[WithdrawalsStatus.NeedClaim] = Array.from(
      new Map(withdrawals[WithdrawalsStatus.NeedClaim].map((w) => [w.nullifier, w])).values(),
    );

    if (withdrawals[WithdrawalsStatus.NeedClaim].length > 0) {
      const withdrawalHashes = new Set(withdrawals[WithdrawalsStatus.NeedClaim].map(getWithdrawHash));
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
            ...withdrawals[WithdrawalsStatus.NeedClaim][i],
          });
        }
      });
      withdrawals[WithdrawalsStatus.NeedClaim] = updatedWithdrawalsToClaim;
    }

    return {
      withdrawals,
      pagination: {
        has_more: cursor_response.has_more,
        next_cursor: cursor_response.next_cursor ? BigInt(cursor_response.next_cursor) : null,
        total_count: cursor_response.total_count,
      },
    };
  }
}
