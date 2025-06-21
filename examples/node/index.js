const { IntMaxNodeClient, TokenType } = require('intmax2-server-sdk');
const dotenv = require('dotenv');
dotenv.config();

const main = async () => {
  // Initialize client
  console.log('Initializing client...');
  const client = new IntMaxNodeClient({
    environment: 'testnet',
    eth_private_key: process.env.ETH_PRIVATE_KEY,
    l1_rpc_url: process.env.L1_RPC_URL,
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

  // Example deposit
  console.log('\nPreparing deposit...');
  const tokens = await client.getTokensList();
  console.log('Available tokens:', JSON.stringify(tokens, null, 2));

  // Fetch transaction history
  console.log('\nFetching transaction history...');
  const [deposits, receiveTransfers, sendTxs] = await Promise.all([
    client.fetchDeposits({}),
    client.fetchTransfers({}),
    client.fetchTransactions({}),
  ]);
  console.log('\nTransaction History:');
  console.log('Latest deposits:', deposits[0]);
  console.log('Latest received transfers:', receiveTransfers[0]);
  console.log('Latest sent transfers:', sendTxs[0]);

  const token = {
    tokenType: TokenType.NATIVE,
    tokenIndex: 0,
    decimals: 18,
    contractAddress: '0x0000000000000000000000000000000000000000',
    price: 2417.08,
  };

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

  const deposit = await client.deposit(depositParams);
  console.log('Deposit result:', JSON.stringify(deposit, null, 2));

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
  const transferResult = await client.broadcastTransaction(transfers);
  console.log('Transfer result:', JSON.stringify(transferResult, null, 2));

  // The user needs to pay `withdrawalFeeAmount` of tokens corresponding to the `withdrawalFeeToken`.
  const withdrawalFee = await client.getWithdrawalFee(token);
  const withdrawalFeeToken = withdrawalFee?.fee?.token_index;
  const withdrawalFeeAmount = withdrawalFee?.fee?.amount;
  console.log('Withdrawal Fee Token Index:', withdrawalFeeToken);
  console.log('Withdrawal Fee Amount:', withdrawalFeeAmount);

  await client.fetchTokenBalances();

  console.log('Withdraw ETH...');
  while (true) {
    try {
      const withdrawResult = await client.withdraw({
        address: '0xf9c78dAE01Af727E2F6Db9155B942D8ab631df4B', // Ethereum address
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
  do{
  const resp= await client.fetchWithdrawals({
    cursor: withdrawal_cursor,
  });

  Object.keys(withdrawals).forEach((key) => {
    withdrawals[key] = [...withdrawals[key], ...resp[key]];
  })

  hasNextPage = resp.pagination.has_more;
  withdrawal_cursor = resp.pagination.next_cursor;
  console.log('Withdrawals pagination:', JSON.stringify(pagination, null, 2));
  console.log('Pending Withdrawals:', JSON.stringify(withdrawals, null, 2));
  }while (hasNextPage);

  if (withdrawals.need_claim.length === 0) {
    console.log('No withdrawals to claim.');
  } else {
    const claim = await client.claimWithdrawal(withdrawals.need_claim);
    console.log('Claim Withdrawal result:', JSON.stringify(claim, null, 2));
  }
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
