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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _IntMaxClient_instances, _IntMaxClient_config, _IntMaxClient_tokenFetcher, _IntMaxClient_txFetcher, _IntMaxClient_walletClient, _IntMaxClient_publicClient, _IntMaxClient_vaultHttpClient, _IntMaxClient_privateKey, _IntMaxClient_userData, _IntMaxClient_urls, _IntMaxClient_generateConfig, _IntMaxClient_checkAllowanceToExecuteMethod, _IntMaxClient_decryptTransactionData, _IntMaxClient_entropy, _IntMaxClient_fetchUserData, _IntMaxClient_prepareDepositToken, _IntMaxClient_prepareTransaction, _IntMaxClient_depositToAccount, _IntMaxClient_validateApproval, _IntMaxClient_getAllowance, _IntMaxClient_checkApproval;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntMaxClient = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const shared_1 = require("../shared");
const intmax2_wasm_lib_1 = require("../wasm/browser/intmax2_wasm_lib");
const intmax2_wasm_lib_bg_wasm_url_1 = __importDefault(require("../wasm/browser/intmax2_wasm_lib_bg.wasm?url"));
class IntMaxClient {
    constructor({ async_params, environment }) {
        _IntMaxClient_instances.add(this);
        _IntMaxClient_config.set(this, void 0);
        _IntMaxClient_tokenFetcher.set(this, void 0);
        _IntMaxClient_txFetcher.set(this, void 0);
        _IntMaxClient_walletClient.set(this, void 0);
        _IntMaxClient_publicClient.set(this, void 0);
        _IntMaxClient_vaultHttpClient.set(this, void 0);
        _IntMaxClient_privateKey.set(this, '');
        _IntMaxClient_userData.set(this, void 0);
        _IntMaxClient_urls.set(this, void 0);
        this.isLoggedIn = false;
        this.address = '';
        this.tokenBalances = [];
        if (typeof async_params === 'undefined') {
            throw new Error('Cannot be called directly');
        }
        (0, intmax2_wasm_lib_1.initSync)(async_params);
        __classPrivateFieldSet(this, _IntMaxClient_walletClient, (0, viem_1.createWalletClient)({
            chain: environment === 'mainnet' ? chains_1.mainnet : chains_1.sepolia,
            transport: (0, viem_1.custom)(window.ethereum),
        }), "f");
        __classPrivateFieldSet(this, _IntMaxClient_publicClient, (0, viem_1.createPublicClient)({
            chain: environment === 'mainnet' ? chains_1.mainnet : chains_1.sepolia,
            transport: (0, viem_1.http)(),
        }), "f");
        __classPrivateFieldSet(this, _IntMaxClient_vaultHttpClient, (0, shared_1.axiosClientInit)({
            baseURL: environment === 'mainnet'
                ? shared_1.MAINNET_ENV.key_vault_url
                : environment === 'testnet'
                    ? shared_1.TESTNET_ENV.key_vault_url
                    : shared_1.DEVNET_ENV.key_vault_url,
        }), "f");
        __classPrivateFieldSet(this, _IntMaxClient_urls, environment === 'mainnet' ? shared_1.MAINNET_ENV : environment === 'testnet' ? shared_1.TESTNET_ENV : shared_1.DEVNET_ENV, "f");
        __classPrivateFieldSet(this, _IntMaxClient_config, __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_generateConfig).call(this, environment), "f");
        __classPrivateFieldSet(this, _IntMaxClient_txFetcher, new shared_1.TransactionFetcher(environment), "f");
        __classPrivateFieldSet(this, _IntMaxClient_tokenFetcher, new shared_1.TokenFetcher(environment), "f");
    }
    static async init({ environment }) {
        try {
            const bytes = await fetch(intmax2_wasm_lib_bg_wasm_url_1.default).then((response) => {
                return response.arrayBuffer();
            });
            return new IntMaxClient({ async_params: bytes, environment });
        }
        catch (e) {
            console.error(e);
            throw new Error('Failed to load wasm');
        }
    }
    async login() {
        this.isLoggedIn = false;
        await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").requestAddresses();
        const [address] = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").getAddresses();
        const signNetwork = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").signMessage({
            account: address,
            message: (0, shared_1.networkMessage)(address),
        });
        const data = await __classPrivateFieldGet(this, _IntMaxClient_vaultHttpClient, "f").post('/challenge', {
            address,
            type: 'login',
        });
        const challengeSignature = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").signMessage({
            account: address,
            message: data.message,
        });
        const { hashedSignature } = await __classPrivateFieldGet(this, _IntMaxClient_vaultHttpClient, "f").post('/wallet/login', {
            address,
            challengeSignature,
            securitySeed: (0, viem_1.sha256)(signNetwork),
        });
        await __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_entropy).call(this, signNetwork, hashedSignature);
        this.isLoggedIn = true;
        return {
            address: this.address,
            isLoggedIn: this.isLoggedIn,
        };
    }
    async getPrivateKey() {
        const [address] = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").getAddresses();
        const signNetwork = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").signMessage({
            account: address,
            message: (0, shared_1.networkMessage)(address),
        });
        try {
            const valid = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").verifyMessage({
                address: address,
                message: (0, shared_1.networkMessage)(address),
                signature: signNetwork,
            });
            if (valid) {
                return __classPrivateFieldGet(this, _IntMaxClient_privateKey, "f");
            }
        }
        catch (e) {
            console.error(e);
        }
        throw Error('Signature is wrong');
    }
    async fetchTokenBalances() {
        if (!this.isLoggedIn) {
            throw Error('Not logged in');
        }
        const userData = await __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_fetchUserData).call(this);
        let tokens = __classPrivateFieldGet(this, _IntMaxClient_tokenFetcher, "f").tokens;
        if (tokens.length === 0) {
            tokens = await __classPrivateFieldGet(this, _IntMaxClient_tokenFetcher, "f").fetchTokens();
        }
        const nftIds = userData.balances.reduce((acc, tb) => {
            const token = tokens.find((t) => t.tokenIndex === tb.token_index);
            if (!token) {
                return [...acc, tb.token_index];
            }
            return acc;
        }, []);
        const nftTokensResponse = await __classPrivateFieldGet(this, _IntMaxClient_tokenFetcher, "f").getTokensById(nftIds);
        const nftTokens = nftTokensResponse.reduce((acc, { result, status }, idx) => {
            if (status !== 'success') {
                return acc;
            }
            return [
                ...acc,
                {
                    price: 0,
                    tokenIndex: nftIds[idx],
                    tokenType: result.tokenType,
                    contractAddress: result.tokenAddress,
                },
            ];
        }, []);
        const balances = userData.balances.map((balance) => {
            const token = tokens.find((t) => t.tokenIndex === balance.token_index);
            if (!token) {
                const nftToken = nftTokens.find((t) => t.tokenIndex === balance.token_index);
                return {
                    token: nftToken,
                    amount: BigInt(balance.amount),
                };
            }
            return {
                token: { ...token, tokenType: token.tokenIndex !== 0 ? shared_1.TokenType.ERC20 : shared_1.TokenType.NATIVE },
                amount: BigInt(balance.amount),
            };
        });
        return {
            balances,
        };
    }
    async broadcastTransaction(rawTransfers, isWithdrawal = false) {
        if (!this.isLoggedIn) {
            throw Error('Not logged in');
        }
        const transfers = rawTransfers.map((transfer) => {
            const salt = `0x${(0, shared_1.randomBytesHex)(32)}`;
            let amount = `${transfer.amount}`;
            if (transfer.token.decimals) {
                amount = (0, viem_1.parseUnits)(transfer.amount.toString(), transfer.token.decimals).toString();
            }
            if (isWithdrawal) {
                if (!(0, viem_1.isAddress)(transfer.address)) {
                    throw Error('Invalid address to withdraw');
                }
                return new intmax2_wasm_lib_1.JsTransfer(new intmax2_wasm_lib_1.JsGenericAddress(!isWithdrawal, transfer.address), transfer.token.tokenIndex, amount, salt);
            }
            if (!isWithdrawal && (0, viem_1.isAddress)(transfer.address)) {
                throw Error('Invalid address to transfer');
            }
            return new intmax2_wasm_lib_1.JsTransfer(new intmax2_wasm_lib_1.JsGenericAddress(!isWithdrawal, transfer.address), transfer.token.tokenIndex, amount, salt);
        });
        let privateKey = '';
        try {
            privateKey = await this.getPrivateKey();
        }
        catch (e) {
            console.error(e);
            throw Error('No private key found');
        }
        let memo;
        try {
            // send the tx request
            memo = (await (0, intmax2_wasm_lib_1.send_tx_request)(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_urls, "f").block_builder_url, privateKey, transfers));
            if (!memo) {
                throw new Error('Failed to send tx request');
            }
            memo.tx();
        }
        catch (e) {
            console.error(e);
            throw new Error('Failed to send tx request');
        }
        let tx;
        try {
            tx = await (0, intmax2_wasm_lib_1.query_and_finalize)(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_urls, "f").block_builder_url, privateKey, memo);
        }
        catch (e) {
            console.error(e);
            throw new Error('Failed to finalize tx');
        }
        if (isWithdrawal) {
            await (0, shared_1.sleep)(40000);
            await (0, intmax2_wasm_lib_1.sync_withdrawals)(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), privateKey);
        }
        return {
            txTreeRoot: tx.tx_tree_root,
            transferUUIDs: tx.transfer_uuids,
            withdrawalUUIDs: tx.withdrawal_uuids,
            transferData: tx.transfer_data_vec.length > 0 ? tx.transfer_data_vec.map(shared_1.jsTransferToTransfer) : [],
            withdrawalData: tx.withdrawal_data_vec.length > 0 ? tx.withdrawal_data_vec.map(shared_1.jsTransferToTransfer) : [],
        };
    }
    // Send/Withdrawals
    async fetchTransactions(_params) {
        __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_checkAllowanceToExecuteMethod).call(this);
        const data = await __classPrivateFieldGet(this, _IntMaxClient_txFetcher, "f").fetchTx({
            address: this.address,
        });
        const pendingWithdrawals = await __classPrivateFieldGet(this, _IntMaxClient_txFetcher, "f").fetchPendingWithdrawals(this.address);
        return __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_decryptTransactionData).call(this, data, shared_1.TransactionType.Send, pendingWithdrawals);
    }
    // Receive
    async fetchTransfers(_params) {
        __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_checkAllowanceToExecuteMethod).call(this);
        const data = await __classPrivateFieldGet(this, _IntMaxClient_txFetcher, "f").fetchTransfers({
            address: this.address,
        });
        return __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_decryptTransactionData).call(this, data, shared_1.TransactionType.Receive);
    }
    // Deposit
    async fetchDeposits(_params) {
        __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_checkAllowanceToExecuteMethod).call(this);
        const data = await __classPrivateFieldGet(this, _IntMaxClient_txFetcher, "f").fetchDeposits({
            address: this.address,
        });
        return __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_decryptTransactionData).call(this, data, shared_1.TransactionType.Deposit);
    }
    async withdraw({ amount, address, token }) {
        return this.broadcastTransaction([
            {
                amount,
                address,
                token,
            },
        ], true);
    }
    async logout() {
        this.isLoggedIn = false;
        __classPrivateFieldSet(this, _IntMaxClient_privateKey, '', "f");
        this.address = '';
        __classPrivateFieldSet(this, _IntMaxClient_userData, undefined, "f");
        await __classPrivateFieldGet(this, _IntMaxClient_vaultHttpClient, "f").post('/wallet/logout', {});
        return;
    }
    async estimateDepositGas(params) {
        const txConfig = await __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_prepareDepositToken).call(this, params);
        if (txConfig.functionName !== 'depositNativeToken') {
            const isValidApproval = await __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_validateApproval).call(this, {
                tokenAddress: txConfig.args?.[0],
                amount: BigInt(txConfig.args?.[2]),
                functionName: txConfig.functionName,
            });
            if (!isValidApproval) {
                switch (txConfig.functionName) {
                    case 'depositERC20':
                        await __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_getAllowance).call(this, txConfig.args?.[0], BigInt(txConfig.args?.[2]));
                        break;
                    case 'depositERC721':
                    case 'depositERC1155':
                        await __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_checkApproval).call(this, txConfig.args?.[0]);
                        break;
                }
            }
        }
        const estimatedGas = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").estimateContractGas({
            address: txConfig.address,
            abi: txConfig.abi,
            functionName: txConfig.functionName,
            args: txConfig.args,
            account: txConfig.account,
            value: txConfig.value,
        });
        const gasPrice = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").getGasPrice();
        return (0, viem_1.parseEther)((gasPrice ?? 0n * estimatedGas).toString());
    }
    async deposit(params) {
        const txConfig = await __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_prepareDepositToken).call(this, { ...params, isGasEstimation: false });
        const depositHash = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").writeContract(txConfig);
        let status = shared_1.TransactionStatus.Processing;
        while (status === shared_1.TransactionStatus.Processing) {
            await (0, shared_1.sleep)(3000);
            try {
                const tx = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").getTransactionReceipt({
                    hash: depositHash,
                });
                if (tx) {
                    status = tx.status === 'success' ? shared_1.TransactionStatus.Completed : shared_1.TransactionStatus.Rejected;
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        return {
            status,
            txHash: depositHash,
        };
    }
    async fetchPendingWithdrawals() {
        return __classPrivateFieldGet(this, _IntMaxClient_txFetcher, "f").fetchPendingWithdrawals(this.address);
    }
    async claimWithdrawal(needClaimWithdrawals) {
        const [address] = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").getAddresses();
        const withdrawalsToClaim = needClaimWithdrawals
            .filter((w) => w.recipient.toLowerCase() === address.toLowerCase())
            .map((w) => ({
            ...w,
            amount: BigInt(w.amount),
            tokenIndex: BigInt(w.tokenIndex),
        }));
        if (withdrawalsToClaim.length === 0) {
            throw new Error('No withdrawals to claim');
        }
        await (0, shared_1.sleep)(500);
        try {
            const txHash = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").writeContract({
                address: __classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address,
                abi: shared_1.LiquidityAbi,
                functionName: 'claimWithdrawals',
                args: [withdrawalsToClaim],
                account: address,
                chain: __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").chain,
            });
            let status = shared_1.TransactionStatus.Processing;
            while (status === shared_1.TransactionStatus.Processing) {
                await (0, shared_1.sleep)(1500);
                try {
                    const tx = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").getTransactionReceipt({
                        hash: txHash,
                    });
                    if (tx) {
                        status = tx.status === 'success' ? shared_1.TransactionStatus.Completed : shared_1.TransactionStatus.Rejected;
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
            if (status === shared_1.TransactionStatus.Rejected) {
                throw new Error('Transaction rejected');
            }
            return {
                status: shared_1.TransactionStatus.Completed,
                txHash,
            };
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    waitForTransactionConfirmation(_params) {
        throw Error('Not implemented!');
    }
    signMessage(_data) {
        throw Error('Not implemented!');
    }
    async getTokensList() {
        if (!__classPrivateFieldGet(this, _IntMaxClient_tokenFetcher, "f").tokens) {
            return __classPrivateFieldGet(this, _IntMaxClient_tokenFetcher, "f").fetchTokens();
        }
        return __classPrivateFieldGet(this, _IntMaxClient_tokenFetcher, "f").tokens;
    }
}
exports.IntMaxClient = IntMaxClient;
_IntMaxClient_config = new WeakMap(), _IntMaxClient_tokenFetcher = new WeakMap(), _IntMaxClient_txFetcher = new WeakMap(), _IntMaxClient_walletClient = new WeakMap(), _IntMaxClient_publicClient = new WeakMap(), _IntMaxClient_vaultHttpClient = new WeakMap(), _IntMaxClient_privateKey = new WeakMap(), _IntMaxClient_userData = new WeakMap(), _IntMaxClient_urls = new WeakMap(), _IntMaxClient_instances = new WeakSet(), _IntMaxClient_generateConfig = function _IntMaxClient_generateConfig(env) {
    const urls = env === 'mainnet' ? shared_1.MAINNET_ENV : env === 'testnet' ? shared_1.TESTNET_ENV : shared_1.DEVNET_ENV;
    return new intmax2_wasm_lib_1.Config(urls.store_vault_server_url, urls.balance_prover_url, urls.block_validity_prover_url, urls.withdrawal_aggregator_url, BigInt(60), // Deposit Timeout
    BigInt(60), // Tx timeout
    // ---------------------
    BigInt(10), // Block Builder Request Interval
    BigInt(6), // Block Builder Request Limit
    BigInt(5), // Block Builder Query Wait Time
    BigInt(5), // Block Builder Query Interval
    BigInt(20), // Block Builder Query Limit
    // ---------------------
    urls.rpc_url_l1, // L1 RPC URL
    BigInt(urls.chain_id_l1), // L1 Chain ID
    urls.liquidity_contract, // Liquidity Contract Address
    urls.rpc_url_l2, // L2 RPC URL
    BigInt(urls.chain_id_l2), // L2 Chain ID
    urls.rollup_contract, // Rollup Contract Address
    BigInt(urls.rollup_contract_deployed_block_number));
}, _IntMaxClient_checkAllowanceToExecuteMethod = function _IntMaxClient_checkAllowanceToExecuteMethod() {
    if (!this.isLoggedIn && !this.address) {
        throw Error('Not logged in');
    }
    if (!__classPrivateFieldGet(this, _IntMaxClient_userData, "f")) {
        throw Error('User data not found');
    }
}, _IntMaxClient_decryptTransactionData = async function _IntMaxClient_decryptTransactionData(data, variant, pendingWithdrawals) {
    const rawTransactions = data.map((t) => (0, shared_1.transactionMapper)(t, variant));
    const txsPromises = rawTransactions.map(async (tx) => {
        switch (tx.txType) {
            case shared_1.TransactionType.Deposit:
            case shared_1.TransactionType.Mining:
                return await (0, intmax2_wasm_lib_1.decrypt_deposit_data)(__classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"), tx.data);
            case shared_1.TransactionType.Send:
            case shared_1.TransactionType.Withdraw:
                return await (0, intmax2_wasm_lib_1.decrypt_tx_data)(__classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"), tx.data);
            case shared_1.TransactionType.Receive:
                return await (0, intmax2_wasm_lib_1.decrypt_transfer_data)(__classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"), tx.data);
        }
    });
    const decryptedData = await Promise.all(txsPromises);
    const formattedTxs = decryptedData.map((tx, idx) => (0, shared_1.decryptedToWASMTx)(tx, rawTransactions[idx].uuid, rawTransactions[idx].txType, rawTransactions[idx].timestamp));
    const tokens = await __classPrivateFieldGet(this, _IntMaxClient_tokenFetcher, "f").fetchTokens();
    return formattedTxs
        .map((tx) => (0, shared_1.wasmTxToTx)(tx, __classPrivateFieldGet(this, _IntMaxClient_userData, "f"), tokens, pendingWithdrawals))
        .filter(Boolean);
}, _IntMaxClient_entropy = async function _IntMaxClient_entropy(networkSignedMessage, hashedSignature) {
    const securitySeed = (0, viem_1.sha256)(networkSignedMessage);
    const entropyPreImage = (securitySeed + hashedSignature.slice(2));
    const entropy = (0, viem_1.sha256)(entropyPreImage);
    const hdKey = (0, shared_1.getPkFromMnemonic)(entropy);
    if (!hdKey) {
        throw Error('No key found');
    }
    const keySet = await (0, intmax2_wasm_lib_1.generate_intmax_account_from_eth_key)((0, viem_1.toHex)(hdKey));
    if (!keySet) {
        throw new Error('No key found');
    }
    this.address = keySet.pubkey;
    __classPrivateFieldSet(this, _IntMaxClient_privateKey, keySet.privkey, "f");
    return;
}, _IntMaxClient_fetchUserData = async function _IntMaxClient_fetchUserData() {
    const prevFetchData = shared_1.localStorageManager.getItem('user_data_fetch');
    const prevFetchDateObj = prevFetchData?.find((data) => data.address.toLowerCase() === this.address.toLowerCase());
    if (prevFetchDateObj && prevFetchDateObj.address.toLowerCase() === this.address.toLowerCase()) {
        const prevFetchDate = prevFetchDateObj.fetchDate;
        const currentDate = new Date().getTime();
        const diff = currentDate - prevFetchDate;
        if (diff < 180000 && __classPrivateFieldGet(this, _IntMaxClient_userData, "f")) {
            console.info('Skipping user data fetch');
            return __classPrivateFieldGet(this, _IntMaxClient_userData, "f");
        }
        else if (diff < 180000) {
            console.info('Fetching user data without sync');
            const userdata = await (0, intmax2_wasm_lib_1.get_user_data)(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"));
            __classPrivateFieldSet(this, _IntMaxClient_userData, userdata, "f");
            return userdata;
        }
    }
    try {
        // sync the account's balance proof
        await (0, shared_1.retryWithAttempts)(() => {
            return (0, intmax2_wasm_lib_1.sync)(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"));
        }, 10000, 5);
        console.info('Synced account balance proof');
        // sync withdrawals
        await (0, shared_1.retryWithAttempts)(() => {
            return (0, intmax2_wasm_lib_1.sync_withdrawals)(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"));
        }, 10000, 5);
        console.info('Synced withdrawals');
    }
    catch (e) {
        console.info('Failed to sync account balance proof', e);
    }
    const userData = await (0, intmax2_wasm_lib_1.get_user_data)(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"));
    __classPrivateFieldSet(this, _IntMaxClient_userData, userData, "f");
    const prevFetchDataArr = prevFetchData?.filter((data) => data.address.toLowerCase() !== this.address?.toLowerCase()) ?? [];
    prevFetchDataArr.push({
        fetchDate: Date.now(),
        address: this.address,
    });
    shared_1.localStorageManager.setItem('user_data_fetch', prevFetchDataArr);
    return userData;
}, _IntMaxClient_prepareDepositToken = async function _IntMaxClient_prepareDepositToken({ token, isGasEstimation, amount, address }) {
    const accounts = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").getAddresses();
    const salt = isGasEstimation
        ? (0, shared_1.randomBytesHex)(16)
        : await __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_depositToAccount).call(this, {
            pubkey: address,
            amountInDecimals: token.tokenType === shared_1.TokenType.NATIVE
                ? (0, viem_1.parseEther)(`${amount}`)
                : token.tokenType === shared_1.TokenType.ERC20
                    ? (0, viem_1.parseUnits)(`${amount}`, token.decimals ?? 18)
                    : BigInt(amount),
            tokenIndex: token.tokenIndex,
            token_type: token.tokenType,
            token_address: token.contractAddress,
        });
    return __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_prepareTransaction).call(this, {
        salt,
        tokenType: token.tokenType,
        amountInWei: token.tokenType === shared_1.TokenType.NATIVE
            ? (0, viem_1.parseEther)(`${amount}`)
            : token.tokenType === shared_1.TokenType.ERC20
                ? (0, viem_1.parseUnits)(`${amount}`, token.decimals ?? 18)
                : BigInt(amount),
        tokenAddress: token.contractAddress,
        tokenId: token.tokenIndex,
        account: accounts[0],
    });
}, _IntMaxClient_prepareTransaction = function _IntMaxClient_prepareTransaction({ salt, tokenType, amountInWei, tokenAddress, tokenId, account, }) {
    const returnObj = {
        args: [],
        functionName: '',
        account,
        chain: __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").chain,
        abi: shared_1.LiquidityAbi,
        address: __classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address,
        value: 0n,
    };
    switch (tokenType) {
        case shared_1.TokenType.NATIVE:
            returnObj.functionName = 'depositNativeToken';
            returnObj.args = [salt];
            returnObj.value = BigInt(amountInWei);
            break;
        case shared_1.TokenType.ERC20:
            returnObj.functionName = 'depositERC20';
            returnObj.args = [tokenAddress, salt, amountInWei];
            break;
        case shared_1.TokenType.ERC721:
            returnObj.functionName = 'depositERC721';
            returnObj.args = [tokenAddress, salt, tokenId];
            break;
        case shared_1.TokenType.ERC1155:
            returnObj.functionName = 'depositERC1155';
            returnObj.args = [tokenAddress, salt, tokenId, amountInWei];
            break;
    }
    return returnObj;
}, _IntMaxClient_depositToAccount = async function _IntMaxClient_depositToAccount({ tokenIndex, amountInDecimals, pubkey, token_type, token_address, }) {
    const depositResult = await (0, intmax2_wasm_lib_1.prepare_deposit)(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), pubkey, amountInDecimals.toString(), token_type, token_address, tokenIndex.toString());
    if (!depositResult) {
        throw new Error('Failed to prepare deposit');
    }
    return depositResult.deposit_data.pubkey_salt_hash;
}, _IntMaxClient_validateApproval = async function _IntMaxClient_validateApproval({ tokenAddress, amount, functionName, }) {
    let isApproved = false;
    const addresses = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").getAddresses();
    // Check if we need to approve the contract to spend the token
    try {
        if (functionName === 'depositERC20') {
            const currentAllowance = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").readContract({
                address: tokenAddress,
                abi: viem_1.erc20Abi,
                functionName: 'allowance',
                args: [addresses[0], __classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address],
            });
            isApproved = currentAllowance >= amount;
        }
        else if (functionName === 'depositERC721' || functionName === 'depositERC1155') {
            isApproved = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").readContract({
                address: tokenAddress,
                abi: viem_1.erc721Abi,
                functionName: 'isApprovedForAll',
                args: [addresses[0], __classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address],
            });
        }
    }
    catch (e) {
        console.error(e);
        throw e;
    }
    return isApproved;
}, _IntMaxClient_getAllowance = async function _IntMaxClient_getAllowance(tokenAddress, amount) {
    const addresses = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").getAddresses();
    const currentAllowance = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").readContract({
        address: tokenAddress,
        abi: viem_1.erc20Abi,
        functionName: 'allowance',
        args: [addresses[0], __classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address],
    });
    if (currentAllowance < amount) {
        try {
            const approveTx = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").writeContract({
                address: tokenAddress,
                abi: viem_1.erc20Abi,
                functionName: 'approve',
                args: [__classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address, amount],
                account: addresses[0],
                chain: __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").chain,
            });
            await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").waitForTransactionReceipt({
                hash: approveTx,
            });
        }
        catch (approveError) {
            console.error('Approval failed', approveError);
            throw approveError;
        }
    }
}, _IntMaxClient_checkApproval = async function _IntMaxClient_checkApproval(tokenAddress) {
    const addresses = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").getAddresses();
    const currentApproval = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").readContract({
        address: tokenAddress,
        abi: viem_1.erc721Abi,
        functionName: 'isApprovedForAll',
        args: [addresses[0], __classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address],
    });
    if (!currentApproval) {
        try {
            const approveTx = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").writeContract({
                address: tokenAddress,
                abi: viem_1.erc721Abi,
                functionName: 'setApprovalForAll',
                args: [__classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address, true],
                account: addresses[0],
                chain: __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").chain,
            });
            await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").waitForTransactionReceipt({
                hash: approveTx,
            });
        }
        catch (approveError) {
            console.error('Approval failed', approveError);
            throw approveError;
        }
    }
};
//# sourceMappingURL=index.js.map