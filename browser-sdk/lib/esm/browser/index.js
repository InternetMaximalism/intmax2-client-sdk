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
var _IntMaxClient_instances, _IntMaxClient_config, _IntMaxClient_tokenFetcher, _IntMaxClient_txFetcher, _IntMaxClient_walletClient, _IntMaxClient_publicClient, _IntMaxClient_vaultHttpClient, _IntMaxClient_privateKey, _IntMaxClient_userData, _IntMaxClient_urls, _IntMaxClient_generateConfig, _IntMaxClient_checkAllowanceToExecuteMethod, _IntMaxClient_decryptTransactionData, _IntMaxClient_entropy, _IntMaxClient_fetchUserData, _IntMaxClient_prepareDepositToken, _IntMaxClient_prepareTransaction, _IntMaxClient_depositToAccount, _IntMaxClient_validateApproval, _IntMaxClient_getAllowance, _IntMaxClient_checkApproval;
import { createPublicClient, createWalletClient, custom, erc20Abi, erc721Abi, http, isAddress, parseEther, parseUnits, sha256, toHex, } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { axiosClientInit, decryptedToWASMTx, DEVNET_ENV, getPkFromMnemonic, jsTransferToTransfer, LiquidityAbi, localStorageManager, MAINNET_ENV, networkMessage, randomBytesHex, retryWithAttempts, sleep, TESTNET_ENV, TokenFetcher, TokenType, TransactionFetcher, transactionMapper, TransactionStatus, TransactionType, wasmTxToTx, } from '../shared';
import { Config, decrypt_deposit_data, decrypt_transfer_data, decrypt_tx_data, generate_intmax_account_from_eth_key, get_user_data, initSync, JsGenericAddress, JsTransfer, prepare_deposit, query_and_finalize, send_tx_request, sync, sync_withdrawals, } from '../wasm/browser/intmax2_wasm_lib';
import wasmBytes from '../wasm/browser/intmax2_wasm_lib_bg.wasm?url';
export class IntMaxClient {
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
        initSync(async_params);
        __classPrivateFieldSet(this, _IntMaxClient_walletClient, createWalletClient({
            chain: environment === 'mainnet' ? mainnet : sepolia,
            transport: custom(window.ethereum),
        }), "f");
        __classPrivateFieldSet(this, _IntMaxClient_publicClient, createPublicClient({
            chain: environment === 'mainnet' ? mainnet : sepolia,
            transport: http(),
        }), "f");
        __classPrivateFieldSet(this, _IntMaxClient_vaultHttpClient, axiosClientInit({
            baseURL: environment === 'mainnet'
                ? MAINNET_ENV.key_vault_url
                : environment === 'testnet'
                    ? TESTNET_ENV.key_vault_url
                    : DEVNET_ENV.key_vault_url,
        }), "f");
        __classPrivateFieldSet(this, _IntMaxClient_urls, environment === 'mainnet' ? MAINNET_ENV : environment === 'testnet' ? TESTNET_ENV : DEVNET_ENV, "f");
        __classPrivateFieldSet(this, _IntMaxClient_config, __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_generateConfig).call(this, environment), "f");
        __classPrivateFieldSet(this, _IntMaxClient_txFetcher, new TransactionFetcher(environment), "f");
        __classPrivateFieldSet(this, _IntMaxClient_tokenFetcher, new TokenFetcher(environment), "f");
    }
    static async init({ environment }) {
        try {
            const bytes = await fetch(wasmBytes).then((response) => {
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
            message: networkMessage(address),
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
            securitySeed: sha256(signNetwork),
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
            message: networkMessage(address),
        });
        try {
            const valid = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").verifyMessage({
                address: address,
                message: networkMessage(address),
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
                token: { ...token, tokenType: token.tokenIndex !== 0 ? TokenType.ERC20 : TokenType.NATIVE },
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
            const salt = `0x${randomBytesHex(32)}`;
            let amount = `${transfer.amount}`;
            if (transfer.token.decimals) {
                amount = parseUnits(transfer.amount.toString(), transfer.token.decimals).toString();
            }
            if (isWithdrawal) {
                if (!isAddress(transfer.address)) {
                    throw Error('Invalid address to withdraw');
                }
                return new JsTransfer(new JsGenericAddress(!isWithdrawal, transfer.address), transfer.token.tokenIndex, amount, salt);
            }
            if (!isWithdrawal && isAddress(transfer.address)) {
                throw Error('Invalid address to transfer');
            }
            return new JsTransfer(new JsGenericAddress(!isWithdrawal, transfer.address), transfer.token.tokenIndex, amount, salt);
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
            memo = (await send_tx_request(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_urls, "f").block_builder_url, privateKey, transfers));
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
            tx = await query_and_finalize(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_urls, "f").block_builder_url, privateKey, memo);
        }
        catch (e) {
            console.error(e);
            throw new Error('Failed to finalize tx');
        }
        if (isWithdrawal) {
            await sleep(40000);
            await sync_withdrawals(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), privateKey);
        }
        return {
            txTreeRoot: tx.tx_tree_root,
            transferUUIDs: tx.transfer_uuids,
            withdrawalUUIDs: tx.withdrawal_uuids,
            transferData: tx.transfer_data_vec.length > 0 ? tx.transfer_data_vec.map(jsTransferToTransfer) : [],
            withdrawalData: tx.withdrawal_data_vec.length > 0 ? tx.withdrawal_data_vec.map(jsTransferToTransfer) : [],
        };
    }
    // Send/Withdrawals
    async fetchTransactions(_params) {
        __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_checkAllowanceToExecuteMethod).call(this);
        const data = await __classPrivateFieldGet(this, _IntMaxClient_txFetcher, "f").fetchTx({
            address: this.address,
        });
        const pendingWithdrawals = await __classPrivateFieldGet(this, _IntMaxClient_txFetcher, "f").fetchPendingWithdrawals(this.address);
        return __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_decryptTransactionData).call(this, data, TransactionType.Send, pendingWithdrawals);
    }
    // Receive
    async fetchTransfers(_params) {
        __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_checkAllowanceToExecuteMethod).call(this);
        const data = await __classPrivateFieldGet(this, _IntMaxClient_txFetcher, "f").fetchTransfers({
            address: this.address,
        });
        return __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_decryptTransactionData).call(this, data, TransactionType.Receive);
    }
    // Deposit
    async fetchDeposits(_params) {
        __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_checkAllowanceToExecuteMethod).call(this);
        const data = await __classPrivateFieldGet(this, _IntMaxClient_txFetcher, "f").fetchDeposits({
            address: this.address,
        });
        return __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_decryptTransactionData).call(this, data, TransactionType.Deposit);
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
        return parseEther((gasPrice ?? 0n * estimatedGas).toString());
    }
    async deposit(params) {
        const txConfig = await __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_prepareDepositToken).call(this, { ...params, isGasEstimation: false });
        const depositHash = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").writeContract(txConfig);
        let status = TransactionStatus.Processing;
        while (status === TransactionStatus.Processing) {
            await sleep(3000);
            try {
                const tx = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").getTransactionReceipt({
                    hash: depositHash,
                });
                if (tx) {
                    status = tx.status === 'success' ? TransactionStatus.Completed : TransactionStatus.Rejected;
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
        await sleep(500);
        try {
            const txHash = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").writeContract({
                address: __classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address,
                abi: LiquidityAbi,
                functionName: 'claimWithdrawals',
                args: [withdrawalsToClaim],
                account: address,
                chain: __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").chain,
            });
            let status = TransactionStatus.Processing;
            while (status === TransactionStatus.Processing) {
                await sleep(1500);
                try {
                    const tx = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").getTransactionReceipt({
                        hash: txHash,
                    });
                    if (tx) {
                        status = tx.status === 'success' ? TransactionStatus.Completed : TransactionStatus.Rejected;
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
            if (status === TransactionStatus.Rejected) {
                throw new Error('Transaction rejected');
            }
            return {
                status: TransactionStatus.Completed,
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
_IntMaxClient_config = new WeakMap(), _IntMaxClient_tokenFetcher = new WeakMap(), _IntMaxClient_txFetcher = new WeakMap(), _IntMaxClient_walletClient = new WeakMap(), _IntMaxClient_publicClient = new WeakMap(), _IntMaxClient_vaultHttpClient = new WeakMap(), _IntMaxClient_privateKey = new WeakMap(), _IntMaxClient_userData = new WeakMap(), _IntMaxClient_urls = new WeakMap(), _IntMaxClient_instances = new WeakSet(), _IntMaxClient_generateConfig = function _IntMaxClient_generateConfig(env) {
    const urls = env === 'mainnet' ? MAINNET_ENV : env === 'testnet' ? TESTNET_ENV : DEVNET_ENV;
    return new Config(urls.store_vault_server_url, urls.balance_prover_url, urls.block_validity_prover_url, urls.withdrawal_aggregator_url, BigInt(60), // Deposit Timeout
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
    const rawTransactions = data.map((t) => transactionMapper(t, variant));
    const txsPromises = rawTransactions.map(async (tx) => {
        switch (tx.txType) {
            case TransactionType.Deposit:
            case TransactionType.Mining:
                return await decrypt_deposit_data(__classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"), tx.data);
            case TransactionType.Send:
            case TransactionType.Withdraw:
                return await decrypt_tx_data(__classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"), tx.data);
            case TransactionType.Receive:
                return await decrypt_transfer_data(__classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"), tx.data);
        }
    });
    const decryptedData = await Promise.all(txsPromises);
    const formattedTxs = decryptedData.map((tx, idx) => decryptedToWASMTx(tx, rawTransactions[idx].uuid, rawTransactions[idx].txType, rawTransactions[idx].timestamp));
    const tokens = await __classPrivateFieldGet(this, _IntMaxClient_tokenFetcher, "f").fetchTokens();
    return formattedTxs
        .map((tx) => wasmTxToTx(tx, __classPrivateFieldGet(this, _IntMaxClient_userData, "f"), tokens, pendingWithdrawals))
        .filter(Boolean);
}, _IntMaxClient_entropy = async function _IntMaxClient_entropy(networkSignedMessage, hashedSignature) {
    const securitySeed = sha256(networkSignedMessage);
    const entropyPreImage = (securitySeed + hashedSignature.slice(2));
    const entropy = sha256(entropyPreImage);
    const hdKey = getPkFromMnemonic(entropy);
    if (!hdKey) {
        throw Error('No key found');
    }
    const keySet = await generate_intmax_account_from_eth_key(toHex(hdKey));
    if (!keySet) {
        throw new Error('No key found');
    }
    this.address = keySet.pubkey;
    __classPrivateFieldSet(this, _IntMaxClient_privateKey, keySet.privkey, "f");
    return;
}, _IntMaxClient_fetchUserData = async function _IntMaxClient_fetchUserData() {
    const prevFetchData = localStorageManager.getItem('user_data_fetch');
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
            const userdata = await get_user_data(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"));
            __classPrivateFieldSet(this, _IntMaxClient_userData, userdata, "f");
            return userdata;
        }
    }
    try {
        // sync the account's balance proof
        await retryWithAttempts(() => {
            return sync(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"));
        }, 10000, 5);
        console.info('Synced account balance proof');
        // sync withdrawals
        await retryWithAttempts(() => {
            return sync_withdrawals(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"));
        }, 10000, 5);
        console.info('Synced withdrawals');
    }
    catch (e) {
        console.info('Failed to sync account balance proof', e);
    }
    const userData = await get_user_data(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), __classPrivateFieldGet(this, _IntMaxClient_privateKey, "f"));
    __classPrivateFieldSet(this, _IntMaxClient_userData, userData, "f");
    const prevFetchDataArr = prevFetchData?.filter((data) => data.address.toLowerCase() !== this.address?.toLowerCase()) ?? [];
    prevFetchDataArr.push({
        fetchDate: Date.now(),
        address: this.address,
    });
    localStorageManager.setItem('user_data_fetch', prevFetchDataArr);
    return userData;
}, _IntMaxClient_prepareDepositToken = async function _IntMaxClient_prepareDepositToken({ token, isGasEstimation, amount, address }) {
    const accounts = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").getAddresses();
    const salt = isGasEstimation
        ? randomBytesHex(16)
        : await __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_depositToAccount).call(this, {
            pubkey: address,
            amountInDecimals: token.tokenType === TokenType.NATIVE
                ? parseEther(`${amount}`)
                : token.tokenType === TokenType.ERC20
                    ? parseUnits(`${amount}`, token.decimals ?? 18)
                    : BigInt(amount),
            tokenIndex: token.tokenIndex,
            token_type: token.tokenType,
            token_address: token.contractAddress,
        });
    return __classPrivateFieldGet(this, _IntMaxClient_instances, "m", _IntMaxClient_prepareTransaction).call(this, {
        salt,
        tokenType: token.tokenType,
        amountInWei: token.tokenType === TokenType.NATIVE
            ? parseEther(`${amount}`)
            : token.tokenType === TokenType.ERC20
                ? parseUnits(`${amount}`, token.decimals ?? 18)
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
        abi: LiquidityAbi,
        address: __classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address,
        value: 0n,
    };
    switch (tokenType) {
        case TokenType.NATIVE:
            returnObj.functionName = 'depositNativeToken';
            returnObj.args = [salt];
            returnObj.value = BigInt(amountInWei);
            break;
        case TokenType.ERC20:
            returnObj.functionName = 'depositERC20';
            returnObj.args = [tokenAddress, salt, amountInWei];
            break;
        case TokenType.ERC721:
            returnObj.functionName = 'depositERC721';
            returnObj.args = [tokenAddress, salt, tokenId];
            break;
        case TokenType.ERC1155:
            returnObj.functionName = 'depositERC1155';
            returnObj.args = [tokenAddress, salt, tokenId, amountInWei];
            break;
    }
    return returnObj;
}, _IntMaxClient_depositToAccount = async function _IntMaxClient_depositToAccount({ tokenIndex, amountInDecimals, pubkey, token_type, token_address, }) {
    const depositResult = await prepare_deposit(__classPrivateFieldGet(this, _IntMaxClient_config, "f"), pubkey, amountInDecimals.toString(), token_type, token_address, tokenIndex.toString());
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
                abi: erc20Abi,
                functionName: 'allowance',
                args: [addresses[0], __classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address],
            });
            isApproved = currentAllowance >= amount;
        }
        else if (functionName === 'depositERC721' || functionName === 'depositERC1155') {
            isApproved = await __classPrivateFieldGet(this, _IntMaxClient_publicClient, "f").readContract({
                address: tokenAddress,
                abi: erc721Abi,
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
        abi: erc20Abi,
        functionName: 'allowance',
        args: [addresses[0], __classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address],
    });
    if (currentAllowance < amount) {
        try {
            const approveTx = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").writeContract({
                address: tokenAddress,
                abi: erc20Abi,
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
        abi: erc721Abi,
        functionName: 'isApprovedForAll',
        args: [addresses[0], __classPrivateFieldGet(this, _IntMaxClient_config, "f").liquidity_contract_address],
    });
    if (!currentApproval) {
        try {
            const approveTx = await __classPrivateFieldGet(this, _IntMaxClient_walletClient, "f").writeContract({
                address: tokenAddress,
                abi: erc721Abi,
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