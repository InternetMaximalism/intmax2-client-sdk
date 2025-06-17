# INTMAX2-CLIENT-SDK

This SDK is a client library for the INTMAX API. It is designed to help you integrate INTMAX services into your applications.

For detailed interface specifications and usage instructions, please refer to the documentation below:

- [📘 INTMAX Client SDK Docs (API Reference)](https://aquatic-paperback-675.notion.site/INTMAX-Client-SDK-Docs-176d989987db8096a012d144ae0e0dba)
- [🧪 Examples on GitHub](https://github.com/InternetMaximalism/intmax2-client-sdk/tree/main/examples)
- [🔧 Integration Guide](https://aquatic-paperback-675.notion.site/INTMAX-Client-SDK-Integration-Guide-208d989987db809db876ff8c79e78853)

Use these resources to quickly get started with building, integrating, and testing INTMAX-powered applications.

## Installation for browser

```bash
npm install intmax2-client-sdk
```

or

```bash
pnpm install intmax2-client-sdk
```

or

```bash
yarn add intmax2-client-sdk
```

## Installation for Node.js

```bash
npm install intmax2-server-sdk
```

or

```bash
pnpm install intmax2-server-sdk
```

or

```bash
yarn add intmax2-server-sdk
```

## Interface

```ts
export interface INTMAXClient {
  // properties
  isLoggedIn: boolean;
  address: string;
  tokenBalances: TokenBalance[] | undefined;

  // account
  login: () => Promise<LoginResponse>;
  logout: () => Promise<void>;
  getPrivateKey: () => Promise<string | undefined>;
  signMessage: (message: string) => Promise<SignMessageResponse>;
  verifySignature: (
    signature: SignMessageResponse,
    message: string | Uint8Array
  ) => Promise<boolean>;

  // token
  getTokensList: () => Promise<Token[]>;
  fetchTokenBalances: () => Promise<TokenBalancesResponse>;

  // transaction
  fetchTransfers: (params: {}) => Promise<Transaction[]>;
  fetchTransactions: (params: {}) => Promise<Transaction[]>;
  broadcastTransaction: (
    rawTransfers: BroadcastTransactionRequest[],
    isWithdrawal: boolean
  ) => Promise<BroadcastTransactionResponse>;

  // deposit
  deposit: (
    params: PrepareDepositTransactionRequest
  ) => Promise<PrepareDepositTransactionResponse>;
  fetchDeposits: (params: {}) => Promise<Transaction[]>;

  // withdrawal
  withdraw: (params: WithdrawRequest) => Promise<WithdrawalResponse>;
  claimWithdrawal: (
    params: ContractWithdrawal[]
  ) => Promise<ClaimWithdrawalTransactionResponse>;
  fetchWithdrawals: (params: FetchWithdrawalsRequest) => Promise<FetchWithdrawalsResponse>;

  // Fees
  getTransferFee: () => Promise<FeeResponse>;
  getWithdrawalFee: (token: Token) => Promise<FeeResponse>;
}
```

## Usage for browser

### Initialization

`IntMaxClient` is a core component of the INTMAX SDK that provides seamless interaction with the INTMAX network.

```ts
import { IntMaxClient } from "intmax2-client-sdk";

const intMaxClient = IntMaxClient.init({ environment: "testnet" });
```

### Login to INTMAX Network

Here is an example of logging in to INTMAX. Users need to login once before using the SDK functions.
You should sign two message, they will be appeared in the popup window automatically:

1. Sign the message confirm your ETH wallet address.
2. Sign the message with challenge string.

```ts
await intMaxClient.login();
```

### Retrieve Balance

This example retrieves the balances of the generated INTMAX account.

```ts
const { balances } = await intMaxClient.fetchTokenBalances();
```

## Usage for Node.js

### Initialization

`IntMaxNodeClient` is a core component of the INTMAX SDK that provides seamless interaction with the INTMAX network.

```ts
import { IntMaxNodeClient } from "intmax2-server-sdk";

const intMaxClient = new IntMaxNodeClient({
  environment: "testnet",
  eth_private_key: process.env.ETH_PRIVATE_KEY,
  l1_rpc_url: process.env.L1_RPC_URL,
});
```

### Login to INTMAX Network & Retrieve Balance

Here is an example of logging in to INTMAX and retrieving balances. Users need to retrieve their balances once before using the SDK functions.

```ts
await intMaxClient.login();
const { balances } = await intMaxClient.fetchTokenBalances();
```

## Usage for both

### Retrieve INTMAX Account Address & Private Key

This example retrieves the address and private key of the generated INTMAX account.

```ts
const address = intMaxClient.address; // Public key of the wallet
const privateKey = intMaxClient.getPrivateKey(); // Private key of the wallet. Here you should sign message.
```

### Sign & Verify signature

```ts
const message = "Hello, World!";
const signature = await intMaxClient.signMessage(message);

const isVerified = await intMaxClient.verifySignature(signature, message);
console.log(isVerified); // true

const isFakeMessageVerify = await intMaxClient.verifySignature(
  signature,
  "Another message"
);
console.log(isFakeMessageVerify); // false

const isFakeSignatureVerify = await intMaxClient.verifySignature(
  "Another signature",
  message
);
console.log(isFakeSignatureVerify); // false
```

### List Available Tokens & Retrieve Information for a Specific Token

Shows how to get the list of tokens supported by the network.

```ts
const tokens = await intMaxClient.getTokensList();
console.log('Available tokens:', tokens);

const nativeToken = tokens.find(
  (t) => t.contractAddress.toLowerCase() === '0x0000000000000000000000000000000000000000',
);
```

### Fetch Transaction History

Retrieves deposits, transfers, and sent transactions in parallel, then prints the latest entries.

```ts
const [deposits, transfers, sentTxs] = await Promise.all([
  client.fetchDeposits({}),
  client.fetchTransfers({}),
  client.fetchTransactions({}),
]);

console.log('Deposits:', deposits);
console.log('Received Transfers:', transfers);
console.log('Sent Transfers:', sentTxs);
```

### Deposit Native Token (ETH)

```ts
const tokens = await intMaxClient.getTokensList(); // Get list of the tokens
let token = tokens.find((token) => token.tokenIndex === 0); // Find token by symbol

if (token) {
  token = {
    ...token,
    tokenType: TokenType.NATIVE,
  };
}

const depositParams = {
  amount: 0.000001, // 0.000001 ETH
  token,
  address: '0x2e4b60f5680324c8cbf202abdbcf9f913d75629ff9f93bc016afa822665d7322', // recipient INTMAX address
};

// Dry-run gas estimation
const gas = await intMaxClient.estimateDepositGas({
  ...depositParams,
  isGasEstimation: true,
});
console.log('Estimated gas:', gas);

// Execute the deposit
const depositResult = await intMaxClient.deposit(depositParams);
console.log('Deposit result:', depositResult);
console.log('Transaction Hash:', depositResult.txHash);
```

The final txHash obtained can be searched on [SepoliaScan](https://sepolia.etherscan.io/).

### Deposit ERC20

```ts
const contractAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const tokens = await intMaxClient.getTokensList(); // Get list of the tokens
let token = tokens.find((token) => token.contractAddress === contractAddress); // Find token by symbol

if (!token) {
  token = {
    decimals: 6, // Decimals of the token
    tokenType: TokenType.ERC20,
    contractAddress, // Your Token address if not exist on token list
  };
} else {
  token = {
    ...token,
    tokenType: TokenType.ERC20,
  };
}

const depositParams = {
  amount: 0.000001, // 0.000001 USDC
  token,
  address: '0x2e4b60f5680324c8cbf202abdbcf9f913d75629ff9f93bc016afa822665d7322', // recipient INTMAX address
};

// Dry-run gas estimation
const gas = await intMaxClient.estimateDepositGas({
  ...depositParams,
  isGasEstimation: true,
});

// Execute the deposit
const depositResult = await intMaxClient.deposit(depositParams);
console.log('Deposit result:', depositResult);
console.log('Transaction Hash:', depositResult.txHash);
```

### Deposit ERC721 / ERC1155

```ts
const token = {
  tokenIndex: 1, // Nft id in contract
  tokenType: TokenType.ERC721, // or TokenType.ERC1155
  contractAddress: "0x....", // Your Token address if not exist on token list
};

const depositParams = {
  amount: 1, // Amount of the token for erc721 should be 1, for erc1155 can be more than 1
  token,
  address: '0x2e4b60f5680324c8cbf202abdbcf9f913d75629ff9f93bc016afa822665d7322', // recipient INTMAX address
};

// Estimate gas if need to show for user
const gas = await intMaxClient.estimateDepositGas({
  ...depositParams,
  isGasEstimation: true,
});

// Deposit
const depositResult = await intMaxClient.deposit(depositParams);
console.log('Deposit result:', depositResult);
console.log('Transaction Hash:', depositResult.txHash);
```

### Withdraw

```ts
const { balances } = await intMaxClient.fetchTokenBalances(); // fetch token balances

// You can change filtration by tokenIndex or tokenAddress
const token = balances.find((b) => b.token.tokenIndex === 0).token;

// Withdraw
const withdrawalResult = await intMaxClient.withdraw({
  address: '0xf9c78dAE01Af727E2F6Db9155B942D8ab631df4B', // Your public key of ETH wallet
  token,
  amount: 0.000001, // Amount of the token, for erc721 should be 1, for erc1155 can be more than 1
});
console.log('Withdrawal result:', withdrawalResult);
```

### Fetch withdrawals (needToClaim, etc.)

```ts
const withdrawals = await intMaxClient.fetchWithdrawals();
console.log('Withdrawals:', withdrawals);
```

### Claim withdrawals

```ts
const withdrawals = await intMaxClient.fetchWithdrawals();
const claim = await intMaxClient.claimWithdrawal(withdrawals.needClaim); // Claim response (should be add additional check for receiver address you can claim withdrawals only for your address)
console.log('Claim result:', claim);
```

### Logout

```ts
await intMaxClient.logout();
```
