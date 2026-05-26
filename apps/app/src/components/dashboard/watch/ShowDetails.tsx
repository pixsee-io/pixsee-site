"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MuxPlayer from "@mux/mux-player-react";
import { usePrivy } from "@privy-io/react-auth";

import {
  ArrowLeft,
  Star,
  Share2,
  Eye,
  Clock,
  Tag,
  MessageCircle,
  Heart,
  Loader2,
  Lock,
  Play,
  Unlock,
  AlertCircle,
  Trash2,
  UserPlus,
  UserCheck,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ShowCard from "@/components/dashboard/watch/ShowCard";
import ShareSheet from "@/components/ui/ShareSheet";
import {
  useVideo,
  useVideos,
  formatCount,
  useEpisodePlayback,
} from "@/app/hooks/useVideo";
import { ApiEpisode, ApiShow } from "@/app/types/pixsee-api";
import { usePixseeContract, isApprovalCached } from "@/app/hooks/usePixseeContract";
import { CONTRACT_ADDRESSES } from "@/app/lib/pixsee-contracts";
import {
  useLike,
  useComments,
  useFollow,
  useWatchlist,
} from "@/app/hooks/useSocial";
import { useSocialState } from "@/app/context/SocialStateContext";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { recordTransaction } from "@/app/lib/apiClient";

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function friendlyTxError(raw: string | null): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (
    lower.includes("user rejected") ||
    lower.includes("rejected the request") ||
    lower.includes("user denied") ||
    lower.includes("cancelled")
  ) {
    return "Transaction cancelled.";
  }
  if (lower.includes("insufficient funds") || lower.includes("insufficient balance")) {
    return "Insufficient funds for this transaction.";
  }
  if (lower.includes("insufficient allowance")) {
    return "USDC allowance too low. Please try again.";
  }
  return "Transaction failed. Please try again.";
}

//  BuyAndWatchButton ─
// Shows cost, handles approve + buy + unlock flow

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";

const BuyAndWatchButton = ({
  episode,
  showContractAddress,
  bondingCurveAddress,
  tickSymbol: tickSymbolProp,
  showTitle,
  getAccessToken,
  onSuccess,
  bare = false,
}: {
  episode: ApiEpisode;
  showContractAddress: Address;
  bondingCurveAddress: Address;
  tickSymbol?: string;
  showTitle?: string;
  getAccessToken: () => Promise<string | null>;
  onSuccess: () => void;
  bare?: boolean;
}) => {
  const {
    buyAndUnlock,
    quoteCostToWatch,
    getTixAddress,
    getTixBalance,
    unlockWithTix,
    isLoading,
    error,
    walletAddress,
  } = usePixseeContract();

  const [cost, setCost] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "approving" | "unlocking">("idle");
  const [tixAddress, setTixAddress] = useState<Address | null>(null);
  const [userTixBalance, setUserTixBalance] = useState<bigint>(0n);
  const tickSymbol = tickSymbolProp ?? "Tix";

  const fullDuration = episode.duration ?? 600;
  // Payment always covers the full episode duration — the preview is a free teaser,
  // not a discount on the purchase price. The ShowContract was registered with fullDuration.
  const durationSeconds = fullDuration;
  // Amount of tix-wei needed for this episode
  const tixNeeded = BigInt(durationSeconds) * BigInt("1000000000000000000");
  const hasEnoughTix = userTixBalance >= tixNeeded;

  // Fetch tix address + user's tix balance for this show
  useEffect(() => {
    if (!bondingCurveAddress || episode.is_free) return;
    getTixAddress(bondingCurveAddress)
      .then((addr) => {
        setTixAddress(addr);
        // Try to read tick symbol from contract for display
        return getTixBalance(addr).then((bal) => setUserTixBalance(bal));
      })
      .catch(() => {});
  }, [bondingCurveAddress, episode.is_free, getTixAddress, getTixBalance]);

  // Fetch USDC cost quote (only needed when user doesn't have enough tix)
  useEffect(() => {
    if (!bondingCurveAddress || episode.is_free || hasEnoughTix) return;
    quoteCostToWatch(bondingCurveAddress, durationSeconds)
      .then((q) => setCost(q.displayCost))
      .catch(() => {});
  }, [
    bondingCurveAddress,
    durationSeconds,
    episode.is_free,
    hasEnoughTix,
    quoteCostToWatch,
  ]);

  const notifyBackend = async (tx: string, extra?: Record<string, unknown>) => {
    const token = await getAccessToken();
    try {
      await fetch(
        `${BASE_URL}/api/v1/shows/${episode.show_id}/episodes/${episode.id}/grant-access`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ tx_hash: tx, wallet_address: walletAddress, ...extra }),
        }
      );
    } catch {
      // grant-access failed but tx succeeded — onSuccess still runs
    }
  };

  // Path A: user already has enough tix — unlock directly, no USDC
  const handleUnlockWithTix = async () => {
    if (!tixAddress) return;
    const needsApproval = walletAddress
      ? !isApprovalCached(walletAddress, tixAddress, showContractAddress)
      : false;
    setStep(needsApproval ? "approving" : "unlocking");
    const onChainEpisodeId =
      episode.on_chain_episode_id != null
        ? Number(episode.on_chain_episode_id)
        : episode.episode_number ?? episode.id;
    const tixAmount = formatUnits(BigInt(durationSeconds) * BigInt("1000000000000000000"), 18);
    let tx: string | null = null;
    try {
      tx = await unlockWithTix({
        showContractAddress,
        tixAddress,
        episodeId: onChainEpisodeId,
        durationSeconds,
      });
    } catch {
      // error is set inside unlockWithTix; step resets below
    }
    setStep("idle");
    if (tx) {
      await notifyBackend(tx, { tix_amount: tixAmount });
      const token = await getAccessToken().catch(() => null);
      recordTransaction(token, {
        type: "episode_unlocked_with_tix",
        description: `10% TIX cashback for unlocking episode ${episode.episode_number} of ${showTitle ?? "Unknown Show"}`,
        show_id: episode.show_id,
        show_title: showTitle,
        episode_id: episode.id,
        episode_number: episode.episode_number,
        on_chain_episode_id: String(onChainEpisodeId),
        show_contract_address: showContractAddress,
        tx_hash: tx,
        tix_amount: tixAmount,
        duration_seconds: durationSeconds,
        wallet_address: walletAddress,
      });
      onSuccess();
    }
  };

  // Path B: user doesn't have enough tix — buy with USDC + unlock via router
  const handleBuyAndUnlock = async () => {
    const needsApproval = walletAddress
      ? !isApprovalCached(walletAddress, CONTRACT_ADDRESSES.usdc, CONTRACT_ADDRESSES.router)
      : false;
    setStep(needsApproval ? "approving" : "unlocking");
    const onChainEpisodeId =
      episode.on_chain_episode_id != null
        ? Number(episode.on_chain_episode_id)
        : episode.episode_number ?? episode.id;
    const usdcAmount = cost ?? "0";
    const tixAmount = formatUnits(tixNeeded, 18);
    let tx: string | null = null;
    try {
      tx = await buyAndUnlock({
        showContractAddress,
        bondingCurveAddress,
        episodeId: onChainEpisodeId,
        durationSeconds,
      });
    } catch {
      // error is set inside buyAndUnlock; step resets below
    }
    setStep("idle");
    if (tx) {
      await notifyBackend(tx, { usdc_amount: usdcAmount, tix_amount: tixAmount });
      const token = await getAccessToken().catch(() => null);
      recordTransaction(token, {
        type: "episode_purchased",
        description: `10% TIX cashback for unlocking episode ${episode.episode_number} of ${showTitle ?? "Unknown Show"}`,
        show_id: episode.show_id,
        show_title: showTitle,
        episode_id: episode.id,
        episode_number: episode.episode_number,
        on_chain_episode_id: String(onChainEpisodeId),
        show_contract_address: showContractAddress,
        tx_hash: tx,
        usdc_amount: usdcAmount,
        tix_amount: tixAmount,
        duration_seconds: durationSeconds,
        wallet_address: walletAddress,
      });
      onSuccess();
    }
  };

  if (episode.is_free) return null;

  const tixBalanceDisplay = parseFloat(formatUnits(userTixBalance, 18)).toFixed(
    4
  );

  return (
    <div className={bare ? "" : "mt-4 p-4 rounded-xl bg-brand-pixsee-secondary/5 border border-brand-pixsee-secondary/20"}>
      {/* Episode info row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-neutral-tertiary-text">
        {fullDuration > 0 && (
          <span>
            Duration:{" "}
            <span className="font-medium text-neutral-secondary-text">
              {formatDuration(fullDuration)}
            </span>
          </span>
        )}
        <span>
          TIX needed:{" "}
          <span className="font-medium text-neutral-secondary-text">
            {durationSeconds} {tickSymbol}
          </span>
        </span>
      </div>

      {hasEnoughTix ? (
        // User has enough tix — show balance and unlock-with-tix option
        <div className="mb-3 text-sm">
          <p className="text-neutral-secondary-text">
            You have{" "}
            <span className="font-semibold text-brand-pixsee-secondary">
              {tixBalanceDisplay} {tickSymbol}
            </span>{" "}
            — unlock this episode without spending USDC.
          </p>
          <p className="text-xs text-neutral-tertiary-text mt-1">
            10% of your TIX is returned as watch rewards after unlocking.
          </p>
        </div>
      ) : (
        // User doesn't have enough tix — show USDC cost with breakdown
        cost && (
          <div className="mb-3">
            <p className="text-sm text-neutral-secondary-text">
              Cost:{" "}
              <span className="font-semibold text-brand-pixsee-secondary">
                ~${parseFloat(cost).toFixed(4)} USDC
              </span>
            </p>
          </div>
        )
      )}

      {error && (
        <div className="flex items-center gap-2 text-semantic-error-primary text-sm mb-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{friendlyTxError(error)}</span>
        </div>
      )}

      {hasEnoughTix ? (
        <Button
          onClick={handleUnlockWithTix}
          disabled={isLoading}
          className="w-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {step === "approving" ? "Approving Tix…" : "Unlocking…"}
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Unlock with your {tickSymbol} tix balance.{" "}
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleBuyAndUnlock}
          disabled={isLoading}
          className="w-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {step === "approving" ? "Approving USDC…" : "Unlocking…"}
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Buy & Watch{cost ? ` (~$${parseFloat(cost).toFixed(4)})` : ""}
            </>
          )}
        </Button>
      )}

      <p className="text-xs text-neutral-tertiary-text text-center mt-2">
        One-time unlock — watch anytime, forever
      </p>
    </div>
  );
};

//  VideoPlayer ─
// When an episode is locked, content starts with the thumbnail visible and a
// "Continue watching" modal overlay auto-appears (simulating the play → pause → pay flow).
// The user can dismiss the overlay to see the thumbnail, then tap the play button to bring
// the overlay back.
//
// NOTE FOR BACKEND DEV (30-second teaser):
// Once the backend can return a `preview_playback_id` on ApiEpisode (a Mux playback token
// limited to the first N seconds), pass it as `previewPlaybackUrl` below. The MuxPlayer will
// autoplay it; an `onTimeUpdate` handler will pause at FREE_PREVIEW_SECONDS and show the overlay.

// FREE_PREVIEW_SECONDS = 30 — used by the teaser feature once backend
// provides preview_playback_id. See NOTE FOR BACKEND DEV comment above.

const VideoPlayer = ({
  episode,
  playbackUrl,
  playbackLoading,
  hasAccess,
  showContractAddress,
  bondingCurveAddress,
  tickSymbol,
  showTitle,
  videoFormat,
  creatorPhaseActive,
  getAccessToken,
  onAccessGranted,
  onEnded,
  autoPlay,
}: {
  episode: ApiEpisode | null;
  playbackUrl: string | null;
  playbackLoading: boolean;
  hasAccess: boolean;
  showContractAddress?: Address;
  bondingCurveAddress?: Address;
  tickSymbol?: string;
  showTitle?: string;
  videoFormat?: "landscape" | "portrait" | null;
  creatorPhaseActive?: boolean;
  getAccessToken: () => Promise<string | null>;
  onAccessGranted: () => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}) => {
  const isPortrait = videoFormat === "portrait";

  // Auto-show the pay overlay whenever a new locked episode is selected.
  // Hooks must be declared before any conditional early returns.
  // If a preview is available, hide the overlay until the preview finishes playing.
  const [showPayOverlay, setShowPayOverlay] = useState(() => {
    return !(episode?.preview_token && episode?.preview_end_seconds && episode?.mux_playback_id);
  });
  const [feeExpanded, setFeeExpanded] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);
  const previewPlayerRef = React.useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // On episode change: hide overlay if a preview is available (it shows after preview ends),
    // otherwise show overlay immediately.
    const hasP = !!(episode?.preview_token && episode?.preview_end_seconds && episode?.mux_playback_id);
    setShowPayOverlay(!hasP);
    setFeeExpanded(false);
    setPreviewEnded(false);
  }, [episode?.id]);

  const hasPreview = !!(episode?.preview_token && episode?.preview_end_seconds && episode?.mux_playback_id);
  const previewUrl = hasPreview
    ? `https://stream.mux.com/${episode!.mux_playback_id}.m3u8?token=${episode!.preview_token}`
    : null;

  if (!episode) {
    return (
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
        <p className="text-white/40 text-sm">Select an episode to play</p>
      </div>
    );
  }

  // ── Creator phase: show is not yet open for public trading ────────────────
  if (creatorPhaseActive && !episode.is_free && !hasAccess) {
    return (
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden flex items-center justify-center bg-neutral-800",
          isPortrait
            ? "mx-auto w-full max-w-xs sm:max-w-sm aspect-9/16"
            : "w-full aspect-video"
        )}
      >
        {episode.thumbnail_url && (
          <img
            src={episode.thumbnail_url}
            alt={episode.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-6 py-8 max-w-xs mx-auto">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-white/70" />
          </div>
          <p className="text-white font-semibold text-base mb-2">
            Not open yet
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            The creator hasn't opened this show to the public yet. Check back
            soon.
          </p>
        </div>
      </div>
    );
  }

  // ── Locked episode: auto-show "Continue watching" overlay ─────────────────
  if (!episode.is_free && !hasAccess) {
    return (
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden",
          isPortrait
            ? "mx-auto w-full max-w-xs sm:max-w-sm aspect-9/16"
            : "w-full min-h-95 sm:min-h-0 sm:aspect-video"
        )}
      >
        {/* Background: preview player or thumbnail */}
        {hasPreview && !previewEnded ? (
          <MuxPlayer
            src={previewUrl!}
            poster={episode.thumbnail_url ?? undefined}
            autoPlay
            style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
            streamType="on-demand"
            onTimeUpdate={(e) => {
              const video = (e.target as HTMLVideoElement);
              if (episode.preview_end_seconds && video.currentTime >= episode.preview_end_seconds) {
                video.pause();
                setPreviewEnded(true);
                setShowPayOverlay(true);
              }
            }}
          />
        ) : episode.thumbnail_url ? (
          <Image
            src={episode.thumbnail_url}
            alt={episode.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-800" />
        )}
        {/* Dark scrim so UI elements are readable */}
        <div className={cn("absolute inset-0", hasPreview && !previewEnded && !showPayOverlay ? "bg-black/0" : "bg-black/55")} />

        {/* ── Play preview button when overlay is dismissed and preview hasn't played ── */}
        {!showPayOverlay && !(hasPreview && !previewEnded) && (
          <button
            onClick={() => setShowPayOverlay(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 group"
            aria-label="Buy to watch"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
            <p className="text-white/80 text-sm font-medium">
              Buy to watch this episode
            </p>
          </button>
        )}

        {/* ── Pay-to-watch modal overlay ── */}
        {/* Auto-appears when a locked episode is selected, simulating
            the "content starts → pauses → pay to continue" flow.
            Dismiss with X to see the thumbnail + play button. */}
        {showPayOverlay && (
          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-md bg-neutral-primary rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between p-4 pb-0">
                <div className="min-w-0 pr-2">
                  <p className="text-xs text-neutral-tertiary-text mb-0.5">
                    {previewEnded ? "Preview ended" : "Continue watching"}
                  </p>
                  <p className="font-semibold text-neutral-primary-text text-sm sm:text-base line-clamp-2">
                    {episode.title}
                  </p>
                </div>
                <button
                  onClick={() => setShowPayOverlay(false)}
                  className="shrink-0 text-neutral-tertiary-text hover:text-neutral-primary-text p-1 rounded-lg hover:bg-neutral-secondary transition-colors mt-0.5"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Fee breakdown toggle */}
              <button
                onClick={() => setFeeExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs text-neutral-tertiary-text hover:text-neutral-secondary-text transition-colors"
              >
                <span>See what you're paying for</span>
                {feeExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
              {feeExpanded && (
                <div className="px-4 pb-2 space-y-1 text-xs text-neutral-tertiary-text border-t border-neutral-tertiary-border pt-2 mx-4 mb-1 rounded">
                  <div className="flex justify-between">
                    <span>Watch reward (back to you)</span>
                    <span className="text-semantic-success-text">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Creator royalties</span>
                    <span>90%</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-tertiary-border">
                    <span>Platform fee</span>
                    <span>3% of purchase</span>
                  </div>
                  <p className="text-[10px] text-neutral-tertiary-text/70 pt-1 leading-relaxed">
                    One-time unlock — watch this episode anytime, forever.
                  </p>
                </div>
              )}

              {/* Buy & Watch button */}
              {showContractAddress && bondingCurveAddress ? (
                <div className="px-4 pb-4">
                  <BuyAndWatchButton
                    episode={episode}
                    showContractAddress={showContractAddress}
                    bondingCurveAddress={bondingCurveAddress}
                    tickSymbol={tickSymbol}
                    showTitle={showTitle}
                    getAccessToken={getAccessToken}
                    onSuccess={onAccessGranted}
                    bare
                  />
                </div>
              ) : (
                <div className="px-4 pb-4">
                  <p className="text-xs text-neutral-tertiary-text text-center py-2">
                    Show contract not available yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (playbackLoading || !playbackUrl) {
    return (
      <div
        className={cn(
          "relative bg-black rounded-2xl overflow-hidden flex items-center justify-center",
          isPortrait
            ? "mx-auto w-full max-w-xs sm:max-w-sm aspect-9/16"
            : "w-full aspect-video"
        )}
      >
        {episode.thumbnail_url && (
          <Image
            src={episode.thumbnail_url}
            alt={episode.title}
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="relative z-10 text-center px-6">
          <Loader2 className="w-10 h-10 text-white/50 animate-spin mx-auto mb-3" />
          <p className="text-white/50 text-sm">
            {episode.mux_status !== "ready"
              ? "Video processing…"
              : "Loading playback…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden bg-black",
        isPortrait
          ? "mx-auto w-full max-w-xs sm:max-w-sm aspect-9/16"
          : "w-full aspect-video"
      )}
    >
      <MuxPlayer
        src={playbackUrl}
        poster={episode.thumbnail_url ?? undefined}
        style={{ width: "100%", height: "100%" }}
        streamType="on-demand"
        autoPlay={autoPlay}
        onEnded={onEnded}
      />
    </div>
  );
};

//  EpisodeRow

const EpisodeRow = ({
  episode,
  isActive,
  hasAccess,
  tickSymbol,
  onClick,
}: {
  episode: ApiEpisode;
  isActive: boolean;
  hasAccess: boolean;
  tickSymbol?: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
      isActive
        ? "bg-brand-pixsee-secondary/10 border border-brand-pixsee-secondary/30"
        : "hover:bg-neutral-secondary border border-transparent"
    )}
  >
    <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-neutral-tertiary shrink-0">
      {episode.thumbnail_url ? (
        <Image
          src={episode.thumbnail_url}
          alt={episode.title}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Play className="w-5 h-5 text-neutral-tertiary-text" />
        </div>
      )}
      {isActive && (
        <div className="absolute inset-0 bg-brand-pixsee-secondary/20 flex items-center justify-center">
          <Play className="w-5 h-5 text-brand-pixsee-secondary fill-brand-pixsee-secondary" />
        </div>
      )}
      {episode.duration && (
        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
          {formatDuration(episode.duration)}
        </span>
      )}
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-xs text-neutral-tertiary-text mb-0.5">
        S{episode.season_number} E{episode.episode_number}
      </p>
      <p
        className={cn(
          "text-sm font-medium truncate",
          isActive ? "text-brand-pixsee-secondary" : "text-neutral-primary-text"
        )}
      >
        {episode.title}
      </p>
      {episode.description && (
        <p className="text-xs text-neutral-tertiary-text truncate mt-0.5">
          {episode.description}
        </p>
      )}
    </div>

    <div className="shrink-0">
      {episode.is_free || hasAccess ? (
        <span className="text-[10px] bg-semantic-success-subtle text-semantic-success-text px-2 py-0.5 rounded-full font-medium">
          {episode.is_free ? "Free" : "Unlocked"}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[10px] bg-brand-pixsee-secondary/10 text-brand-pixsee-secondary px-2 py-0.5 rounded-full font-medium">
          <Lock className="w-2.5 h-2.5" />
          {tickSymbol ?? "TIX"}
        </span>
      )}
    </div>
  </button>
);

//  Skeleton

const ShowDetailsSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="w-full aspect-video bg-neutral-tertiary rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-7 bg-neutral-tertiary rounded w-2/3" />
        <div className="h-4 bg-neutral-tertiary rounded w-1/3" />
        <div className="h-48 bg-neutral-tertiary rounded" />
      </div>
      <div className="h-64 bg-neutral-tertiary rounded-2xl" />
    </div>
  </div>
);

//  Main Component

const ShowDetails = ({ id }: { id: string }) => {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const { video: show, isLoading, error } = useVideo(id, getAccessToken);
  const { shows: relatedShows } = useVideos({
    perPage: 8,
    sort: "-published_at",
  });
  const {
    checkAccess,
    walletAddress,
    getShowInfo,
    buyAndUnlockBatch,
    quoteCostToWatch,
    setBingeModeApproval,
    getRouterUsdcAllowance,
  } = usePixseeContract();

  const apiShow = show as unknown as ApiShow;
  const episodes = apiShow?.episodes ?? [];
  const isSeries = apiShow?.type === "tv_show";

  const [activeEpisodeId, setActiveEpisodeId] = useState<number | null>(null);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState<number | null>(null);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [playbackRefreshKey, setPlaybackRefreshKey] = useState(0);
  const [episodeAccess, setEpisodeAccess] = useState<Record<number, boolean>>(
    {}
  );
  const [bingeQuote, setBingeQuote] = useState<string | null>(null);
  const [bingeLoading, setBingeLoading] = useState(false);
  const [bingeSuccess, setBingeSuccess] = useState(false);
  // Keeper binge mode: viewer pre-approves USDC to router so backend auto-buys next segment
  const [keeperBingeMode, setKeeperBingeMode] = useState(false);
  const [keeperBingeModeLoading, setKeeperBingeModeLoading] = useState(false);
  const [keeperBingeModeChecked, setKeeperBingeModeChecked] = useState(false);
  const [showContractAddress, setShowContractAddress] = useState<
    Address | undefined
  >();
  const [bondingCurveAddress, setBondingCurveAddress] = useState<
    Address | undefined
  >();
  const [resolvedTickSymbol, setResolvedTickSymbol] = useState<
    string | undefined
  >();
  // null = not yet read, true = creator phase active (not open), false = trading open
  const [creatorPhaseActive, setCreatorPhaseActive] = useState<boolean | null>(
    null
  );

  const activeEpisode =
    episodes.find((ep) => ep.id === activeEpisodeId) ?? episodes[0] ?? null;

  const currentEpisodeIndex = episodes.findIndex(
    (ep) => ep.id === (activeEpisodeId ?? episodes[0]?.id)
  );
  const nextEpisode =
    isSeries && currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1
      ? episodes[currentEpisodeIndex + 1]
      : null;

  // Cancel countdown when user manually switches episode; reset autoPlay flag
  useEffect(() => {
    setNextEpisodeCountdown(null);
    // autoPlayNext is intentionally NOT reset here — it was set in the same
    // batch as activeEpisodeId so MuxPlayer gets autoPlay=true on first render.
    // We reset it after a tick so subsequent manual clicks don't autoplay.
    const t = setTimeout(() => setAutoPlayNext(false), 500);
    return () => clearTimeout(t);
  }, [activeEpisodeId]);

  // Tick down every second; auto-play at 0
  useEffect(() => {
    if (nextEpisodeCountdown === null) return;
    if (nextEpisodeCountdown === 0) {
      if (nextEpisode) {
        setAutoPlayNext(true);
        setActiveEpisodeId(nextEpisode.id);
      }
      setNextEpisodeCountdown(null);
      return;
    }
    const t = setTimeout(
      () => setNextEpisodeCountdown((n) => (n !== null ? n - 1 : null)),
      1000
    );
    return () => clearTimeout(t);
  }, [nextEpisodeCountdown, nextEpisode]);

  const handleEpisodeEnded = useCallback(() => {
    if (nextEpisode) setNextEpisodeCountdown(5);
  }, [nextEpisode]);

  // Read contract addresses directly from API response (stored there via chain-info PATCH)
  useEffect(() => {
    if (apiShow?.show_contract)
      setShowContractAddress(apiShow.show_contract as Address);
    if (apiShow?.bonding_curve)
      setBondingCurveAddress(apiShow.bonding_curve as Address);
  }, [apiShow?.show_contract, apiShow?.bonding_curve]);

  // Check whether the show is still in creator phase (i.e. not yet open for public trading)
  useEffect(() => {
    if (!bondingCurveAddress) return;
    import("viem").then(({ createPublicClient, http }) =>
      import("viem/chains").then(({ baseSepolia }) => {
        const client = createPublicClient({
          chain: baseSepolia,
          transport: http("https://base-sepolia-rpc.publicnode.com"),
        });
        client
          .readContract({
            address: bondingCurveAddress,
            abi: [
              {
                name: "creatorPhaseActive",
                type: "function",
                stateMutability: "view",
                inputs: [],
                outputs: [{ name: "", type: "bool" }],
              },
            ],
            functionName: "creatorPhaseActive",
          })
          .then((v) => setCreatorPhaseActive(v as boolean))
          .catch(() => setCreatorPhaseActive(false));
      })
    );
  }, [bondingCurveAddress]);

  // Resolve tick symbol: use API value if present, otherwise read from factory contract
  useEffect(() => {
    if (apiShow?.tick_symbol) {
      setResolvedTickSymbol(apiShow.tick_symbol);
      return;
    }
    const onChainId = apiShow?.on_chain_show_id;
    if (!onChainId) return;
    getShowInfo(Number(onChainId))
      .then((info) => {
        if (info.tickSymbol) setResolvedTickSymbol(info.tickSymbol);
      })
      .catch(() => {});
  }, [apiShow?.tick_symbol, apiShow?.on_chain_show_id, getShowInfo]);

  // Check access for all episodes once we have the show contract and wallet
  const checkAllAccess = useCallback(async () => {
    if (!showContractAddress || !walletAddress || episodes.length === 0) return;
    const results = await Promise.all(
      episodes.map(async (ep) => {
        const episodeOnChainId =
          ep.on_chain_episode_id != null
            ? Number(ep.on_chain_episode_id)
            : ep.episode_number ?? ep.id;
        const access = await checkAccess(showContractAddress, episodeOnChainId);
        return [ep.id, access] as const;
      })
    );
    setEpisodeAccess(Object.fromEntries(results));
  }, [showContractAddress, walletAddress, episodes, checkAccess]);

  useEffect(() => {
    checkAllAccess();
  }, [checkAllAccess]);

  // Keeper binge mode: check if viewer has already pre-approved USDC to router
  useEffect(() => {
    if (!walletAddress) return;
    setKeeperBingeModeChecked(false);
    getRouterUsdcAllowance().then((allowance) => {
      setKeeperBingeMode(allowance > 0n);
      setKeeperBingeModeChecked(true);
    });
  }, [walletAddress, getRouterUsdcAllowance]);

  const handleKeeperBingeModeToggle = useCallback(async () => {
    if (!walletAddress) return;
    setKeeperBingeModeLoading(true);
    const tx = await setBingeModeApproval(!keeperBingeMode);
    setKeeperBingeModeLoading(false);
    if (tx) setKeeperBingeMode((prev) => !prev);
  }, [walletAddress, keeperBingeMode, setBingeModeApproval]);

  // Batch binge mode: quote cost for all locked episodes
  useEffect(() => {
    if (!bondingCurveAddress) {
      setBingeQuote(null);
      return;
    }
    const locked = episodes.filter(
      (ep) =>
        !ep.is_free && !episodeAccess[ep.id] && ep.on_chain_episode_id != null
    );
    if (locked.length < 2) {
      setBingeQuote(null);
      return;
    }
    const totalDuration = locked.reduce(
      (sum, ep) => sum + (ep.duration ?? 0),
      0
    );
    if (totalDuration === 0) {
      setBingeQuote(null);
      return;
    }
    quoteCostToWatch(bondingCurveAddress, totalDuration)
      .then(({ displayCost }) =>
        setBingeQuote(parseFloat(displayCost).toFixed(4))
      )
      .catch(() => setBingeQuote(null));
  }, [bondingCurveAddress, episodeAccess, episodes, quoteCostToWatch]);

  const handleBingeMode = useCallback(async () => {
    if (!showContractAddress || !bondingCurveAddress) return;
    const locked = episodes.filter(
      (ep) =>
        !ep.is_free && !episodeAccess[ep.id] && ep.on_chain_episode_id != null
    );
    if (locked.length === 0) return;
    const totalDuration = locked.reduce(
      (sum, ep) => sum + (ep.duration ?? 0),
      0
    );
    const episodeIds = locked.map((ep) => Number(ep.on_chain_episode_id));
    setBingeLoading(true);
    setBingeSuccess(false);
    const tx = await buyAndUnlockBatch({
      showContractAddress,
      bondingCurveAddress,
      episodeIds,
      totalDurationSeconds: totalDuration,
    });
    setBingeLoading(false);
    if (tx) {
      setBingeSuccess(true);
      const token = await getAccessToken().catch(() => null);
      // Notify backend via batch endpoint — single call unlocks all episodes
      const bingeTixAmount = formatUnits(BigInt(totalDuration) * BigInt("1000000000000000000"), 18);
      await fetch(`${BASE_URL}/api/v1/shows/${apiShow?.id}/episodes/grant-access-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tx_hash: tx,
          episode_ids: locked.map((ep) => ep.id),
          wallet_address: walletAddress,
          usdc_amount: bingeQuote ?? "0",
          tix_amount: bingeTixAmount,
        }),
      }).catch(() => {});
      recordTransaction(token, {
        type: "batch_episodes_purchased",
        show_id: apiShow?.id,
        show_contract_address: showContractAddress,
        episode_ids: locked.map((ep) => ep.id),
        on_chain_episode_ids: episodeIds.map(String),
        tx_hash: tx,
        usdc_amount: bingeQuote ?? "0",
        tix_amount: bingeTixAmount,
        total_duration_seconds: totalDuration,
        wallet_address: walletAddress,
      });
      // Await access re-check before triggering playback refetch,
      // otherwise the playback request fires before episodeAccess is updated.
      await checkAllAccess();
      setPlaybackRefreshKey((k) => k + 1);
    }
  }, [
    showContractAddress,
    bondingCurveAddress,
    episodes,
    episodeAccess,
    buyAndUnlockBatch,
    checkAllAccess,
  ]);

  const { playbackUrl, isLoading: playbackLoading } = useEpisodePlayback(
    activeEpisode?.id ?? null,
    getAccessToken,
    playbackRefreshKey
  );

  const [shareOpen, setShareOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeCommentTab, setActiveCommentTab] = useState<
    "top" | "recents" | "following"
  >("recents");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const creator = apiShow?.creator;
  const creatorName = creator?.name ?? creator?.username ?? "Unknown";
  const creatorProfileHref = creator?.id ? `/profile/${creator.id}` : null;

  // Pre-seed the social cache from API data so persistence works on remount
  const socialCache = useSocialState();
  useEffect(() => {
    if (!activeEpisode) return;
    const { id, is_liked, like_count } = activeEpisode;
    // Only seed if not already set by a user action (cache takes priority after toggle)
    if (socialCache.getLiked(id) === undefined && is_liked != null) {
      socialCache.setLiked(id, is_liked);
    }
    if (socialCache.getLikeCount(id) === undefined && like_count != null) {
      socialCache.setLikeCount(id, like_count);
    }
  }, [activeEpisode?.id, activeEpisode?.is_liked, activeEpisode?.like_count]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    liked,
    likesCount,
    setLikesCount,
    loading: likeLoading,
    toggle: toggleLike,
  } = useLike(
    activeEpisode?.id ?? null,
    getAccessToken,
    activeEpisode?.is_liked ?? false,
    activeEpisode?.like_count ?? 0
  );

  // Mirror episode liked state to show ID so ShowCard on the browse page reflects it
  useEffect(() => {
    if (!activeEpisode || !id) return;
    const showIdNum = parseInt(id);
    if (!isNaN(showIdNum)) socialCache.setLiked(showIdNum, liked);
  }, [liked, activeEpisode?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const {
    following,
    loading: followLoading,
    toggle: toggleFollow,
  } = useFollow(creator?.id, getAccessToken);
  const { addShow, removeShow, isInWatchlist } = useWatchlist(getAccessToken);
  const inWatchlist = isInWatchlist(parseInt(id));
  const toggleWatchlist = () =>
    inWatchlist ? removeShow(parseInt(id)) : addShow(parseInt(id));
  const {
    comments,
    isLoading: commentsLoading,
    isPosting,
    postComment,
    deleteComment,
  } = useComments(activeEpisode?.id ?? null, getAccessToken, activeCommentTab);

  const related = relatedShows.filter((s) => s.id !== id).slice(0, 4);
  const description =
    activeEpisode?.description && activeEpisode.description.trim()
      ? activeEpisode.description
      : apiShow?.description ?? "";
  const truncated = description.length > 300;

  const activeEpisodeOnChainId =
    (activeEpisode as any)?.on_chain_episode_id ??
    activeEpisode?.episode_number ??
    activeEpisode?.id ??
    null;

  const activeEpisodeHasAccess =
    activeEpisode?.is_free ||
    (activeEpisodeOnChainId !== null && episodeAccess[activeEpisode?.id ?? -1]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-semantic-error-primary mb-4">Failed to load show.</p>
        <button
          onClick={() => router.back()}
          className="text-brand-pixsee-secondary underline text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foundation-alternate pb-12">
      <div className="max-w-350 mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-neutral-secondary-text hover:text-neutral-primary-text transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>

      <div className="max-w-350 mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {isLoading ? (
          <ShowDetailsSkeleton />
        ) : (
          <>
            <div
              className={cn(
                "grid gap-4",
                isSeries && episodes.length > 1
                  ? "grid-cols-1 lg:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              <div
                className={
                  isSeries && episodes.length > 1 ? "lg:col-span-2" : ""
                }
              >
                <div className="relative">
                  <VideoPlayer
                    episode={activeEpisode}
                    playbackUrl={playbackUrl}
                    playbackLoading={playbackLoading}
                    hasAccess={activeEpisodeHasAccess ?? false}
                    showContractAddress={showContractAddress}
                    bondingCurveAddress={bondingCurveAddress}
                    tickSymbol={resolvedTickSymbol}
                    showTitle={apiShow?.title}
                    videoFormat={apiShow?.video_format}
                    creatorPhaseActive={creatorPhaseActive ?? false}
                    getAccessToken={getAccessToken}
                    onAccessGranted={() => {
                      checkAllAccess();
                      setPlaybackRefreshKey((k) => k + 1);
                    }}
                    onEnded={handleEpisodeEnded}
                    autoPlay={autoPlayNext}
                  />

                  {/* Next episode countdown overlay */}
                  {nextEpisodeCountdown !== null && nextEpisode && (
                    <div className="absolute bottom-3 right-3 z-20 w-56 sm:w-64 bg-neutral-primary/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-neutral-tertiary-border overflow-hidden">
                      {/* Thumbnail with countdown ring */}
                      <div className="relative aspect-video w-full bg-neutral-secondary">
                        {nextEpisode.thumbnail_url ? (
                          <Image
                            src={nextEpisode.thumbnail_url}
                            alt={nextEpisode.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-8 h-8 text-neutral-tertiary-text" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40" />
                        {/* Countdown ring */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
                              <circle
                                cx="18" cy="18" r="14" fill="none" stroke="white" strokeWidth="2.5"
                                strokeDasharray={`${(nextEpisodeCountdown / 5) * 87.96} 87.96`}
                                strokeLinecap="round"
                                className="transition-all duration-700"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-base">
                              {nextEpisodeCountdown}
                            </span>
                          </div>
                        </div>
                        {/* Close */}
                        <button
                          onClick={() => setNextEpisodeCountdown(null)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                          aria-label="Cancel auto-play"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Info + actions */}
                      <div className="p-3">
                        <p className="text-[10px] text-neutral-tertiary-text uppercase tracking-wide mb-0.5">Up next</p>
                        <p className="text-xs font-semibold text-neutral-primary-text line-clamp-1">
                          S{nextEpisode.season_number} E{nextEpisode.episode_number} — {nextEpisode.title}
                        </p>
                        <div className="flex gap-2 mt-2.5">
                          <button
                            onClick={() => {
                              setAutoPlayNext(true);
                              setActiveEpisodeId(nextEpisode.id);
                              setNextEpisodeCountdown(null);
                            }}
                            className="flex-1 py-1.5 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            Play now
                          </button>
                          <button
                            onClick={() => setNextEpisodeCountdown(null)}
                            className="px-3 py-1.5 bg-neutral-secondary hover:bg-neutral-tertiary text-neutral-secondary-text text-xs rounded-lg transition-colors border border-neutral-tertiary-border"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isSeries && activeEpisode && (
                  <p className="mt-2 text-sm text-neutral-secondary-text">
                    Now playing:{" "}
                    <span className="font-medium text-neutral-primary-text">
                      S{activeEpisode.season_number} E
                      {activeEpisode.episode_number} — {activeEpisode.title}
                    </span>
                  </p>
                )}

                {/* Show buy+unlock below player for non-series paid episodes */}
              </div>

              {isSeries && episodes.length > 1 && (
                <div className="bg-neutral-primary rounded-2xl p-3 sm:p-4 border border-neutral-tertiary-border">
                  <div className="flex items-center justify-between gap-2 mb-3 px-1">
                    <h3 className="font-paytone text-neutral-primary-text">
                      Episodes ({episodes.length})
                    </h3>
                    {walletAddress && !creatorPhaseActive && bingeQuote && (
                      <button
                        onClick={handleBingeMode}
                        disabled={bingeLoading || bingeSuccess}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover disabled:opacity-60 text-white text-xs font-medium rounded-full transition-colors whitespace-nowrap"
                      >
                        {bingeLoading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />{" "}
                            Unlocking…
                          </>
                        ) : bingeSuccess ? (
                          "All unlocked!"
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            Batch unlock all · ${bingeQuote} USDC
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="space-y-1 max-h-80 lg:max-h-120 overflow-y-auto pr-1">
                    {episodes.map((ep) => (
                      <EpisodeRow
                        key={ep.id}
                        episode={ep}
                        isActive={
                          (activeEpisodeId ?? episodes[0]?.id) === ep.id
                        }
                        hasAccess={episodeAccess[ep.id] ?? false}
                        tickSymbol={resolvedTickSymbol}
                        onClick={() => setActiveEpisodeId(ep.id)}
                      />
                    ))}
                  </div>

                  {/* Keeper binge mode toggle — viewer pre-approves USDC so backend auto-buys next segment */}
                  {walletAddress && !creatorPhaseActive && keeperBingeModeChecked && (
                    <div className="mt-3 pt-3 border-t border-neutral-tertiary-border">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-neutral-primary-text">
                            Auto-play next segment
                          </p>
                          <p className="text-xs text-neutral-tertiary-text mt-0.5 leading-relaxed">
                            {keeperBingeMode
                              ? "On — we'll automatically unlock the next segment so playback is seamless. Revoke anytime."
                              : "Authorise Pixsee to automatically purchase the next segment for you. You can revoke this at any time."}
                          </p>
                        </div>
                        <button
                          onClick={handleKeeperBingeModeToggle}
                          disabled={keeperBingeModeLoading}
                          className={cn(
                            "shrink-0 relative w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                            keeperBingeMode
                              ? "bg-brand-pixsee-secondary"
                              : "bg-neutral-tertiary"
                          )}
                          aria-label={keeperBingeMode ? "Disable auto-play" : "Enable auto-play"}
                        >
                          {keeperBingeModeLoading ? (
                            <Loader2 className="absolute inset-0 m-auto w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <span
                              className={cn(
                                "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                                keeperBingeMode ? "left-6" : "left-1"
                              )}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-5 sm:gap-3">
                <h1 className="text-xl sm:text-3xl font-paytone text-neutral-primary-text leading-tight">
                  {apiShow?.title}
                </h1>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pt-0.5">
                  <Button
                    variant="outline"
                    onClick={toggleLike}
                    disabled={likeLoading}
                    className={cn(
                      "rounded-full w-9 h-9 sm:w-auto sm:h-auto px-0 sm:px-4 py-0 sm:py-1.5 gap-1.5 text-xs sm:text-sm",
                      liked
                        ? "border-semantic-error-primary text-semantic-error-primary bg-semantic-error-subtle"
                        : "border-neutral-tertiary-border"
                    )}
                  >
                    <Heart
                      className={cn("w-3.5 h-3.5", liked && "fill-current")}
                    />
                    {likesCount > 0 && <span className="hidden sm:inline">{likesCount}</span>}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={toggleWatchlist}
                    className={cn(
                      "rounded-full w-9 h-9 sm:w-auto sm:h-auto px-0 sm:px-4 py-0 sm:py-1.5 gap-1.5 text-xs sm:text-sm",
                      inWatchlist
                        ? "border-brand-pixsee-secondary text-brand-pixsee-secondary bg-brand-pixsee-secondary/5"
                        : "border-neutral-tertiary-border"
                    )}
                  >
                    <Star
                      className={cn("w-3.5 h-3.5", inWatchlist && "fill-current")}
                    />
                    <span className="hidden sm:inline">
                      {inWatchlist ? "Saved" : "Watchlist"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShareOpen(true)}
                    className="rounded-full px-3 sm:px-4 py-1.5 gap-1.5 text-xs sm:text-sm border-neutral-tertiary-border"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>

              {/* Tags — horizontal scroll on mobile so they don't stack vertically */}
              {apiShow?.tags && apiShow.tags.length > 0 && (
                <div className="flex gap-2 mt-2.5 overflow-x-auto scrollbar-hide pb-1">
                  {apiShow.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2.5 py-1 bg-neutral-secondary rounded-full text-xs text-neutral-secondary-text whitespace-nowrap shrink-0"
                    >
                      <Tag className="w-3 h-3 shrink-0" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
              <div className="lg:col-span-2 bg-neutral-primary rounded-2xl p-4 sm:p-6 border border-neutral-tertiary-border">
                <h2 className="text-lg sm:text-xl font-paytone text-neutral-primary-text mb-3">
                  {activeEpisode && isSeries
                    ? `About: ${activeEpisode.title}`
                    : `About this ${isSeries ? "show" : "video"}`}
                </h2>
                <p className="text-sm sm:text-base text-neutral-secondary-text leading-relaxed">
                  {showFullDescription || !truncated
                    ? description
                    : `${description.slice(0, 300)}...`}
                  {truncated && (
                    <button
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      className="text-brand-pixsee-secondary hover:underline ml-1"
                    >
                      {showFullDescription ? "Show Less" : "Read More"}
                    </button>
                  )}
                  {!description && (
                    <span className="text-neutral-tertiary-text italic">
                      No description provided.
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-secondary rounded-lg border border-neutral-tertiary-border">
                    <span className="text-xs text-neutral-secondary-text">
                      Views
                    </span>
                    <Eye className="w-4 h-4 text-neutral-tertiary-text" />
                    <span className="text-xs font-semibold text-brand-pixsee-secondary">
                      {formatCount(
                        episodes.reduce(
                          (sum, ep) => sum + (ep.view_count ?? 0),
                          0
                        ) || activeEpisode?.view_count
                      )}
                    </span>
                  </div>
                  {activeEpisode?.duration && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-secondary rounded-lg border border-neutral-tertiary-border">
                      <span className="text-xs text-neutral-secondary-text">
                        Duration
                      </span>
                      <Clock className="w-4 h-4 text-neutral-tertiary-text" />
                      <span className="text-xs font-semibold text-brand-pixsee-secondary">
                        {formatDuration(activeEpisode.duration)}
                      </span>
                    </div>
                  )}
                  {isSeries && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-secondary rounded-lg border border-neutral-tertiary-border">
                      <span className="text-xs text-neutral-secondary-text">
                        Episodes
                      </span>
                      <span className="text-xs font-semibold text-brand-pixsee-secondary">
                        {episodes.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-neutral-primary rounded-2xl p-4 sm:p-6 flex flex-col border border-neutral-tertiary-border">
                <h2 className="text-lg sm:text-xl font-paytone text-neutral-primary-text mb-3">
                  Creator
                </h2>
                <div className="flex items-start gap-3 mb-4">
                  {creatorProfileHref ? (
                    <Link
                      href={creatorProfileHref}
                      className="flex items-start gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-12 h-12 rounded-full bg-neutral-tertiary overflow-hidden shrink-0 flex items-center justify-center text-lg font-semibold text-neutral-secondary-text">
                        {creatorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-primary-text hover:text-brand-pixsee-secondary transition-colors">
                          {creatorName}
                        </h3>
                        <p className="text-xs text-neutral-tertiary-text">
                          Video Creator
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-neutral-tertiary overflow-hidden shrink-0 flex items-center justify-center text-lg font-semibold text-neutral-secondary-text">
                        {creatorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-primary-text">
                          {creatorName}
                        </h3>
                        <p className="text-xs text-neutral-tertiary-text">
                          Video Creator
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={cn(
                    "w-full rounded-lg gap-2 text-sm mt-auto",
                    following
                      ? "border-neutral-tertiary-border text-neutral-secondary-text"
                      : "border-brand-pixsee-secondary text-brand-pixsee-secondary hover:bg-brand-pixsee-secondary hover:text-white"
                  )}
                >
                  {following ? (
                    <>
                      <UserCheck className="w-4 h-4" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Follow creator
                    </>
                  )}
                </Button>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h2 className="text-lg sm:text-xl font-paytone text-neutral-primary-text mb-4">
                  More to watch
                </h2>
                {/* Landscape first */}
                {related.filter((s) => s.videoFormat === "landscape").length >
                  0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4">
                    {related
                      .filter((s) => s.videoFormat === "landscape")
                      .map((show) => (
                        <ShowCard key={show.id} {...show} />
                      ))}
                  </div>
                )}
                {/* Portrait after */}
                {related.filter((s) => s.videoFormat !== "landscape").length >
                  0 && (
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {related
                      .filter((s) => s.videoFormat !== "landscape")
                      .map((show) => (
                        <ShowCard key={show.id} {...show} />
                      ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-neutral-primary rounded-2xl p-4 sm:p-6 mt-6 border border-neutral-tertiary-border">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg sm:text-xl font-paytone text-neutral-primary-text">
                  Comments
                </h2>
                <MessageCircle size={16} />
                <span className="text-sm text-neutral-tertiary-text">
                  {comments.length > 0 ? comments.length : ""}
                </span>
              </div>

              {/* Sort tabs */}
              <div className="flex gap-4 sm:gap-6 mb-4 border-b border-neutral-tertiary-border">
                {(["top", "recents", "following"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCommentTab(tab)}
                    className={cn(
                      "pb-2.5 text-xs sm:text-sm font-medium capitalize transition-colors",
                      activeCommentTab === tab
                        ? "text-neutral-primary-text border-b-2 border-neutral-primary-text"
                        : "text-neutral-tertiary-text hover:text-neutral-secondary-text"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Post comment */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-brand-pixsee-secondary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {creatorName.charAt(0).toUpperCase()}
                </div>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const ok = await postComment(newComment);
                      if (ok) setNewComment("");
                    }
                  }}
                  className="flex-1 px-2 sm:px-4 py-2.5 text-sm bg-neutral-secondary rounded-lg border border-neutral-tertiary-border focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
                />
                <Button
                  onClick={async () => {
                    const ok = await postComment(newComment);
                    if (ok) setNewComment("");
                  }}
                  disabled={isPosting || !newComment.trim()}
                  className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-lg px-3 sm:px-4 text-sm shrink-0 disabled:opacity-60"
                >
                  {isPosting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>

              {/* Comment list */}
              {commentsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-tertiary-text" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-neutral-tertiary-text text-center py-6 italic">
                  No comments yet. Be the first!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-tertiary flex items-center justify-center text-sm font-semibold text-neutral-secondary-text shrink-0">
                        {(comment.user?.name ?? comment.user?.username ?? "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-neutral-primary-text">
                            {comment.user?.name ??
                              comment.user?.username ??
                              "User"}
                          </span>
                          <span className="text-xs text-neutral-tertiary-text">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-secondary-text">
                          {comment.body}
                        </p>

                        <div className="flex items-center gap-3 mt-1">
                          <button
                            onClick={() => {
                              setReplyingTo(
                                replyingTo === comment.id ? null : comment.id
                              );
                              setReplyText("");
                            }}
                            className="text-xs text-neutral-tertiary-text hover:text-brand-pixsee-secondary transition-colors"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-xs text-neutral-tertiary-text hover:text-semantic-error-primary transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Reply input */}
                        {replyingTo === comment.id && (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm bg-neutral-secondary rounded-lg border border-neutral-tertiary-border focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
                            />
                            <Button
                              onClick={async () => {
                                const ok = await postComment(
                                  replyText,
                                  comment.id
                                );
                                if (ok) {
                                  setReplyText("");
                                  setReplyingTo(null);
                                }
                              }}
                              disabled={isPosting || !replyText.trim()}
                              className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-lg px-3 text-xs shrink-0 disabled:opacity-60"
                            >
                              Reply
                            </Button>
                          </div>
                        )}

                        {/* Nested replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 pl-3 border-l-2 border-neutral-tertiary-border space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-neutral-tertiary flex items-center justify-center text-xs font-semibold text-neutral-secondary-text shrink-0">
                                  {(
                                    reply.user?.name ??
                                    reply.user?.username ??
                                    "?"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-semibold text-neutral-primary-text">
                                      {reply.user?.name ??
                                        reply.user?.username ??
                                        "User"}
                                    </span>
                                    <span className="text-xs text-neutral-tertiary-text">
                                      {new Date(
                                        reply.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-neutral-secondary-text">
                                    {reply.body}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ShareSheet
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        url={
          typeof window !== "undefined"
            ? `${window.location.origin}/watch/${id}`
            : `/watch/${id}`
        }
        title={apiShow?.title}
        description={apiShow?.description ?? undefined}
      />
    </div>
  );
};

export default ShowDetails;
