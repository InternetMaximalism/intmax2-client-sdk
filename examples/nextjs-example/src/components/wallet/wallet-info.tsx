"use client";

import { Card } from "../ui/card";

interface WalletInfoProps {
  ethAddress: string;
  intmaxAddress?: string;
}

export function WalletInfo({ ethAddress, intmaxAddress }: WalletInfoProps) {
  return (
    <Card>
      <div className="space-y-2">
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ethereum Address:
          </p>
          <p className="font-mono text-gray-900 dark:text-gray-100">
            {ethAddress}
          </p>
        </div>
        {intmaxAddress && (
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              IntMax Address:
            </p>
            <p className="font-mono text-gray-900 dark:text-gray-100">
              {intmaxAddress}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
