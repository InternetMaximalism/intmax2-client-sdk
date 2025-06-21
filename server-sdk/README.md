# INTMAX2-SERVER-SDK

This SDK is a client library for the INTMAX API. It is designed to help you integrate INTMAX services into your applications.

For detailed interface specifications and usage instructions, please refer to the documentation below:

- [📘 INTMAX Client SDK Docs (API Reference)](https://aquatic-paperback-675.notion.site/INTMAX-Client-SDK-Docs-176d989987db8096a012d144ae0e0dba)
- [🔧 Integration Guide](https://aquatic-paperback-675.notion.site/INTMAX-Client-SDK-Integration-Guide-208d989987db809db876ff8c79e78853)
- [🧪 Examples on GitHub](https://github.com/InternetMaximalism/intmax2-client-sdk/tree/main/examples)

Use these resources to quickly get started with building, integrating, and testing INTMAX-powered applications.

## Installation for Node.js

```bash
npm install intmax2-server-sdk
```

or

```bash
yarn add intmax2-server-sdk
```

or

```bash
pnpm install intmax2-server-sdk
```

## Interface

```ts
export interface INTMAXClient {
  // properties
  isLoggedIn: boolean;
  address: string; // INTMAX address
  tokenBalances: TokenBalance[] | undefined;

  // account
  login: () => Promise<LoginResponse>;
  logout: () => Promise<void>;
  getPrivateKey: () => Promise<string | undefined>;
  signMessage: (message: string) => Promise<SignMessageResponse>;
  verifySignature: (signature: SignMessageResponse, message: string | Uint8Array) => Promise<boolean>;

  // token
  getTokensList: () => Promise<Token[]>;
  fetchTokenBalances: () => Promise<TokenBalancesResponse>;

  // transaction
  fetchTransfers: (_params: FetchTransactionsRequest) => Promise<Transaction[]>;
  fetchTransactions: (params: FetchTransactionsRequest) => Promise<Transaction[]>;
  broadcastTransaction: (
    rawTransfers: BroadcastTransactionRequest[],
    isWithdrawal: boolean,
  ) => Promise<BroadcastTransactionResponse>;

  // deposit
  fetchDeposits: (params: FetchTransactionsRequest) => Promise<(Transaction | null)[]>;
  deposit: (params: PrepareDepositTransactionRequest) => Promise<PrepareDepositTransactionResponse>;

  // withdrawal
  fetchWithdrawals: (params: FetchWithdrawalsRequest) => Promise<FetchWithdrawalsResponse>;
  withdraw: (params: WithdrawRequest) => Promise<WithdrawalResponse>;
  claimWithdrawal: (params: ContractWithdrawal[]) => Promise<ClaimWithdrawalTransactionResponse>;

  // Fees
  getTransferFee: () => Promise<FeeResponse>;
  getWithdrawalFee: (token: Token) => Promise<FeeResponse>;
}
```

## Usage

### Initialization

`IntMaxNodeClient` is a core component of the INTMAX SDK that provides seamless interaction with the INTMAX network.

To initialize the client, you need to provide the Ethereum private key (`eth_private_key`) and the Layer 1 RPC URL (`l1_rpc_url`). These are required to sign transactions and connect to the Ethereum network.

```ts
import { IntMaxNodeClient } from "intmax2-server-sdk";

const intMaxClient = new IntMaxNodeClient({
  environment: "testnet", //  'mainnet' | 'testnet'
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

### Retrieve INTMAX Account Address & Private Key

This example retrieves the address and private key of the generated INTMAX account.

```ts
const address = intMaxClient.address; // Your INTMAX address
const privateKey = intMaxClient.getPrivateKey(); // INTMAX private key. Here you should sign message.
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
```

### List Available Tokens & Retrieve Information for a Specific Token

Shows how to get the list of tokens supported by the network.

```ts
const tokens = await intMaxClient.getTokensList();
console.log("Available tokens:", tokens);

const nativeToken = tokens.find(
  (t) =>
    t.contractAddress.toLowerCase() ===
    "0x0000000000000000000000000000000000000000"
);

// or use can use tokenIndex
const nativeToken = tokens.find((token) => token.tokenIndex === 0);
```

### Fetch Transaction History

Retrieves deposits, transfers, transactions, withdrawals in parallel:
- fetchDeposits - Retrieves deposits received by the wallet
- fetchTransfers - Retrieves transfers received by the wallet
- fetchTransactions - Retrieves transactions sent from the wallet
- fetchWithdrawals - Retrieves withdrawal requests made by the wallet

All returned data is sorted in descending chronological order (newest first).

```ts
const [receivedDeposits, receivedTransfers, sentTxs, requestedWithdrawals] = await Promise.all([
  client.fetchDeposits({}),
  client.fetchTransfers({}),
  client.fetchTransactions({}),
  client.fetchWithdrawals(),
]);

console.log('Received Deposits:', receivedDeposits);
console.log('Received Transfers:', receivedTransfers);
console.log('Sent Transfers:', sentTxs);
console.log('Requested Withdrawals:', requestedWithdrawals);
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
  address: "T6ubiG36LmNce6uzcJU3h5JR5FWa72jBBLUGmEPx5VXcFtvXnBB3bqice6uzcJU3h5JR5FWa72jBBLUGmEPx5VXcB3prnCZ", // recipient INTMAX address
};

// Dry-run gas estimation
const gas = await intMaxClient.estimateDepositGas({
  ...depositParams,
  isGasEstimation: true,
});
console.log("Estimated gas:", gas);

// Execute the deposit
const depositResult = await intMaxClient.deposit(depositParams);
console.log("Deposit result:", depositResult);
console.log("Transaction Hash:", depositResult.txHash);
```

The final txHash obtained can be searched on [SepoliaScan](https://sepolia.etherscan.io/).

### Deposit ERC20

```ts
const contractAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // ERC20 address
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
  address: "T6ubiG36LmNce6uzcJU3h5JR5FWa72jBBLUGmEPx5VXcFtvXnBB3bqice6uzcJU3h5JR5FWa72jBBLUGmEPx5VXcB3prnCZ", // recipient INTMAX address
};

// Dry-run gas estimation
const gas = await intMaxClient.estimateDepositGas({
  ...depositParams,
  isGasEstimation: true,
});

// Execute the deposit
const depositResult = await intMaxClient.deposit(depositParams);
console.log("Deposit result:", depositResult);
console.log("Transaction Hash:", depositResult.txHash);
```

### Deposit ERC721 / ERC1155

```ts
const token = {
  tokenIndex: 1, // NFT id in contract
  tokenType: TokenType.ERC721, // or TokenType.ERC1155
  contractAddress: "0x....", // Your Token address if not exist on token list
};

const depositParams = {
  amount: 1, // Amount of the token for erc721 should be 1, for erc1155 can be more than 1
  token,
  address: "T6ubiG36LmNce6uzcJU3h5JR5FWa72jBBLUGmEPx5VXcFtvXnBB3bqice6uzcJU3h5JR5FWa72jBBLUGmEPx5VXcB3prnCZ", // recipient INTMAX address
};

// Estimate gas if need to show for user
const gas = await intMaxClient.estimateDepositGas({
  ...depositParams,
  isGasEstimation: true,
});

// Deposit
const depositResult = await intMaxClient.deposit(depositParams);
console.log("Deposit result:", depositResult);
console.log("Transaction Hash:", depositResult.txHash);
```

### Withdraw

```ts
const { balances } = await intMaxClient.fetchTokenBalances(); // fetch token balances

// You can change filtration by tokenIndex or tokenAddress
const token = balances.find((b) => b.token.tokenIndex === 0).token;

// Withdraw
const withdrawalResult = await intMaxClient.withdraw({
  address: "0xf9c78dAE01Af727E2F6Db9155B942D8ab631df4B", // Your Ethereum address
  token,
  amount: 0.000001, // Amount of the token, for erc721 should be 1, for erc1155 can be more than 1
});
console.log("Withdrawal result:", withdrawalResult);
```

### Claim withdrawals

```ts
const withdrawals = await intMaxClient.fetchWithdrawals();
const claim = await intMaxClient.claimWithdrawal(withdrawals.needClaim); // Claim response (should be add additional check for receiver address you can claim withdrawals only for your address)
console.log("Claim result:", claim);
```

### Logout

Logout is not required when using the Server SDK, as it does not maintain any user session or authentication state.
