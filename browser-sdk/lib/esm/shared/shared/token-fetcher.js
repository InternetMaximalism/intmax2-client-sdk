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
var _TokenFetcher_instances, _TokenFetcher_intervalId, _TokenFetcher_httpClient, _TokenFetcher_liquidityContractAddress, _TokenFetcher_publicClient, _TokenFetcher_startPeriodicUpdate, _TokenFetcher_fetchTokens;
import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { DEVNET_ENV, liquidityAbiNft, MAINNET_ENV, TESTNET_ENV } from '../constants';
import { axiosClientInit } from '../utils';
export class TokenFetcher {
    constructor(environment) {
        _TokenFetcher_instances.add(this);
        this.tokens = [];
        _TokenFetcher_intervalId.set(this, null);
        _TokenFetcher_httpClient.set(this, void 0);
        _TokenFetcher_liquidityContractAddress.set(this, void 0);
        _TokenFetcher_publicClient.set(this, void 0);
        __classPrivateFieldSet(this, _TokenFetcher_liquidityContractAddress, environment === 'mainnet'
            ? MAINNET_ENV.liquidity_contract
            : environment === 'testnet'
                ? TESTNET_ENV.liquidity_contract
                : DEVNET_ENV.liquidity_contract, "f");
        __classPrivateFieldSet(this, _TokenFetcher_httpClient, axiosClientInit({
            baseURL: environment === 'mainnet'
                ? MAINNET_ENV.tokens_url
                : environment === 'testnet'
                    ? TESTNET_ENV.tokens_url
                    : DEVNET_ENV.tokens_url,
        }), "f");
        __classPrivateFieldSet(this, _TokenFetcher_publicClient, createPublicClient({
            chain: environment === 'mainnet' ? mainnet : sepolia,
            transport: http(),
        }), "f");
        this.fetchTokens();
        __classPrivateFieldGet(this, _TokenFetcher_instances, "m", _TokenFetcher_startPeriodicUpdate).call(this, 60000);
    }
    async fetchTokens() {
        let cursor = null;
        let fetchAgain = true;
        this.tokens = [];
        while (fetchAgain) {
            const data = await __classPrivateFieldGet(this, _TokenFetcher_instances, "m", _TokenFetcher_fetchTokens).call(this, cursor);
            this.tokens = [...this.tokens, ...data.items];
            cursor = data.nextCursor;
            if (!cursor) {
                fetchAgain = false;
            }
        }
        return this.tokens;
    }
    async getTokensById(tokenIds) {
        const contracts = tokenIds.map((id) => ({
            abi: liquidityAbiNft,
            address: __classPrivateFieldGet(this, _TokenFetcher_liquidityContractAddress, "f"),
            functionName: 'getTokenInfo',
            args: [id],
        }));
        const multicallResults = await __classPrivateFieldGet(this, _TokenFetcher_publicClient, "f").multicall({
            contracts,
        });
        return multicallResults;
    }
}
_TokenFetcher_intervalId = new WeakMap(), _TokenFetcher_httpClient = new WeakMap(), _TokenFetcher_liquidityContractAddress = new WeakMap(), _TokenFetcher_publicClient = new WeakMap(), _TokenFetcher_instances = new WeakSet(), _TokenFetcher_startPeriodicUpdate = function _TokenFetcher_startPeriodicUpdate(interval) {
    if (__classPrivateFieldGet(this, _TokenFetcher_intervalId, "f")) {
        clearInterval(__classPrivateFieldGet(this, _TokenFetcher_intervalId, "f"));
    }
    __classPrivateFieldSet(this, _TokenFetcher_intervalId, setInterval(async () => {
        await this.fetchTokens();
        console.info('Tokens updated');
    }, interval), "f");
}, _TokenFetcher_fetchTokens = async function _TokenFetcher_fetchTokens(cursor) {
    return __classPrivateFieldGet(this, _TokenFetcher_httpClient, "f").get('/token-mappings/list', {
        params: {
            perPage: 100,
            cursor,
        },
    });
};
//# sourceMappingURL=token-fetcher.js.map