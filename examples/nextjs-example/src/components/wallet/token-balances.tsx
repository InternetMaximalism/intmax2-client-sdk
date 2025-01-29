"use client";

import { Button } from "../ui/button";
import { Card } from "../ui/card";

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
    <Card>
      <div className="flex items-center justify-between">
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
    </Card>
  );
};

interface TokenBalancesProps {
  balances: Balance[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function TokenBalances({
  balances,
  isLoading,
  onRefresh,
}: TokenBalancesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Token Balances
        </h3>
        <Button onClick={onRefresh} isLoading={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {isLoading && !balances.length && (
        <Card>
          <div className="flex items-center justify-center h-24 gap-2 text-gray-600 dark:text-gray-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading balances...</span>
          </div>
        </Card>
      )}

      {balances.length > 0 ? (
        <div className="grid gap-3">
          {balances.map((balance, index) => (
            <TokenBalanceCard key={index} balance={balance} />
          ))}
        </div>
      ) : (
        !isLoading && (
          <Card>
            <div className="flex items-center justify-center h-24">
              <p className="text-gray-500 dark:text-gray-400">
                No tokens found
              </p>
            </div>
          </Card>
        )
      )}
    </div>
  );
}
