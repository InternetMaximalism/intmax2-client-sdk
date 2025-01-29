"use client";

import { useState, useEffect } from "react";
import { ConnectSection } from "@/components/wallet/connect-section";
import { WalletInfo } from "@/components/wallet/wallet-info";
import { TokenBalances } from "@/components/wallet/token-balances";
import { DepositForm } from "@/components/wallet/deposit-form";
import { useWallet } from "@/hooks/useWallet";

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
    statusMessage,
    loginStep,
    handleLogin,
    handleLogout,
    handleDeposit,
    fetchBalances,
  } = useWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

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

        {isConnected && (
          <>
            <ConnectSection
              isInitialized={isInitialized}
              isInitializing={isInitializing}
              onLogin={handleLogin}
              onLogout={handleLogout}
              loginStep={loginStep}
            />

            <WalletInfo ethAddress={ethAddress} intmaxAddress={intmaxAddress} />

            {isInitialized && (
              <>
                <TokenBalances
                  balances={balances}
                  isLoading={isLoadingBalances}
                  onRefresh={fetchBalances}
                />
                <DepositForm onSubmit={handleDeposit} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
