# INTMAX2 Client SDK - Node Example

This example demonstrates how to use the `intmax2-client-sdk` with Node.js to:

## Setup

### 1. **Clone the repository**

```bash
git clone https://github.com/InternetMaximalism/intmax2-client-sdk.git
cd intmax2-client-sdk
```

### 2. **Install and build `server-sdk`**

```bash
cd server-sdk
pnpm install
pnpm build
```

### 3. **Run the Node example**

1. **Install Dependencies**

```bash
cd ../examples/node
pnpm install
```

2. **Create a `.env` file**

Create a `.env` file in the `examples/node` directory with the following contents:

```env
ETH_PRIVATE_KEY=your_ethereum_private_key_here
L1_RPC_URL=https://your-l1-rpc-url
```

> 🔐 Replace the values with your actual Ethereum private key and RPC URL.

3. **Run the script**

```bash
node index.js
```
