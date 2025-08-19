import axios, { AxiosInstance, AxiosResponse, CreateAxiosDefaults } from 'axios';

import { IntMaxEnvironment } from '../types';
import { sleep } from './index';

export function onResponse(response: AxiosResponse): AxiosResponse {
  return response.data.data || response.data;
}

export const axiosClientInit = (initializationParams: CreateAxiosDefaults): AxiosInstance => {
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
  private abortController: AbortController;
  private pendingRetry: boolean = false;

  constructor() {
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

  setPendingRetry(value: boolean) {
    this.pendingRetry = value;
  }

  getRetryAbortController() {
    return this.abortController;
  }
}

export const retryController = new RetryController();

export async function retryWithAttempts(callback: () => Promise<void> | undefined, timeout: number, attempts: number) {
  retryController.setPendingRetry(true);
  for (let i = 0; i < attempts; i++) {
    if (retryController.getRetryAbortController().signal.aborted) {
      return Promise.reject('Retry cancelled');
    }
    try {
      await callback();
      console.info('Success');
      return;
    } catch (error) {
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

export const checkValidLocalTime = async (env: IntMaxEnvironment): Promise<boolean> => {
  try {
    let url = '';
    switch (env) {
      case 'mainnet':
        url = 'https://api.indexer.intmax.io/v1/time';
        break;
      case 'testnet':
        url = 'https://stage.api.indexer.intmax.io/v1/time';
        break;
      case 'devnet':
      default:
        url = 'https://dev.api.indexer.intmax.xyz/v1/time';
    }

    const { data } = await axios.get(url);

    const serverTime = new Date(data.dateTime);

    const localTime = new Date();
    const localTimeUTC = new Date(localTime.getTime() + localTime.getTimezoneOffset() * 60000);

    const timeDiff = Math.abs(serverTime.getTime() - localTimeUTC.getTime());

    return timeDiff > 10000;
  } catch (error) {
    console.error('Error checking local time validity:', error);
    return false;
  }
};
