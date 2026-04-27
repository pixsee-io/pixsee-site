"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Wallet, Coins, Info, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useWallets } from "@privy-io/react-auth";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseUnits,
  formatUnits,
  type Address,
} from "viem";
import { baseSepolia } from "viem/chains";
import { CONTRACT_ADDRESSES, ERC20_ABI } from "@/app/lib/pixsee-contracts";

type WithdrawModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  currentBalance: number;
};

const quickAmounts = [10, 25, 50, 100];

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const WithdrawModal = ({
  isOpen,
  onClose,
  onSuccess,
  currentBalance,
}: WithdrawModalProps) => {
  const { wallets } = useWallets();
  const [amount, setAmount] = useState("");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [toAddress, setToAddress] = useState("");
  const [step, setStep] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numericAmount = selectedQuickAmount ?? (parseFloat(amount) || 0);
  const isValidAddress = toAddress.startsWith("0x") && toAddress.length === 42;
  const canProceed = numericAmount >= 1 && numericAmount <= currentBalance && isValidAddress;

  const activeWallet =
    wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];

  const handleWithdraw = async () => {
    if (!canProceed || !activeWallet) return;

    setStep("sending");
    setErrorMsg(null);

    try {
      await activeWallet.switchChain(baseSepolia.id);
      const provider = await activeWallet.getEthereumProvider();
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(provider),
        account: activeWallet.address as Address,
      });

      // USDC has 6 decimals
      const usdcAmount = parseUnits(numericAmount.toString(), 6);

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.usdc as Address,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [toAddress as Address, usdcAmount],
        gas: 100_000n,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      setStep("success");
      onSuccess(numericAmount);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setErrorMsg(msg.includes("User rejected") ? "Transaction cancelled." : "Transfer failed. Check your balance and try again.");
      setStep("error");
    }
  };

  const handleClose = () => {
    setStep("idle");
    setAmount("");
    setSelectedQuickAmount(null);
    setToAddress("");
    setTxHash(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        {step === "success" ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-semantic-success-primary flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-2">Withdrawal Sent</h2>
            <p className="text-sm text-neutral-tertiary-text mb-2">
              ${numericAmount.toFixed(2)} USDC sent to
            </p>
            <p className="text-xs font-mono text-neutral-tertiary-text mb-4 break-all">{toAddress}</p>
            {txHash && (
              <a
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-pixsee-secondary underline mb-6 inline-block"
              >
                View on Basescan →
              </a>
            )}
            <Button onClick={handleClose} className="w-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full py-6 mt-4">
              Done
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-1">Withdraw USDC</h2>
            <p className="text-sm text-neutral-tertiary-text mb-6">Send USDC to any wallet address</p>

            {/* Current Balance */}
            <div className="bg-brand-pixsee-tertiary border-2 border-brand-pixsee-secondary/30 rounded-xl p-4 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-neutral-secondary-text" />
                <span className="text-neutral-primary-text font-medium">Available Balance</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-brand-pixsee-secondary" />
                <span className="text-xl font-bold text-neutral-primary-text">${currentBalance.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick amounts */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-neutral-primary-text mb-3">Quick amount</p>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((value) => (
                  <button
                    key={value}
                    onClick={() => { setSelectedQuickAmount(value); setAmount(""); }}
                    disabled={value > currentBalance}
                    className={cn(
                      "py-4 rounded-xl border text-center font-semibold transition-all text-sm",
                      selectedQuickAmount === value
                        ? "border-brand-pixsee-secondary bg-brand-pixsee-tertiary text-brand-pixsee-secondary"
                        : "border-neutral-tertiary-border text-brand-pixsee-secondary hover:border-brand-pixsee-secondary",
                      value > currentBalance && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    ${value}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="mb-4">
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

            {/* Destination address */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                Destination wallet address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value.trim())}
                className={cn(
                  "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary bg-neutral-primary text-neutral-primary-text font-mono text-sm",
                  toAddress && !isValidAddress
                    ? "border-semantic-error-primary"
                    : "border-neutral-tertiary-border"
                )}
              />
              {toAddress && !isValidAddress && (
                <p className="text-xs text-semantic-error-primary mt-1">Enter a valid 0x wallet address</p>
              )}
            </div>

            {/* Summary */}
            {numericAmount > 0 && isValidAddress && (
              <div className="bg-brand-pixsee-tertiary border border-brand-pixsee-secondary/30 rounded-xl p-4 mb-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-secondary-text">You send</span>
                  <span className="font-semibold text-neutral-primary-text">${numericAmount.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-secondary-text">To</span>
                  <span className="font-mono text-neutral-tertiary-text text-xs">{toAddress.slice(0, 8)}…{toAddress.slice(-6)}</span>
                </div>
              </div>
            )}

            {/* Error */}
            {step === "error" && errorMsg && (
              <div className="flex items-start gap-2 p-3 bg-semantic-error-primary/10 border border-semantic-error-primary/30 rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 text-semantic-error-primary shrink-0 mt-0.5" />
                <p className="text-sm text-semantic-error-primary">{errorMsg}</p>
              </div>
            )}

            {/* Info */}
            <div className="mb-5 p-4 bg-semantic-error-primary/10 rounded-xl border border-semantic-error-primary/30">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-semantic-error-primary shrink-0 mt-0.5" />
                <ul className="text-xs text-neutral-secondary-text space-y-0.5">
                  <li>• Sends USDC on Base Sepolia</li>
                  <li>• Minimum: $1.00 · No platform fee</li>
                  <li>• Transaction is irreversible — double-check the address</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 rounded-full py-6 border-neutral-tertiary-border">
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={!canProceed || step === "sending"}
                className="flex-1 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full py-6 gap-2"
              >
                {step === "sending" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : (
                  <><Wallet className="w-4 h-4" /> Withdraw</>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default WithdrawModal;
