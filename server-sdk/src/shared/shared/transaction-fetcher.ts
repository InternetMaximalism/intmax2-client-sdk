import { ConsolaInstance } from 'consola';
import { Abi, createPublicClient, http, PublicClient } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import * as wasmMainnet from '../../wasm/node/mainnet';
import * as wasmTestnet from '../../wasm/node/testnet';
import { LiquidityAbi, MAINNET_ENV, TESTNET_ENV } from '../constants';
import {
  ContractWithdrawal,
  FetchWithdrawalsResponse,
  IntMaxEnvironment,
  PaginationCursor,
  WithdrawalsStatus,
} from '../types';
import { getWithdrawHash } from '../utils';

export class TransactionFetcher {
  readonly #environment: IntMaxEnvironment;
  readonly #publicClient: PublicClient;
  readonly #liquidityContractAddress: string;
  readonly #get_withdrawal_info: typeof wasmMainnet.get_withdrawal_info | typeof wasmTestnet.get_withdrawal_info;
  readonly #logger: ConsolaInstance;

  constructor(environment: IntMaxEnvironment, logger: ConsolaInstance) {
    this.#environment = environment;
    this.#logger = logger;
    this.#liquidityContractAddress =
      environment === 'mainnet' ? MAINNET_ENV.liquidity_contract : TESTNET_ENV.liquidity_contract;

    this.#publicClient = createPublicClient({
      chain: environment === 'mainnet' ? mainnet : sepolia,
      transport: http(),
    });

    this.#get_withdrawal_info =
      environment === 'mainnet' ? wasmMainnet.get_withdrawal_info : wasmTestnet.get_withdrawal_info;
  }

  async fetchWithdrawals(
    config: wasmMainnet.Config | wasmTestnet.Config,
    privateKey: string,
    cursor: bigint | null = null,
    limit: number = 256,
  ): Promise<FetchWithdrawalsResponse> {
    if (limit && limit > 256) {
      throw new Error('Limit cannot be greater than 256');
    }

    const withdrawals = {
      [WithdrawalsStatus.Failed]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.NeedClaim]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.Relayed]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.Requested]: [] as ContractWithdrawal[],
      [WithdrawalsStatus.Success]: [] as ContractWithdrawal[],
    };

    let withdrawalInfo: wasmMainnet.JsWithdrawalInfo[] | wasmTestnet.JsWithdrawalInfo[] = [];
    let pagination: PaginationCursor = {
      has_more: false,
      next_cursor: null,
      total_count: 0,
    };
    try {
      const resp = await this.#get_withdrawal_info(config, privateKey, this.getValidCursor(cursor, limit));
      withdrawalInfo = resp.info;
      pagination = {
        has_more: resp.cursor_response.has_more,
        next_cursor: resp.cursor_response.next_cursor ? BigInt(resp.cursor_response.next_cursor) : null,
        total_count: resp.cursor_response.total_count,
      };
    } catch (e) {
      this.#logger.error(e);
      throw new Error('Failed to fetch withdrawal info');
    }

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

    return { withdrawals, pagination };
  }

  getValidCursor(cursor: bigint | null, limit: number): wasmTestnet.JsTimestampCursor | wasmMainnet.JsTimestampCursor {
    return this.#environment === 'mainnet'
      ? new wasmMainnet.JsTimestampCursor(cursor, 'desc', limit)
      : new wasmTestnet.JsTimestampCursor(cursor, 'desc', limit);
  }
}
