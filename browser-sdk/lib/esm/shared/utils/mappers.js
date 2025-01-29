import { formatEther, zeroAddress } from 'viem';
import { JsTransferData, JsTxData } from '../../wasm/browser/intmax2_wasm_lib';
import { TokenType, TransactionStatus, TransactionType, WithdrawalsStatus, } from '../types';
export const jsTransferToTransfer = (td) => {
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
export const transactionMapper = (data, txType) => {
    return {
        data: data[1],
        uuid: data[0].uuid,
        txType,
        timestamp: Number(data[0].timestamp),
    };
};
export const decryptedToWASMTx = (rawTx, uuid, txType, timestamp) => {
    {
        let tx = rawTx;
        if (tx instanceof JsTxData) {
            tx = {
                transfers: tx.transfers,
                tx: tx.tx,
            };
        }
        else if (tx instanceof JsTransferData) {
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
const filterWithdrawals = (transfers) => {
    return transfers.some((transfer) => transfer.isWithdrawal) ? TransactionType.Withdraw : TransactionType.Send;
};
export const wasmTxToTx = (rawTx, userData, tokens, pendingWithdrawals) => {
    if (rawTx.txType === TransactionType.Receive) {
        const tx = rawTx;
        const processedUuids = userData.processed_transfer_uuids;
        let transaction = {
            amount: '',
            from: tx.sender,
            status: TransactionStatus.Processing,
            timestamp: tx.timestamp,
            to: tx.transfer.recipient.data,
            tokenType: TokenType.ERC20,
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
                    status: TransactionStatus.Rejected,
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
                    status: TransactionStatus.Completed,
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
                status: TransactionStatus.Processing,
                timestamp: tx.timestamp,
            };
        }
        return transaction;
    }
    else if (rawTx.txType === TransactionType.Deposit) {
        const tx = rawTx;
        const token = tokens.find((t) => t.contractAddress.toLowerCase() === tx.token_address.toLowerCase());
        const processedUuids = userData.processed_deposit_uuids;
        let transaction = {
            amount: '',
            from: '',
            status: TransactionStatus.Processing,
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
                    status: TransactionStatus.Rejected,
                    timestamp: tx.timestamp,
                };
            }
            else {
                transaction = {
                    ...transaction,
                    amount: tx.amount,
                    timestamp: tx.timestamp,
                    status: TransactionStatus.Completed,
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
        const isNativeToken = transaction.tokenAddress === zeroAddress && transaction.tokenIndex === 0;
        if (isNativeToken && [0.1, 0.5, 1.0].includes(Number(formatEther(BigInt(tx.amount))))) {
            transaction.txType = TransactionType.Mining;
        }
        return transaction;
    }
    else if ((rawTx.txType === TransactionType.Send || rawTx.txType === TransactionType.Withdraw) &&
        pendingWithdrawals) {
        const failedNullifiers = pendingWithdrawals[WithdrawalsStatus.Failed].map((w) => w.nullifier);
        const successStatuses = pendingWithdrawals[WithdrawalsStatus.Success].map((w) => w.nullifier);
        const needClaimStatuses = pendingWithdrawals[WithdrawalsStatus.NeedClaim].map((w) => w.nullifier);
        const tx = rawTx;
        const processedUuids = userData.processed_tx_uuids;
        let transaction = {
            amount: '',
            from: '',
            status: TransactionStatus.Processing,
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
            if (!processedUuids.includes(tx.uuid) && transaction.txType === TransactionType.Send) {
                transaction = {
                    ...transaction,
                    transfers,
                    timestamp: tx.timestamp,
                    status: TransactionStatus.Rejected,
                };
            }
            else {
                transaction = {
                    ...transaction,
                    transfers,
                    status: TransactionStatus.Completed,
                    timestamp: tx.timestamp,
                };
                if (transaction.txType !== TransactionType.Send) {
                    let status = TransactionStatus.Processing;
                    if (failedNullifiers.includes(transfers[0].nullifier)) {
                        status = TransactionStatus.Rejected;
                    }
                    else if (successStatuses.includes(transfers[0].nullifier)) {
                        status = TransactionStatus.Completed;
                    }
                    else if (needClaimStatuses.includes(transfers[0].nullifier)) {
                        status = TransactionStatus.ReadyToClaim;
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
//# sourceMappingURL=mappers.js.map