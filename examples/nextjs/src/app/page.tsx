'use client';

import { IntMaxClient, TokenBalance, TokenType } from 'intmax2-client-sdk';
import { useState, useEffect } from 'react';

const zeroAddress = '0x0000000000000000000000000000000000000000';

export default function Home() {
  const [client, setClient] = useState<IntMaxClient | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [withdrawals, setWithdrawals] = useState<any>(null);
  const [nextCursor, setNextCursor] = useState<any>(null);
  const [depositForm, setDepositForm] = useState({ contractAddress: zeroAddress, amount: '', address: '' });
  const [withdrawForm, setWithdrawForm] = useState({ tokenIndex: '', amount: '', address: '' });
  const [history, setHistory] = useState<any>(null);

  const initializeClient = async () => {
    const newClient = await IntMaxClient.init({ environment: 'testnet' });
    setClient(newClient);
  };

  const login = async () => {
    if (!client) return;
    await client.login();
    setIsLoggedIn(true);
  };

  const logout = async () => {
    if (!client) return;
    await client.logout();
    setIsLoggedIn(false);
    setBalances([]);
    setWithdrawals(null);
    setHistory(null);
  };

  const showPrivateKey = async () => {
    if (!client) return;
    const privateKey = await client.getPrivateKey();
    alert(`Private Key: ${privateKey}`);
  };

  const fetchBalances = async () => {
    if (!client) return;
    const { balances } = await client.fetchTokenBalances();
    setBalances(balances);
  };

  const fetchWithdrawals = async () => {
    if (!client) return;
    const { withdrawals, pagination } = await client.fetchWithdrawals({
      cursor: nextCursor,
    });
    setWithdrawals(withdrawals);
    if (pagination.has_more) {
      setNextCursor(pagination.next_cursor);
    } else {
      setNextCursor(null);
    }
  };

  const claimWithdrawals = async () => {
    if (!client) return;
    try {
      const { withdrawals } = await client.fetchWithdrawals();
      const result = await client.claimWithdrawal(withdrawals.need_claim);
      alert('Withdrawals claimed successfully');
      console.log(result);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const tokens = await client.getTokensList();
    let token = tokens.find((t) => t.contractAddress.toLowerCase() === depositForm.contractAddress.toLowerCase());

    if (token) {
      token = {
        ...token,
        tokenType:
          token.contractAddress === zeroAddress ? TokenType.NATIVE : TokenType.ERC20,
      };
    }

    if (!token) {
      alert('Token not found');
      return;
    }

    try {
      const gas = await client.estimateDepositGas({
        amount: Number(depositForm.amount),
        token,
        address: depositForm.address,
        isGasEstimation: true,
      });
      alert(`Gas: ${gas}`);

      const deposit = await client.deposit({
        amount: Number(depositForm.amount),
        token,
        address: depositForm.address,
      });

      console.log('Deposit:', deposit);
      alert('Deposit successful');
    } catch (e) {
      console.error(e);
      alert('Deposit failed');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || balances.length === 0) return;

    const token = balances.find((b) => b.token.tokenIndex === Number(withdrawForm.tokenIndex))?.token;
    if (!token) {
      alert('Token not found');
      return;
    }

    try {
      const withdrawalFee = await client.getWithdrawalFee(token);
      const transferFee = await client.getTransferFee();
      console.log('withdrawalFee', withdrawalFee);
      console.log('transferFee', transferFee);

      const withdrawResult = await client.withdraw({
        amount: withdrawForm.amount,
        token,
        address: withdrawForm.address as `0x${string}`,
      });

      console.log('Withdraw:', withdrawResult);

      const withdrawalConfirmation = await client.waitForTransactionConfirmation(withdrawResult);
      console.log('Withdrawal confirmation result:', withdrawalConfirmation);

      alert('Withdrawal successful');
    } catch (e) {
      console.error(e);
      alert('Withdrawal failed');
    }
  };

  const fetchHistory = async () => {
    if (!client) return;
    try {
      const [deposits, receiveTxs, send] = await Promise.all([
        client.fetchDeposits(),
        client.fetchTransfers(),
        client.fetchTransactions(),
      ]);

      setHistory({
        deposits,
        receiveTxs,
        send,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'User data not found') {
        alert('User data not found. Please fetch token balances first.');
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn && balances.length === 0) {
      fetchBalances();
    }
  }, [isLoggedIn]);

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">IntMax2 SDK NextJS Example</h1>

      {!client ? (
        <button
          onClick={initializeClient}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Initialize Client
        </button>
      ) : !isLoggedIn ? (
        <button
          onClick={login}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Login
        </button>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
            <button
              onClick={showPrivateKey}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Show Private Key
            </button>
          </div>

          <div>
            <p className="mb-4">Address: {client.address}</p>
          </div>

          <div>
            <button
              onClick={fetchBalances}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
            >
              Fetch Balances
            </button>
            {balances.length > 0 && (
              <div className="max-h-96 overflow-y-auto border p-4 rounded">
                <h3 className="font-bold mb-2">Balances:</h3>
                {balances.map((balance, index) => (
                  <pre key={index} className="text-sm mb-2">
                    {JSON.stringify(balance, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)}
                  </pre>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold mb-2">Deposit</h3>
            <form onSubmit={handleDeposit} className="space-y-2 max-w-md">
              <input
                type="text"
                placeholder="Contract Address"
                value={depositForm.contractAddress}
                onChange={(e) => setDepositForm({ ...depositForm, contractAddress: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Amount"
                value={depositForm.amount}
                onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Address"
                value={depositForm.address}
                onChange={(e) => setDepositForm({ ...depositForm, address: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit Deposit
              </button>
            </form>
          </div>

          <div>
            <h3 className="font-bold mb-2">Withdraw</h3>
            <form onSubmit={handleWithdraw} className="space-y-2 max-w-md">
              <select
                value={withdrawForm.tokenIndex}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, tokenIndex: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select Token</option>
                {balances
                  .filter((b) => b.amount > 0)
                  .map((b) => (
                    <option key={b.token.tokenIndex} value={b.token.tokenIndex}>
                      {b.token.tokenIndex} {b.token.symbol}
                    </option>
                  ))}
              </select>
              <input
                type="text"
                placeholder="Amount"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Address"
                value={withdrawForm.address}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, address: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit Withdraw
              </button>
            </form>
          </div>

          <div>
            <button
              onClick={fetchHistory}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
            >
              Fetch History
            </button>
            {history && (
              <pre className="max-h-96 overflow-y-auto border p-4 rounded text-sm">
                {JSON.stringify(history, null, 2)}
              </pre>
            )}
          </div>

          <div>
            <button
              onClick={fetchWithdrawals}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 mr-4"
            >
              Fetch Withdrawals {nextCursor && '(more available)'}
            </button>
            <button
              onClick={claimWithdrawals}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
            >
              Claim Withdrawals
            </button>
            {withdrawals && (
              <pre className="max-h-96 overflow-y-auto border p-4 rounded text-sm">
                {JSON.stringify(withdrawals, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
