"use client";

import { useState, useEffect } from "react";
import { useIntMaxClient } from "../hooks/useIntMaxClient";
import { TokenType } from "intmax2-client-sdk";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

interface Token {
  contractAddress: string;
  tokenIndex: number;
  symbol: string;
  tokenType?: number;
  decimals: number;
  image?: string;
}

interface Balance {
  amount: bigint;
  token: Token;
}

interface TokenBalanceProps {
  balance: Balance;
}

const TokenBalanceCard = ({ balance }: TokenBalanceProps) => {
  const amount =
    Number(balance.amount) / Math.pow(10, balance.token.decimals || 18);
  const isNativeToken =
    balance.token.contractAddress ===
    "0x0000000000000000000000000000000000000000";

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center gap-3">
        {balance.token.image ? (
          <img
            src={balance.token.image}
            alt={balance.token.symbol}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {balance.token.symbol.slice(0, 2)}
            </span>
          </div>
        )}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {balance.token.symbol}
          </h4>
          {!isNativeToken && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {balance.token.contractAddress.slice(0, 6)}...
              {balance.token.contractAddress.slice(-4)}
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}
          <span className="ml-1 text-gray-500 dark:text-gray-400">
            {balance.token.symbol}
          </span>
        </p>
      </div>
    </div>
  );
};

type LoginStep =
  | { step: "idle" }
  | { step: "connecting_wallet" }
  | { step: "initializing_and_logging_in" }
  | { step: "error"; error: string };

export function IntMaxInterface() {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address: ethAddress } = useAccount();
  const { client, login, logout, isInitialized, isInitializing } =
    useIntMaxClient();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [intmaxAddress, setIntmaxAddress] = useState<string>("");
  const [loginStep, setLoginStep] = useState<LoginStep>({ step: "idle" });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (client) {
      setIntmaxAddress(client.address);
    } else {
      setIntmaxAddress("");
    }
  }, [client]);

  const handleConnect = async () => {
    setLoginStep({ step: "connecting_wallet" });
    try {
      await connect({ connector: injected() });
      setLoginStep({ step: "idle" });
    } catch (error) {
      console.error("Connection error:", error);
      setLoginStep({ step: "error", error: "Failed to connect wallet" });
    }
  };

  const fetchBalances = async () => {
    if (!client) return;
    setIsLoadingBalances(true);
    try {
      const { balances: newBalances } = await client.fetchTokenBalances();
      setBalances(newBalances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setStatusMessage({
        type: "error",
        message: "Failed to fetch balances. Please try again.",
      });
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Fetch balances automatically when connected to IntMax
  useEffect(() => {
    if (isInitialized && client) {
      fetchBalances();
    }
  }, [isInitialized, client]);

  const handleLogin = async () => {
    try {
      setLoginStep({ step: "initializing_and_logging_in" });
      await login();
      setStatusMessage({
        type: "success",
        message: "Successfully connected to IntMax!",
      });
      if (client) {
        setIntmaxAddress(client.address);
      }
      setLoginStep({ step: "idle" });
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Failed to connect to IntMax. ";
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }
      setStatusMessage({
        type: "error",
        message: errorMessage,
      });
      setLoginStep({ step: "error", error: errorMessage });
    }
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setStatusMessage({
        type: "success",
        message: "Successfully logged out from IntMax!",
      });
      setIntmaxAddress("");
    } catch (error) {
      console.error("Logout error:", error);
      setStatusMessage({
        type: "error",
        message: "Failed to logout from IntMax. Please try again.",
      });
    }
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleDeposit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!client) return;

    const formData = new FormData(e.currentTarget);
    const contractAddress = formData.get("contractAddress") as string;
    const amount = Number(formData.get("amount"));
    const depositAddress = formData.get("address") as string;

    const tokens = await client.getTokensList();
    let token = tokens.find(
      (t: Token) =>
        t.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    );

    if (token) {
      token = {
        ...token,
        tokenType:
          token.contractAddress === "0x0000000000000000000000000000000000000000"
            ? TokenType.NATIVE
            : TokenType.ERC20,
      };

      try {
        const gas = await client.estimateDepositGas({
          amount,
          token,
          address: depositAddress,
          isGasEstimation: true,
        });
        alert(`Estimated Gas: ${gas}`);

        await client.deposit({
          amount,
          token,
          address: depositAddress,
        });

        // Refresh balances after deposit
        fetchBalances();
      } catch (error) {
        console.error("Deposit error:", error);
        alert("Deposit failed. Check console for details.");
      }
    }
  };

  const renderLoginStatus = () => {
    switch (loginStep.step) {
      case "connecting_wallet":
        return (
          <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting wallet...</span>
          </div>
        );
      case "initializing_and_logging_in":
        return (
          <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting to IntMax...</span>
          </div>
        );
      case "error":
        return (
          <p className="text-red-500 dark:text-red-400">{loginStep.error}</p>
        );
      default:
        return null;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl p-4 text-gray-900 dark:text-gray-100">
          <div className="animate-pulse">Loading wallet...</div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl p-4 space-y-4">
          <button
            disabled={loginStep.step !== "idle"}
            onClick={handleConnect}
            className="relative bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginStep.step !== "idle" ? (
              <>
                <span className="opacity-0">Connect Wallet</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
          {renderLoginStatus()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-2xl p-4 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
          IntMax Wallet
        </h1>

        {statusMessage && (
          <div
            className={`p-4 rounded-lg ${
              statusMessage.type === "success"
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100"
                : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100"
            }`}
          >
            {statusMessage.message}
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => disconnect()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Disconnect Wallet
          </button>
          {!isInitialized && (
            <button
              onClick={handleLogin}
              disabled={isInitializing || loginStep.step !== "idle"}
              className="relative bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInitializing || loginStep.step !== "idle" ? (
                <>
                  <span className="opacity-0">Connect to IntMax</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </>
              ) : (
                "Connect to IntMax"
              )}
            </button>
          )}
          {isInitialized && (
            <button
              onClick={handleLogout}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
            >
              Disconnect from IntMax
            </button>
          )}
        </div>

        {(isInitializing || loginStep.step !== "idle") && (
          <div className="text-center">{renderLoginStatus()}</div>
        )}

        <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ethereum Address:
            </p>
            <p className="font-mono text-gray-900 dark:text-gray-100">
              {ethAddress}
            </p>
          </div>
          {intmaxAddress && (
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                IntMax Address:
              </p>
              <p className="font-mono text-gray-900 dark:text-gray-100">
                {intmaxAddress}
              </p>
            </div>
          )}
        </div>

        {isInitialized && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Token Balances
              </h3>
              <button
                onClick={fetchBalances}
                disabled={isLoadingBalances}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingBalances ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>

            {isLoadingBalances && !balances.length && (
              <div className="flex items-center justify-center h-32 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading balances...</span>
                </div>
              </div>
            )}

            {balances.length > 0 ? (
              <div className="grid gap-3">
                {balances.map((balance, index) => (
                  <TokenBalanceCard key={index} balance={balance} />
                ))}
              </div>
            ) : (
              !isLoadingBalances && (
                <div className="flex items-center justify-center h-32 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    No tokens found
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {isInitialized && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Deposit
            </h3>
            <form onSubmit={handleDeposit} className="space-y-2 max-w-md">
              <input
                name="contractAddress"
                placeholder="Contract Address"
                className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
              <input
                name="amount"
                type="number"
                placeholder="Amount"
                className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
              <input
                name="address"
                placeholder="Address"
                className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
              <button
                type="submit"
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              >
                Submit Deposit
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
