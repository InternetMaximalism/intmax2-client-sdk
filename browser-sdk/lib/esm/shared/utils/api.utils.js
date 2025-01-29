import axios from 'axios';
import { sleep } from './index';
export function onResponse(response) {
    return response.data.data || response.data;
}
export const axiosClientInit = (initializationParams) => {
    const instance = axios.create({
        ...initializationParams,
        headers: {
            common: {
                'Content-Type': 'application/json',
                ...initializationParams?.headers?.common,
            },
            ...initializationParams?.headers,
        },
    });
    instance.interceptors.response.use(onResponse);
    return instance;
};
class RetryController {
    constructor() {
        this.pendingRetry = false;
        this.abortController = new AbortController();
    }
    abortRetry() {
        return this.abortController.abort();
    }
    async resetRetry() {
        while (this.pendingRetry) {
            this.abortController.abort();
            await sleep(300);
        }
        this.abortController = new AbortController();
    }
    setPendingRetry(value) {
        this.pendingRetry = value;
    }
    getRetryAbortController() {
        return this.abortController;
    }
}
export const retryController = new RetryController();
export async function retryWithAttempts(callback, timeout, attempts) {
    retryController.setPendingRetry(true);
    for (let i = 0; i < attempts; i++) {
        if (retryController.getRetryAbortController().signal.aborted) {
            return Promise.reject('Retry cancelled');
        }
        try {
            await callback();
            console.info('Success');
            return;
        }
        catch (error) {
            if (retryController.getRetryAbortController().signal.aborted) {
                retryController.setPendingRetry(false);
                return Promise.reject('Retry cancelled');
            }
            console.warn(`Attempt ${i + 1} failed: `, error, 'retrying...');
        }
        await sleep(timeout);
    }
    retryController.setPendingRetry(false);
    console.error(`Failed after ${attempts} attempts`);
}
//# sourceMappingURL=api.utils.js.map