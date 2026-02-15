"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Play, Heart, Flame, Lock, Clock } from "lucide-react";

type QuestStatus = "active" | "completed" | "upcoming";

type Quest = {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  progress?: {
    current: number;
    total: number;
    label: string;
  };
  percentage?: number;
  reward: string;
  status: QuestStatus;
  buttonText?: string;
  buttonColor?: string;
  timeRemaining?: string;
  progressColor?: string;
};

// Mock Data
const overviewStats = [
  {
    label: "Total XP Available",
    value: "6000 TIX",
    subtitle: "From Active Quest",
  },
  { label: "Active Quest", value: "3", subtitle: "Available to Complete" },
  {
    label: "Completion Rate",
    value: "17%",
    subtitle: "1 of 6 quests",
    subtitleColor: "text-semantic-error-primary",
  },
];

const activeQuests: Quest[] = [
  {
    id: "1",
    icon: <Users className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    title: "Referral Champion",
    description: "Refer 3 Friends to pixsee",
    progress: { current: 2, total: 3, label: "Completed" },
    percentage: 70,
    reward: "2000 TIX",
    status: "active",
    buttonText: "Refer Friends",
    buttonColor: "bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover",
    progressColor: "bg-semantic-success-primary",
  },
  {
    id: "2",
    icon: <Play className="w-5 h-5 text-white" />,
    iconBg: "bg-brand-pixsee-secondary",
    title: "Binge Watcher",
    description: "Watch 5 episodes in one day",
    progress: { current: 3, total: 5, label: "Episode" },
    percentage: 100,
    reward: "2000 TIX",
    status: "active",
    buttonText: "Continue watching",
    buttonColor: "bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover",
    timeRemaining: "14d",
    progressColor: "bg-semantic-success-primary",
  },
  {
    id: "3",
    icon: <Heart className="w-5 h-5 text-white" />,
    iconBg: "bg-pink-500",
    title: "Vote Diversifier",
    description: "Vote on shows from 5 different genres",
    progress: { current: 2, total: 5, label: "Votes" },
    percentage: 100,
    reward: "2000 TIX",
    status: "active",
    buttonText: "Vote shows",
    buttonColor: "bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover",
    progressColor: "bg-semantic-warning-primary",
  },
];

const completedQuests: Quest[] = [
  {
    id: "1",
    icon: <Flame className="w-5 h-5 text-semantic-success-text" />,
    iconBg: "bg-semantic-success-subtle",
    title: "3-days Daily Login",
    description: "Log in 3 consecutive days",
    reward: "2000 TIX",
    status: "completed",
  },
];

const upcomingQuests: Quest[] = [
  {
    id: "1",
    icon: <Lock className="w-5 h-5 text-semantic-success-text" />,
    iconBg: "bg-semantic-success-subtle",
    title: "14-days Daily Login",
    description: "Log in 14 consecutive days",
    reward: "2000 TIX",
    status: "upcoming",
  },
];

const QuestTab = () => {
  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {overviewStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl px-4 py-6 border border-neutral-tertiary-border"
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

      {/* Active Quests */}
      <section>
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-4">
          Active Quests
        </h2>
        <div className="space-y-4">
          {activeQuests.map((quest) => (
            <div
              key={quest.id}
              className="bg-white rounded-xl p-5 border border-neutral-tertiary-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      quest.iconBg
                    )}
                  >
                    {quest.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-neutral-primary-text">
                        {quest.title}
                      </p>
                      {quest.timeRemaining && (
                        <span className="flex items-center gap-1 text-xs text-neutral-tertiary-text bg-neutral-secondary px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" />
                          {quest.timeRemaining}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-tertiary-text">
                      {quest.description}
                    </p>
                  </div>
                </div>
                <Button
                  className={cn("rounded-full text-white", quest.buttonColor)}
                >
                  {quest.buttonText}
                </Button>
              </div>

              {quest.progress && (
                <>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-semantic-success-text">
                      {quest.progress.current} of {quest.progress.total}{" "}
                      {quest.progress.label}
                    </span>
                    <span className="text-neutral-tertiary-text">
                      {quest.percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-tertiary rounded-full mb-3 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", quest.progressColor)}
                      style={{ width: `${quest.percentage}%` }}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-tertiary-text">Reward</span>
                <span className="font-semibold text-brand-pixsee-secondary">
                  {quest.reward}
                </span>
                <span className="text-neutral-tertiary-text">•</span>
                <span className="text-neutral-tertiary-text">Watch</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Completed Quests */}
      <section>
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-4">
          Completed Quest
        </h2>
        <div className="space-y-3">
          {completedQuests.map((quest) => (
            <div
              key={quest.id}
              className="bg-white rounded-xl p-4 border border-neutral-tertiary-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    quest.iconBg
                  )}
                >
                  {quest.icon}
                </div>
                <div>
                  <p className="font-semibold text-neutral-primary-text">
                    {quest.title}
                  </p>
                  <p className="text-sm text-neutral-tertiary-text">
                    {quest.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-semantic-success-subtle text-semantic-success-text text-xs rounded-full mb-1">
                  Completed
                </span>
                <p className="font-semibold text-neutral-primary-text">
                  {quest.reward}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Quests */}
      <section>
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-4">
          Upcoming Quest
        </h2>
        <div className="space-y-3">
          {upcomingQuests.map((quest) => (
            <div
              key={quest.id}
              className="bg-white rounded-xl p-4 border border-neutral-tertiary-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    quest.iconBg
                  )}
                >
                  {quest.icon}
                </div>
                <div>
                  <p className="font-semibold text-neutral-tertiary-text">
                    {quest.title}
                  </p>
                  <p className="text-sm text-neutral-tertiary-text">
                    {quest.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-neutral-secondary text-neutral-tertiary-text text-xs rounded-full mb-1">
                  Inactive
                </span>
                <p className="font-semibold text-neutral-tertiary-text">
                  {quest.reward}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default QuestTab;
