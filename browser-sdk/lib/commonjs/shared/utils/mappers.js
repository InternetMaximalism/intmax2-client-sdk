"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wasmTxToTx = exports.decryptedToWASMTx = exports.transactionMapper = exports.jsTransferToTransfer = void 0;
const viem_1 = require("viem");
const intmax2_wasm_lib_1 = require("../../wasm/browser/intmax2_wasm_lib");
const types_1 = require("../types");
const jsTransferToTransfer = (td) => {
    return {
        transfer: {
            amount: td.transfer.amount,
            recipient: td.transfer.recipient.data,
            salt: td.transfer.salt,
            tokenIndex: td.transfer.token_index,
        },
        sender: td.sender,
    };
};
exports.jsTransferToTransfer = jsTransferToTransfer;
const transactionMapper = (data, txType) => {
    return {
        data: data[1],
        uuid: data[0].uuid,
        txType,
        timestamp: Number(data[0].timestamp),
    };
};
exports.transactionMapper = transactionMapper;
const decryptedToWASMTx = (rawTx, uuid, txType, timestamp) => {
    {
        let tx = rawTx;
        if (tx instanceof intmax2_wasm_lib_1.JsTxData) {
            tx = {
                transfers: tx.transfers,
                tx: tx.tx,
            };
        }
        else if (tx instanceof intmax2_wasm_lib_1.JsTransferData) {
            tx = {
                sender: tx.sender,
                transfer: tx.transfer,
            };
        }
        else {
            tx = {
                token_address: tx.token_address,
                token_type: tx.token_type,
                amount: tx.amount,
                token_id: tx.token_id,
                deposit_salt: tx.deposit_salt,
                pubkey_salt_hash: tx.pubkey_salt_hash,
            };
        }
        return {
            ...tx,
            uuid,
            txType,
            timestamp,
        };
    }
};
exports.decryptedToWASMTx = decryptedToWASMTx;
const filterWithdrawals = (transfers) => {
    return transfers.some((transfer) => transfer.isWithdrawal) ? types_1.TransactionType.Withdraw : types_1.TransactionType.Send;
};
const wasmTxToTx = (rawTx, userData, tokens, pendingWithdrawals) => {
    if (rawTx.txType === types_1.TransactionType.Receive) {
        const tx = rawTx;
        const processedUuids = userData.processed_transfer_uuids;
        let transaction = {
            amount: '',
            from: tx.sender,
            status: types_1.TransactionStatus.Processing,
            timestamp: tx.timestamp,
            to: tx.transfer.recipient.data,
            tokenType: types_1.TokenType.ERC20,
            tokenIndex: tx.transfer.token_index,
            transfers: [],
            txType: tx.txType,
            uuid: tx.uuid,
        };
        if (BigInt(tx.timestamp) <= userData.transfer_lpt) {
            if (!processedUuids.includes(tx.uuid)) {
                transaction = {
                    ...transaction,
                    amount: tx.transfer.amount,
                    tokenIndex: tx.transfer.token_index,
                    from: tx.sender,
                    to: tx.transfer.recipient.data,
                    timestamp: tx.timestamp,
                    status: types_1.TransactionStatus.Rejected,
                };
            }
            else {
                transaction = {
                    ...transaction,
                    amount: tx.transfer.amount,
                    tokenIndex: tx.transfer.token_index,
                    from: tx.sender,
                    to: tx.transfer.recipient.data,
                    timestamp: tx.timestamp,
                    status: types_1.TransactionStatus.Completed,
                };
            }
        }
        else {
            transaction = {
                ...transaction,
                amount: tx.transfer.amount,
                tokenIndex: tx.transfer.token_index,
                from: tx.sender,
                to: tx.transfer.recipient.data,
                status: types_1.TransactionStatus.Processing,
                timestamp: tx.timestamp,
            };
        }
        return transaction;
    }
    else if (rawTx.txType === types_1.TransactionType.Deposit) {
        const tx = rawTx;
        const token = tokens.find((t) => t.contractAddress.toLowerCase() === tx.token_address.toLowerCase());
        const processedUuids = userData.processed_deposit_uuids;
        let transaction = {
            amount: '',
            from: '',
            status: types_1.TransactionStatus.Processing,
            timestamp: tx.timestamp,
            to: '',
            tokenType: tx.token_type,
            tokenIndex: token?.tokenIndex ?? 0,
            transfers: [],
            txType: tx.txType,
            uuid: tx.uuid,
            tokenAddress: tx.token_address,
        };
        if (BigInt(tx.timestamp) <= userData.deposit_lpt) {
            if (!processedUuids.includes(tx.uuid)) {
                transaction = {
                    ...transaction,
                    amount: tx.amount,
                    status: types_1.TransactionStatus.Rejected,
                    timestamp: tx.timestamp,
                };
            }
            else {
                transaction = {
                    ...transaction,
                    amount: tx.amount,
                    timestamp: tx.timestamp,
                    status: types_1.TransactionStatus.Completed,
                };
            }
        }
        else {
            transaction = {
                ...transaction,
                amount: tx.amount,
                timestamp: tx.timestamp,
            };
        }
        const isNativeToken = transaction.tokenAddress === viem_1.zeroAddress && transaction.tokenIndex === 0;
        if (isNativeToken && [0.1, 0.5, 1.0].includes(Number((0, viem_1.formatEther)(BigInt(tx.amount))))) {
            transaction.txType = types_1.TransactionType.Mining;
        }
        return transaction;
    }
    else if ((rawTx.txType === types_1.TransactionType.Send || rawTx.txType === types_1.TransactionType.Withdraw) &&
        pendingWithdrawals) {
        const failedNullifiers = pendingWithdrawals[types_1.WithdrawalsStatus.Failed].map((w) => w.nullifier);
        const successStatuses = pendingWithdrawals[types_1.WithdrawalsStatus.Success].map((w) => w.nullifier);
        const needClaimStatuses = pendingWithdrawals[types_1.WithdrawalsStatus.NeedClaim].map((w) => w.nullifier);
        const tx = rawTx;
        const processedUuids = userData.processed_tx_uuids;
        let transaction = {
            amount: '',
            from: '',
            status: types_1.TransactionStatus.Processing,
            timestamp: tx.timestamp,
            to: '',
            // tokenType: tx.token_type,
            tokenIndex: 0,
            transfers: [],
            txType: tx.txType,
            uuid: tx.uuid,
        };
        const transfers = tx.transfers
            .filter((transfer) => transfer.amount !== '0')
            .map((transfer) => {
            const isWithdrawal = !transfer.recipient.is_pubkey;
            let returnObject = {
                recipient: transfer.recipient.data,
                salt: transfer.salt,
                amount: transfer.amount,
                tokenIndex: transfer.token_index,
                to: transfer.recipient.data,
                isWithdrawal: isWithdrawal,
            };
            if (isWithdrawal) {
                returnObject = {
                    ...returnObject,
                    nullifier: transfer.to_withdrawal().nullifier,
                };
            }
            return returnObject;
        });
        transaction.txType = filterWithdrawals(transfers);
        if (BigInt(tx.timestamp) <= userData.tx_lpt) {
            if (!processedUuids.includes(tx.uuid) && transaction.txType === types_1.TransactionType.Send) {
                transaction = {
                    ...transaction,
                    transfers,
                    timestamp: tx.timestamp,
                    status: types_1.TransactionStatus.Rejected,
                };
            }
            else {
                transaction = {
                    ...transaction,
                    transfers,
                    status: types_1.TransactionStatus.Completed,
                    timestamp: tx.timestamp,
                };
                if (transaction.txType !== types_1.TransactionType.Send) {
                    let status = types_1.TransactionStatus.Processing;
                    if (failedNullifiers.includes(transfers[0].nullifier)) {
                        status = types_1.TransactionStatus.Rejected;
                    }
                    else if (successStatuses.includes(transfers[0].nullifier)) {
                        status = types_1.TransactionStatus.Completed;
                    }
                    else if (needClaimStatuses.includes(transfers[0].nullifier)) {
                        status = types_1.TransactionStatus.ReadyToClaim;
                    }
                    transaction.status = status;
                }
            }
        }
        else {
            transaction = {
                ...transaction,
                transfers,
                timestamp: tx.timestamp,
            };
        }
        return transaction;
    }
    return null;
};
exports.wasmTxToTx = wasmTxToTx;
//# sourceMappingURL=mappers.js.map