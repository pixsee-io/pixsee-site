"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  ArrowDownUp,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";
import { useTixPortfolio, type TixHolding, type ShowListing } from "@/app/hooks/useTixPortfolio";
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
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(4);
}

// ── Buy Modal ─────────────────────────────────────────────────────────────────

type BuyModalProps = {
  show: ShowListing;
  onClose: () => void;
  onSuccess: () => void;
};

function BuyModal({ show, onClose, onSuccess }: BuyModalProps) {
  const { buyTix, calculateTixOut, isLoading } = usePixseeContract();
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
    // 2% slippage on tix out
    const minTixOut = tixQuote ? (tixQuote * 98n) / 100n : 0n;
    const tx = await buyTix({
      bondingCurveAddress: show.show.bondingCurve as Address,
      usdcAmount: usdcRaw,
      minTixOut,
    });
    if (tx) {
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

          <div className="bg-neutral-secondary rounded-xl px-3 py-2.5 flex items-center justify-between">
            <span className="text-xs text-neutral-secondary-text">You receive</span>
            <span className="text-sm font-semibold text-neutral-primary-text">
              {quoteLoading
                ? "..."
                : tixQuote !== null
                ? `${fmtTix(tixQuote)} ${show.show.tickSymbol}`
                : "—"}
            </span>
          </div>

          <div className="rounded-xl border border-neutral-tertiary-border px-3 py-2.5 space-y-1">
            <p className="text-xs font-medium text-neutral-secondary-text">3% transaction fee</p>
            <div className="flex justify-between text-xs text-neutral-tertiary-text">
              <span>1% Pixsee platform</span>
              <span>1% Voting pool</span>
              <span>1% Creator</span>
            </div>
          </div>

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
};

function SellModal({ holding, onClose, onSuccess }: SellModalProps) {
  const { sellTix, calculateUsdcOut, isLoading } = usePixseeContract();
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

          <div className="bg-neutral-secondary rounded-xl px-3 py-2.5 flex items-center justify-between">
            <span className="text-xs text-neutral-secondary-text">You receive</span>
            <span className="text-sm font-semibold text-neutral-primary-text">
              {quoteLoading
                ? "..."
                : usdcQuote !== null
                ? fmtUsdc(formatUnits(usdcQuote, 6))
                : "—"}
            </span>
          </div>

          <div className="rounded-xl border border-neutral-tertiary-border px-3 py-2.5 space-y-1">
            <p className="text-xs font-medium text-neutral-secondary-text">3% transaction fee</p>
            <div className="flex justify-between text-xs text-neutral-tertiary-text">
              <span>1% Pixsee platform</span>
              <span>1% Voting pool</span>
              <span>1% Creator</span>
            </div>
          </div>

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
  const { walletAddress } = usePixseeContract();
  const portfolio = useTixPortfolio(walletAddress);

  const [buyTarget, setBuyTarget] = useState<ShowListing | null>(null);
  const [sellTarget, setSellTarget] = useState<TixHolding | null>(null);

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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-tertiary-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-tertiary-text">Show</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-tertiary-text">Balance</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-tertiary-text">Price/min</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-tertiary-text">Est. Value</th>
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
                          return bid ? (
                            <Link href={`/dashboard/watch/${bid}`} className="font-medium text-neutral-primary-text hover:text-brand-pixsee-secondary transition-colors">
                              {h.show.title}
                            </Link>
                          ) : (
                            <div className="font-medium text-neutral-primary-text">{h.show.title}</div>
                          );
                        })()}
                        <div className="text-xs text-neutral-tertiary-text">{h.show.tickSymbol}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-neutral-primary-text">
                        {fmtTix(h.tixBalance)}
                        <div className="text-xs text-neutral-tertiary-text">{h.show.tickSymbol}</div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedShows.map((s) => {
              const holding = holdings.find((h) => h.showId === s.showId);
              return (
                <div
                  key={s.showId}
                  className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-4 flex flex-col gap-3"
                >
                  <div>
                    {s.backendShowId ? (
                      <Link href={`/dashboard/watch/${s.backendShowId}`} className="font-semibold text-neutral-primary-text hover:text-brand-pixsee-secondary transition-colors">
                        {s.show.title}
                      </Link>
                    ) : (
                      <p className="font-semibold text-neutral-primary-text">{s.show.title}</p>
                    )}
                    <p className="text-xs text-neutral-tertiary-text">{s.show.tickSymbol}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-neutral-tertiary-text">Price/min</p>
                      <p className="font-medium text-neutral-primary-text">
                        {fmtUsdc(s.pricePerMinuteDisplay)}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-tertiary-text">TIX Volume</p>
                      <p className="font-medium text-neutral-primary-text">
                        {fmtUsdc(s.totalVolumeUsdc)}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-tertiary-text">TIX Supply</p>
                      <p className="font-medium text-neutral-primary-text">
                        {fmtTix(s.tixSupply)}
                      </p>
                    </div>
                    {holding && (
                      <div>
                        <p className="text-neutral-tertiary-text">Your balance</p>
                        <p className="font-medium text-brand-pixsee-secondary">
                          {fmtTix(holding.tixBalance)} {s.show.tickSymbol}
                        </p>
                      </div>
                    )}
                  </div>

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
              );
            })}
          </div>
        )}
      </section>

      {/* ── Modals ── */}
      {buyTarget && (
        <BuyModal
          show={buyTarget}
          onClose={() => setBuyTarget(null)}
          onSuccess={handleSuccess}
        />
      )}
      {sellTarget && (
        <SellModal
          holding={sellTarget}
          onClose={() => setSellTarget(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
