"use client";

import { useState, useEffect } from "react";
import { ConnectSection } from "@/components/wallet/connect-section";
import { WalletInfo } from "@/components/wallet/wallet-info";
import { TokenBalances } from "@/components/wallet/token-balances";
import { DepositForm } from "@/components/wallet/deposit-form";
import { TransferForm } from "@/components/wallet/transfer-form";
import { TransactionHistory } from "@/components/wallet/transaction-history";
import { useWallet } from "@/hooks/useWallet";
import { sepolia } from "viem/chains";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const {
    isConnected,
    ethAddress,
    intmaxAddress,
    isInitialized,
    isInitializing,
    balances,
    isLoadingBalances,
    handleLogin,
    handleLogout,
    handleDeposit,
    fetchBalances,
    chainId,
    client,
  } = useWallet();

  const isCorrectNetwork = chainId === sepolia.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTransfer = async ({
    amount,
    token,
    address: recipientAddress,
  }: {
    amount: string;
    token: {
      contractAddress: string;
      tokenIndex: number;
      symbol: string;
      tokenType?: number;
      decimals: number;
    };
    address: string;
  }) => {
    if (!client) throw new Error("Client not initialized");

    try {
      const transfer = {
        token_index: token.tokenIndex,
        amount: amount,
        address: recipientAddress,
        contract_address: token.contractAddress,
        token_type: token.tokenType || 0,
        token: {
          contract_address: token.contractAddress,
          tokenIndex: token.tokenIndex,
          decimals: token.decimals,
          symbol: token.symbol,
          token_type: token.tokenType || 0,
        },
      };

      console.log("Sending transfer:", transfer);
      await client.broadcastTransaction([transfer], false);

      // Refresh balances after transfer
      await fetchBalances();
    } catch (error) {
      console.error("Transfer error:", error);
      throw error;
    }
  };

  const handleFetchHistory = async () => {
    if (!client) throw new Error("Client not initialized");

    const [deposits, receiveTxs, send] = await Promise.all([
      client.fetchDeposits({}),
      client.fetchTransactions({}),
      client.fetchTransactions({}),
    ]);

    return {
      deposits: deposits || [],
      receiveTxs: receiveTxs || [],
      send: send || [],
    };
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

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-2xl p-4 space-y-6">
        {/* Testnet Warning Banner */}
        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 p-4 rounded-lg text-center">
          <p className="font-bold">⚠️ Testnet Environment</p>
          <p className="text-sm">
            This is a testnet application. Please make sure you&apos;re
            connected to Sepolia network.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            IntMax Wallet
          </h1>
          {isConnected && (
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                isCorrectNetwork
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
              }`}
            >
              {isCorrectNetwork ? "Sepolia Network" : "Wrong Network"}
            </div>
          )}
        </div>

        <ConnectSection
          isConnected={isConnected}
          isInitialized={isInitialized}
          isInitializing={isInitializing}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {isConnected && !isCorrectNetwork && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg text-center">
            Please switch to Sepolia network to use this application
          </div>
        )}

        {isConnected && isCorrectNetwork && (
          <>
            <WalletInfo
              ethAddress={ethAddress || ""}
              intmaxAddress={intmaxAddress}
            />

            {isInitialized && (
              <>
                <TokenBalances
                  balances={balances}
                  isLoading={isLoadingBalances}
                  onRefresh={fetchBalances}
                />
                <DepositForm
                  onSubmit={handleDeposit}
                  intmaxAddress={intmaxAddress}
                />
                <TransferForm balances={balances} onTransfer={handleTransfer} />
                <TransactionHistory onFetchHistory={handleFetchHistory} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
