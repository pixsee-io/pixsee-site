"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Wallet,
  Coins,
  CreditCard,
  Building2,
  Bitcoin,
  ArrowRightLeft,
  Info,
} from "lucide-react";
import Modal from "@/components/ui/Modal";

type PaymentMethod = "card" | "bank" | "crypto";

type AddFundsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  currentBalance: number;
};

const AddFundsModal = ({
  isOpen,
  onClose,
  onSuccess,
  currentBalance,
}: AddFundsModalProps) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const paymentMethods = [
    {
      id: "card" as PaymentMethod,
      icon: <CreditCard className="w-5 h-5 text-brand-pixsee-secondary" />,
      title: "Credit/Debit Card",
      subtitle: "Instant • 2.9% + $0.30 fee",
    },
    {
      id: "bank" as PaymentMethod,
      icon: <Building2 className="w-5 h-5 text-semantic-warning-primary" />,
      title: "Bank Account (ACH)",
      subtitle: "1-3 days • Lower fees",
    },
    {
      id: "crypto" as PaymentMethod,
      icon: <Bitcoin className="w-5 h-5 text-brand-primary" />,
      title: "Crypto (USDC, USDT, BTC,ETH)",
      subtitle: "Instant • Network fees apply",
    },
  ];

  const numericAmount = parseFloat(amount) || 0;

  const handleProceed = () => {
    if (numericAmount >= 5) {
      onSuccess(numericAmount);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-1">
          Add Funds
        </h2>
        <p className="text-sm text-neutral-tertiary-text mb-6">
          Convert USD to $PIX
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

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-primary-text mb-2">
            Enter Custom amount
          </label>
          <input
            type="number"
            placeholder="Enter ticket amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary bg-neutral-primary text-neutral-primary-text"
          />
        </div>

        <div className="bg-brand-pixsee-tertiary border-2 border-brand-pixsee-secondary/30 rounded-xl p-4 flex items-center justify-between mb-6">
          <span className="text-neutral-primary-text font-medium">You pay</span>

          <ArrowRightLeft className="w-5 h-5 text-neutral-tertiary-text" />

          <span className="text-2xl font-bold text-neutral-primary-text">
            ${numericAmount.toFixed(2)}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-neutral-primary-text mb-3">
            Payment Method
          </p>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                  paymentMethod === method.id
                    ? "border-brand-pixsee-secondary bg-brand-pixsee-tertiary"
                    : "border-neutral-tertiary-border hover:border-neutral-secondary-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-secondary flex items-center justify-center">
                    {method.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-neutral-primary-text">
                      {method.title}
                    </p>
                    <p className="text-xs text-neutral-tertiary-text">
                      {method.subtitle}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2",
                    paymentMethod === method.id
                      ? "border-brand-pixsee-secondary bg-brand-pixsee-secondary"
                      : "border-neutral-tertiary-border"
                  )}
                >
                  {paymentMethod === method.id && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-neutral-primary" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Proceed Button */}
        <Button
          onClick={handleProceed}
          disabled={numericAmount < 5}
          className="w-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full py-6 gap-2"
        >
          <Wallet className="w-5 h-5" />
          Proceed to payment
        </Button>

        {/* Important Information */}
        <div className="mt-6 p-4 bg-semantic-error-primary/10 rounded-xl border border-semantic-error-primary/30">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-semantic-error-primary shrink-0 mt-0.5" />
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

export default AddFundsModal;
