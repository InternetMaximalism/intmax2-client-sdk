"use client";

import { IntMaxClient } from "intmax2-client-sdk";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export interface IntMaxClientHook {
  client: IntMaxClient | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isInitialized: boolean;
  isInitializing: boolean;
}

export function useIntMaxClient(): IntMaxClientHook {
  const [client, setClient] = useState<IntMaxClient | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected && client) {
      client.logout().catch(console.error);
      setClient(null);
    }
  }, [isConnected, client]);

  const login = async () => {
    if (!isConnected) return;
    setIsInitializing(true);
    try {
      console.log("Initializing IntMax client...");
      const newClient = await IntMaxClient.init({
        environment: "testnet",
      });
      console.log("IntMax client initialized, logging in...");
      await newClient.login();
      console.log("Logged in successfully");
      setClient(newClient);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  };

  const logout = async () => {
    if (!client) return;
    try {
      await client.logout();
      setClient(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return {
    client,
    login,
    logout,
    isInitialized: !!client,
    isInitializing,
  };
}
