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
      {/* Overview Stats — 1 col on mobile, 3 on md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {overviewStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl px-4 py-5 sm:py-6 border border-neutral-tertiary-border"
          >
            <p className="text-sm text-neutral-tertiary-text mb-1">
              {stat.label}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-neutral-primary-text mb-1">
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
              className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-tertiary-border"
            >
              {/* Top row: icon+info on left, button on right (stacks on mobile) */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      quest.iconBg
                    )}
                  >
                    {quest.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
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

                {/* Button — full width on mobile, auto on sm+ */}
                <Button
                  className={cn(
                    "rounded-full text-white text-sm w-full sm:w-auto flex-shrink-0",
                    quest.buttonColor
                  )}
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

              <div className="flex items-center gap-2 text-sm flex-wrap">
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
              className="bg-white rounded-xl p-4 border border-neutral-tertiary-border"
            >
              {/* Stack on mobile, row on sm+ */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      quest.iconBg
                    )}
                  >
                    {quest.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-primary-text truncate">
                      {quest.title}
                    </p>
                    <p className="text-sm text-neutral-tertiary-text">
                      {quest.description}
                    </p>
                  </div>
                </div>
                {/* Badge + reward — left-aligned on mobile, right-aligned on sm+ */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 flex-shrink-0">
                  <span className="inline-block px-3 py-1 bg-semantic-success-subtle text-semantic-success-text text-xs rounded-full">
                    Completed
                  </span>
                  <p className="font-semibold text-neutral-primary-text text-sm">
                    {quest.reward}
                  </p>
                </div>
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
              className="bg-white rounded-xl p-4 border border-neutral-tertiary-border"
            >
              {/* Stack on mobile, row on sm+ */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      quest.iconBg
                    )}
                  >
                    {quest.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-tertiary-text truncate">
                      {quest.title}
                    </p>
                    <p className="text-sm text-neutral-tertiary-text">
                      {quest.description}
                    </p>
                  </div>
                </div>
                {/* Badge + reward — left-aligned on mobile, right-aligned on sm+ */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 flex-shrink-0">
                  <span className="inline-block px-3 py-1 bg-neutral-secondary text-neutral-tertiary-text text-xs rounded-full">
                    Inactive
                  </span>
                  <p className="font-semibold text-neutral-tertiary-text text-sm">
                    {quest.reward}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default QuestTab;
