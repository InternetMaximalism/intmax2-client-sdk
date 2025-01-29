"use client";

import { Button } from "../ui/button";
import { useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useState } from "react";

interface ConnectSectionProps {
  isInitialized: boolean;
  isInitializing: boolean;
  isConnected: boolean;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export function ConnectSection({
  isInitialized,
  isInitializing,
  isConnected,
  onLogin,
  onLogout,
}: ConnectSectionProps) {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect({ connector: injected() });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {!isConnected ? (
        <Button
          variant="default"
          onClick={handleConnect}
          isLoading={isConnecting}
        >
          Connect Wallet
        </Button>
      ) : (
        <>
          <Button variant="danger" onClick={() => disconnect()}>
            Disconnect Wallet
          </Button>

          {!isInitialized && (
            <Button
              variant="success"
              onClick={onLogin}
              isLoading={isInitializing}
            >
              Connect to IntMax
            </Button>
          )}

          {isInitialized && (
            <Button variant="warning" onClick={onLogout}>
              Disconnect from IntMax
            </Button>
          )}
        </>
      )}
    </div>
  );
}
