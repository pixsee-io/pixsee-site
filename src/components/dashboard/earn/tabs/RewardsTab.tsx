"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Play, LogIn, Flame, Lock } from "lucide-react";

type RewardStatus = "claimable" | "claimed" | "locked" | "in-progress";

type RewardItem = {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  progress: string;
  percentage: number;
  reward: string;
  status: RewardStatus;
  progressColor: string;
  buttonColor: string;
};

type ClaimedReward = {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  reward: string;
};

type LockedReward = {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  requirement: string;
  reward: string;
};

// Mock Data
const overviewStats = [
  {
    label: "Available to Claim",
    value: "12,450",
    subtitle: "3 rewards waiting",
  },
  { label: "Total Claimed", value: "2", subtitle: "Rewards received" },
  {
    label: "Active Boosters",
    value: "2",
    subtitle: "1.5x XP Multiplier",
    subtitleColor: "text-semantic-success-text",
  },
];

const nextRewards: RewardItem[] = [
  {
    id: "1",
    icon: <Users className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    title: "Referral Champion",
    progress: "Completed",
    percentage: 100,
    reward: "2000 TIX",
    status: "claimable",
    progressColor: "bg-semantic-success-primary",
    buttonColor: "bg-semantic-success-primary hover:bg-semantic-success-text",
  },
  {
    id: "2",
    icon: <Play className="w-5 h-5 text-white" />,
    iconBg: "bg-brand-primary",
    title: "Binge Watcher",
    progress: "2000 / 2000",
    percentage: 100,
    reward: "2000 TIX",
    status: "claimable",
    progressColor: "bg-semantic-success-primary",
    buttonColor: "bg-brand-primary hover:bg-brand-primary-dark",
  },
  {
    id: "3",
    icon: <LogIn className="w-5 h-5 text-pink-500" />,
    iconBg: "bg-pink-100",
    title: "Signup",
    progress: "Completed",
    percentage: 100,
    reward: "2000 TIX",
    status: "claimable",
    progressColor: "bg-semantic-warning-primary",
    buttonColor: "bg-pink-500 hover:bg-pink-600",
  },
  {
    id: "4",
    icon: <Flame className="w-5 h-5 text-brand-primary" />,
    iconBg: "bg-brand-tertiary",
    title: "7-day Streak",
    progress: "7 / 7",
    percentage: 60,
    reward: "2000 TIX",
    status: "claimable",
    progressColor: "bg-semantic-success-primary",
    buttonColor: "bg-semantic-success-primary hover:bg-semantic-success-text",
  },
];

const claimedRewards: ClaimedReward[] = [
  {
    id: "1",
    icon: <Users className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    title: "Referral champions",
    description: "Accumulated referral earnings",
    reward: "2000 TIX",
  },
  {
    id: "2",
    icon: <Flame className="w-5 h-5 text-brand-primary" />,
    iconBg: "bg-brand-tertiary",
    title: "3-days Daily Login",
    description: "Accumulated referral earnings",
    reward: "2000 TIX",
  },
];

const lockedRewards: LockedReward[] = [
  {
    id: "1",
    icon: <Lock className="w-5 h-5 text-pink-500" />,
    iconBg: "bg-pink-100",
    title: "Elite Tier (2x)",
    requirement: "Requires 50,000 XP to unlock",
    reward: "2000 TIX",
  },
];

type RewardsTabProps = {
  onClaimReward: (reward: RewardItem) => void;
};

const RewardsTab = ({ onClaimReward }: RewardsTabProps) => {
  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {overviewStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 border border-neutral-tertiary-border"
          >
            <p className="text-sm text-neutral-tertiary-text mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-neutral-primary-text mb-1">
              {stat.value}
            </p>
            <p
              className={cn(
                "text-sm",
                stat.subtitleColor || "text-neutral-tertiary-text"
              )}
            >
              {stat.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Your Next Rewards */}
      <section>
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-4">
          Your Next Rewards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextRewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-white rounded-xl p-4 border border-neutral-tertiary-border"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  reward.iconBg
                )}
              >
                {reward.icon}
              </div>

              <p className="font-semibold text-neutral-primary-text mb-2">
                {reward.title}
              </p>

              <div className="flex items-center justify-between text-sm mb-2">
                <span
                  className={cn(
                    reward.status === "claimable"
                      ? "text-semantic-success-text"
                      : "text-neutral-secondary-text"
                  )}
                >
                  {reward.progress}
                </span>
                <span className="text-neutral-tertiary-text">
                  {reward.percentage}%
                </span>
              </div>

              <div className="h-1.5 bg-neutral-tertiary rounded-full mb-3 overflow-hidden">
                <div
                  className={cn("h-full rounded-full", reward.progressColor)}
                  style={{ width: `${reward.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-neutral-tertiary-text">Reward</span>
                <span className="font-semibold text-neutral-primary-text">
                  {reward.reward}
                </span>
              </div>

              <Button
                onClick={() => onClaimReward(reward)}
                className={cn(
                  "w-full rounded-full text-white",
                  reward.buttonColor
                )}
              >
                Claim Reward
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Claimed Rewards */}
      <section>
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-4">
          Claimed Reward
        </h2>
        <div className="space-y-3">
          {claimedRewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-white rounded-xl p-3 sm:p-4 border border-neutral-tertiary-border flex items-center justify-between"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={cn(
                    "p-2 rounded-full flex items-center justify-center",
                    reward.iconBg
                  )}
                >
                  {reward.icon}
                </div>
                <div>
                  <p className="text-sm md:text-base font-semibold text-neutral-primary-text">
                    {reward.title}
                  </p>
                  <p className="text-xs md:text-sm text-neutral-tertiary-text">
                    {reward.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-semantic-success-subtle text-semantic-success-text text-xs rounded-full mb-1">
                  Claimed
                </span>
                <p className="text-xs md:text-sm font-semibold text-neutral-primary-text">
                  {reward.reward}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Locked Rewards */}
      <section>
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-4">
          Locked Reward
        </h2>
        <div className="space-y-3">
          {lockedRewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-white rounded-xl p-4 border border-neutral-tertiary-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-full flex items-center justify-center",
                    reward.iconBg
                  )}
                >
                  {reward.icon}
                </div>
                <div>
                  <p className="text-sm md:text-base font-bold text-neutral-tertiary-text">
                    {reward.title}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-tertiary-text">
                    {reward.requirement}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-pink-50 text-pink-400 text-xs rounded-full mb-1">
                  Locked
                </span>
                <p className="text-xs md:text-base font-semibold text-neutral-tertiary-text">
                  {reward.reward}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RewardsTab;
