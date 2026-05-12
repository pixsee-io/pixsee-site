"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRightLeft } from "lucide-react";
import Modal from "@/components/ui/Modal";

type ClaimRewardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
  reward: {
    title: string;
    progress: string;
    tixAmount: number;
    usdAmount: number;
  };
};

const ClaimRewardModal = ({
  isOpen,
  onClose,
  onClaim,
  reward,
}: ClaimRewardModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6">
        {/* Gift Icon */}
        <div className="flex justify-center mb-4">
          <div className="text-6xl">🎁</div>
        </div>

        <h2 className="text-xl sm:text-2xl font-paytone text-neutral-primary-text text-center mb-2">
          Claim Reward
        </h2>
        <p className="text-neutral-tertiary-text text-center mb-6">
          You've completed this reward. Confirm to add it to your wallet.
        </p>

        {/* Reward Details */}
        <div className="bg-brand-pixsee-tertiary border-2 border-brand-pixsee-secondary/30 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-tertiary-text mb-1">Reward</p>
              <p className="font-semibold text-neutral-primary-text">
                {reward.title}
              </p>
              <p className="text-sm text-neutral-tertiary-text">
                {reward.progress}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-neutral-primary text-brand-pixsee-secondary text-xs rounded-full mb-2">
                Unclaimed
              </span>
              <p className="text-2xl font-bold text-neutral-primary-text">
                +{reward.tixAmount.toLocaleString()}{" "}
                <span className="text-sm font-normal">PIX</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onClaim}
            className="w-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full py-6"
          >
            Claim Reward
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-full py-6 border-neutral-tertiary-border"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ClaimRewardModal;
