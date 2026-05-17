"use client";

// Box Office Revenue (viewer unlock payments):
//   When a viewer unlocks an episode using TIX, 90% of those TIX accumulate as
//   `pendingRoyaltyTix` in the ShowContract. The remaining 10% is rebated to the viewer.
//   When the creator calls claimRoyalties(), the contract sells all pending TIX through
//   the bonding curve, automatically deducts 7% as a platform fee (sent to platformTreasury),
//   and transfers the remaining 93% to the creator's wallet as USDC.

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createPublicClient, http, formatUnits, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { BASE_SEPOLIA_RPC } from "@/app/lib/pixsee-contracts";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";
import { recordTransaction } from "@/app/lib/apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";

const royaltyClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC),
});

const GET_PENDING_ROYALTY_ABI = [
  {
    name: "getPendingRoyaltyTix",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const GET_CURVE_STATE_ABI = [
  {
    name: "getCurveState",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "spotPricePerToken", type: "uint256" },
      { name: "spotPricePerMinute", type: "uint256" },
      { name: "currentHalfSupply", type: "uint256" },
    ],
  },
] as const;

type CreatorShow = { id: number; title: string; show_contract: string | null; bonding_curve: string | null; deployment_block?: number | null };
type ShowRoyalty = {
  show: CreatorShow;
  pendingTix: bigint;
  spotPricePerToken: bigint;
  totalClaimedUsdc: bigint;
  hasClaimed: boolean;
  isClaiming: boolean;
};

export function CreatorRoyaltiesSection({
  getAccessToken,
  onTotalsLoaded,
  claimedByShowId,
  onClaimed,
}: {
  getAccessToken: () => Promise<string | null>;
  onTotalsLoaded?: (pendingGrossUsdc: string, totalClaimedUsdc: string) => void;
  /** Per-show total claimed USDC derived from the transactions list (more reliable than royalties-claims API) */
  claimedByShowId?: Record<number, number>;
  /** Called after a successful claim so the parent can refetch transactions */
  onClaimed?: () => void;
}) {
  const { claimRoyalties, walletAddress } = usePixseeContract();
  const [royalties, setRoyalties] = useState<ShowRoyalty[]>([]);
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
        const shows: CreatorShow[] = (
          json?.data ?? json?.shows ?? json ?? []
        ).filter((s: CreatorShow) => s.show_contract);

        const results = await Promise.all(
          shows.map(async (show) => {
            try {
              const [tix, claimsRes, curveState] = await Promise.all([
                royaltyClient.readContract({
                  address: show.show_contract as Address,
                  abi: GET_PENDING_ROYALTY_ABI,
                  functionName: "getPendingRoyaltyTix",
                }) as Promise<bigint>,
                fetch(`${BASE_URL}/api/v1/shows/${show.id}/royalties-claims`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }).then((r) => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
                show.bonding_curve
                  ? (royaltyClient.readContract({
                      address: show.bonding_curve as Address,
                      abi: GET_CURVE_STATE_ABI,
                      functionName: "getCurveState",
                    }) as Promise<readonly [bigint, bigint, bigint]>).catch(() => null)
                  : Promise.resolve(null),
              ]);

              // royalties-claims API currently returns empty; use the transactions-derived total if available
              const claimsData: { amount_usdc: string }[] = claimsRes?.data ?? [];
              const apiClaimedUsdc = claimsData.reduce(
                (sum, c) => sum + BigInt(Math.round(parseFloat(c.amount_usdc) * 1_000_000)),
                0n
              );
              const txClaimedUsdc = claimedByShowId?.[show.id] != null
                ? BigInt(Math.round(claimedByShowId[show.id] * 1_000_000))
                : 0n;
              const totalClaimedUsdc = txClaimedUsdc > apiClaimedUsdc ? txClaimedUsdc : apiClaimedUsdc;

              return {
                show,
                pendingTix: tix,
                spotPricePerToken: curveState?.[0] ?? 0n,
                totalClaimedUsdc,
                hasClaimed: totalClaimedUsdc > 0n || claimsData.length > 0,
                isClaiming: false,
              };
            } catch {
              return {
                show,
                pendingTix: 0n,
                spotPricePerToken: 0n,
                totalClaimedUsdc: 0n,
                hasClaimed: false,
                isClaiming: false,
              };
            }
          })
        );

        if (!cancelled) {
          setRoyalties(results);
          if (onTotalsLoaded) {
            // Pending gross = pending TIX × spot price (before 7% fee)
            const pendingGross = results.reduce((sum, r) => {
              const tix = parseFloat(formatUnits(r.pendingTix, 18));
              const spot = parseFloat(formatUnits(r.spotPricePerToken, 6));
              return sum + tix * spot;
            }, 0);
            const totalClaimed = results.reduce((sum, r) => sum + r.totalClaimedUsdc, 0n);
            onTotalsLoaded(pendingGross.toFixed(4), parseFloat(formatUnits(totalClaimed, 6)).toFixed(4));
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
    const entry = royalties[index];
    if (!entry.show.show_contract) return;
    const tix = parseFloat(formatUnits(entry.pendingTix, 18));
    const spot = parseFloat(formatUnits(entry.spotPricePerToken, 6));
    const estimatedUsdc = (tix * spot * 0.93).toFixed(6);
    setRoyalties((prev) =>
      prev.map((r, i) => (i === index ? { ...r, isClaiming: true } : r))
    );
    const tx = await claimRoyalties(entry.show.show_contract as Address, 0n);
    const claimedRaw = tx
      ? BigInt(Math.round(parseFloat(estimatedUsdc) * 1_000_000))
      : 0n;
    setRoyalties((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              isClaiming: false,
              pendingTix: tx ? 0n : r.pendingTix,
              hasClaimed: tx ? true : r.hasClaimed,
              totalClaimedUsdc: tx ? r.totalClaimedUsdc + claimedRaw : r.totalClaimedUsdc,
            }
          : r
      )
    );
    if (tx) {
      const token = await getAccessToken().catch(() => null);
      recordTransaction(token, {
        type: "royalties_claimed",
        description: `Box office revenue claimed for ${entry.show.title}`,
        show_id: entry.show.id,
        tx_hash: tx,
        tix_amount: formatUnits(entry.pendingTix, 18),
        usdc_amount: estimatedUsdc,
        show_contract_address: entry.show.show_contract,
        wallet_address: walletAddress,
      });
      // Update the earnings card totals after claim
      if (onTotalsLoaded) {
        const updatedRoyalties = royalties.map((r, i) =>
          i === index ? { ...r, pendingTix: 0n, totalClaimedUsdc: r.totalClaimedUsdc + claimedRaw } : r
        );
        const pendingGross = updatedRoyalties.reduce((sum, r) => {
          const tix = parseFloat(formatUnits(r.pendingTix, 18));
          const spot = parseFloat(formatUnits(r.spotPricePerToken, 6));
          return sum + tix * spot;
        }, 0);
        const totalClaimed = updatedRoyalties.reduce((sum, r) => sum + r.totalClaimedUsdc, 0n);
        onTotalsLoaded(pendingGross.toFixed(4), parseFloat(formatUnits(totalClaimed, 6)).toFixed(4));
      }
      // Trigger parent refetch so transactions-derived totals stay fresh
      onClaimed?.();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-neutral-tertiary-text">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (royalties.length === 0) {
    return (
      <p className="text-sm text-neutral-tertiary-text italic py-2">
        No on-chain shows yet. Revenue accumulates once viewers pay to watch.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {royalties.map((entry, index) => {
        const hasPending = entry.pendingTix > 0n;
        const tixAmount = parseFloat(formatUnits(entry.pendingTix, 18));
        // spotPricePerToken is raw USDC (6 dec) per TIX token — matches useTixPortfolio's
        // valueUsdc = (tix * spotPrice) / 1e18 formula which returns 6-dec USDC
        const spotPrice = parseFloat(formatUnits(entry.spotPricePerToken, 6));
        const grossUsdc = tixAmount * spotPrice;
        const platformFee = grossUsdc * 0.07;
        const creatorReceives = grossUsdc * 0.93;
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

                {/* Pending */}
                {hasPending ? (
                  <div className="mt-1.5 space-y-1">
                    <p className="text-xs text-neutral-secondary-text">
                      Pending:{" "}
                      <span className="font-medium text-brand-pixsee-secondary">
                        {tixAmount.toFixed(2)} TIX
                        {spotPrice > 0 && (
                          <span className="text-neutral-tertiary-text font-normal">
                            {" "}≈ ${grossUsdc.toFixed(4)} gross
                          </span>
                        )}
                      </span>
                    </p>
                    {spotPrice > 0 && grossUsdc > 0 && (
                      <div className="text-xs space-y-0.5 pl-2 border-l-2 border-neutral-tertiary-border">
                        <p className="text-neutral-tertiary-text">
                          Platform fee (7%):{" "}
                          <span className="text-semantic-error-text">−${platformFee.toFixed(4)}</span>
                        </p>
                        <p className="text-neutral-tertiary-text">
                          You receive:{" "}
                          <span className="font-semibold text-semantic-success-text">${creatorReceives.toFixed(4)}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-semantic-success-text mt-0.5">
                    Up to date — no pending TIX
                  </p>
                )}

                {/* Historical total claimed */}
                {totalClaimed > 0 && (
                  <p className="text-xs text-neutral-tertiary-text mt-1.5">
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
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white text-xs font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {entry.isClaiming ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Claiming…</>
                    ) : (
                      "Claim as USDC"
                    )}
                  </button>
                ) : entry.hasClaimed ? (
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
