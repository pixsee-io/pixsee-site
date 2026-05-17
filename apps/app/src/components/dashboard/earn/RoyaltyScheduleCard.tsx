"use client";

import React from "react";
import { Loader2, Calendar, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoyaltySchedule, type RoyaltySchedule } from "@/app/hooks/useSocial";

const OPTIONS: { value: RoyaltySchedule; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "manual",
    label: "Manual",
    description: "Claim whenever you want",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "Auto-claimed every week",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    value: "daily",
    label: "Daily",
    description: "Auto-claimed every day",
    icon: <Zap className="w-4 h-4" />,
  },
];

export function RoyaltyScheduleCard({
  getAccessToken,
}: {
  getAccessToken: () => Promise<string | null>;
}) {
  const { schedule, isLoading, update, isUpdating } = useRoyaltySchedule(getAccessToken);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-neutral-tertiary-text">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading schedule…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-neutral-secondary-text uppercase tracking-wide">
        Auto-claim schedule
      </p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const isActive = schedule === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => update(opt.value)}
              disabled={isUpdating || isActive}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl p-3 border text-center transition-colors",
                isActive
                  ? "bg-brand-primary/10 border-brand-primary text-brand-primary"
                  : "bg-neutral-secondary border-neutral-tertiary-border text-neutral-secondary-text hover:border-neutral-secondary-border disabled:opacity-50"
              )}
            >
              {isUpdating && !isActive ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                opt.icon
              )}
              <span className="text-xs font-semibold leading-none">{opt.label}</span>
              <span className="text-[10px] leading-tight text-neutral-tertiary-text">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
