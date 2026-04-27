"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type VoteAllocation = {
  id: string;
  showTitle: string;
  thumbnailUrl: string;
  episodeCount: number;
  apr: string;
  totalVotes: string;
  earnings: string;
};

// Mock data — replace with real API data when voting endpoint is available
const claimableAmount = "$48.32";
const totalPixVoted = "2,000";
const showsVotedCount = 3;
const averageApr = "27.2%";

const allocations: VoteAllocation[] = [
  {
    id: "1",
    showTitle: "Quantum Dreams: Genesis",
    thumbnailUrl: "/images/movie1.png",
    episodeCount: 120,
    apr: "18.4%",
    totalVotes: "500 PIX",
    earnings: "$10.40",
  },
  {
    id: "2",
    showTitle: "Quantum Dreams: Genesis",
    thumbnailUrl: "/images/movie1.png",
    episodeCount: 120,
    apr: "18.4%",
    totalVotes: "500 PIX",
    earnings: "$10.40",
  },
  {
    id: "3",
    showTitle: "Quantum Dreams: Genesis",
    thumbnailUrl: "/images/movie1.png",
    episodeCount: 120,
    apr: "18.4%",
    totalVotes: "500 PIX",
    earnings: "$10.40",
  },
];

const VotingTab = () => {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-primary rounded-2xl p-5 border border-neutral-tertiary-border">
          <p className="text-sm text-neutral-tertiary-text mb-2">Claimable Now</p>
          <p className="text-3xl font-bold text-neutral-primary-text mb-1">{claimableAmount}</p>
          <p className="text-xs text-neutral-tertiary-text">USDC · Ready to claim</p>
        </div>

        <div className="bg-neutral-primary rounded-2xl p-5 border border-neutral-tertiary-border">
          <p className="text-sm text-neutral-tertiary-text mb-2">Total PIX Voted</p>
          <p className="text-3xl font-bold text-neutral-primary-text mb-1">
            {totalPixVoted}
            <span className="text-base font-medium text-neutral-tertiary-text ml-1">PIX</span>
          </p>
          <p className="text-xs text-semantic-success-text">Across {showsVotedCount} shows</p>
        </div>

        <div className="bg-neutral-primary rounded-2xl p-5 border border-neutral-tertiary-border">
          <p className="text-sm text-neutral-tertiary-text mb-2">Average APR</p>
          <p className="text-3xl font-bold text-neutral-primary-text mb-1">{averageApr}</p>
          <p className="text-xs text-neutral-tertiary-text">Daily earnings</p>
        </div>
      </div>

      {/* Active Vote Allocations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-paytone text-neutral-primary-text">
            Active Vote Allocations
          </h2>
          <Link
            href="/dashboard/watch"
            className="text-sm text-brand-pixsee-secondary hover:underline font-medium whitespace-nowrap"
          >
            Vote for more shows
          </Link>
        </div>

        <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-neutral-tertiary-border">
            <span className="text-xs font-semibold text-neutral-tertiary-text uppercase tracking-wide">Shows</span>
            <span className="text-xs font-semibold text-neutral-tertiary-text uppercase tracking-wide w-20 text-center">APR</span>
            <span className="text-xs font-semibold text-neutral-tertiary-text uppercase tracking-wide w-28 text-center">Total Votes</span>
            <span className="text-xs font-semibold text-neutral-tertiary-text uppercase tracking-wide w-20 text-right">Earnings</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-neutral-tertiary-border">
            {allocations.map((allocation) => (
              <div
                key={allocation.id}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-neutral-secondary transition-colors"
              >
                {/* Show info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-tertiary">
                    <Image
                      src={allocation.thumbnailUrl}
                      alt={allocation.showTitle}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-neutral-primary-text truncate">
                      {allocation.showTitle}
                    </p>
                    <p className="text-xs text-neutral-tertiary-text mt-0.5">
                      {allocation.episodeCount} Eps
                    </p>
                  </div>
                </div>

                {/* APR */}
                <span className="text-sm font-medium text-neutral-primary-text w-20 text-center">
                  {allocation.apr}
                </span>

                {/* Total Votes */}
                <span className="text-sm font-medium text-neutral-primary-text w-28 text-center">
                  {allocation.totalVotes}
                </span>

                {/* Earnings */}
                <span className="text-sm font-semibold text-semantic-success-text w-20 text-right">
                  {allocation.earnings}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claim Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-pixsee-secondary/10 border border-brand-pixsee-secondary/20 rounded-2xl px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <p className="font-bold text-base text-neutral-primary-text">
            Ready to claim {claimableAmount} as USDC
          </p>
          <p className="text-sm text-neutral-tertiary-text mt-0.5">
            Direct stablecoin payout — no swaps, no slippage
          </p>
        </div>
        <Button className="shrink-0 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-6 gap-2">
          Claim USDC
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default VotingTab;
