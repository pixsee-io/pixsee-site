"use client";

// Creator Royalties — 1% of every TIX trade on a creator's show accumulates
// in that show's ShowFeeDistributor.creatorFeeBalance (USDC, 6 decimals).
// The creator calls claimCreatorFees() to sweep the full balance to their wallet.
// No platform fee is deducted at claim time — the 1/1/1 split already happened on trade.

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createPublicClient, http, formatUnits, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { BASE_SEPOLIA_RPC, SHOW_FEE_DISTRIBUTOR_ABI } from "@/app/lib/pixsee-contracts";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";
import { recordTransaction } from "@/app/lib/apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";

const feeClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC, { batch: true }),
});

type CreatorShow = { id: number; title: string; fee_distributor: string | null; deployment_block?: number | null };
type ShowFeeEntry = {
  show: CreatorShow;
  creatorBalance: bigint;
  totalClaimedUsdc: bigint;
  isClaiming: boolean;
};

export function CreatorRoyaltiesSection({
  getAccessToken,
  onTotalLoaded,
  onClaimed,
}: {
  getAccessToken: () => Promise<string | null>;
  onTotalLoaded?: (totalUsdc: string) => void;
  onClaimed?: () => void;
}) {
  const { claimCreatorFees, walletAddress } = usePixseeContract();
  const [entries, setEntries] = useState<ShowFeeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const token = await getAccessToken();
        const res = await fetch(`${BASE_URL}/api/v1/my-shows`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const json = await res.json();
        const shows: CreatorShow[] = (json?.data ?? json?.shows ?? json ?? []).filter(
          (s: CreatorShow) => s.fee_distributor
        );

        const results = await Promise.all(
          shows.map(async (show) => {
            try {
              const [balances, claimsRes] = await Promise.all([
                feeClient.readContract({
                  address: show.fee_distributor as Address,
                  abi: SHOW_FEE_DISTRIBUTOR_ABI,
                  functionName: "getBalances",
                }) as Promise<readonly [bigint, bigint]>,
                fetch(`${BASE_URL}/api/v1/shows/${show.id}/fee-claims`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }).then((r) => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
              ]);

              const claimsData: { amount_usdc: string }[] = claimsRes?.data ?? [];
              const totalClaimedUsdc = claimsData.reduce(
                (sum, c) => sum + BigInt(Math.round(parseFloat(c.amount_usdc) * 1_000_000)),
                0n
              );

              return {
                show,
                creatorBalance: balances[0],
                totalClaimedUsdc,
                isClaiming: false,
              };
            } catch {
              return { show, creatorBalance: 0n, totalClaimedUsdc: 0n, isClaiming: false };
            }
          })
        );

        if (!cancelled) {
          setEntries(results);
          if (onTotalLoaded) {
            const pendingRaw = results.reduce((sum, e) => sum + e.creatorBalance, 0n);
            onTotalLoaded(parseFloat(formatUnits(pendingRaw, 6)).toFixed(4));
          }
        }
      } catch {
        // silently ignore
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [getAccessToken]);

  const handleClaim = async (index: number) => {
    const entry = entries[index];
    if (!entry.show.fee_distributor) return;
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, isClaiming: true } : e)));
    const tx = await claimCreatorFees(entry.show.fee_distributor as Address);
    setEntries((prev) =>
      prev.map((e, i) =>
        i === index
          ? {
              ...e,
              isClaiming: false,
              totalClaimedUsdc: tx ? e.totalClaimedUsdc + e.creatorBalance : e.totalClaimedUsdc,
              creatorBalance: tx ? 0n : e.creatorBalance,
            }
          : e
      )
    );
    if (tx) {
      const token = await getAccessToken().catch(() => null);
      recordTransaction(token, {
        type: "creator_fees_claimed",
        show_id: entry.show.id,
        tx_hash: tx,
        usdc_amount: formatUnits(entry.creatorBalance, 6),
        fee_distributor_address: entry.show.fee_distributor,
        wallet_address: walletAddress,
      });
    }
    // Update card total after claim
    if (tx && onTotalLoaded) {
      const updated = entries.map((e, i) =>
        i === index ? { ...e, creatorBalance: 0n } : e
      );
      const pendingRaw = updated.reduce((sum, e) => sum + e.creatorBalance, 0n);
      onTotalLoaded(parseFloat(formatUnits(pendingRaw, 6)).toFixed(4));
    }
    // Trigger parent refetch so transactions-derived totals stay fresh
    if (tx) onClaimed?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-neutral-tertiary-text">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-tertiary-text italic py-2">
        No on-chain shows yet. Trading fees accumulate once your show has TIX activity.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const hasPending = entry.creatorBalance > 0n;
        const pendingUsdc = parseFloat(formatUnits(entry.creatorBalance, 6));
        const totalClaimed = parseFloat(formatUnits(entry.totalClaimedUsdc, 6));

        return (
          <div
            key={entry.show.id}
            className="bg-neutral-secondary rounded-xl p-4 border border-neutral-tertiary-border"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-neutral-primary-text truncate">
                  {entry.show.title}
                </p>

                {hasPending ? (
                  <p className="text-xs text-neutral-secondary-text mt-1">
                    Pending:{" "}
                    <span className="font-medium text-brand-primary">
                      ${pendingUsdc.toFixed(4)} USDC
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-semantic-success-text mt-1">
                    Up to date — no pending fees
                  </p>
                )}

                {totalClaimed > 0 && (
                  <p className="text-xs text-neutral-tertiary-text mt-1">
                    Total claimed:{" "}
                    <span className="font-medium text-semantic-success-text">
                      ${totalClaimed.toFixed(4)} USDC
                    </span>
                  </p>
                )}
              </div>

              <div className="shrink-0">
                {hasPending ? (
                  <button
                    onClick={() => handleClaim(index)}
                    disabled={entry.isClaiming}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {entry.isClaiming ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Claiming…</>
                    ) : (
                      "Claim as USDC"
                    )}
                  </button>
                ) : totalClaimed > 0 ? (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-semantic-success-subtle text-semantic-success-text font-medium">
                    Claimed
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
