"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Modal from "@/components/ui/Modal";

type TransactionSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "deposit" | "withdraw";
  amount: number;
};

const TransactionSuccessModal = ({
  isOpen,
  onClose,
  type,
  amount,
}: TransactionSuccessModalProps) => {
  const title = type === "deposit" ? "Transaction Successfully" : "Withdrawal made Successfully";
  const message = type === "deposit" 
    ? `$${amount} has been added to your wallet`
    : `$${amount} has been withdrawn your funds is on its way`;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-semantic-success-primary flex items-center justify-center">
          <Check className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-2xl font-paytone text-neutral-primary-text mb-2">
          {title}
        </h2>
        <p className="text-neutral-tertiary-text mb-8">
          {message}
        </p>

        <Button
          onClick={onClose}
          className="w-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full py-6"
        >
          Go to wallet
        </Button>
      </div>
    </Modal>
  );
};

export default TransactionSuccessModal;