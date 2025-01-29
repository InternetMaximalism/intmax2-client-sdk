var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TransactionFetcher_storeVaultHttpClient, _TransactionFetcher_withdrawalHttpClient, _TransactionFetcher_publicClient, _TransactionFetcher_liquidityContractAddress;
import { createPublicClient, hexToBigInt, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { DEVNET_ENV, LiquidityAbi, MAINNET_ENV, TESTNET_ENV } from '../constants';
import { WithdrawalsStatus, } from '../types';
import { axiosClientInit, getWithdrawHash } from '../utils';
export class TransactionFetcher {
    constructor(environment) {
        _TransactionFetcher_storeVaultHttpClient.set(this, void 0);
        _TransactionFetcher_withdrawalHttpClient.set(this, void 0);
        _TransactionFetcher_publicClient.set(this, void 0);
        _TransactionFetcher_liquidityContractAddress.set(this, void 0);
        __classPrivateFieldSet(this, _TransactionFetcher_liquidityContractAddress, environment === 'mainnet'
            ? MAINNET_ENV.liquidity_contract
            : environment === 'testnet'
                ? TESTNET_ENV.liquidity_contract
                : DEVNET_ENV.liquidity_contract, "f");
        __classPrivateFieldSet(this, _TransactionFetcher_storeVaultHttpClient, axiosClientInit({
            baseURL: environment === 'mainnet'
                ? MAINNET_ENV.store_vault_server_url
                : environment === 'testnet'
                    ? TESTNET_ENV.store_vault_server_url
                    : DEVNET_ENV.store_vault_server_url,
        }), "f");
        __classPrivateFieldSet(this, _TransactionFetcher_withdrawalHttpClient, axiosClientInit({
            baseURL: `${environment === 'mainnet'
                ? MAINNET_ENV.withdrawal_aggregator_url
                : environment === 'testnet'
                    ? TESTNET_ENV.withdrawal_aggregator_url
                    : DEVNET_ENV.withdrawal_aggregator_url}/withdrawal-server`,
        }), "f");
        __classPrivateFieldSet(this, _TransactionFetcher_publicClient, createPublicClient({
            chain: environment === 'mainnet' ? mainnet : sepolia,
            transport: http(),
        }), "f");
    }
    async fetchTx({ address, timestamp = 0 }) {
        return __classPrivateFieldGet(this, _TransactionFetcher_storeVaultHttpClient, "f").get('/store-vault-server/tx/get-all-after', {
            params: {
                timestamp,
                pubkey: hexToBigInt(address),
            },
        });
    }
    async fetchTransfers({ address, timestamp = 0 }) {
        return await __classPrivateFieldGet(this, _TransactionFetcher_storeVaultHttpClient, "f").get('/store-vault-server/transfer/get-all-after', {
            params: {
                timestamp,
                pubkey: hexToBigInt(address),
            },
        });
    }
    async fetchDeposits({ address, timestamp = 0 }) {
        return await __classPrivateFieldGet(this, _TransactionFetcher_storeVaultHttpClient, "f").get('/store-vault-server/deposit/get-all-after', {
            params: {
                timestamp,
                pubkey: hexToBigInt(address),
            },
        });
    }
    async fetchPendingWithdrawals(address) {
        const pendingWithdrawals = {
            [WithdrawalsStatus.Failed]: [],
            [WithdrawalsStatus.NeedClaim]: [],
            [WithdrawalsStatus.Relayed]: [],
            [WithdrawalsStatus.Requested]: [],
            [WithdrawalsStatus.Success]: [],
        };
        const rawWithdrawals = await __classPrivateFieldGet(this, _TransactionFetcher_withdrawalHttpClient, "f").get('/get-withdrawal-info', {
            params: {
                pubkey: hexToBigInt(address),
                signature: [
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                ],
            },
        });
        rawWithdrawals.withdrawalInfo.forEach((withdrawal) => {
            pendingWithdrawals[withdrawal.status].push(withdrawal.contractWithdrawal);
        });
        pendingWithdrawals[WithdrawalsStatus.NeedClaim] = Array.from(new Map(pendingWithdrawals[WithdrawalsStatus.NeedClaim].map((w) => [w.nullifier, w])).values());
        if (pendingWithdrawals[WithdrawalsStatus.NeedClaim].length > 0) {
            const withdrawalHashes = new Set(pendingWithdrawals[WithdrawalsStatus.NeedClaim].map(getWithdrawHash));
            const results = await __classPrivateFieldGet(this, _TransactionFetcher_publicClient, "f").multicall({
                contracts: [...withdrawalHashes].map((hash) => ({
                    abi: LiquidityAbi,
                    address: __classPrivateFieldGet(this, _TransactionFetcher_liquidityContractAddress, "f"),
                    functionName: 'claimableWithdrawals',
                    args: [hash],
                })),
            });
            const updatedWithdrawalsToClaim = [];
            results.forEach((result, i) => {
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
_TransactionFetcher_storeVaultHttpClient = new WeakMap(), _TransactionFetcher_withdrawalHttpClient = new WeakMap(), _TransactionFetcher_publicClient = new WeakMap(), _TransactionFetcher_liquidityContractAddress = new WeakMap();
//# sourceMappingURL=transaction-fetcher.js.map