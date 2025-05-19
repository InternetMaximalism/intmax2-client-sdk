import { AxiosInstance } from 'axios';
import { signaturesToBytes } from 'predicate-sdk';
import { encodeAbiParameters, encodeFunctionData } from 'viem';

import { DEVNET_ENV, MAINNET_ENV, TESTNET_ENV } from '../constants';
import { IntMaxEnvironment, PredicateSignatureRequest, PredicateSignatureResponse, TokenType } from '../types';
import { axiosClientInit } from '../utils';

const depositNativeTokenAbi = {
  name: 'depositNativeToken',
  type: 'function',
  stateMutability: 'payable',
  inputs: [
    {
      name: 'recipientSaltHash',
      type: 'bytes32',
    },
  ],
  outputs: [],
};

const depositERC20Abi = {
  name: 'depositERC20',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    {
      name: 'tokenAddress',
      type: 'address',
    },
    {
      name: 'recipientSaltHash',
      type: 'bytes32',
    },
    {
      name: 'amount',
      type: 'uint256',
    },
  ],
  outputs: [],
};

const depositERC721Abi = {
  name: 'depositERC721',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    {
      name: 'tokenAddress',
      type: 'address',
    },
    {
      name: 'recipientSaltHash',
      type: 'bytes32',
    },
    {
      name: 'tokenId',
      type: 'uint256',
    },
  ],
  outputs: [],
};

const depositERC1155Abi = {
  name: 'depositERC1155',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    {
      name: 'tokenAddress',
      type: 'address',
    },
    {
      name: 'recipientSaltHash',
      type: 'bytes32',
    },
    {
      name: 'tokenId',
      type: 'uint256',
    },
    {
      name: 'amount',
      type: 'uint256',
    },
  ],
  outputs: [],
};

export class PredicateFetcher {
  readonly #httpClient: AxiosInstance;

  constructor(environment: IntMaxEnvironment) {
    this.#httpClient = axiosClientInit({
      baseURL:
        environment === 'mainnet'
          ? MAINNET_ENV.predicate_url
          : environment === 'testnet'
            ? TESTNET_ENV.predicate_url
            : DEVNET_ENV.predicate_url,
    });
  }

  async fetchPredicateSignature(data: PredicateSignatureRequest): Promise<PredicateSignatureResponse> {
    const response = await this.#httpClient.post<PredicateSignatureResponse, PredicateSignatureResponse>(
      '/evaluate-policy',
      data,
    );

    if (!response) {
      throw new Error('Failed to fetch predicate signature');
    }

    return response;
  }

  generateBody({
    tokenAddress,
    tokenType,
    amountInWei,
    recipientSaltHash,
    tokenId,
  }: {
    recipientSaltHash: string;
    tokenType: TokenType;
    amountInWei?: bigint | string;
    tokenAddress?: string;
    tokenId?: number;
  }): string {
    switch (tokenType) {
      case TokenType.NATIVE:
        return encodeFunctionData({
          abi: [depositNativeTokenAbi],
          functionName: 'depositNativeToken',
          args: [recipientSaltHash],
        });
      case TokenType.ERC20:
        return encodeFunctionData({
          abi: [depositERC20Abi],
          functionName: 'depositERC20',
          args: [tokenAddress, recipientSaltHash, amountInWei],
        });
      case TokenType.ERC721:
        return encodeFunctionData({
          abi: [depositERC721Abi],
          functionName: 'depositERC721',
          args: [tokenAddress, recipientSaltHash, tokenId],
        });
      case TokenType.ERC1155:
        return encodeFunctionData({
          abi: [depositERC1155Abi],
          functionName: 'depositERC1155',
          args: [tokenAddress, recipientSaltHash, tokenId, amountInWei],
        });
    }
  }

  encodePredicateSignature = (predicateSignatures: PredicateSignatureResponse) => {
    const predicateMessage = signaturesToBytes(predicateSignatures);

    return encodeAbiParameters(
      [
        {
          type: 'tuple',
          components: [
            { name: 'taskId', type: 'string' },
            { name: 'expireByBlockNumber', type: 'uint256' },
            { name: 'signerAddresses', type: 'address[]' },
            { name: 'signatures', type: 'bytes[]' },
          ],
        },
      ],

      [
        {
          taskId: predicateMessage.taskId,
          expireByBlockNumber: BigInt(predicateMessage.expireByBlockNumber),
          signerAddresses: predicateMessage.signerAddresses as `0x${string}`[],
          //eslint-disable-next-line
          //@ts-ignore
          signatures: predicateSignatures.signature,
        },
      ],
    );
  };
}
