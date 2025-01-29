import { AxiosInstance, AxiosResponse, CreateAxiosDefaults } from 'axios';
export declare function onResponse(response: AxiosResponse): AxiosResponse;
export declare const axiosClientInit: (initializationParams: CreateAxiosDefaults) => AxiosInstance;
declare class RetryController {
    private abortController;
    private pendingRetry;
    constructor();
    abortRetry(): void;
    resetRetry(): Promise<void>;
    setPendingRetry(value: boolean): void;
    getRetryAbortController(): AbortController;
}
export declare const retryController: RetryController;
export declare function retryWithAttempts(callback: () => Promise<void> | undefined, timeout: number, attempts: number): Promise<undefined>;
export {};
