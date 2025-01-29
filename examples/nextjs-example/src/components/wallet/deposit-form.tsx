"use client";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useState, useEffect } from "react";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { formatUnits, isAddress } from "viem";

const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

interface DepositFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  intmaxAddress?: string;
}

export function DepositForm({ onSubmit, intmaxAddress }: DepositFormProps) {
  const [isNativeToken, setIsNativeToken] = useState(true);
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const { address: userAddress } = useAccount();

  // Fetch ETH balance
  const { data: ethBalance } = useBalance({
    address: userAddress,
  });

  // Fetch ERC20 token decimals
  const { data: decimals } = useContractRead({
    address: isAddress(tokenAddress)
      ? (tokenAddress as `0x${string}`)
      : undefined,
    abi: erc20Abi,
    functionName: "decimals",
  });

  // Fetch ERC20 token balance
  const { data: tokenBalance } = useContractRead({
    address: isAddress(tokenAddress)
      ? (tokenAddress as `0x${string}`)
      : undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  });

  // Update token decimals when fetched
  useEffect(() => {
    if (decimals) {
      setTokenDecimals(Number(decimals));
    }
  }, [decimals]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create a new form element to submit
    const form = e.currentTarget;

    // Update form values before submission
    if (isNativeToken) {
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = "contractAddress";
      hiddenInput.value = "0x0000000000000000000000000000000000000000";
      form.appendChild(hiddenInput);
    }

    // Set the current values to the form
    const amountInput = form.querySelector(
      'input[name="amount"]'
    ) as HTMLInputElement;
    const addressInput = form.querySelector(
      'input[name="address"]'
    ) as HTMLInputElement;
    if (amountInput) amountInput.value = amount;
    if (addressInput) addressInput.value = recipientAddress;

    // Submit the form
    await onSubmit(e);

    // Clean up the hidden input if we added one
    if (isNativeToken) {
      const hiddenInput = form.querySelector('input[name="contractAddress"]');
      if (hiddenInput) form.removeChild(hiddenInput);
    }
  };

  const handleTokenAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenAddress(e.target.value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleRecipientAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRecipientAddress(e.target.value);
  };

  const formatBalance = (balance: bigint | undefined, decimals: number) => {
    if (!balance) return "0";
    return formatUnits(balance, decimals);
  };

  const getCurrentBalance = () => {
    if (isNativeToken) {
      return ethBalance?.formatted || "0";
    }
    return formatBalance(tokenBalance as bigint | undefined, tokenDecimals);
  };

  const handleMaxClick = () => {
    setAmount(getCurrentBalance());
  };

  const handleUseMyAddressClick = () => {
    if (intmaxAddress) {
      setRecipientAddress(intmaxAddress);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        Bridge to IntMax Testnet
      </h3>
      <Card>
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Bridge your assets from Ethereum Sepolia to IntMax Testnet. This
              process may take a few minutes.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Use ETH (Native Token)
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={isNativeToken}
                onClick={() => setIsNativeToken(!isNativeToken)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isNativeToken
                    ? "bg-indigo-600"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span className="sr-only">Use ETH</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isNativeToken ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {!isNativeToken && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Token Contract Address
                </label>
                <input
                  name="contractAddress"
                  placeholder="0x..."
                  value={tokenAddress}
                  onChange={handleTokenAddressChange}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Balance: {getCurrentBalance()} {isNativeToken ? "ETH" : ""}
                </span>
              </div>
              <div className="relative">
                <input
                  name="amount"
                  type="number"
                  step="any"
                  placeholder="0.0"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  MAX
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recipient Address (IntMax)
                </label>
                {intmaxAddress && (
                  <button
                    type="button"
                    onClick={handleUseMyAddressClick}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Use My Address
                  </button>
                )}
              </div>
              <input
                name="address"
                placeholder="IntMax address"
                value={recipientAddress}
                onChange={handleRecipientAddressChange}
                className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>

            <Button type="submit" variant="success" className="w-full">
              Bridge to IntMax
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
