"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { formatUnits } from "viem";
import { usePublicClient } from "wagmi";

interface Transaction {
  id?: string;
  timestamp: number;
  status: string;
  amount?: string;
  token?: {
    contract_address: string;
    symbol?: string;
    decimals?: number;
  };
  type?: string;
}

export function TransactionHistory({
  onFetchHistory,
}: {
  onFetchHistory: () => Promise<{
    deposits: Transaction[];
    receiveTxs: Transaction[];
    send: Transaction[];
  }>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<{
    deposits: Transaction[];
    receiveTxs: Transaction[];
    send: Transaction[];
  } | null>(null);
  const publicClient = usePublicClient();

  const handleFetchHistory = async () => {
    try {
      setIsLoading(true);
      const history = await onFetchHistory();

      // Log the raw response from the API
      console.log("Raw transaction history:", {
        deposits: history.deposits,
        received: history.receiveTxs,
        sent: history.send,
      });

      setTransactions(history);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const enrichTransactionsWithTokenInfo = async (
    transactions: Transaction[]
  ) => {
    if (!publicClient) return transactions;

    return Promise.all(
      transactions.map(async (tx) => {
        if (!tx.token?.contract_address) return tx;

        try {
          // Skip if it's the native token (ETH)
          if (
            tx.token.contract_address ===
            "0x0000000000000000000000000000000000000000"
          ) {
            return {
              ...tx,
              token: {
                ...tx.token,
                symbol: "ETH",
                decimals: 18,
              },
            };
          }

          const [symbol, decimals] = await Promise.all([
            publicClient.readContract({
              address: tx.token.contract_address as `0x${string}`,
              abi: [
                {
                  constant: true,
                  inputs: [],
                  name: "symbol",
                  outputs: [{ name: "", type: "string" }],
                  type: "function",
                },
              ],
              functionName: "symbol",
            }) as Promise<string>,
            publicClient.readContract({
              address: tx.token.contract_address as `0x${string}`,
              abi: [
                {
                  constant: true,
                  inputs: [],
                  name: "decimals",
                  outputs: [{ name: "", type: "uint8" }],
                  type: "function",
                },
              ],
              functionName: "decimals",
            }) as Promise<number>,
          ]);

          return {
            ...tx,
            token: {
              ...tx.token,
              symbol,
              decimals,
            },
          };
        } catch (error) {
          console.error("Failed to fetch token info:", error);
          return tx;
        }
      })
    );
  };

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp * 1000).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatAmount = (amount: bigint | undefined, decimals: number = 18) => {
    if (!amount) return "0";
    try {
      return formatUnits(amount, decimals);
    } catch (error) {
      return "Error";
    }
  };

  const getTransactionType = (type: string, category: string) => {
    if (category === "deposits") return "Deposit";
    if (category === "receiveTxs") return "Receive";
    if (category === "send") return "Send";
    return type;
  };

  const renderTransactionList = (
    transactions: Transaction[],
    title: string
  ) => {
    if (!transactions.length) return null;

    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </h4>
        {transactions.map((tx, index) => {
          // Determine if it's ETH
          const isEth =
            tx.token?.contract_address ===
            "0x0000000000000000000000000000000000000000";
          const symbol = isEth || !tx.token?.symbol ? "ETH" : tx.token.symbol;

          // Format the amount with detailed logging
          const amount = tx.amount ? tx.amount.toString() : "0";
          console.log(`Transaction details for ${title}:`, {
            rawAmount: amount,
            token: tx.token,
            decimals: tx.token?.decimals || 18,
            timestamp: tx.timestamp,
            status: tx.status,
          });

          const formattedAmount = formatUnits(
            BigInt(amount),
            tx.token?.decimals || 18
          );

          return (
            <div
              key={`${title}-${tx.id || index}`}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {formattedAmount} {symbol}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs ${
                    tx.status === "confirmed"
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100"
                  }`}
                >
                  {tx.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Transaction History
          </h3>
          <Button
            variant="default"
            onClick={handleFetchHistory}
            isLoading={isLoading}
          >
            {isLoading ? "Fetching..." : "Fetch History"}
          </Button>
        </div>

        {transactions ? (
          <div className="space-y-6">
            {renderTransactionList(transactions.deposits, "Deposits")}
            {renderTransactionList(transactions.receiveTxs, "Received")}
            {renderTransactionList(transactions.send, "Sent")}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Click the button above to fetch your transaction history
          </p>
        )}
      </div>
    </Card>
  );
}
