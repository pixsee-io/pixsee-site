"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowLeft,
  Star,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  TrendingUp,
  UserPlus,
  UserCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVideo } from "@/app/hooks/useVideo";
import { useTixPortfolio, type ShowListing } from "@/app/hooks/useTixPortfolio";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";
import { useFollow, useWatchlist } from "@/app/hooks/useSocial";
import { recordTransaction, recordNotification } from "@/app/lib/apiClient";
import { formatUnits, parseUnits, type Address } from "viem";
import type { ApiShow } from "@/app/types/pixsee-api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtUsdc(val: string | number): string {
  const n = typeof val === "number" ? val : parseFloat(val);
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

// ── Bonding Curve Chart (recharts) ────────────────────────────────────────────
// Sigmoid: P_norm = 2·S_norm / (S_norm + 1)
// Passes through (currentSupply, currentPrice). Past region shaded differently.

function BondingCurveChart({
  supply,
  spotPrice,
  tickSymbol,
}: {
  supply: bigint;
  spotPrice: bigint;
  tickSymbol: string;
}) {
  const supplyNum = parseFloat(formatUnits(supply, 18));
  const priceNum = parseFloat(formatUnits(spotPrice, 6));
  const hasData = supplyNum > 0 && priceNum > 0;

  if (!hasData) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-neutral-tertiary-text text-sm">
        No price data yet
      </div>
    );
  }

  // Generate 80 points: 0 → 3× current supply
  const MAX_S_NORM = 3;
  const data = Array.from({ length: 80 }, (_, i) => {
    const sNorm = (i / 79) * MAX_S_NORM;
    const pNorm = sNorm === 0 ? 0 : (2 * sNorm) / (sNorm + 1);
    const supply_k = (sNorm * supplyNum) / 1000;
    const price = pNorm * priceNum;
    return {
      supply_k: parseFloat(supply_k.toFixed(2)),
      price: parseFloat(price.toFixed(8)),
      // Split areas: "past" up to current, "future" beyond
      pastPrice: sNorm <= 1 ? parseFloat(price.toFixed(8)) : undefined,
      futurePrice: sNorm >= 1 ? parseFloat(price.toFixed(8)) : undefined,
    };
  });

  const currentPrice = priceNum;
  const currentSupplyK = supplyNum / 1000;

  const fmtPrice = (v: number) => {
    if (v === 0) return "$0";
    if (v < 0.0001) return `$${v.toExponential(2)}`;
    return `$${v.toFixed(5)}`;
  };

  const fmtSupply = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}B`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}M`;
    return `${v.toFixed(1)}K`;
  };

  return (
    <div className="w-full">
      <p className="text-[10px] text-neutral-tertiary-text uppercase tracking-wide mb-2">
        Bonding Curve · Price vs Supply · <span className="text-brand-pixsee-secondary">● Now</span>
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 18 }}>
          <defs>
            <linearGradient id="pastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="futureGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.07} />

          <XAxis
            dataKey="supply_k"
            tick={{ fontSize: 9, fill: "currentColor", opacity: 0.45 }}
            tickFormatter={fmtSupply}
            label={{
              value: `${tickSymbol} Supply`,
              position: "insideBottom",
              offset: -10,
              fontSize: 9,
              fill: "currentColor",
              opacity: 0.35,
            }}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "currentColor", opacity: 0.45 }}
            tickFormatter={fmtPrice}
            width={58}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-neutral-primary, #1a1a2e)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: 11,
            }}
            formatter={(v: number) => [fmtUsdc(v * 60) + "/min", "Price/min"]}
            labelFormatter={(label: number) => `Supply: ${fmtSupply(label)}`}
          />

          {/* Past region (filled, solid line) */}
          <Area
            type="monotone"
            dataKey="pastPrice"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#pastGrad)"
            connectNulls={false}
            dot={false}
            activeDot={false}
          />

          {/* Future region (dashed, lighter fill) */}
          <Area
            type="monotone"
            dataKey="futurePrice"
            stroke="#6366f1"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            fill="url(#futureGrad)"
            connectNulls={false}
            dot={false}
            activeDot={false}
          />

          {/* Current position marker */}
          <ReferenceLine
            x={parseFloat(currentSupplyK.toFixed(2))}
            stroke="#3b82f6"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            label={{
              value: fmtPrice(currentPrice),
              position: "top",
              fontSize: 9,
              fill: "#3b82f6",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Inline Buy Panel ──────────────────────────────────────────────────────────

function TradePanelBuy({
  listing,
  getAccessToken,
  onSuccess,
}: {
  listing: ShowListing;
  getAccessToken: () => Promise<string | null>;
  onSuccess: () => void;
}) {
  const { buyTix, calculateTixOut, isLoading, walletAddress } = usePixseeContract();
  const [usdcInput, setUsdcInput] = useState("");
  const [tixQuote, setTixQuote] = useState<bigint | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    setTixQuote(null);
    if (!usdcInput || parseFloat(usdcInput) <= 0) return;
    const t = setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const { tixOut } = await calculateTixOut(
          listing.show.bondingCurve as Address,
          parseUnits(usdcInput, 6)
        );
        setTixQuote(tixOut);
      } catch {
        setTixQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [usdcInput, listing.show.bondingCurve, calculateTixOut]);

  const handleBuy = async () => {
    if (!usdcInput || parseFloat(usdcInput) <= 0) return;
    setTxError(null);
    const tx = await buyTix({
      bondingCurveAddress: listing.show.bondingCurve as Address,
      usdcAmount: parseUnits(usdcInput, 6),
      minTixOut: tixQuote ? (tixQuote * 98n) / 100n : 0n,
    });
    setUsdcInput("");
    setTixQuote(null);
    if (tx) {
      const token = await getAccessToken().catch(() => null);
      recordTransaction(token, {
        type: "tix_bought",
        show_id: listing.backendShowId ?? listing.showId,
        tx_hash: tx,
        usdc_amount: usdcInput,
        tix_amount: tixQuote ? formatUnits(tixQuote, 18) : "0",
        bonding_curve_address: listing.show.bondingCurve,
        wallet_address: walletAddress,
      });
      recordNotification(token, {
        type: "tix_bought",
        show_id: listing.backendShowId ?? listing.showId,
        tx_hash: tx,
      });
      onSuccess();
    } else {
      setTxError("Transaction failed. Check your USDC balance.");
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-neutral-secondary-text">
        {listing.show.title} &middot; Current price:{" "}
        <span className="text-brand-pixsee-secondary">
          {fmtUsdc(listing.pricePerMinuteDisplay)}/min
        </span>
      </p>

      <div>
        <label className="text-xs text-neutral-tertiary-text mb-1 block">Amount (USDC)</label>
        <div className="flex items-center border border-neutral-tertiary-border rounded-xl px-3 py-2.5 gap-2 bg-neutral-secondary/30">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={usdcInput}
            onChange={(e) => setUsdcInput(e.target.value)}
            className="flex-1 outline-none text-sm text-neutral-primary-text bg-transparent"
          />
          <span className="text-xs font-medium text-neutral-tertiary-text">USDC</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setUsdcInput("")}
          className="text-xs px-3 py-1.5 rounded-lg border border-neutral-tertiary-border hover:bg-neutral-secondary transition-colors text-neutral-secondary-text"
        >
          Reset
        </button>
        {["10", "25", "50"].map((p) => (
          <button
            key={p}
            onClick={() => setUsdcInput(p)}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-tertiary-border hover:bg-neutral-secondary transition-colors text-neutral-secondary-text"
          >
            {p} USDC
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs text-neutral-tertiary-text mb-1 block">You will receive</label>
        <div className="flex items-center border border-neutral-tertiary-border rounded-xl px-3 py-2.5 gap-2 bg-neutral-secondary/30">
          <span className="flex-1 text-sm text-neutral-primary-text">
            {quoteLoading
              ? "…"
              : tixQuote !== null
              ? `${fmtTix(tixQuote)} ${listing.show.tickSymbol}`
              : "0.00"}
          </span>
          <span className="text-xs font-medium text-neutral-tertiary-text">TIX</span>
        </div>
      </div>

      {txError && (
        <div className="flex items-center gap-1.5 text-xs text-semantic-error-primary">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {txError}
        </div>
      )}

      <Button
        onClick={handleBuy}
        disabled={isLoading || !usdcInput || parseFloat(usdcInput) <= 0}
        className="w-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-xl h-11 text-sm font-semibold"
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing…</>
        ) : (
          `Buy $${listing.show.tickSymbol}`
        )}
      </Button>
      <p className="text-[10px] text-neutral-tertiary-text text-center">
        3% fee · 10% watch reward on unlock
      </p>
    </div>
  );
}

// ── Inline Sell Panel ─────────────────────────────────────────────────────────

function TradePanelSell({
  listing,
  getAccessToken,
  onSuccess,
}: {
  listing: ShowListing;
  getAccessToken: () => Promise<string | null>;
  onSuccess: () => void;
}) {
  const { sellTix, calculateUsdcOut, getTixBalance, isLoading, walletAddress } = usePixseeContract();
  const [tixInput, setTixInput] = useState("");
  const [usdcQuote, setUsdcQuote] = useState<bigint | null>(null);
  const [tixBalance, setTixBalance] = useState<bigint>(0n);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    if (!listing.show.tix) return;
    getTixBalance(listing.show.tix as Address)
      .then(setTixBalance)
      .catch(() => {});
  }, [listing.show.tix, getTixBalance]);

  useEffect(() => {
    setUsdcQuote(null);
    if (!tixInput || parseFloat(tixInput) <= 0) return;
    const t = setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const raw = parseUnits(tixInput, 18);
        if (raw > tixBalance) { setUsdcQuote(null); return; }
        const { usdcOut } = await calculateUsdcOut(
          listing.show.bondingCurve as Address,
          raw
        );
        setUsdcQuote(usdcOut);
      } catch {
        setUsdcQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [tixInput, listing.show.bondingCurve, tixBalance, calculateUsdcOut]);

  const handleSell = async () => {
    if (!tixInput || parseFloat(tixInput) <= 0) return;
    setTxError(null);
    const tx = await sellTix({
      bondingCurveAddress: listing.show.bondingCurve as Address,
      tixAmount: parseUnits(tixInput, 18),
      minUsdcOut: usdcQuote ? (usdcQuote * 98n) / 100n : 0n,
    });
    setTixInput("");
    setUsdcQuote(null);
    if (tx) {
      const token = await getAccessToken().catch(() => null);
      recordTransaction(token, {
        type: "tix_sold",
        show_id: listing.backendShowId ?? listing.showId,
        tx_hash: tx,
        tix_amount: tixInput,
        usdc_amount: usdcQuote ? formatUnits(usdcQuote, 6) : "0",
        bonding_curve_address: listing.show.bondingCurve,
        wallet_address: walletAddress,
      });
      onSuccess();
    } else {
      setTxError("Transaction failed.");
    }
  };

  const net = usdcQuote !== null ? parseFloat(formatUnits(usdcQuote, 6)) : null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-tertiary-text">
        Balance:{" "}
        <span className="font-medium text-neutral-primary-text">
          {fmtTix(tixBalance)} {listing.show.tickSymbol}
        </span>
      </p>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-neutral-tertiary-text">Amount to sell</label>
          <button
            onClick={() => setTixInput(formatUnits(tixBalance, 18))}
            className="text-xs text-brand-pixsee-secondary hover:underline"
          >
            Max
          </button>
        </div>
        <div className="flex items-center border border-neutral-tertiary-border rounded-xl px-3 py-2.5 gap-2 bg-neutral-secondary/30">
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={tixInput}
            onChange={(e) => setTixInput(e.target.value)}
            className="flex-1 outline-none text-sm text-neutral-primary-text bg-transparent"
          />
          <span className="text-xs font-medium text-neutral-tertiary-text">{listing.show.tickSymbol}</span>
        </div>
      </div>

      <div>
        <label className="text-xs text-neutral-tertiary-text mb-1 block">You will receive</label>
        <div className="flex items-center border border-neutral-tertiary-border rounded-xl px-3 py-2.5 gap-2 bg-neutral-secondary/30">
          <span className="flex-1 text-sm text-neutral-primary-text">
            {quoteLoading ? "…" : net !== null ? fmtUsdc(net) : "0.00"}
          </span>
          <span className="text-xs font-medium text-neutral-tertiary-text">USDC</span>
        </div>
      </div>

      {txError && (
        <div className="flex items-center gap-1.5 text-xs text-semantic-error-primary">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {txError}
        </div>
      )}

      <Button
        onClick={handleSell}
        disabled={isLoading || !tixInput || parseFloat(tixInput) <= 0 || tixBalance === 0n}
        className="w-full bg-semantic-error-primary hover:bg-semantic-error-primary/90 text-white rounded-xl h-11 text-sm font-semibold"
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing…</>
        ) : (
          `Sell $${listing.show.tickSymbol}`
        )}
      </Button>
    </div>
  );
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="p-1 rounded hover:bg-neutral-secondary transition-colors"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-semantic-success-text" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-neutral-tertiary-text" />
      )}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ShowTradingView({ showId }: { showId: string }) {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const { walletAddress } = usePixseeContract();

  const { video: rawShow, isLoading: showLoading } = useVideo(showId, getAccessToken);
  const apiShow = rawShow as unknown as ApiShow | null;

  const portfolio = useTixPortfolio(walletAddress);
  const listing = portfolio.allShows.find(
    (s) => String(s.showId) === showId || String(s.backendShowId) === showId
  );

  const [tradeTab, setTradeTab] = useState<"buy" | "sell">("buy");

  const { addShow, removeShow, isInWatchlist } = useWatchlist(getAccessToken);
  const inWatchlist = isInWatchlist(parseInt(showId));
  const toggleWatchlist = () =>
    inWatchlist ? removeShow(parseInt(showId)) : addShow(parseInt(showId));

  const creator = apiShow?.creator;
  const { following, loading: followLoading, toggle: toggleFollow } = useFollow(
    creator?.id,
    getAccessToken
  );

  const creatorName = creator?.name ?? creator?.username ?? listing?.creatorName ?? "Unknown";
  const thumbnailUrl = apiShow?.cover_image_url ?? listing?.thumbnailUrl ?? null;
  const description = apiShow?.description ?? listing?.description ?? "";

  const handleSuccess = useCallback(() => portfolio.refresh(), [portfolio]);

  if (showLoading && !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-tertiary-text" />
      </div>
    );
  }

  if (!listing && !showLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-secondary-text mb-4">Show not found or not yet on-chain.</p>
        <button onClick={() => router.back()} className="text-brand-pixsee-secondary underline text-sm">
          Go back
        </button>
      </div>
    );
  }

  const showTitle = apiShow?.title ?? listing?.show.title ?? "Show";
  const tickSymbol = listing?.show.tickSymbol ?? apiShow?.tick_symbol ?? "TIX";
  const showContract = listing?.show.showContract ?? apiShow?.show_contract ?? null;
  const bondingCurve = listing?.show.bondingCurve ?? apiShow?.bonding_curve ?? null;

  return (
    <div className="min-h-screen bg-foundation-alternate pb-12">
      <div className="max-w-350 mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-neutral-secondary-text hover:text-neutral-primary-text transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-pixsee-secondary text-white text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              Trading View
            </span>
            <Link
              href={`/watch/${showId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-tertiary-border text-neutral-secondary-text text-xs font-medium hover:bg-neutral-secondary transition-colors"
            >
              Watch View
            </Link>
          </div>
        </div>

        {/* ── Row 1: Poster + Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Show poster */}
          <div className="relative rounded-2xl overflow-hidden bg-neutral-secondary aspect-video lg:aspect-auto lg:min-h-72">
            {thumbnailUrl ? (
              <Image src={thumbnailUrl} alt={showTitle} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-neutral-tertiary-text" />
              </div>
            )}
          </div>

          {/* Chart panel */}
          <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-4 flex flex-col gap-3">
            {/* Show name + watchlist */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-brand-pixsee-secondary">
                  ${showTitle}
                </h1>
                <p className="text-xs text-neutral-tertiary-text">{tickSymbol} TIX</p>
              </div>
              <button
                onClick={toggleWatchlist}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shrink-0",
                  inWatchlist
                    ? "border-brand-pixsee-secondary text-brand-pixsee-secondary bg-brand-pixsee-secondary/5"
                    : "border-neutral-tertiary-border text-neutral-secondary-text hover:bg-neutral-secondary"
                )}
              >
                <Star className={cn("w-3.5 h-3.5", inWatchlist && "fill-current")} />
                {inWatchlist ? "Saved" : "Add to watchlist"}
              </button>
            </div>

            {/* Contract links */}
            <div className="flex items-center gap-3 text-xs text-neutral-tertiary-text flex-wrap">
              {showContract && (
                <div className="flex items-center gap-1">
                  <span>Contract</span>
                  <CopyButton value={showContract} />
                  <a
                    href={`https://sepolia.basescan.org/address/${showContract}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-pixsee-secondary transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {bondingCurve && (
                <div className="flex items-center gap-1">
                  <span>Pair</span>
                  <CopyButton value={bondingCurve} />
                  <a
                    href={`https://sepolia.basescan.org/address/${bondingCurve}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-pixsee-secondary transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Recharts bonding curve */}
            {listing ? (
              <BondingCurveChart
                supply={listing.tixSupply}
                spotPrice={listing.spotPricePerToken}
                tickSymbol={tickSymbol}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-tertiary-text text-sm">
                Loading chart…
              </div>
            )}

            {/* Current price pill */}
            {listing && (
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2.5 py-1 bg-brand-pixsee-secondary/10 text-brand-pixsee-secondary rounded-full font-medium">
                  {fmtUsdc(listing.pricePerMinuteDisplay)}/min
                </span>
                <span className="text-neutral-tertiary-text">
                  Supply: {fmtTix(listing.tixSupply)} {tickSymbol}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: Trade Activity + Trade Panel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Trade Activity */}
          <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-4 sm:p-5 space-y-4">
            <h2 className="font-semibold text-neutral-primary-text">Trade Activity</h2>
            {listing ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-tertiary-text">TIX Ticker</p>
                    <p className="font-medium text-neutral-primary-text">{showTitle}</p>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-brand-pixsee-secondary/20 text-brand-pixsee-secondary text-[10px] font-bold flex items-center justify-center">
                    C
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <p className="text-neutral-tertiary-text">Price/min</p>
                    <p className="font-semibold text-neutral-primary-text">{fmtUsdc(listing.pricePerMinuteDisplay)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-tertiary-text">TIX Volume</p>
                    <p className="font-semibold text-neutral-primary-text">{fmtUsdc(listing.totalVolumeUsdc)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-tertiary-text">TIX Supply</p>
                    <p className="font-semibold text-neutral-primary-text">{fmtTix(listing.tixSupply)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-tertiary-text">Total Views</p>
                    <p className="font-semibold text-neutral-primary-text">
                      {apiShow?.view_count != null
                        ? apiShow.view_count >= 1000
                          ? (apiShow.view_count / 1000).toFixed(1) + "k+"
                          : String(apiShow.view_count)
                        : "—"}
                    </p>
                  </div>
                </div>
                {showContract && (
                  <div>
                    <p className="text-xs text-neutral-tertiary-text mb-1">Contract Address</p>
                    <a
                      href={`https://sepolia.basescan.org/address/${showContract}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-pixsee-secondary hover:underline font-mono break-all"
                    >
                      {showContract.slice(0, 20)}…{showContract.slice(-6)}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-neutral-tertiary-text">Loading…</p>
            )}
          </div>

          {/* Trade Panel */}
          <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-4 sm:p-5">
            <h2 className="font-semibold text-neutral-primary-text mb-4">Trade</h2>
            <div className="flex rounded-xl overflow-hidden border border-neutral-tertiary-border mb-4">
              <button
                onClick={() => setTradeTab("buy")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold transition-colors",
                  tradeTab === "buy"
                    ? "bg-brand-pixsee-secondary text-white"
                    : "bg-neutral-primary text-neutral-secondary-text hover:bg-neutral-secondary"
                )}
              >
                BUY
              </button>
              <button
                onClick={() => setTradeTab("sell")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold transition-colors",
                  tradeTab === "sell"
                    ? "bg-semantic-error-primary text-white"
                    : "bg-neutral-primary text-neutral-secondary-text hover:bg-neutral-secondary"
                )}
              >
                SELL
              </button>
            </div>
            {listing ? (
              tradeTab === "buy" ? (
                <TradePanelBuy listing={listing} getAccessToken={getAccessToken} onSuccess={handleSuccess} />
              ) : (
                <TradePanelSell listing={listing} getAccessToken={getAccessToken} onSuccess={handleSuccess} />
              )
            ) : (
              <p className="text-sm text-neutral-tertiary-text text-center py-6">
                Show not yet available for trading.
              </p>
            )}
          </div>
        </div>

        {/* ── Row 3: About the show ── */}
        <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-4 sm:p-5 mb-4">
          <h2 className="font-semibold text-neutral-primary-text mb-3">About the show</h2>
          {description ? (
            <p className="text-sm text-neutral-secondary-text leading-relaxed">{description}</p>
          ) : (
            <p className="text-sm text-neutral-tertiary-text italic">No description provided.</p>
          )}
        </div>

        {/* ── Row 4: Creator Profile ── */}
        {creator && (
          <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-4 sm:p-5">
            <h2 className="font-semibold text-neutral-primary-text mb-4">Creator Profile</h2>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-neutral-tertiary overflow-hidden shrink-0 flex items-center justify-center text-lg font-semibold text-neutral-secondary-text">
                {creator.avatar_url ? (
                  <Image
                    src={creator.avatar_url}
                    alt={creatorName}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  creatorName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-primary-text">{creatorName}</p>
                <p className="text-xs text-neutral-tertiary-text mt-0.5">Video Creator</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={toggleFollow}
              disabled={followLoading}
              className={cn(
                "rounded-lg gap-2 text-sm",
                following
                  ? "border-neutral-tertiary-border text-neutral-secondary-text"
                  : "border-brand-pixsee-secondary text-brand-pixsee-secondary hover:bg-brand-pixsee-secondary hover:text-white"
              )}
            >
              {following ? (
                <><UserCheck className="w-4 h-4" /> Following</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Follow creator</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
