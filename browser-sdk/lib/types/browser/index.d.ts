import { BroadcastTransactionRequest, BroadcastTransactionResponse, ClaimWithdrawalTransactionResponse, ConstructorParams, ContractWithdrawal, FetchTransactionsRequest, FetchWithdrawalsResponse, INTMAXClient, PrepareDepositTransactionRequest, PrepareDepositTransactionResponse, PrepareEstimateDepositTransactionRequest, SignMessageResponse, Token, TokenBalance, TokenBalancesResponse, Transaction, WaitForTransactionConfirmationRequest, WaitForTransactionConfirmationResponse, WithdrawalResponse, WithdrawRequest } from '../shared';
export declare class IntMaxClient implements INTMAXClient {
    #private;
    isLoggedIn: boolean;
    address: string;
    tokenBalances: TokenBalance[];
    constructor({ async_params, environment }: ConstructorParams);
    static init({ environment }: ConstructorParams): Promise<IntMaxClient>;
    login(): Promise<{
        address: string;
        isLoggedIn: boolean;
    }>;
    getPrivateKey(): Promise<string>;
    fetchTokenBalances(): Promise<TokenBalancesResponse>;
    broadcastTransaction(rawTransfers: BroadcastTransactionRequest[], isWithdrawal?: boolean): Promise<BroadcastTransactionResponse>;
    fetchTransactions(_params: FetchTransactionsRequest): Promise<Transaction[]>;
    fetchTransfers(_params: FetchTransactionsRequest): Promise<Transaction[]>;
    fetchDeposits(_params: FetchTransactionsRequest): Promise<Transaction[]>;
    withdraw({ amount, address, token }: WithdrawRequest): Promise<WithdrawalResponse>;
    logout(): Promise<void>;
    estimateDepositGas(params: PrepareEstimateDepositTransactionRequest): Promise<bigint>;
    deposit(params: PrepareDepositTransactionRequest): Promise<PrepareDepositTransactionResponse>;
    fetchPendingWithdrawals(): Promise<FetchWithdrawalsResponse>;
    claimWithdrawal(needClaimWithdrawals: ContractWithdrawal[]): Promise<ClaimWithdrawalTransactionResponse>;
    waitForTransactionConfirmation(_params: WaitForTransactionConfirmationRequest): Promise<WaitForTransactionConfirmationResponse>;
    signMessage(_data: string): Promise<SignMessageResponse>;
    getTokensList(): Promise<Token[]>;
}
