"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Wallet, Coins, ArrowRightLeft, Info } from "lucide-react";
import Modal from "@/components/ui/Modal";

type WithdrawModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  currentBalance: number;
};

const quickAmounts = [10, 25, 50, 100];

const WithdrawModal = ({
  isOpen,
  onClose,
  onSuccess,
  currentBalance,
}: WithdrawModalProps) => {
  const [amount, setAmount] = useState("");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(
    null
  );

  const numericAmount = selectedQuickAmount || parseFloat(amount) || 0;
  const tixAmount = numericAmount * 350; // Example conversion rate

  const handleQuickAmountClick = (value: number) => {
    setSelectedQuickAmount(value);
    setAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setAmount(value);
    setSelectedQuickAmount(null);
  };

  const handleProceed = () => {
    if (numericAmount >= 5 && numericAmount <= currentBalance) {
      onSuccess(numericAmount);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-1">
          Withdraw
        </h2>
        <p className="text-sm text-neutral-tertiary-text mb-6">
          Convert USD to $USDC
        </p>

        {/* Current Balance */}
        <div className="bg-brand-pixsee-tertiary border-2 border-brand-pixsee-secondary/30 rounded-xl p-4 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-neutral-secondary-text" />
            <span className="text-neutral-primary-text font-medium">
              Your Current Balance
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-brand-pixsee-secondary" />
            <span className="text-xl font-bold text-neutral-primary-text">
              ${currentBalance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Quick Add */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-neutral-primary-text mb-3">
            Quick add
          </p>
          <div className="grid grid-cols-4 gap-3">
            {quickAmounts.map((value) => (
              <button
                key={value}
                onClick={() => handleQuickAmountClick(value)}
                className={cn(
                  "py-6 rounded-xl border text-center font-semibold shadow transition-all",
                  selectedQuickAmount === value
                    ? "border-brand-pixsee-secondary bg-brand-pixsee-tertiary text-brand-pixsee-secondary"
                    : "border-neutral-tertiary-border text-brand-pixsee-secondary hover:border-brand-pixsee-secondary"
                )}
              >
                ${value}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-primary-text mb-2">
            Or Enter Custom amount
          </label>
          <input
            type="number"
            placeholder="Enter ticket amount"
            value={amount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
          />
        </div>

        {/* You Pay / You Receive Display */}
        <div className="bg-brand-pixsee-tertiary border-2 border-brand-pixsee-secondary/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-primary-text font-medium">
              You pay
            </span>
            <span className="text-xl font-bold text-neutral-primary-text">
              ${numericAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-center my-2">
            <ArrowRightLeft className="w-5 h-5 text-neutral-tertiary-text" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-primary-text font-medium">
              You receive
            </span>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-brand-pixsee-secondary" />
              <span className="text-xl font-bold text-brand-pixsee-secondary">
                {tixAmount} TIX
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-full py-6 border-neutral-tertiary-border"
          >
            Cancel payment
          </Button>
          <Button
            onClick={handleProceed}
            disabled={numericAmount < 5 || numericAmount > currentBalance}
            className="flex-1 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full py-6 gap-2"
          >
            <Wallet className="w-5 h-5" />
            Proceed to payment
          </Button>
        </div>

        {/* Important Information */}
        <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-primary-text mb-2">
                Important Information
              </p>
              <ul className="text-sm text-neutral-secondary-text space-y-1">
                <li>• Minimum deposit: $5.00</li>
                <li>• No transaction fees</li>
                <li>• Use to unlock premium content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WithdrawModal;
