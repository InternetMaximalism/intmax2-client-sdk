"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { formatUnits, parseUnits } from "viem";

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

interface TransferFormProps {
  balances: Balance[];
  onTransfer: (params: {
    amount: string;
    token: {
      contractAddress: string;
      tokenIndex: number;
      symbol: string;
      tokenType?: number;
      decimals: number;
    };
    address: string;
  }) => Promise<void>;
}

export function TransferForm({ balances, onTransfer }: TransferFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedToken || !amount || !recipientAddress) return;

    try {
      setIsLoading(true);

      // Ensure we have all required token information
      if (!selectedToken.decimals) {
        throw new Error("Token decimals not found");
      }

      // Pass the amount directly as the SDK handles decimals
      const rawAmount = amount;

      console.log("Submitting transfer with amount:", {
        input: amount,
        rawAmount,
        token: selectedToken.symbol,
      });

      await onTransfer({
        amount: rawAmount,
        token: {
          contractAddress: selectedToken.contractAddress,
          tokenIndex: selectedToken.tokenIndex,
          symbol: selectedToken.symbol,
          decimals: selectedToken.decimals,
          tokenType: selectedToken.tokenType || 0,
        },
        address: recipientAddress,
      });

      // Reset form
      setAmount("");
      setRecipientAddress("");
      setSelectedToken(null);
    } catch (error) {
      console.error("Transfer error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentBalance = () => {
    if (!selectedToken) return "0";
    const balance = balances.find(
      (b) =>
        b.token.contractAddress.toLowerCase() ===
        selectedToken.contractAddress.toLowerCase()
    );
    if (!balance || !balance.token.decimals) return "0";
    try {
      return formatUnits(balance.amount, balance.token.decimals);
    } catch (error) {
      console.error("Error formatting balance:", error);
      return "0";
    }
  };

  const handleMaxClick = () => {
    const balance = getCurrentBalance();
    setAmount(balance);
  };

  return (
    <Card>
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Transfer Tokens
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Transfer your tokens to another IntMax address
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Token
            </label>
            <select
              value={selectedToken?.contractAddress || ""}
              onChange={(e) => {
                const token = balances.find(
                  (b) =>
                    b.token.contractAddress.toLowerCase() ===
                    e.target.value.toLowerCase()
                )?.token;
                setSelectedToken(token || null);
              }}
              className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            >
              <option value="">Select a token</option>
              {balances.map((balance) => (
                <option
                  key={balance.token.contractAddress}
                  value={balance.token.contractAddress}
                >
                  {balance.token.symbol} (Balance:{" "}
                  {formatUnits(balance.amount, balance.token.decimals)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Balance: {getCurrentBalance()} {selectedToken?.symbol || ""}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                MAX
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipient Address (IntMax)
            </label>
            <input
              placeholder="IntMax address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>

          <Button
            type="submit"
            variant="success"
            className="w-full"
            isLoading={isLoading}
            disabled={!selectedToken || !amount || !recipientAddress}
          >
            {isLoading ? "Transferring..." : "Transfer"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
