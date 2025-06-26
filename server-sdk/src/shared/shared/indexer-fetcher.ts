import { AxiosInstance } from 'axios';

import { DEVNET_ENV, MAINNET_ENV, TESTNET_ENV } from '../constants';
import { BlockBuilderResponse, Fee, IntMaxEnvironment } from '../types';
import { axiosClientInit } from '../utils';

export const REGISTRATION_FEE_THRESHOLD: bigint = 2500000000000n; // 2,500 Gwei
export const NON_REGISTRATION_FEE_THRESHOLD: bigint = 2500000000000n; // 2,500 Gwei

export const checkIsValidBlockBuilderFee = (fee: Fee, isRegistrationBlock: boolean): boolean => {
  return BigInt(fee.amount) <= (isRegistrationBlock ? REGISTRATION_FEE_THRESHOLD : NON_REGISTRATION_FEE_THRESHOLD);
};

const checkIsFeeInfoValid = (nonRegistrationFee: Fee[], registrationFee: Fee[]): boolean => {
  const ethRegistrationFee = registrationFee.find((fee) => fee.token_index === 0);
  const ethNonRegistrationFee = nonRegistrationFee.find((fee) => fee.token_index === 0);
  if (!ethRegistrationFee || !ethNonRegistrationFee) {
    return false;
  }
  const isEthRegistrationFeeValid = checkIsValidBlockBuilderFee(ethRegistrationFee, true);
  const isEthNonRegistrationFeeValid = checkIsValidBlockBuilderFee(ethNonRegistrationFee, false);

  return isEthRegistrationFeeValid && isEthNonRegistrationFeeValid;
};

export class IndexerFetcher {
  #url: string = '';

  readonly #httpClient: AxiosInstance;

  constructor(environment: IntMaxEnvironment) {
    this.#httpClient = axiosClientInit({
      baseURL:
        environment === 'mainnet'
          ? MAINNET_ENV.indexer_url
          : environment === 'testnet'
            ? TESTNET_ENV.indexer_url
            : DEVNET_ENV.indexer_url,
    });
  }

  async fetchBlockBuilderUrl(): Promise<string> {
    const data = await this.#httpClient.get<BlockBuilderResponse[], BlockBuilderResponse[]>('/builders');
    if (!data) {
      throw new Error('Failed to fetch block builder URL');
    }
    const validUrls = await Promise.allSettled(
      data.map(async (bb) => {
        const res = await fetch(bb.url + '/fee-info');
        const data = await res.json();
        if (checkIsFeeInfoValid(data.nonRegistrationFee, data.registrationFee)) {
          return data;
        }
        throw new Error('Invalid fee info for block builder URL');
      }),
    );

    const urls = data.filter((_, index) => {
      return validUrls[index].status === 'fulfilled';
    });

    this.#url = urls?.[Math.floor(Math.random() * data.length)]?.url ?? '';

    return this.#url;
  }

  async getBlockBuilderUrl(): Promise<string> {
    if (this.#url) {
      return this.#url;
    }
    return await this.fetchBlockBuilderUrl();
  }
}
