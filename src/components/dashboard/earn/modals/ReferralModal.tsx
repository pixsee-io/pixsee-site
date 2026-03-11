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
      <div className="p-4 sm:p-6">
        {/* Hero banner */}
        <div className="refer_bg p-4 mb-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 bg-white text-black px-3 sm:px-4 py-2 rounded-lg">
              <Coins className="w-4 h-4 shrink-0" />
              <span className="font-semibold text-sm sm:text-base">
                Earn 1000 TIX
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-paytone mb-2">
            Refer & Earn
          </h2>
          <p className="text-sm sm:text-base text-neutral-tertiary-text mb-4 sm:mb-6 max-w-xs">
            Invite friends to Pixsee and earn rewards when they sign up and
            watch shows.
          </p>
        </div>

        {/* Referral Progress */}
        <div className="border border-neutral-tertiary-border rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm sm:text-base text-neutral-primary-text">
              Referral Progress
            </span>
            <span className="text-sm text-neutral-tertiary-text">
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
          <h3 className="text-base sm:text-lg font-paytone text-neutral-primary-text mb-4">
            How it works :
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Link2 className="w-5 h-5 text-neutral-tertiary-text shrink-0" />
              <span className="text-sm sm:text-base text-neutral-secondary-text">
                Share your invite link
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link2 className="w-5 h-5 text-neutral-tertiary-text shrink-0" />
              <span className="text-sm sm:text-base text-neutral-secondary-text">
                Share your invite link
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-semantic-warning-primary shrink-0" />
              <span className="text-sm sm:text-base text-neutral-secondary-text">
                You Earn 200 TIX for each referral
              </span>
            </div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-paytone text-neutral-primary-text mb-3">
            Your Referral link
          </h3>

          {/* Pill row: truncated link + copy button.
              On very small screens the button stays readable because
              the link side just shrinks via min-w-0 + truncate. */}
          <div className="flex items-center gap-2 p-1.5 sm:p-2 border rounded-full">
            <div className="flex-1 flex items-center gap-2 px-2 sm:px-4 min-w-0">
              <Link2 className="w-4 h-4 text-neutral-tertiary-text shrink-0" />
              <span className="text-xs sm:text-sm text-neutral-secondary-text truncate">
                {referralLink}
              </span>
            </div>

            <Button
              onClick={handleCopyLink}
              className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-4 sm:px-6 text-xs sm:text-sm shrink-0 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 sm:hidden" />
                  <span className="hidden sm:inline">Copy link</span>
                  <span className="sm:hidden">Copy</span>
                </>
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
