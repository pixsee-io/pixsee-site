"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Wallet, Coins, Info, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useFundWallet, useWallets } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";
import { CONTRACT_ADDRESSES } from "@/app/lib/pixsee-contracts";

type AddFundsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  currentBalance: number;
};

const quickAmounts = [10, 25, 50, 100];

const AddFundsModal = ({
  isOpen,
  onClose,
  onSuccess,
  currentBalance,
}: AddFundsModalProps) => {
  const { wallets } = useWallets();
  const { fundWallet } = useFundWallet();
  const [amount, setAmount] = useState("");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const numericAmount = selectedQuickAmount ?? (parseFloat(amount) || 0);
  const canProceed = numericAmount >= 1;

  const activeWallet = wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];
  const walletAddress = activeWallet?.address;

  const handleFund = async () => {
    if (!canProceed || !walletAddress) {
      console.warn("[Fund] blocked — canProceed:", canProceed, "walletAddress:", walletAddress);
      return;
    }
    setIsLoading(true);
    try {
      console.log("[Fund] calling fundWallet for", walletAddress, "amount:", numericAmount);
      await fundWallet({
        address: walletAddress,
        options: {
          chain: baseSepolia,
          amount: numericAmount.toString(),
          asset: { erc20: CONTRACT_ADDRESSES.usdc as `0x${string}` },
        },
      });
      onSuccess(numericAmount);
      handleClose();
    } catch (err) {
      console.error("[Fund] fundWallet threw:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setSelectedQuickAmount(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-1">
          Fund Wallet
        </h2>
        <p className="text-sm text-neutral-tertiary-text mb-6">
          Add USDC to your Pixsee wallet via card, bank, or crypto
        </p>

        {/* Current Balance */}
        <div className="bg-brand-pixsee-tertiary border-2 border-brand-pixsee-secondary/30 rounded-xl p-4 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-neutral-secondary-text" />
            <span className="text-neutral-primary-text font-medium">Current Balance</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-brand-pixsee-secondary" />
            <span className="text-xl font-bold text-neutral-primary-text">
              ${currentBalance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Quick amounts */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-neutral-primary-text mb-3">
            Quick amount
          </p>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((value) => (
              <button
                key={value}
                onClick={() => { setSelectedQuickAmount(value); setAmount(""); }}
                className={cn(
                  "py-4 rounded-xl border text-center font-semibold transition-all text-sm",
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

        {/* Custom amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-primary-text mb-2">
            Or enter custom amount (USDC)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setSelectedQuickAmount(null); }}
            className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary bg-neutral-primary text-neutral-primary-text"
          />
        </div>

        {/* Summary */}
        {numericAmount > 0 && (
          <div className="bg-brand-pixsee-tertiary border border-brand-pixsee-secondary/30 rounded-xl p-4 mb-5 flex items-center justify-between text-sm">
            <span className="text-neutral-secondary-text">You add</span>
            <span className="font-bold text-neutral-primary-text text-base">
              ${numericAmount.toFixed(2)} USDC
            </span>
          </div>
        )}

        {/* Info */}
        <div className="mb-5 p-4 bg-semantic-error-primary/10 rounded-xl border border-semantic-error-primary/30">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-semantic-error-primary shrink-0 mt-0.5" />
            <ul className="text-xs text-neutral-secondary-text space-y-0.5">
              <li>• Powered by Privy — pay via card, bank transfer, or crypto</li>
              <li>• USDC is added directly to your embedded wallet</li>
              <li>• Use USDC to unlock premium content on Pixsee</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleFund}
          disabled={!canProceed || isLoading}
          className="w-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full py-6 gap-2"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Opening payment…</>
          ) : (
            <><Wallet className="w-4 h-4" /> Fund Wallet</>
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default AddFundsModal;
