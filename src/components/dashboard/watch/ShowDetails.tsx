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
} from "lucide-react";
import ShowCard from "@/components/dashboard/watch/ShowCard";
import {
  useVideo,
  useVideos,
  formatCount,
  useEpisodePlayback,
} from "@/app/hooks/useVideo";
import { ApiEpisode, ApiShow } from "@/app/types/pixsee-api";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";
import { useLike, useComments, useFollow } from "@/app/hooks/useSocial";
import { useSocialState } from "@/app/context/SocialStateContext";
import type { Address } from "viem";
import { formatUnits } from "viem";

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

//  BuyAndWatchButton ─
// Shows cost, handles approve + buy + unlock flow

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";

const BuyAndWatchButton = ({
  episode,
  showContractAddress,
  bondingCurveAddress,
  tickSymbol: tickSymbolProp,
  getAccessToken,
  onSuccess,
}: {
  episode: ApiEpisode;
  showContractAddress: Address;
  bondingCurveAddress: Address;
  tickSymbol?: string;
  getAccessToken: () => Promise<string | null>;
  onSuccess: () => void;
}) => {
  const {
    buyAndUnlock,
    quoteCostToWatch,
    getTixAddress,
    getTixBalance,
    unlockWithTix,
    isLoading,
    error,
  } = usePixseeContract();

  const [cost, setCost] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "approving" | "unlocking">("idle");
  const [tixAddress, setTixAddress] = useState<Address | null>(null);
  const [userTixBalance, setUserTixBalance] = useState<bigint>(0n);
  const tickSymbol = tickSymbolProp ?? "Tix";

  const durationSeconds = episode.duration ?? 600;
  const durationMinutes = Math.ceil(durationSeconds / 60);
  // Amount of tix-wei needed for this episode
  const tixNeeded = BigInt(durationSeconds) * BigInt("1000000000000000000");
  const hasEnoughTix = userTixBalance >= tixNeeded;

  // Fetch tix address + user's tix balance for this show
  useEffect(() => {
    if (!bondingCurveAddress || episode.is_free) return;
    getTixAddress(bondingCurveAddress).then((addr) => {
      setTixAddress(addr);
      // Try to read tick symbol from contract for display
      return getTixBalance(addr).then((bal) => setUserTixBalance(bal));
    }).catch(() => {});
  }, [bondingCurveAddress, episode.is_free, getTixAddress, getTixBalance]);

  // Fetch USDC cost quote (only needed when user doesn't have enough tix)
  useEffect(() => {
    if (!bondingCurveAddress || episode.is_free || hasEnoughTix) return;
    quoteCostToWatch(bondingCurveAddress, durationMinutes)
      .then((q) => setCost(q.displayCost))
      .catch(() => {});
  }, [bondingCurveAddress, durationMinutes, episode.is_free, hasEnoughTix, quoteCostToWatch]);

  const notifyBackend = async (tx: string) => {
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
          body: JSON.stringify({ tx_hash: tx }),
        }
      );
    } catch {
      // grant-access failed but tx succeeded — onSuccess still runs
    }
  };

  // Path A: user already has enough tix — unlock directly, no USDC
  const handleUnlockWithTix = async () => {
    if (!tixAddress) return;
    setStep("approving");
    const onChainEpisodeId =
      episode.on_chain_episode_id != null
        ? Number(episode.on_chain_episode_id)
        : episode.episode_number ?? episode.id;
    const tx = await unlockWithTix({
      showContractAddress,
      tixAddress,
      episodeId: onChainEpisodeId,
      durationSeconds,
    });
    setStep("idle");
    if (tx) {
      await notifyBackend(tx);
      onSuccess();
    }
  };

  // Path B: user doesn't have enough tix — buy with USDC + unlock via router
  const handleBuyAndUnlock = async () => {
    setStep("approving");
    const onChainEpisodeId =
      episode.on_chain_episode_id != null
        ? Number(episode.on_chain_episode_id)
        : episode.episode_number ?? episode.id;
    const tx = await buyAndUnlock({
      showContractAddress,
      bondingCurveAddress,
      episodeId: onChainEpisodeId,
      durationMinutes,
    });
    setStep("idle");
    if (tx) {
      await notifyBackend(tx);
      onSuccess();
    }
  };

  if (episode.is_free) return null;

  const tixBalanceDisplay = parseFloat(formatUnits(userTixBalance, 18)).toFixed(4);

  return (
    <div className="mt-4 p-4 rounded-xl bg-brand-pixsee-secondary/5 border border-brand-pixsee-secondary/20">
      <div className="flex items-center gap-2 mb-3">
        <Lock className="w-4 h-4 text-brand-pixsee-secondary" />
        <p className="text-sm font-medium text-brand-pixsee-secondary">
          This episode requires tix to unlock
        </p>
      </div>

      {hasEnoughTix ? (
        // User has enough tix — show tix balance and unlock-with-tix option
        <p className="text-sm text-neutral-secondary-text mb-3">
          You have{" "}
          <span className="font-semibold text-brand-pixsee-secondary">
            {tixBalanceDisplay} {tickSymbol}
          </span>{" "}
          — enough to unlock this episode without spending USDC.
        </p>
      ) : (
        // User doesn't have enough tix — show USDC cost
        cost && (
          <p className="text-sm text-neutral-secondary-text mb-3">
            Cost to watch:{" "}
            <span className="font-semibold text-brand-pixsee-secondary">
              ~${parseFloat(cost).toFixed(4)} USDC
            </span>
            <span className="text-xs ml-1 text-neutral-tertiary-text">
              (incl. 3% fee)
            </span>
          </p>
        )
      )}

      {error && (
        <div className="flex items-center gap-2 text-semantic-error-primary text-sm mb-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
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
              Unlock with {tickSymbol}
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

const VideoPlayer = ({
  episode,
  playbackUrl,
  playbackLoading,
  hasAccess,
  showContractAddress,
  bondingCurveAddress,
  tickSymbol,
  getAccessToken,
  onAccessGranted,
}: {
  episode: ApiEpisode | null;
  playbackUrl: string | null;
  playbackLoading: boolean;
  hasAccess: boolean;
  showContractAddress?: Address;
  bondingCurveAddress?: Address;
  tickSymbol?: string;
  getAccessToken: () => Promise<string | null>;
  onAccessGranted: () => void;
}) => {
  if (!episode) {
    return (
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
        <p className="text-white/40 text-sm">Select an episode to play</p>
      </div>
    );
  }

  // Locked episode — show paywal
  if (!episode.is_free && !hasAccess) {
    return (
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative flex items-center justify-center">
        {episode.thumbnail_url && (
          <Image
            src={episode.thumbnail_url}
            alt={episode.title}
            fill
            className="object-cover opacity-20 blur-sm"
          />
        )}
        <div className="relative z-10 text-center px-6 max-w-md">
          <Lock className="w-12 h-12 text-white/50 mx-auto mb-3" />
          <p className="text-white font-semibold text-lg mb-1">
            {episode.title}
          </p>
          <p className="text-white/60 text-sm">
            Purchase tix to unlock this episode
          </p>
          {showContractAddress && bondingCurveAddress && (
            <div className="mt-4">
              <BuyAndWatchButton
                episode={episode}
                showContractAddress={showContractAddress}
                bondingCurveAddress={bondingCurveAddress}
                tickSymbol={tickSymbol}
                getAccessToken={getAccessToken}
                onSuccess={onAccessGranted}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (playbackLoading || !playbackUrl) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
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
    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
      <MuxPlayer
        src={playbackUrl}
        poster={episode.thumbnail_url ?? undefined}
        style={{ width: "100%", height: "100%" }}
        streamType="on-demand"
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
    <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-neutral-tertiary flex-shrink-0">
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

    <div className="flex-shrink-0">
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

//  Skeleton ─

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

//  Main Component ─

const ShowDetails = ({ id }: { id: string }) => {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const { video: show, isLoading, error } = useVideo(id, getAccessToken);
  const { shows: relatedShows } = useVideos({
    perPage: 8,
    sort: "-published_at",
  });
  const { checkAccess, walletAddress } = usePixseeContract();

  const apiShow = show as unknown as ApiShow;
  const episodes = apiShow?.episodes ?? [];
  const isSeries = apiShow?.type === "tv_show";

  const [activeEpisodeId, setActiveEpisodeId] = useState<number | null>(null);
  const [playbackRefreshKey, setPlaybackRefreshKey] = useState(0);
  const [episodeAccess, setEpisodeAccess] = useState<Record<number, boolean>>(
    {}
  );
  const [showContractAddress, setShowContractAddress] = useState<
    Address | undefined
  >();
  const [bondingCurveAddress, setBondingCurveAddress] = useState<
    Address | undefined
  >();

  const activeEpisode =
    episodes.find((ep) => ep.id === activeEpisodeId) ?? episodes[0] ?? null;

  // Read contract addresses directly from API response (stored there via chain-info PATCH)
  useEffect(() => {
    if (apiShow?.show_contract)
      setShowContractAddress(apiShow.show_contract as Address);
    if (apiShow?.bonding_curve)
      setBondingCurveAddress(apiShow.bonding_curve as Address);
  }, [apiShow?.show_contract, apiShow?.bonding_curve]);

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

  const { playbackUrl, isLoading: playbackLoading } = useEpisodePlayback(
    activeEpisode?.id ?? null,
    getAccessToken,
    playbackRefreshKey
  );

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeCommentTab, setActiveCommentTab] = useState<
    "top" | "recents" | "following"
  >("recents");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const creator = apiShow?.creator;
  const creatorName = creator?.name ?? creator?.username ?? "Unknown";

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

  const { liked, likesCount, setLikesCount, loading: likeLoading, toggle: toggleLike } =
    useLike(
      activeEpisode?.id ?? null,
      getAccessToken,
      activeEpisode?.is_liked ?? false,
      activeEpisode?.like_count ?? 0
    );
  const { following, loading: followLoading, toggle: toggleFollow } =
    useFollow(creator?.id, getAccessToken);
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
                <VideoPlayer
                  episode={activeEpisode}
                  playbackUrl={playbackUrl}
                  playbackLoading={playbackLoading}
                  hasAccess={activeEpisodeHasAccess ?? false}
                  showContractAddress={showContractAddress}
                  bondingCurveAddress={bondingCurveAddress}
                  tickSymbol={apiShow?.tick_symbol ?? undefined}
                  getAccessToken={getAccessToken}
                  onAccessGranted={() => {
                    checkAllAccess();
                    setPlaybackRefreshKey((k) => k + 1);
                  }}
                />

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
                {!isSeries &&
                  activeEpisode &&
                  !activeEpisode.is_free &&
                  !activeEpisodeHasAccess &&
                  showContractAddress &&
                  bondingCurveAddress && (
                    <BuyAndWatchButton
                      episode={activeEpisode}
                      showContractAddress={showContractAddress}
                      bondingCurveAddress={bondingCurveAddress}
                      tickSymbol={apiShow?.tick_symbol ?? undefined}
                      getAccessToken={getAccessToken}
                      onSuccess={() => {
                        checkAllAccess();
                        setPlaybackRefreshKey((k) => k + 1);
                      }}
                    />
                  )}
              </div>

              {isSeries && episodes.length > 1 && (
                <div className="bg-neutral-primary rounded-2xl p-3 sm:p-4 border border-neutral-tertiary-border">
                  <h3 className="font-paytone text-neutral-primary-text mb-3 px-1">
                    Episodes ({episodes.length})
                  </h3>
                  <div className="space-y-1 max-h-[320px] lg:max-h-[480px] overflow-y-auto pr-1">
                    {episodes.map((ep) => (
                      <EpisodeRow
                        key={ep.id}
                        episode={ep}
                        isActive={
                          (activeEpisodeId ?? episodes[0]?.id) === ep.id
                        }
                        hasAccess={episodeAccess[ep.id] ?? false}
                        tickSymbol={apiShow?.tick_symbol ?? undefined}
                        onClick={() => setActiveEpisodeId(ep.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-3xl font-paytone text-neutral-primary-text">
                  {apiShow?.title}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {apiShow?.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2.5 py-0.5 bg-neutral-secondary rounded-full text-xs text-neutral-secondary-text"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={toggleLike}
                  disabled={likeLoading}
                  className={cn(
                    "rounded-full px-3 sm:px-4 py-1.5 gap-1.5 text-xs sm:text-sm",
                    liked
                      ? "border-semantic-error-primary text-semantic-error-primary bg-semantic-error-subtle"
                      : "border-neutral-tertiary-border"
                  )}
                >
                  <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} />
                  {likesCount > 0 && <span>{likesCount}</span>}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-3 sm:px-4 py-1.5 gap-1.5 text-xs sm:text-sm border-neutral-tertiary-border"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Watchlist</span>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-3 sm:px-4 py-1.5 gap-1.5 text-xs sm:text-sm border-neutral-tertiary-border"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </Button>
              </div>
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
                      {formatCount(activeEpisode?.view_count)}
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
                    <><UserCheck className="w-4 h-4" /> Following</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Follow creator</>
                  )}
                </Button>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h2 className="text-lg sm:text-xl font-paytone text-neutral-primary-text mb-4">
                  More to watch
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {related.map((show) => (
                    <ShowCard key={show.id} {...show} />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-neutral-primary rounded-2xl p-4 sm:p-6 mt-6 border border-neutral-tertiary-border">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg sm:text-xl font-paytone text-neutral-primary-text">
                  Comments
                </h2>
                <MessageCircle size={16} />
                <span className="text-sm text-neutral-tertiary-text">{comments.length > 0 ? comments.length : ""}</span>
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
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
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
                        {(comment.user?.name ?? comment.user?.username ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-neutral-primary-text">
                            {comment.user?.name ?? comment.user?.username ?? "User"}
                          </span>
                          <span className="text-xs text-neutral-tertiary-text">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-secondary-text">{comment.body}</p>

                        <div className="flex items-center gap-3 mt-1">
                          <button
                            onClick={() => {
                              setReplyingTo(replyingTo === comment.id ? null : comment.id);
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
                                const ok = await postComment(replyText, comment.id);
                                if (ok) { setReplyText(""); setReplyingTo(null); }
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
                                  {(reply.user?.name ?? reply.user?.username ?? "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-semibold text-neutral-primary-text">
                                      {reply.user?.name ?? reply.user?.username ?? "User"}
                                    </span>
                                    <span className="text-xs text-neutral-tertiary-text">
                                      {new Date(reply.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-neutral-secondary-text">{reply.body}</p>
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
    </div>
  );
};

export default ShowDetails;
