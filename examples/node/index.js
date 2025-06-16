const { IntMaxNodeClient } = require('intmax2-server-sdk');
const dotenv = require('dotenv');
dotenv.config();

const main = async () => {
  try {
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
    // console.log('\nPreparing deposit...');
    const tokens = await client.getTokensList();

    //  Here you can update token address to find exist token in the list
    const nativeToken = tokens.find(
      (t) => t.contractAddress.toLowerCase() === '0x0000000000000000000000000000000000000000',
    );

    let token;

    if (nativeToken) {
      token = {
        ...nativeToken,
        tokenType: 0, // should be changed, if you are using not ETH, to  TokenType.ERC20
      };
    }

    // If you want to deposit a specific token, you can set it like this one
    // token = {
    //   decimals: 0,
    //   price: 0,
    //   contractAddress:  '0x28e16f104a2ca00e75ffa5816cea2f63b34b986c', // Address of the token contract
    //   tokenIndex: 1, // Token id in contractAddress if this NFT, if not NFT set to 0
    //   tokenType: TokenType.ERC721, // TokenType.ERC20, TokenType.ERC721, TokenType.ERC1155
    // }

    // Estimate deposit gas
    // const gas = await client.estimateDepositGas({
    //   amount: 0.00001, // 0.00001 ETH
    //   token,
    //   address: client.address,
    //   isGasEstimation: true,
    // });
    // console.log('Estimated gas for deposit:', gas);

    // // Perform deposit
    // console.log('Performing deposit...');
    // const deposit = await client.deposit({
    //   amount: 0.00001, // 0.00001 ETH
    //   token,
    //   address: client.address,
    // });
    // console.log('Deposit result:', JSON.stringify(deposit, null, 2));

    // // Example withdrawal
    // console.log('\nPreparing withdrawal...');
    // const { balances: updatedBalances } = await client.fetchTokenBalances();
    // const availableTokens = updatedBalances.filter((b) => b.amount > 0);
    //
    // if (availableTokens.length > 0) {
    //   const withdrawToken = availableTokens.find((tb)=>tb.token.tokenIndex===0);

    //   const withrawalFee = await client.getWithdrawalFee(withdrawToken);
    //   const trasnferFee = await client.getTransferFee();
    //   console.log('withrawalFee', withrawalFee);
    //   console.log('trasnferFee', trasnferFee);

    //   console.log('Performing withdrawal...');
    //   const withdraw = await client.withdraw({
    //     amount: 0.001,
    //     token: withdrawToken.token,
    //     address: '0xb6865560b8a966b50832364eDC068D89DD9c1157',
    //   });
    //   console.log('Withdrawal result:', JSON.stringify(withdraw, null, 2));
    // } else {
    //   console.log('No tokens available for withdrawal');
    // }

    // Fetch transaction history
    console.log('\nFetching transaction history...');
    const [deposits, receiveTxs, sendTxs] = await Promise.all([
      client.fetchDeposits({}),
      client.fetchTransfers({}),
      client.fetchTransactions({}),
    ]);
    console.log('\nTransaction History:');
    console.log('Deposits:', JSON.stringify(deposits, null, 2));
    console.log('Received Transfers:', JSON.stringify(receiveTxs, null, 2));
    console.log('Sent Transfers:', JSON.stringify(sendTxs, null, 2));

    console.log('\nFetching pending withdrawals...');
    const pendingWithdrawals = await client.fetchPendingWithdrawals();
    console.log('Pending withdrawals:', JSON.stringify(pendingWithdrawals, null, 2));

    // const claimWithdraw = await client.claimWithdrawal(pendingWithdrawals.need_claim);
    // console.log('Claim Withdrawal:', JSON.stringify(claimWithdraw, null, 2));

    // Logout
    console.log('\nLogging out...');
    await client.logout();
    console.log('Logged out successfully');

    process.exit(0);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

main();
