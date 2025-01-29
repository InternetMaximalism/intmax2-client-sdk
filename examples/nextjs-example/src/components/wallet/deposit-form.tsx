"use client";

import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface DepositFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function DepositForm({ onSubmit }: DepositFormProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        Deposit
      </h3>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <input
              name="contractAddress"
              placeholder="Contract Address"
              className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <input
              name="amount"
              type="number"
              placeholder="Amount"
              className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <input
              name="address"
              placeholder="Address"
              className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
          <Button type="submit" variant="success" className="w-full">
            Submit Deposit
          </Button>
        </form>
      </Card>
    </div>
  );
}
