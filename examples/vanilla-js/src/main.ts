import './style.css';
// import { IntMaxClient, TokenBalance, TokenType } from 'intmax2-client-sdk';
import { IntMaxClient, TokenBalance, TokenType } from '../../../browser-sdk/src';

let client: IntMaxClient;
let appDiv: HTMLDivElement;

const createLogoutButton = () => {
  const wrapper = document.createElement('div');
  wrapper.style.marginTop = '10px';
  appDiv.appendChild(wrapper);

  const button = document.createElement('button');
  button.innerHTML = 'Logout';
  button.onclick = async () => {
    await client.logout();
    createLoginButton();
    button.remove();
  };
  wrapper.appendChild(button);
  showInfo(wrapper);
};

const showPrivateKeyButton = () => {
  const wrapper = document.createElement('div');
  wrapper.style.marginTop = '10px';
  appDiv.appendChild(wrapper);

  const btn = document.createElement('button');
  btn.innerHTML = 'Show Private Key';
  btn.onclick = async () => {
    const privateKey = await client.getPrivateKey();
    const privateKeyDiv = document.createElement('div');
    privateKeyDiv.style.marginTop = '10px';
    privateKeyDiv.innerHTML = `Private Key: ${privateKey}`;
    wrapper.appendChild(privateKeyDiv);
    setTimeout(() => {
      privateKeyDiv.remove();
    }, 5000);
  };
  wrapper.appendChild(btn);
};

const showBalances = (balances: TokenBalance[], wrapper: HTMLDivElement) => {
  const balancesTitle = document.getElementById('balancesTitle');
  if (!balancesTitle) {
    const title = document.createElement('h3');
    title.setAttribute('id', 'balancesTitle');
    title.innerHTML = 'Balances: ';
    wrapper.appendChild(title);
  }

  let balancesDiv = document.getElementById('balances');
  if (!balancesDiv) {
    balancesDiv = document.createElement('div');
    balancesDiv.setAttribute('id', 'balances');
    balancesDiv.style.maxHeight = '500px';
    balancesDiv.style.overflowY = 'scroll';
    balancesDiv.style.marginTop = '10px';
    wrapper.appendChild(balancesDiv);
  } else {
    balancesDiv.innerHTML = '';
  }

  balances.forEach((balance) => {
    const balanceDiv = document.createElement('pre');
    balanceDiv.innerHTML = JSON.stringify(balance, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
    balancesDiv.appendChild(balanceDiv);
  });
};

const fetchBalancesButton = () => {
  const wrapper = document.createElement('div');
  wrapper.style.marginTop = '10px';
  appDiv.appendChild(wrapper);

  const button = document.createElement('button');
  button.style.marginTop = '10px';
  button.innerHTML = 'Fetch Balances';
  button.onclick = async () => {
    button.innerHTML = 'Fetching...';
    const { balances } = await client.fetchTokenBalances();
    showBalances(balances, wrapper);
    button.innerHTML = 'Fetch Balances';
  };
  wrapper.appendChild(button);
};

const showInfo = (wrapper: HTMLDivElement) => {
  const info = document.createElement('div');
  info.style.marginTop = '10px';
  info.innerHTML = `Address: ${client.address}`;
  wrapper.appendChild(info);
};

const fetchWithdrawalsButton = () => {
  const wrapper = document.createElement('div');
  wrapper.style.marginTop = '10px';
  appDiv.appendChild(wrapper);
  let nextCursor: bigint | null = null;

  const button = document.createElement('button');
  button.innerHTML = 'Fetch Withdrawals';
  button.onclick = async () => {
    button.innerHTML = 'Fetching...';
    const { withdrawals, pagination } = await client.fetchWithdrawals({
      cursor: nextCursor,
    });
    if (pagination.has_more) {
      nextCursor = pagination.next_cursor;
      button.innerHTML = `Fetch Withdrawals (more available)`;
    } else {
      button.innerHTML = `Fetch Withdrawals`;
    }
    wrapper.innerHTML = '';
    wrapper.appendChild(button);

    let withdrawalsDiv = wrapper.getElementsByTagName('pre')[0];
    if (!withdrawalsDiv) {
      withdrawalsDiv = document.createElement('pre');
    }
    withdrawalsDiv.style.marginTop = '10px';
    withdrawalsDiv.innerHTML = JSON.stringify(withdrawals, null, 2);
    wrapper.appendChild(withdrawalsDiv);
    button.innerHTML = 'Fetch Withdrawals';
  };
  wrapper.appendChild(button);
};

const claimWithdrawalsButton = async () => {
  const wrapper = document.createElement('div');
  wrapper.style.marginTop = '10px';
  appDiv.appendChild(wrapper);

  const button = document.createElement('button');
  button.innerHTML = 'Claim Withdrawals (Fetching...)';
  wrapper.appendChild(button);

  const { withdrawals } = await client.fetchWithdrawals();
  const withdrawalsToClaim = withdrawals.need_claim;
  button.innerHTML = `Claim Withdrawals (${withdrawalsToClaim.length})`;

  button.onclick = async () => {
    button.innerHTML = 'Claiming...';
    try {
      const { withdrawals } = await client.fetchWithdrawals();
      const result = await client.claimWithdrawal(withdrawals.need_claim);
      const resultDiv = document.createElement('pre');
      resultDiv.style.marginTop = '10px';
      resultDiv.innerHTML = JSON.stringify(result, null, 2);
      wrapper.appendChild(resultDiv);
    } catch (e) {}

    button.innerHTML = `Claim Withdrawals`;
  };
};

const createLoginButton = () => {
  const button = document.createElement('button');
  button.innerHTML = 'Login';
  button.onclick = async () => {
    await client.login();
    button.remove();
    createLogoutButton();
    showPrivateKeyButton();
    fetchBalancesButton();
    createDepositForm();
    fetchHistoryButton();
    fetchWithdrawalsButton();
    await claimWithdrawalsButton();
    await createWithdrawForm();
  };
  appDiv.appendChild(button);
};

const createInitButton = () => {
  const button = document.createElement('button');
  button.innerHTML = 'Initialize Client';
  button.onclick = async () => {
    client = await IntMaxClient.init({ environment: 'testnet' });
    createLoginButton();
    button.remove();
  };
  appDiv.appendChild(button);
};

const createDepositForm = () => {
  const wrapper = document.createElement('div');
  wrapper.style.marginTop = '10px';
  appDiv.appendChild(wrapper);

  const title = document.createElement('h3');
  title.innerHTML = 'Deposit';
  wrapper.appendChild(title);

  const form = document.createElement('form');
  form.style.marginTop = '10px';
  form.style.maxWidth = '300px';
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '6px';
  wrapper.appendChild(form);

  const contractInput = document.createElement('input');
  contractInput.setAttribute('placeholder', 'Contract Address');

  const addressInput = document.createElement('input');
  addressInput.setAttribute('placeholder', 'Address');

  const nftIdInput = document.createElement('input');
  nftIdInput.setAttribute('placeholder', 'NftId');

  const amountInput = document.createElement('input');
  amountInput.setAttribute('placeholder', 'Amount');

  const submitButton = document.createElement('button');
  submitButton.innerHTML = 'Submit deposit';
  submitButton.onclick = async (e) => {
    e.preventDefault();
    submitButton.disabled = true;

    const address = addressInput.value;
    const amount = Number(amountInput.value);
    const contractAddress = contractInput.value;
    // const nftId = Number(nftIdInput.value);

    const tokens = await client.getTokensList();
    let token = tokens.find((t) => t.contractAddress.toLowerCase() === contractAddress.toLowerCase());

    if (token) {
      token = {
        ...token,
        tokenType:
          token.contractAddress === '0x0000000000000000000000000000000000000000' ? TokenType.NATIVE : TokenType.ERC20,
      };
    }

    //TODO: create validation for NFT or ERC20
    if (!token) {
      alert('Token not found');
      submitButton.disabled = false;
      return;
    }

    try {
      const gas = await client.estimateDepositGas({
        amount,
        token,
        address,
        isGasEstimation: true,
      });
      alert(`Gas: ${gas}`);

      const deposit = await client.deposit({
        amount,
        token,
        address,
      });

      const transactionText = document.createElement('pre');
      transactionText.innerHTML = JSON.stringify(deposit, null, 2);
      const hr = document.createElement('hr');
      hr.style.width = '100%';

      form.appendChild(hr);
      form.appendChild(transactionText);
      submitButton.disabled = false;
    } catch (e) {
      submitButton.disabled = false;
      console.error(e);
    }
  };

  // Add elements to form
  form.appendChild(contractInput);
  form.appendChild(amountInput);
  form.appendChild(addressInput);
  form.appendChild(nftIdInput);
  form.appendChild(submitButton);
};

const createWithdrawForm = async () => {
  const wrapper = document.createElement('div');
  wrapper.style.marginTop = '10px';
  appDiv.appendChild(wrapper);

  const title = document.createElement('h3');
  title.innerHTML = 'Withdraw';
  wrapper.appendChild(title);

  const form = document.createElement('form');
  form.style.marginTop = '10px';
  form.style.maxWidth = '300px';
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '6px';
  wrapper.appendChild(form);

  const selectToken = document.createElement('select');
  selectToken.setAttribute('placeholder', 'Token');
  let balances = client.tokenBalances;
  if (balances.length === 0) {
    title.innerHTML = 'Withdraw (No balances, Fetching...)';
    const resp = await client.fetchTokenBalances();
    balances = resp.balances;
    title.innerHTML = 'Withdraw';
  }
  selectToken.innerHTML = balances
    .filter((t) => t.amount > 0)
    .map((b) => `<option value="${b.token.tokenIndex}">${b.token.tokenIndex} ${b.token.symbol}</option>`)
    .join('');

  const addressInput = document.createElement('input');
  addressInput.setAttribute('placeholder', 'Address');

  const amountInput = document.createElement('input');
  amountInput.setAttribute('placeholder', 'Amount');

  const submitButton = document.createElement('button');
  submitButton.innerHTML = 'Submit withdraw';
  submitButton.onclick = async (e) => {
    e.preventDefault();

    submitButton.disabled = true;

    const address = addressInput.value;
    const amount = Number(amountInput.value);
    const tokenInputValue = selectToken.value;
    if (balances?.length === 0) {
      throw new Error('No balances');
    }

    // @ts-ignore
    const token = balances.find((b) => b.token.tokenIndex === Number(tokenInputValue)).token;
    const withrawalFee = await client.getWithdrawalFee(token);
    const trasnferFee = await client.getTransferFee();
    console.log('withrawalFee', withrawalFee);
    console.log('trasnferFee', trasnferFee);

    try {
      const withdraw = await client.withdraw({
        amount,
        token,
        address: address as `0x${string}`,
      });

      const transactionText = document.createElement('pre');
      transactionText.innerHTML = JSON.stringify(withdraw, null, 2);
      const hr = document.createElement('hr');
      hr.style.width = '100%';

      form.appendChild(hr);
      form.appendChild(transactionText);
      submitButton.disabled = false;
    } catch (e) {
      console.error(e);
      submitButton.disabled = false;
    }
  };

  // Add elements to form
  form.appendChild(selectToken);
  form.appendChild(amountInput);
  form.appendChild(addressInput);
  form.appendChild(submitButton);
};

const fetchHistoryButton = () => {
  const wrapper = document.createElement('div');
  wrapper.style.marginTop = '10px';
  appDiv.appendChild(wrapper);

  const button = document.createElement('button');
  button.innerHTML = 'Fetch History';
  button.onclick = async () => {
    button.innerHTML = 'Fetching...';

    try {
      const promises = [client.fetchDeposits({}), client.fetchTransfers({}), client.fetchTransactions({})];
      const [deposits, receiveTxs, send] = await Promise.all(promises);

      const history = {
        deposits,
        receiveTxs,
        send,
      };

      const historyDiv = document.createElement('pre');
      historyDiv.style.marginTop = '10px';
      historyDiv.style.maxHeight = '500px';
      historyDiv.style.overflowY = 'auto';
      historyDiv.innerHTML = JSON.stringify(history, null, 2);
      wrapper.appendChild(historyDiv);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'User data not found') {
        alert('User data not found. Please fetch token balances first.');
      }
    }

    button.innerHTML = 'Fetch History';
  };
  wrapper.appendChild(button);
};

addEventListener('DOMContentLoaded', () => {
  appDiv = document.getElementById('app') as HTMLDivElement;

  const main = () => {
    createInitButton();
  };

  main();
});
