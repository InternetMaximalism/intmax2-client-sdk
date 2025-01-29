"use client";

import { useCallback, useState, useEffect } from "react";
import { useIntMaxClient } from "./useIntMaxClient";
import {
  useAccount,
  useDisconnect,
  useWalletClient,
  useBalance,
  useChainId,
  usePublicClient,
} from "wagmi";
import { TokenType } from "intmax2-client-sdk";

export interface Token {
  contractAddress: string;
  tokenIndex: number;
  symbol: string;
  tokenType?: number;
  decimals: number;
  image?: string;
}

export interface Balance {
  amount: bigint;
  token: Token;
}

export function useWallet() {
  // Wagmi hooks
  const {
    address: ethAddress,
    isConnected,
    status: connectionStatus,
  } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { disconnectAsync } = useDisconnect();

  // IntMax client hook
  const {
    client,
    login: intMaxLogin,
    logout: intMaxLogout,
    isInitialized,
    isInitializing,
  } = useIntMaxClient();

  // Local state
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Native token balance using Wagmi
  const { data: nativeBalance } = useBalance({
    address: ethAddress,
  });

  const handleLogin = useCallback(async () => {
    try {
      if (!isConnected) {
        throw new Error("Wallet not connected");
      }
      await intMaxLogin();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, [isConnected, intMaxLogin]);

  const handleLogout = useCallback(async () => {
    try {
      await intMaxLogout();
      await disconnectAsync();
      setBalances([]);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }, [intMaxLogout, disconnectAsync]);

  const fetchBalances = useCallback(async () => {
    if (!client || !isInitialized) {
      setBalances([]);
      return;
    }

    setIsLoadingBalances(true);
    try {
      const { balances: newBalances } = await client.fetchTokenBalances();
      setBalances(newBalances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      throw error;
    } finally {
      setIsLoadingBalances(false);
    }
  }, [client, isInitialized]);

  // Fetch balances when client is initialized
  useEffect(() => {
    if (isInitialized && client) {
      fetchBalances();
    }
  }, [isInitialized, client, fetchBalances]);

  const handleDeposit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!client || !walletClient || !publicClient) return;

      const formData = new FormData(e.currentTarget);
      const contractAddress = formData.get("contractAddress") as string;
      const amount = Number(formData.get("amount"));
      const depositAddress = formData.get("address") as string;

      try {
        const tokens = await client.getTokensList();
        const token = tokens.find(
          (t: Token) =>
            t.contractAddress.toLowerCase() === contractAddress.toLowerCase()
        );

        if (!token) {
          throw new Error("Token not found");
        }

        const tokenWithType = {
          ...token,
          tokenType:
            token.contractAddress ===
            "0x0000000000000000000000000000000000000000"
              ? TokenType.NATIVE
              : TokenType.ERC20,
        };

        // Estimate gas and execute deposit
        await client.estimateDepositGas({
          amount,
          token: tokenWithType,
          address: depositAddress,
          isGasEstimation: true,
        });

        await client.deposit({
          amount,
          token: tokenWithType,
          address: depositAddress,
        });

        await fetchBalances();
      } catch (error) {
        console.error("Deposit error:", error);
        throw error;
      }
    },
    [client, walletClient, publicClient, fetchBalances]
  );

  return {
    isConnected,
    ethAddress,
    intmaxAddress: client?.address || "",
    connectionStatus,
    chainId,
    nativeBalance,
    isInitialized,
    isInitializing,
    balances,
    isLoadingBalances,
    handleLogin,
    handleLogout,
    handleDeposit,
    fetchBalances,
    client,
  };
}
