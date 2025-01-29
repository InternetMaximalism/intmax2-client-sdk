import { JsDepositData, JsTransferData, JsTxData, JsUserData } from '../../wasm/browser/intmax2_wasm_lib';
import { ContractWithdrawal, EncryptedDataItem, RawTransaction, Token, Transaction, TransactionType, TransferData, WithdrawalsStatus } from '../types';
export declare const jsTransferToTransfer: (td: JsTransferData) => TransferData;
export declare const transactionMapper: (data: EncryptedDataItem, txType: TransactionType) => RawTransaction;
export declare const decryptedToWASMTx: (rawTx: JsTxData | JsTransferData | JsDepositData, uuid: string, txType: TransactionType, timestamp: number) => (JsTxData | JsTransferData | JsDepositData) & {
    uuid: string;
    txType: TransactionType;
    timestamp: number;
};
export declare const wasmTxToTx: (rawTx: (JsTxData | JsTransferData | JsDepositData) & {
    uuid: string;
    txType: TransactionType;
    timestamp: number;
}, userData: JsUserData, tokens: Token[], pendingWithdrawals?: Record<WithdrawalsStatus, ContractWithdrawal[]>) => Transaction | null;
