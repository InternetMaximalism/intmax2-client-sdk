"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryController = exports.axiosClientInit = void 0;
exports.onResponse = onResponse;
exports.retryWithAttempts = retryWithAttempts;
const axios_1 = __importDefault(require("axios"));
const index_1 = require("./index");
function onResponse(response) {
    return response.data.data || response.data;
}
const axiosClientInit = (initializationParams) => {
    const instance = axios_1.default.create({
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
exports.axiosClientInit = axiosClientInit;
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
            await (0, index_1.sleep)(300);
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
exports.retryController = new RetryController();
async function retryWithAttempts(callback, timeout, attempts) {
    exports.retryController.setPendingRetry(true);
    for (let i = 0; i < attempts; i++) {
        if (exports.retryController.getRetryAbortController().signal.aborted) {
            return Promise.reject('Retry cancelled');
        }
        try {
            await callback();
            console.info('Success');
            return;
        }
        catch (error) {
            if (exports.retryController.getRetryAbortController().signal.aborted) {
                exports.retryController.setPendingRetry(false);
                return Promise.reject('Retry cancelled');
            }
            console.warn(`Attempt ${i + 1} failed: `, error, 'retrying...');
        }
        await (0, index_1.sleep)(timeout);
    }
    exports.retryController.setPendingRetry(false);
    console.error(`Failed after ${attempts} attempts`);
}
//# sourceMappingURL=api.utils.js.map