const { IntMaxNodeClient, TokenType } = require('intmax2-server-sdk');
const { privateKeyToAccount } = require('viem/accounts');
require('dotenv/config');

const main = async () => {
  const environment = process.env.ENVIRONMENT || 'testnet';
  if (environment !== 'testnet' && environment !== 'mainnet') {
    throw new Error(`Invalid environment: ${environment}`);
  }
  const ethPrivateKey = process.env.ETH_PRIVATE_KEY;
  if (typeof ethPrivateKey !== 'string') {
    throw new Error('ETH_PRIVATE_KEY is not set');
  }

  // Initialize client
  console.log('Initializing client...');
  const client = new IntMaxNodeClient({
    environment,
    eth_private_key: ethPrivateKey,
    l1_rpc_url: process.env.L1_RPC_URL,
    urls: process.env.BALANCE_PROVER_URL
      ? {
        balance_prover_url: process.env.BALANCE_PROVER_URL,
        use_private_zkp_server: false,
      }
      : undefined,
    loggerLevel: 'info',
  });

  // Login
  console.log('Logging in...');
  await client.login();
  console.log('Logged in successfully');
  console.log('Address:', client.address);

  // Fetch and display balances
  console.log('\nFetching balances...');
  const { balances } = await client.fetchTokenBalances();
  console.log('Balances:');
  balances.forEach((balance) => {
    console.log(JSON.stringify(balance, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2));
  });

  // Verify message signature
  const message = 'Hello, World!';
  const signature = await client.signMessage(message);
  console.log('Signature: ', signature);

  const isVerified = await client.verifySignature(signature, message);
  console.log('Message verified:', isVerified);

  const tokens = await client.getTokensList();
  console.log('Available tokens:', JSON.stringify(tokens, null, 2));

  // Fetch transaction history
  console.log('\nFetching transaction history...');
  const [deposits, receiveTransfers, sendTxs] = await Promise.all([
    client.fetchDeposits({
      limit: 1,
      cursor: null,
    }),
    client.fetchTransfers({
      limit: 1,
      cursor: null,
    }),
    client.fetchTransactions({
      limit: 1,
      cursor: null,
    }),
  ]);
  console.log('\nTransaction History:');
  console.log('Latest deposits:', deposits.items[0]);
  console.log('Latest received transfers:', receiveTransfers.items[0]);
  console.log('Latest sent transfers:', sendTxs.items[0]);

  const token = {
    tokenType: TokenType.NATIVE,
    tokenIndex: 0,
    decimals: 18,
    contractAddress: '0x0000000000000000000000000000000000000000',
  };

  // Example deposit
  console.log('\nPreparing deposit...');
  const depositParams = {
    amount: 0.000001, // 0.000001 ETH
    token,
    // Your public key of the IntMax wallet or any other IntMax wallet public key
    address: client.address,
  };

  // Check gas estimation to verify if the transaction can be executed
  const gas = await client.estimateDepositGas({
    ...depositParams,
    isGasEstimation: true,
  });
  console.log('Estimated gas for deposit:', gas);

  const depositResult = await client.deposit(depositParams);
  console.log('Deposit result:', JSON.stringify(depositResult, null, 2));

  // The user needs to pay `transferFeeAmount` of tokens corresponding to the `transferFeeToken`.
  const transferFee = await client.getTransferFee();
  const transferFeeToken = transferFee?.fee?.token_index;
  const transferFeeAmount = transferFee?.fee?.amount;
  console.log('Transfer Fee Token Index:', transferFeeToken);
  console.log('Transfer Fee Amount:', transferFeeAmount);

  // Token information can be obtained from the return value of `fetchBalances`.
  const transfers = [
    {
      amount: 0.000001, // 0.000001 ETH
      token,
      address: client.address, // Transfer to self
    },
  ];

  while (true) {
    try {
      const transferResult = await client.broadcastTransaction(transfers);
      console.log('Transfer result:', JSON.stringify(transferResult, null, 2));
      // uncomment if you want to reproduce "Pending tx error"
      // await client.sync();
      const transferConfirmation = await client.waitForTransactionConfirmation(transferResult);
      console.log('Transfer confirmation result:', JSON.stringify(transferConfirmation, null, 2));
      break;
    } catch (error) {
      console.warn('Transfer error:', error);

      const expectedErrorMessage = [
        'Pending tx error',
        'Failed to send tx request',
        'prev_digest mismatch with stored digest',
      ];
      if (expectedErrorMessage.some((errorMessage) => error.message.includes(errorMessage))) {
        console.log('Retrying transfer in 5 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  // The user needs to pay `withdrawalFeeAmount` of tokens corresponding to the `withdrawalFeeToken`.
  const withdrawalFee = await client.getWithdrawalFee(token);
  const withdrawalFeeToken = withdrawalFee?.fee?.token_index;
  const withdrawalFeeAmount = withdrawalFee?.fee?.amount;
  console.log('Withdrawal Fee Token Index:', withdrawalFeeToken);
  console.log('Withdrawal Fee Amount:', withdrawalFeeAmount);

  while (true) {
    try {
      await client.sync();
      break;
    } catch (error) {
      const expectedErrorMessage = ['Pending tx error'];
      if (expectedErrorMessage.some((errorMessage) => error.message.includes(errorMessage))) {
        console.log('Retrying balance fetching in 5 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  const withdrawalDestination = privateKeyToAccount(ethPrivateKey).address;

  console.log('Withdraw ETH to', withdrawalDestination);
  while (true) {
    try {
      const withdrawResult = await client.withdraw({
        address: withdrawalDestination, // Ethereum address
        token,
        amount: 0.000001,
      });
      console.log('Withdrawal result:', JSON.stringify(withdrawResult, null, 2));
      break;
    } catch (error) {
      console.warn('Withdrawal error:', error);

      const expectedErrorMessage = ['Pending tx error', 'Failed to send tx request'];
      if (expectedErrorMessage.some((errorMessage) => error.message.includes(errorMessage))) {
        console.log('Retrying withdrawal in 5 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  let hasNextPage = true;
  let withdrawal_cursor = null;
  let withdrawals = { need_claim: [] };
  do {
    console.log('Fetching withdrawals...');
    const resp = await client.fetchWithdrawals({
      cursor: withdrawal_cursor,
      limit: 1,
    });

    Object.keys(withdrawals).forEach((key) => {
      withdrawals[key] = [...withdrawals[key], ...resp.withdrawals[key]];
    });

    hasNextPage = resp.pagination.has_more;
    withdrawal_cursor = resp.pagination.next_cursor;
  } while (hasNextPage);

  if (withdrawals.need_claim.length === 0) {
    console.log('No withdrawals to claim.');
  } else {
    const claim = await client.claimWithdrawal(withdrawals.need_claim);
    console.log('Claim Withdrawal result:', JSON.stringify(claim, null, 2));
  }

  // Keep the process alive for a while to see worker activity
  console.log('\nKeeping process alive for 60 min to observe worker activity...');
  await new Promise((resolve) => setTimeout(resolve, 60000 * 60));

  console.log('Shutting down...');
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
