"use client";

import { Button } from "../ui/button";
import { useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

interface ConnectSectionProps {
  isInitialized: boolean;
  isInitializing: boolean;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  loginStep: { step: string; error?: string };
}

export function ConnectSection({
  isInitialized,
  isInitializing,
  onLogin,
  onLogout,
  loginStep,
}: ConnectSectionProps) {
  const { disconnect } = useDisconnect();

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <Button variant="danger" onClick={() => disconnect()}>
        Disconnect Wallet
      </Button>

      {!isInitialized && (
        <Button
          variant="success"
          onClick={onLogin}
          isLoading={isInitializing || loginStep.step !== "idle"}
        >
          Connect to IntMax
        </Button>
      )}

      {isInitialized && (
        <Button variant="warning" onClick={onLogout}>
          Disconnect from IntMax
        </Button>
      )}
    </div>
  );
}
