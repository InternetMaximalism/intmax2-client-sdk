import { ContractWithdrawal, EncryptedDataItem, IntMaxEnvironment, WithdrawalsStatus } from '../types';
interface GetTxParams {
    address: string;
    timestamp?: number;
}
export declare class TransactionFetcher {
    #private;
    constructor(environment: IntMaxEnvironment);
    fetchTx({ address, timestamp }: GetTxParams): Promise<EncryptedDataItem[]>;
    fetchTransfers({ address, timestamp }: GetTxParams): Promise<EncryptedDataItem[]>;
    fetchDeposits({ address, timestamp }: GetTxParams): Promise<EncryptedDataItem[]>;
    fetchPendingWithdrawals(address: string): Promise<Record<WithdrawalsStatus, ContractWithdrawal[]>>;
}
export {};
