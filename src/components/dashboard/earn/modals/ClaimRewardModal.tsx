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
      <div className="p-6">
        {/* Gift Icon */}
        <div className="flex justify-center mb-4">
          <div className="text-6xl">🎁</div>
        </div>

        <h2 className="text-2xl font-paytone text-neutral-primary-text text-center mb-2">
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
              <span className="inline-block px-3 py-1 bg-white text-brand-pixsee-secondary text-xs rounded-full mb-2">
                Unclaimed
              </span>
              <p className="text-2xl font-bold text-neutral-primary-text">
                +{reward.tixAmount.toLocaleString()}{" "}
                <span className="text-sm font-normal">TIX</span>
              </p>
            </div>
          </div>
        </div>

        {/* Conversion Display */}
        <div className="bg-brand-pixsee-tertiary border-2 border-brand-pixsee-secondary/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-neutral-secondary-text" />
              <div>
                <p className="font-bold text-neutral-primary-text">
                  {reward.tixAmount.toLocaleString()} Tix
                </p>
                <p className="text-xs text-neutral-tertiary-text">
                  Reward will be credited instantly
                </p>
              </div>
            </div>
            <ArrowRightLeft className="w-5 h-5 text-neutral-tertiary-text" />
            <p className="text-2xl font-bold text-neutral-primary-text">
              $ {reward.usdAmount.toFixed(2)}
            </p>
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
