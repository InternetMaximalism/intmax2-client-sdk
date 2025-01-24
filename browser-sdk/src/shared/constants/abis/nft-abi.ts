export const liquidityAbiNft = [
  {
    inputs: [{ internalType: 'uint32', name: 'tokenIndex', type: 'uint32' }],
    name: 'getTokenInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'enum ITokenData.TokenType',
            name: 'tokenType',
            type: 'uint8',
          },
          { internalType: 'address', name: 'tokenAddress', type: 'address' },
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        internalType: 'struct ITokenData.TokenInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
