import { AxiosInstance } from 'axios';
import { Abi, createPublicClient, erc20Abi, http, PublicClient, zeroAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import { DEVNET_ENV, liquidityAbiNft, MAINNET_ENV, TESTNET_ENV } from '../constants';
import { IntMaxEnvironment, PaginatedResponse, Token, TokenType } from '../types';
import { axiosClientInit } from '../utils';

export class TokenFetcher {
  tokens: Token[] = [];

  #intervalId: number | null | NodeJS.Timeout = null;
  #chainTokens: Token[] = [];
  readonly #httpClient: AxiosInstance;
  readonly #liquidityContractAddress: string;
  readonly #publicClient: PublicClient;

  constructor(environment: IntMaxEnvironment) {
    this.#liquidityContractAddress =
      environment === 'mainnet'
        ? MAINNET_ENV.liquidity_contract
        : environment === 'testnet'
          ? TESTNET_ENV.liquidity_contract
          : DEVNET_ENV.liquidity_contract;

    this.#httpClient = axiosClientInit({
      baseURL:
        environment === 'mainnet'
          ? MAINNET_ENV.tokens_url
          : environment === 'testnet'
            ? TESTNET_ENV.tokens_url
            : DEVNET_ENV.tokens_url,
    });

    this.#publicClient = createPublicClient({
      chain: environment === 'mainnet' ? mainnet : sepolia,
      transport: http(),
    });

    this.fetchTokens();

    this.#startPeriodicUpdate(60000);
  }

  async fetchTokens() {
    let cursor: string | null = null;
    let fetchAgain = true;
    this.tokens = [];

    while (fetchAgain) {
      const data = await this.#fetchTokens(cursor);
      this.tokens = [...this.tokens, ...data.items];
      cursor = data.nextCursor;
      if (!cursor) {
        fetchAgain = false;
      }
    }

    return this.tokens.map((t) => ({
      ...t,
      tokenType: t.contractAddress === zeroAddress ? TokenType.NATIVE : TokenType.ERC20,
    }));
  }
  async getTokenChainInfo(tokenAddress: string): Promise<Token> {
    let token = this.tokens.find((t) => t.contractAddress === tokenAddress);
    if (token) {
      return token;
    }
    token = this.#chainTokens.find((t) => t.contractAddress === tokenAddress);
    if (token) {
      return token;
    }

    const chainToken = await this.#publicClient.multicall({
      contracts: [
        {
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'name',
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'symbol',
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'decimals',
        },
      ],
    });

    if (
      chainToken[0].status === 'success' &&
      chainToken[1].status === 'success' &&
      chainToken[2].status === 'success'
    ) {
      token = {
        contractAddress: tokenAddress,
        decimals: chainToken[2].result,
        image: '',
        price: 0,
        symbol: chainToken[1].result,
        tokenIndex: this.tokens.length + this.#chainTokens.length + 1,
        tokenType: TokenType.ERC20,
      };
      this.#chainTokens.push(token);
      return token;
    }
    throw Error('Token not found');
  }

  async getTokensById(tokenIds: number[]): Promise<
    (
      | {
          error?: undefined;
          result: {
            tokenType: TokenType;
            tokenAddress: string;
            tokenId: number;
          };
          status: 'success';
        }
      | { error: Error; result?: undefined; status: 'failure' }
    )[]
  > {
    const contracts = tokenIds.map((id) => ({
      abi: liquidityAbiNft as Abi,
      address: this.#liquidityContractAddress as `0x${string}`,
      functionName: 'getTokenInfo',
      args: [id],
    }));

    const multicallResults = await this.#publicClient.multicall({
      contracts,
    });

    return multicallResults as (
      | {
          error?: undefined;
          result: {
            tokenType: TokenType;
            tokenAddress: string;
            tokenId: number;
          };
          status: 'success';
        }
      | { error: Error; result?: undefined; status: 'failure' }
    )[];
  }

  // PRIVATE METHODS

  #startPeriodicUpdate(interval: number) {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
    }
    this.#intervalId = setInterval(async () => {
      await this.fetchTokens();
      console.info('Tokens updated');
    }, interval);
  }

  async #fetchTokens(cursor: string | null): Promise<PaginatedResponse<Token>> {
    return this.#httpClient.get<PaginatedResponse<Token>, PaginatedResponse<Token>>('/token-maps/list', {
      params: {
        perPage: 100,
        cursor,
      },
    });
  }
}
