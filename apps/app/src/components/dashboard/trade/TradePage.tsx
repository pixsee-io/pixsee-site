"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  Wallet,
  ArrowDownUp,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  X,
  Lock,
  LockOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { usePrivy } from "@privy-io/react-auth";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";
import { useTixPortfolio, type TixHolding, type ShowListing } from "@/app/hooks/useTixPortfolio";
import { recordTransaction, recordNotification } from "@/app/lib/apiClient";
import { formatUnits, parseUnits, type Address } from "viem";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtUsdc(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "$0.00";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function fmtTix(raw: bigint): string {
  const n = parseFloat(formatUnits(raw, 18));
  if (n === 0) return "0";
  if (n >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(2) + "T";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(4);
}

// ── Creator Lock Badge ────────────────────────────────────────────────────────
// Visual trust signal showing whether a creator has locked their tokens.
// locked = true  → green  "C" + lock icon  (creator locked, lower dump risk)
// locked = false → red    "C" + unlock icon (not locked, trade with caution)
// locked = undefined → gray (status pending SC implementation)
//
// NOTE FOR SC DEV: add a view function `isCreatorLocked(address bondingCurve) external view returns (bool)`
// to the BondingCurve contract. Once available, read it in useTixPortfolio and pass the result here
// via a `creatorTokensLocked?: boolean` field on ShowListing.

function CreatorLockBadge({ locked }: { locked?: boolean }) {
  return (
    <div
      title={
        locked === undefined
          ? "Creator lock status coming soon"
          : locked
          ? "Creator has locked their tokens — lower dump risk"
          : "Creator tokens are not locked — trade with caution"
      }
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border cursor-default select-none",
        locked === undefined
          ? "bg-neutral-secondary border-neutral-tertiary-border text-neutral-tertiary-text"
          : locked
          ? "bg-semantic-success-primary/10 border-semantic-success-primary/30 text-semantic-success-text"
          : "bg-semantic-error-primary/10 border-semantic-error-primary/30 text-semantic-error-primary"
      )}
    >
      {/* "C" circle as described in product spec */}
      <span
        className={cn(
          "w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center shrink-0",
          locked === undefined
            ? "bg-neutral-tertiary-border text-neutral-tertiary-text"
            : locked
            ? "bg-semantic-success-primary text-white"
            : "bg-semantic-error-primary text-white"
        )}
      >
        C
      </span>
      {locked === undefined ? (
        <span className="ml-0.5">—</span>
      ) : locked ? (
        <Lock className="w-2.5 h-2.5" />
      ) : (
        <LockOpen className="w-2.5 h-2.5" />
      )}
    </div>
  );
}

// ── Buy Modal ─────────────────────────────────────────────────────────────────

type BuyModalProps = {
  show: ShowListing;
  onClose: () => void;
  onSuccess: () => void;
  getAccessToken: () => Promise<string | null>;
};

function BuyModal({ show, onClose, onSuccess, getAccessToken }: BuyModalProps) {
  const { buyTix, calculateTixOut, isLoading, walletAddress } = usePixseeContract();
  const [usdcInput, setUsdcInput] = useState("");
  const [tixQuote, setTixQuote] = useState<bigint | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  // Debounced quote
  useEffect(() => {
    if (!usdcInput || parseFloat(usdcInput) <= 0) {
      setTixQuote(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const usdcRaw = parseUnits(usdcInput, 6);
        const { tixOut } = await calculateTixOut(
          show.show.bondingCurve as Address,
          usdcRaw
        );
        setTixQuote(tixOut);
      } catch {
        setTixQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [usdcInput, show.show.bondingCurve, calculateTixOut]);

  const handleBuy = async () => {
    if (!usdcInput || parseFloat(usdcInput) <= 0) return;
    setTxError(null);
    const usdcRaw = parseUnits(usdcInput, 6);
    const minTixOut = tixQuote ? (tixQuote * 98n) / 100n : 0n;
    const tx = await buyTix({
      bondingCurveAddress: show.show.bondingCurve as Address,
      usdcAmount: usdcRaw,
      minTixOut,
    });
    if (tx) {
      const token = await getAccessToken().catch(() => null);
      recordTransaction(token, {
        type: "tix_bought",
        show_id: show.backendShowId ?? show.showId,
        tx_hash: tx,
        usdc_amount: usdcInput,
        tix_amount: tixQuote ? formatUnits(tixQuote, 18) : "0",
        bonding_curve_address: show.show.bondingCurve,
        wallet_address: walletAddress,
      });
      recordNotification(token, {
        type: "tix_bought",
        show_id: show.backendShowId ?? show.showId,
        tx_hash: tx,
      });
      onSuccess();
      onClose();
    } else {
      setTxError("Transaction failed. Check your USDC balance.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-neutral-primary rounded-2xl p-4 sm:p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-primary-text">
            Buy {show.show.tickSymbol}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-secondary">
            <X className="w-5 h-5 text-neutral-tertiary-text" />
          </button>
        </div>

        <div className="mb-3 text-sm text-neutral-secondary-text">
          <span className="font-medium">{show.show.title}</span> &middot; Current price:{" "}
          <span className="text-brand-pixsee-secondary font-medium">
            {fmtUsdc(show.pricePerMinuteDisplay)}/min
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-neutral-secondary-text mb-1 block">
              USDC to spend
            </label>
            <div className="flex items-center border border-neutral-tertiary-border rounded-xl px-3 py-2.5 gap-2">
              <span className="text-neutral-tertiary-text text-sm">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={usdcInput}
                onChange={(e) => setUsdcInput(e.target.value)}
                className="flex-1 outline-none text-sm text-neutral-primary-text bg-transparent"
              />
              <span className="text-xs text-neutral-tertiary-text">USDC</span>
            </div>
          </div>

          {(() => {
            const amount = parseFloat(usdcInput);
            const hasAmount = !isNaN(amount) && amount > 0;
            const fee = hasAmount ? amount * 0.03 : null;
            const perCategory = hasAmount ? amount * 0.01 : null;
            const netToCurve = hasAmount ? amount * 0.97 : null;
            return (
              <div className="rounded-xl border border-neutral-tertiary-border px-3 py-2.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-secondary-text font-medium">You pay</span>
                  <span className="font-semibold text-neutral-primary-text">
                    {hasAmount ? fmtUsdc(String(amount)) : "—"}
                  </span>
                </div>
                <div className="space-y-1 pl-2 border-l-2 border-semantic-error-primary/30">
                  {[
                    { label: "Platform (1%)", val: perCategory },
                    { label: "Voting pool (1%)", val: perCategory },
                    { label: "Creator (1%)", val: perCategory },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between text-xs text-neutral-tertiary-text">
                      <span>{label}</span>
                      <span className="text-semantic-error-primary">
                        {val != null ? `−${fmtUsdc(String(val))}` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-tertiary-border">
                  <span className="text-neutral-tertiary-text">Total fee (3%)</span>
                  <span className="text-semantic-error-primary font-medium">
                    {fee != null ? `−${fmtUsdc(String(fee))}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-tertiary-text">Goes to curve</span>
                  <span className="text-neutral-secondary-text">
                    {netToCurve != null ? fmtUsdc(String(netToCurve)) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-tertiary-border">
                  <span className="font-medium text-neutral-secondary-text">You receive</span>
                  <span className="font-semibold text-neutral-primary-text">
                    {quoteLoading ? "..." : tixQuote !== null ? `${fmtTix(tixQuote)} ${show.show.tickSymbol}` : "—"}
                  </span>
                </div>
              </div>
            );
          })()}

          {txError && (
            <p className="text-xs text-semantic-error-primary">{txError}</p>
          )}

          <Button
            onClick={handleBuy}
            disabled={isLoading || !usdcInput || parseFloat(usdcInput) <= 0}
            className="w-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-xl"
          >
            {isLoading ? "Buying..." : `Buy ${show.show.tickSymbol}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Sell Modal ────────────────────────────────────────────────────────────────

type SellModalProps = {
  holding: TixHolding;
  onClose: () => void;
  onSuccess: () => void;
  getAccessToken: () => Promise<string | null>;
};

function SellModal({ holding, onClose, onSuccess, getAccessToken }: SellModalProps) {
  const { sellTix, calculateUsdcOut, isLoading, walletAddress } = usePixseeContract();
  const [tixInput, setTixInput] = useState("");
  const [usdcQuote, setUsdcQuote] = useState<bigint | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const maxTix = formatUnits(holding.tixBalance, 18);

  // Debounced quote
  useEffect(() => {
    if (!tixInput || parseFloat(tixInput) <= 0) {
      setUsdcQuote(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const tixRaw = parseUnits(tixInput, 18);
        if (tixRaw > holding.tixBalance) {
          setUsdcQuote(null);
          return;
        }
        const { usdcOut } = await calculateUsdcOut(
          holding.show.bondingCurve as Address,
          tixRaw
        );
        setUsdcQuote(usdcOut);
      } catch {
        setUsdcQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [tixInput, holding.show.bondingCurve, holding.tixBalance, calculateUsdcOut]);

  const handleSell = async () => {
    if (!tixInput || parseFloat(tixInput) <= 0) return;
    setTxError(null);
    const tixRaw = parseUnits(tixInput, 18);
    const minUsdcOut = usdcQuote ? (usdcQuote * 98n) / 100n : 0n;
    const tx = await sellTix({
      bondingCurveAddress: holding.show.bondingCurve as Address,
      tixAmount: tixRaw,
      minUsdcOut,
    });
    if (tx) {
      const token = await getAccessToken().catch(() => null);
      recordTransaction(token, {
        type: "tix_sold",
        show_id: holding.showId,
        tx_hash: tx,
        tix_amount: tixInput,
        usdc_amount: usdcQuote ? formatUnits(usdcQuote, 6) : "0",
        bonding_curve_address: holding.show.bondingCurve,
        wallet_address: walletAddress,
      });
      recordNotification(token, {
        type: "tix_sold",
        show_id: holding.showId,
        tx_hash: tx,
        tix_amount: tixInput,
        usdc_amount: usdcQuote ? formatUnits(usdcQuote, 6) : "0",
      });
      onSuccess();
      onClose();
    } else {
      setTxError("Transaction failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-neutral-primary rounded-2xl p-4 sm:p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-primary-text">
            Sell {holding.show.tickSymbol}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-secondary">
            <X className="w-5 h-5 text-neutral-tertiary-text" />
          </button>
        </div>

        <div className="mb-3 text-sm text-neutral-secondary-text">
          <span className="font-medium">{holding.show.title}</span> &middot; Balance:{" "}
          <span className="font-medium">{fmtTix(holding.tixBalance)} {holding.show.tickSymbol}</span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-secondary-text">
                Amount to sell
              </label>
              <button
                onClick={() => setTixInput(maxTix)}
                className="text-xs text-brand-pixsee-secondary hover:underline"
              >
                Max
              </button>
            </div>
            <div className="flex items-center border border-neutral-tertiary-border rounded-xl px-3 py-2.5 gap-2">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={tixInput}
                onChange={(e) => setTixInput(e.target.value)}
                className="flex-1 outline-none text-sm text-neutral-primary-text bg-transparent"
              />
              <span className="text-xs text-neutral-tertiary-text">{holding.show.tickSymbol}</span>
            </div>
          </div>

          {(() => {
            const net = usdcQuote !== null ? parseFloat(formatUnits(usdcQuote, 6)) : null;
            // usdcQuote is already after the 3% fee, so gross = net / 0.97
            const gross = net != null ? net / 0.97 : null;
            const fee = gross != null ? gross * 0.03 : null;
            const perCategory = gross != null ? gross * 0.01 : null;
            // Mark value = amount × spot price (what Holdings table shows, no price impact)
            const tixAmt = parseFloat(tixInput);
            const spotPerTix = parseFloat(formatUnits(holding.spotPricePerToken, 6));
            const markValue = !isNaN(tixAmt) && tixAmt > 0 ? tixAmt * spotPerTix : null;
            const priceImpact = markValue != null && gross != null && markValue > 0
              ? ((markValue - gross) / markValue) * 100
              : null;
            return (
              <div className="rounded-xl border border-neutral-tertiary-border px-3 py-2.5 space-y-2">
                {markValue != null && (
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-tertiary-border">
                    <span className="text-neutral-tertiary-text">
                      Mark value <span className="opacity-60">(spot × amount)</span>
                    </span>
                    <span className="text-neutral-secondary-text">{fmtUsdc(String(markValue))}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-secondary-text font-medium">
                    Curve quote
                    {priceImpact != null && priceImpact > 0.1 && (
                      <span className="ml-1.5 text-semantic-warning-primary font-normal">
                        −{priceImpact.toFixed(1)}% impact
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-neutral-primary-text">
                    {quoteLoading ? "..." : gross != null ? `~${fmtUsdc(String(gross))}` : "—"}
                  </span>
                </div>
                <div className="space-y-1 pl-2 border-l-2 border-semantic-error-primary/30">
                  {[
                    { label: "Platform (1%)", val: perCategory },
                    { label: "Voting pool (1%)", val: perCategory },
                    { label: "Creator (1%)", val: perCategory },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between text-xs text-neutral-tertiary-text">
                      <span>{label}</span>
                      <span className="text-semantic-error-primary">
                        {val != null ? `−${fmtUsdc(String(val))}` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-tertiary-border">
                  <span className="text-neutral-tertiary-text">Total fee (3%)</span>
                  <span className="text-semantic-error-primary font-medium">
                    {fee != null ? `−${fmtUsdc(String(fee))}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-tertiary-border">
                  <span className="font-medium text-neutral-secondary-text">You receive</span>
                  <span className="font-semibold text-neutral-primary-text">
                    {quoteLoading ? "..." : net != null ? fmtUsdc(String(net)) : "—"}
                  </span>
                </div>
              </div>
            );
          })()}

          {txError && <p className="text-xs text-semantic-error-primary">{txError}</p>}

          <Button
            onClick={handleSell}
            disabled={isLoading || !tixInput || parseFloat(tixInput) <= 0}
            className="w-full bg-semantic-error-primary hover:bg-semantic-error-primary/90 text-white rounded-xl"
          >
            {isLoading ? "Selling..." : `Sell ${holding.show.tickSymbol}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main TradePage ────────────────────────────────────────────────────────────

export default function TradePage() {
  const { getAccessToken } = usePrivy();
  const { walletAddress, unlockCreatorTokens } = usePixseeContract();
  const portfolio = useTixPortfolio(walletAddress);

  const [buyTarget, setBuyTarget] = useState<ShowListing | null>(null);
  const [sellTarget, setSellTarget] = useState<TixHolding | null>(null);
  const [unlockingShowId, setUnlockingShowId] = useState<number | null>(null);

  const handleSuccess = useCallback(() => {
    portfolio.refresh();
  }, [portfolio]);

  const { usdcBalance, holdings, allShows, totalPortfolioValueDisplay, isLoading, error } = portfolio;

  // Newest first (highest showId at top)
  const sortedHoldings = [...holdings].sort((a, b) => b.showId - a.showId);
  const sortedShows = [...allShows].sort((a, b) => b.showId - a.showId);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-primary-text">Trade</h1>
          <p className="text-sm text-neutral-secondary-text mt-0.5">
            Buy and sell show tix to speculate on viewership growth
          </p>
        </div>
        <button
          onClick={portfolio.refresh}
          disabled={isLoading}
          className="p-2 rounded-xl border border-neutral-tertiary-border hover:bg-neutral-secondary transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-neutral-secondary-text ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ── Portfolio summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-neutral-tertiary-text" />
            <span className="text-xs text-neutral-secondary-text">USDC Balance</span>
          </div>
          <p className="text-2xl font-bold text-neutral-primary-text">
            {fmtUsdc(usdcBalance)}
          </p>
        </div>

        <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-neutral-tertiary-text" />
            <span className="text-xs text-neutral-secondary-text">Tix Portfolio Value</span>
          </div>
          <p className="text-2xl font-bold text-neutral-primary-text">
            {fmtUsdc(
              String(
                parseFloat(totalPortfolioValueDisplay) - parseFloat(usdcBalance)
              )
            )}
          </p>
        </div>

        <div className="bg-brand-pixsee-secondary rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownUp className="w-4 h-4 text-white/70" />
            <span className="text-xs text-white/70">Total Portfolio</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {fmtUsdc(totalPortfolioValueDisplay)}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-semantic-error-primary bg-semantic-error-primary/10 rounded-xl px-4 py-2">{error}</p>
      )}

      {/* ── My Holdings ── */}
      <section>
        <h2 className="text-base font-semibold text-neutral-primary-text mb-3">
          My Holdings {sortedHoldings.length > 0 && <span className="text-neutral-tertiary-text font-normal">({sortedHoldings.length})</span>}
        </h2>

        {isLoading ? (
          <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-8 text-center text-sm text-neutral-secondary-text">
            Loading portfolio...
          </div>
        ) : sortedHoldings.length === 0 ? (
          <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-8 text-center">
            <TrendingUp className="w-8 h-8 text-neutral-tertiary-text mx-auto mb-2" />
            <p className="text-sm text-neutral-secondary-text">No tix holdings yet.</p>
            <p className="text-xs text-neutral-tertiary-text mt-1">
              Buy tix from any show below to start speculating.
            </p>
          </div>
        ) : (
          <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border overflow-hidden">
            <div className="overflow-x-auto max-h-120 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-tertiary-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-tertiary-text">Show</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-tertiary-text">Balance</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-tertiary-text">Price/min</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-tertiary-text" title="Spot price × balance. Actual sell proceeds will be lower due to bonding curve price impact.">
                      Est. Value <span className="font-normal opacity-60">(at spot)</span>
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {sortedHoldings.map((h) => (
                    <tr key={h.showId} className="border-b border-neutral-tertiary-border last:border-0 hover:bg-neutral-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        {(() => {
                          const listing = allShows.find((s) => s.showId === h.showId);
                          const bid = listing?.backendShowId;
                          return (
                            <div className="flex items-center gap-2 flex-wrap">
                              {bid ? (
                                <Link href={`/watch/${bid}`} className="font-medium text-neutral-primary-text hover:text-brand-pixsee-secondary transition-colors">
                                  {h.show.title}
                                </Link>
                              ) : (
                                <div className="font-medium text-neutral-primary-text">{h.show.title}</div>
                              )}
                              <CreatorLockBadge locked={allShows.find((s) => s.showId === h.showId)?.creatorTokensLocked} />
                            </div>
                          );
                        })()}
                        <div className="text-xs text-neutral-tertiary-text">{h.show.tickSymbol}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-neutral-primary-text">
                        {fmtTix(h.tixBalance)}
                        <div className="text-xs text-neutral-tertiary-text">{h.show.tickSymbol}</div>
                        {h.lockedTix && h.lockedTix > 0n && (
                          <div className="mt-0.5 space-y-0.5">
                            <div className="flex items-center justify-end gap-1 text-xs text-semantic-warning-text">
                              <Lock className="w-3 h-3" />
                              {fmtTix(h.lockedTix)} locked in curve
                            </div>
                            {h.lockExpiry && h.lockExpiry > 0n && (() => {
                              const expiredMs = Number(h.lockExpiry) * 1000;
                              const hasExpired = Date.now() >= expiredMs;
                              return hasExpired ? (
                                <div className="flex justify-end">
                                  <button
                                    onClick={async () => {
                                      setUnlockingShowId(h.showId);
                                      await unlockCreatorTokens(h.show.bondingCurve);
                                      setUnlockingShowId(null);
                                      portfolio.refresh();
                                    }}
                                    disabled={unlockingShowId === h.showId}
                                    className="flex items-center gap-1 text-xs font-medium text-semantic-success-text bg-semantic-success-primary/10 hover:bg-semantic-success-primary/20 px-2 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {unlockingShowId === h.showId ? (
                                      <><Loader2 className="w-3 h-3 animate-spin" /> Unlocking…</>
                                    ) : (
                                      <><LockOpen className="w-3 h-3" /> Unlock TIX</>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <div className="text-xs text-neutral-tertiary-text text-right">
                                  Unlocks {new Date(expiredMs).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-secondary-text">
                        {fmtUsdc(formatUnits(h.spotPricePerToken * 60n, 6))}/min
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-neutral-primary-text">
                        {fmtUsdc(h.valueUsdcDisplay)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => {
                              const listing = allShows.find((s) => s.showId === h.showId);
                              if (listing) setBuyTarget(listing);
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-brand-pixsee-secondary hover:bg-brand-pixsee-secondary/10 px-2 py-1 rounded-lg transition-colors"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            Buy
                          </button>
                          <button
                            onClick={() => setSellTarget(h)}
                            className="flex items-center gap-1 text-xs font-medium text-semantic-error-primary hover:bg-semantic-error-primary/10 px-2 py-1 rounded-lg transition-colors"
                          >
                            <ArrowDownLeft className="w-3 h-3" />
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── All Shows ── */}
      <section>
        <h2 className="text-base font-semibold text-neutral-primary-text mb-3">
          All Shows
        </h2>

        {isLoading ? (
          <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-8 text-center text-sm text-neutral-secondary-text">
            Loading shows...
          </div>
        ) : allShows.length === 0 ? (
          <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-8 text-center text-sm text-neutral-secondary-text">
            No shows on the platform yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedShows.map((s) => {
              const holding = holdings.find((h) => h.showId === s.showId);
              return (
                <div
                  key={s.showId}
                  className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border overflow-hidden flex flex-col"
                >
                  {/* Thumbnail — links to detail page */}
                  <Link href={`/trade/${s.showId}`} className="group relative aspect-3/4 w-full overflow-hidden bg-neutral-secondary block">
                    {s.thumbnailUrl ? (
                      <Image
                        src={s.thumbnailUrl}
                        alt={s.show.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-neutral-tertiary-text" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <CreatorLockBadge locked={s.creatorTokensLocked} />
                    </div>
                    {holding && (
                      <div className="absolute bottom-2 left-2 bg-brand-pixsee-secondary text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                        Holding
                      </div>
                    )}
                  </Link>

                  {/* Card body */}
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <Link href={`/trade/${s.showId}`}>
                      <p className="font-semibold text-sm text-neutral-primary-text truncate hover:text-brand-pixsee-secondary transition-colors">{s.show.title}</p>
                    </Link>
                    <p className="text-xs text-neutral-tertiary-text -mt-1.5">{s.show.tickSymbol}</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                      <div>
                        <p className="text-neutral-tertiary-text">Price/min</p>
                        <p className="font-medium text-neutral-primary-text">{fmtUsdc(s.pricePerMinuteDisplay)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-tertiary-text">TIX Volume</p>
                        <p className="font-medium text-neutral-primary-text">{fmtUsdc(s.totalVolumeUsdc)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-tertiary-text">TIX Supply</p>
                        <p className="font-medium text-neutral-primary-text">{fmtTix(s.tixSupply)}</p>
                      </div>
                    </div>
                    {/* Buy / Sell buttons */}
                    <div className="flex gap-2 mt-auto">
                      <Button
                        onClick={() => setBuyTarget(s)}
                        className="flex-1 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white text-xs rounded-xl h-8"
                      >
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        Buy
                      </Button>
                      {holding && (
                        <Button
                          onClick={() => setSellTarget(holding)}
                          variant="outline"
                          className="flex-1 border-semantic-error-primary/30 text-semantic-error-primary hover:bg-semantic-error-primary/10 text-xs rounded-xl h-8"
                        >
                          <ArrowDownLeft className="w-3 h-3 mr-1" />
                          Sell
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Modals ── */}
      {buyTarget && (
        <ErrorBoundary section="Buy">
          <BuyModal
            show={buyTarget}
            onClose={() => setBuyTarget(null)}
            onSuccess={handleSuccess}
            getAccessToken={getAccessToken}
          />
        </ErrorBoundary>
      )}
      {sellTarget && (
        <ErrorBoundary section="Sell">
          <SellModal
            holding={sellTarget}
            onClose={() => setSellTarget(null)}
            onSuccess={handleSuccess}
            getAccessToken={getAccessToken}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
