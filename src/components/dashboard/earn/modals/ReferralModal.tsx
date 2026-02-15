"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Coins, Copy, Check } from "lucide-react";
import Modal from "@/components/ui/Modal";

type ReferralModalProps = {
  isOpen: boolean;
  onClose: () => void;
  referralLink: string;
  referralProgress: {
    current: number;
    total: number;
  };
};

const ReferralModal = ({
  isOpen,
  onClose,
  referralLink,
  referralProgress,
}: ReferralModalProps) => {
  const [copied, setCopied] = useState(false);

  const percentage = (referralProgress.current / referralProgress.total) * 100;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="p-6">
        <div className="refer_bg p-4 mb-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg">
              <Coins className="w-4 h-4" />
              <span className="font-semibold">Earn 1000 TIX</span>
            </div>
          </div>

          <h2 className="text-3xl font-paytone mb-2">Refer & Earn</h2>
          <p className="max-w-xs text-neutral-tertiary-text mb-6">
            Invite friends to Pixsee and earn rewards when they sign up and
            watch shows.
          </p>
        </div>

        {/* Referral Progress */}
        <div className="border border-neutral-tertiary-border rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-neutral-primary-text">
              Referral Progress
            </span>
            <span className="text-neutral-tertiary-text">
              {percentage.toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-neutral-tertiary-text mb-2">
            {referralProgress.current} of {referralProgress.total}
          </p>
          <div className="h-2 bg-neutral-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-semantic-success-primary rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* How it works */}
        <div className="mb-6">
          <h3 className="text-lg font-paytone text-neutral-primary-text mb-4">
            How it works :
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Link2 className="w-5 h-5 text-neutral-tertiary-text" />
              <span className="text-neutral-secondary-text">
                Share your invite link
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link2 className="w-5 h-5 text-neutral-tertiary-text" />
              <span className="text-neutral-secondary-text">
                Share your invite link
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-semantic-warning-primary" />
              <span className="text-neutral-secondary-text">
                You Earn 200 TIX for each referral
              </span>
            </div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="mb-4">
          <h3 className="text-lg font-paytone text-neutral-primary-text mb-3">
            Your Referral link
          </h3>
          <div className="flex items-center gap-2 p-2 border rounded-full">
            <div className="flex-1 flex items-center gap-2 px-4">
              <Link2 className="w-4 h-4 text-neutral-tertiary-text" />
              <span className="text-sm text-neutral-secondary-text truncate">
                {referralLink}
              </span>
            </div>

            <Button
              onClick={handleCopyLink}
              className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-6"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                "Copy link"
              )}
            </Button>
          </div>
        </div>

        {/* View History Link */}
        <div className="text-center">
          <button className="text-neutral-tertiary-text hover:text-neutral-secondary-text underline text-sm">
            View referral History
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReferralModal;
