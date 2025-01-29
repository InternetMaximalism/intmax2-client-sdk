"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionFetcher = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const constants_1 = require("../constants");
const types_1 = require("../types");
const utils_1 = require("../utils");
class TransactionFetcher {
    constructor(environment) {
        _TransactionFetcher_storeVaultHttpClient.set(this, void 0);
        _TransactionFetcher_withdrawalHttpClient.set(this, void 0);
        _TransactionFetcher_publicClient.set(this, void 0);
        _TransactionFetcher_liquidityContractAddress.set(this, void 0);
        __classPrivateFieldSet(this, _TransactionFetcher_liquidityContractAddress, environment === 'mainnet'
            ? constants_1.MAINNET_ENV.liquidity_contract
            : environment === 'testnet'
                ? constants_1.TESTNET_ENV.liquidity_contract
                : constants_1.DEVNET_ENV.liquidity_contract, "f");
        __classPrivateFieldSet(this, _TransactionFetcher_storeVaultHttpClient, (0, utils_1.axiosClientInit)({
            baseURL: environment === 'mainnet'
                ? constants_1.MAINNET_ENV.store_vault_server_url
                : environment === 'testnet'
                    ? constants_1.TESTNET_ENV.store_vault_server_url
                    : constants_1.DEVNET_ENV.store_vault_server_url,
        }), "f");
        __classPrivateFieldSet(this, _TransactionFetcher_withdrawalHttpClient, (0, utils_1.axiosClientInit)({
            baseURL: `${environment === 'mainnet'
                ? constants_1.MAINNET_ENV.withdrawal_aggregator_url
                : environment === 'testnet'
                    ? constants_1.TESTNET_ENV.withdrawal_aggregator_url
                    : constants_1.DEVNET_ENV.withdrawal_aggregator_url}/withdrawal-server`,
        }), "f");
        __classPrivateFieldSet(this, _TransactionFetcher_publicClient, (0, viem_1.createPublicClient)({
            chain: environment === 'mainnet' ? chains_1.mainnet : chains_1.sepolia,
            transport: (0, viem_1.http)(),
        }), "f");
    }
    async fetchTx({ address, timestamp = 0 }) {
        return __classPrivateFieldGet(this, _TransactionFetcher_storeVaultHttpClient, "f").get('/store-vault-server/tx/get-all-after', {
            params: {
                timestamp,
                pubkey: (0, viem_1.hexToBigInt)(address),
            },
        });
    }
    async fetchTransfers({ address, timestamp = 0 }) {
        return await __classPrivateFieldGet(this, _TransactionFetcher_storeVaultHttpClient, "f").get('/store-vault-server/transfer/get-all-after', {
            params: {
                timestamp,
                pubkey: (0, viem_1.hexToBigInt)(address),
            },
        });
    }
    async fetchDeposits({ address, timestamp = 0 }) {
        return await __classPrivateFieldGet(this, _TransactionFetcher_storeVaultHttpClient, "f").get('/store-vault-server/deposit/get-all-after', {
            params: {
                timestamp,
                pubkey: (0, viem_1.hexToBigInt)(address),
            },
        });
    }
    async fetchPendingWithdrawals(address) {
        const pendingWithdrawals = {
            [types_1.WithdrawalsStatus.Failed]: [],
            [types_1.WithdrawalsStatus.NeedClaim]: [],
            [types_1.WithdrawalsStatus.Relayed]: [],
            [types_1.WithdrawalsStatus.Requested]: [],
            [types_1.WithdrawalsStatus.Success]: [],
        };
        const rawWithdrawals = await __classPrivateFieldGet(this, _TransactionFetcher_withdrawalHttpClient, "f").get('/get-withdrawal-info', {
            params: {
                pubkey: (0, viem_1.hexToBigInt)(address),
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
        pendingWithdrawals[types_1.WithdrawalsStatus.NeedClaim] = Array.from(new Map(pendingWithdrawals[types_1.WithdrawalsStatus.NeedClaim].map((w) => [w.nullifier, w])).values());
        if (pendingWithdrawals[types_1.WithdrawalsStatus.NeedClaim].length > 0) {
            const withdrawalHashes = new Set(pendingWithdrawals[types_1.WithdrawalsStatus.NeedClaim].map(utils_1.getWithdrawHash));
            const results = await __classPrivateFieldGet(this, _TransactionFetcher_publicClient, "f").multicall({
                contracts: [...withdrawalHashes].map((hash) => ({
                    abi: constants_1.LiquidityAbi,
                    address: __classPrivateFieldGet(this, _TransactionFetcher_liquidityContractAddress, "f"),
                    functionName: 'claimableWithdrawals',
                    args: [hash],
                })),
            });
            const updatedWithdrawalsToClaim = [];
            results.forEach((result, i) => {
                if (result.status === 'success' && result.result) {
                    updatedWithdrawalsToClaim.push({
                        ...pendingWithdrawals[types_1.WithdrawalsStatus.NeedClaim][i],
                    });
                }
            });
            pendingWithdrawals[types_1.WithdrawalsStatus.NeedClaim] = updatedWithdrawalsToClaim;
        }
        return pendingWithdrawals;
    }
}
exports.TransactionFetcher = TransactionFetcher;
_TransactionFetcher_storeVaultHttpClient = new WeakMap(), _TransactionFetcher_withdrawalHttpClient = new WeakMap(), _TransactionFetcher_publicClient = new WeakMap(), _TransactionFetcher_liquidityContractAddress = new WeakMap();
//# sourceMappingURL=transaction-fetcher.js.map