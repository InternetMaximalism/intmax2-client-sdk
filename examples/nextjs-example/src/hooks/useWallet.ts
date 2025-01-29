"use client";

import { useState, useEffect } from "react";
import { useIntMaxClient } from "./useIntMaxClient";
import { useAccount } from "wagmi";
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

export type LoginStep =
  | { step: "idle" }
  | { step: "connecting_wallet" }
  | { step: "initializing_and_logging_in" }
  | { step: "error"; error: string };

export type StatusMessage = {
  type: "success" | "error";
  message: string;
} | null;

export function useWallet() {
  const { isConnected, address: ethAddress } = useAccount();
  const { client, login, logout, isInitialized, isInitializing } =
    useIntMaxClient();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);
  const [intmaxAddress, setIntmaxAddress] = useState<string>("");
  const [loginStep, setLoginStep] = useState<LoginStep>({ step: "idle" });

  useEffect(() => {
    if (client) {
      setIntmaxAddress(client.address);
    } else {
      setIntmaxAddress("");
    }
  }, [client]);

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

        fetchBalances();
      } catch (error) {
        console.error("Deposit error:", error);
        alert("Deposit failed. Check console for details.");
      }
    }
  };

  useEffect(() => {
    if (isInitialized && client) {
      fetchBalances();
    }
  }, [isInitialized, client]);

  return {
    isConnected,
    ethAddress: ethAddress || "",
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
  };
}
