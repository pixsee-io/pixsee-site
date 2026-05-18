"use client";

import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Wallet,
  Coins,
  TrendingUp,
  Users,
  Eye,
  Film,
  Play,
  BarChart3,
  Lock,
  ChevronRight,
  Edit,
  DollarSign,
  User,
  Clapperboard,
  Plus,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMe, useTransactionAnalytics, useSeePoints } from "@/app/hooks/useSocial";
import { formatCount } from "@/app/hooks/useVideo";
import { useStudioShows } from "@/app/hooks/useStudio";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";
import { useTixPortfolio } from "@/app/hooks/useTixPortfolio";
import { CreatorRoyaltiesSection } from "@/components/dashboard/earn/CreatorRoyaltiesSection";
import { BoxOfficeRevenueSection } from "@/components/dashboard/earn/BoxOfficeRevenueSection";
import EditProfileModal from "@/components/dashboard/profile/modals/EditProfileModal";
import { formatUnits } from "viem";

type DashboardTab = "portfolio" | "profile" | "boxoffice" | "studio";

// ── My Portfolio Tab ──────────────────────────────────────────────────────────

function MyPortfolioTab({
  getAccessToken,
}: {
  getAccessToken: () => Promise<string | null>;
}) {
  const { getUsdcBalance, walletAddress } = usePixseeContract();
  const portfolio = useTixPortfolio(walletAddress);
  const { analytics } = useTransactionAnalytics(getAccessToken);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);

  useEffect(() => {
    getUsdcBalance().then(setUsdcBalance).catch(() => {});
  }, [getUsdcBalance]);

  const tixPortfolioValue = portfolio.holdings.reduce(
    (sum, h) => sum + parseFloat(h.valueUsdcDisplay),
    0
  );
  const totalPortfolioValue =
    (usdcBalance != null ? parseFloat(usdcBalance) : 0) + tixPortfolioValue;

  return (
    <div className="space-y-6">
      {/* Total portfolio value banner */}
      <div className="bg-brand-primary rounded-2xl p-6 text-white relative overflow-hidden balance_bg">
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">Total Portfolio Value</p>
          <p className="text-4xl font-bold">
            ${totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-white/60 text-xs mt-1">USDC wallet + TIX holdings</p>

          <div className="flex flex-wrap items-center gap-6 mt-5">
            <div>
              <p className="text-white/60 text-xs">USDC Balance</p>
              <p className="text-lg font-semibold">
                ${usdcBalance != null
                  ? parseFloat(usdcBalance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : "—"}
              </p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-white/60 text-xs">TIX Portfolio</p>
              <p className="text-lg font-semibold">
                ${tixPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-white/60 text-xs">Holdings</p>
              <p className="text-lg font-semibold">{portfolio.holdings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings analytics */}
      {analytics && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-primary rounded-xl p-4 border border-neutral-tertiary-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-semantic-success-primary/10 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4 text-semantic-success-primary" />
              </div>
              <p className="text-xs text-neutral-tertiary-text font-medium leading-tight">
                Box Office Claimed
              </p>
            </div>
            <p className="text-xl font-bold text-semantic-success-text">
              ${parseFloat(analytics.total_royalties_claimed_usdc).toFixed(4)}
            </p>
            <p className="text-xs text-neutral-tertiary-text mt-0.5">
              {analytics.royalties_claims_count} claim{analytics.royalties_claims_count !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="bg-neutral-primary rounded-xl p-4 border border-neutral-tertiary-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-brand-tertiary flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-brand-primary" />
              </div>
              <p className="text-xs text-neutral-tertiary-text font-medium leading-tight">
                Creator Royalties Claimed
              </p>
            </div>
            <p className="text-xl font-bold text-brand-primary">
              ${parseFloat(analytics.total_box_office_revenue_usdc).toFixed(4)}
            </p>
            <p className="text-xs text-neutral-tertiary-text mt-0.5">
              {analytics.fee_claims_count} claim{analytics.fee_claims_count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* TIX Holdings */}
      <div>
        <h3 className="text-base font-semibold text-neutral-primary-text mb-3">TIX Holdings</h3>

        {portfolio.isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-neutral-tertiary-text">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading portfolio…
          </div>
        ) : portfolio.holdings.length === 0 ? (
          <div className="bg-neutral-primary rounded-xl p-8 border border-neutral-tertiary-border text-center">
            <Wallet className="w-10 h-10 text-neutral-tertiary-text mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-primary-text">No TIX holdings yet</p>
            <p className="text-xs text-neutral-tertiary-text mt-1">
              Buy TIX to watch shows and earn rewards
            </p>
            <Link
              href="/trade"
              className="mt-4 inline-flex items-center gap-1.5 bg-brand-primary text-white text-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              Go to Trade <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {portfolio.holdings.map((holding) => {
              const tixBal = parseFloat(holding.tixBalanceDisplay);
              const lockedTix = holding.lockedTix
                ? parseFloat(formatUnits(holding.lockedTix, 18))
                : 0;
              const spotPrice = parseFloat(formatUnits(holding.spotPricePerToken, 6));

              return (
                <div
                  key={holding.showId}
                  className="bg-neutral-primary rounded-xl p-4 border border-neutral-tertiary-border"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-neutral-primary-text truncate">
                        {holding.show.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-neutral-secondary-text">
                          <span className="font-medium text-brand-pixsee-secondary">
                            {tixBal.toFixed(4)}
                          </span>{" "}
                          TIX
                        </span>
                        {lockedTix > 0 && (
                          <span className="flex items-center gap-1 text-xs text-neutral-tertiary-text">
                            <Lock className="w-3 h-3" />
                            {lockedTix.toFixed(4)} locked
                          </span>
                        )}
                        <span className="text-xs text-neutral-tertiary-text">
                          @ ${spotPrice.toFixed(6)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-brand-primary text-base">
                        $
                        {parseFloat(holding.valueUsdcDisplay).toLocaleString("en-US", {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })}
                      </p>
                      <p className="text-xs text-neutral-tertiary-text">USDC</p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between px-4 py-3 bg-brand-tertiary rounded-xl border border-brand-secondary/30">
              <p className="text-sm font-semibold text-brand-primary">Total TIX Value</p>
              <p className="text-base font-bold text-brand-primary">
                $
                {tixPortfolioValue.toLocaleString("en-US", {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── My Profile Tab ────────────────────────────────────────────────────────────

function MyProfileTab({
  getAccessToken,
}: {
  getAccessToken: () => Promise<string | null>;
}) {
  const { profile, updateProfile, isLoading: profileLoading } = useMe(getAccessToken);
  const { shows: myShows, isLoading: showsLoading } = useStudioShows(getAccessToken);
  const { balance: seePoints } = useSeePoints(getAccessToken);
  const { getUsdcBalance } = usePixseeContract();
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    getUsdcBalance().then(setUsdcBalance).catch(() => {});
  }, [getUsdcBalance]);

  const displayName = profile?.name ?? profile?.username ?? "User";
  const displayUsername = profile?.username ? `@${profile.username}` : profile?.email ?? "";
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";
  const followersCount = profile?.followers_count?.toLocaleString() ?? "0";
  const followingCount = profile?.following_count?.toLocaleString() ?? "0";
  const tokenBalance = profile?.token_balance
    ? parseFloat(profile.token_balance).toLocaleString("en-US", { maximumFractionDigits: 2 })
    : null;

  const totalViews = myShows.reduce((sum, s) => {
    return sum + (s.episodes?.reduce((es, ep) => es + ep.view_count, 0) ?? s.view_count ?? 0);
  }, 0);

  const statCards = [
    {
      label: "Published Shows",
      value: showsLoading ? "…" : String(myShows.length),
      icon: <Film className="w-4 h-4 text-brand-pixsee-secondary" />,
    },
    {
      label: "Total Views",
      value: showsLoading ? "…" : formatCount(totalViews),
      icon: <Eye className="w-4 h-4 text-brand-pixsee-secondary" />,
    },
    {
      label: "SEE Points",
      value: seePoints != null ? seePoints.toLocaleString() : "—",
      icon: <TrendingUp className="w-4 h-4 text-brand-pixsee-secondary" />,
    },
    {
      label: "Followers",
      value: followersCount,
      icon: <Users className="w-4 h-4 text-brand-pixsee-secondary" />,
    },
    {
      label: "Following",
      value: followingCount,
      icon: <Users className="w-4 h-4 text-brand-pixsee-secondary" />,
    },
    {
      label: "USDC Balance",
      value:
        usdcBalance != null
          ? `$${parseFloat(usdcBalance).toFixed(2)}`
          : "—",
      icon: <DollarSign className="w-4 h-4 text-brand-pixsee-secondary" />,
    },
  ];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-tertiary-text" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-neutral-primary rounded-2xl p-5 border border-neutral-tertiary-border">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-neutral-tertiary overflow-hidden flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={displayName}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-neutral-secondary-text">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-xl font-semibold text-neutral-primary-text">{displayName}</p>
            {displayUsername && (
              <p className="text-sm text-neutral-tertiary-text">{displayUsername}</p>
            )}
            {profile?.bio && (
              <p className="text-sm text-neutral-secondary-text mt-1 line-clamp-2">{profile.bio}</p>
            )}
            <p className="text-xs text-neutral-tertiary-text mt-1">Joined {joinedDate}</p>
            {tokenBalance !== null && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-brand-pixsee-tertiary rounded-full">
                <span className="text-xs font-semibold text-brand-pixsee-secondary">
                  {tokenBalance} $PIX
                </span>
              </div>
            )}
          </div>

          {/* Edit */}
          <Button
            variant="outline"
            onClick={() => setShowEditProfile(true)}
            className="border border-neutral-tertiary-border rounded-full gap-1.5 text-sm shrink-0"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>

        {/* Followers row */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-tertiary-border">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-neutral-tertiary-text" />
            <span className="text-sm font-semibold text-neutral-primary-text">{followersCount}</span>
            <span className="text-xs text-neutral-tertiary-text">followers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-neutral-tertiary-text" />
            <span className="text-sm font-semibold text-neutral-primary-text">{followingCount}</span>
            <span className="text-xs text-neutral-tertiary-text">following</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-neutral-primary rounded-xl px-4 py-4 border border-neutral-tertiary-border"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-brand-pixsee-tertiary flex items-center justify-center">
                {s.icon}
              </div>
              <p className="text-xs text-neutral-tertiary-text leading-tight">{s.label}</p>
            </div>
            <p className="text-xl font-bold text-neutral-primary-text">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/profile"
          className="flex items-center justify-between gap-2 bg-neutral-primary rounded-xl p-4 border border-neutral-tertiary-border hover:border-brand-pixsee-secondary/50 transition-colors"
        >
          <span className="text-sm font-medium text-neutral-primary-text">Full Profile</span>
          <ChevronRight className="w-4 h-4 text-neutral-tertiary-text" />
        </Link>
        <Link
          href="/earn"
          className="flex items-center justify-between gap-2 bg-neutral-primary rounded-xl p-4 border border-neutral-tertiary-border hover:border-brand-pixsee-secondary/50 transition-colors"
        >
          <span className="text-sm font-medium text-neutral-primary-text">Earn & Rewards</span>
          <ChevronRight className="w-4 h-4 text-neutral-tertiary-text" />
        </Link>
      </div>

      {showEditProfile && (
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          profile={profile}
          updateProfile={updateProfile}
        />
      )}
    </div>
  );
}

// ── My Box Office Tab ─────────────────────────────────────────────────────────

function MyBoxOfficeTab({
  getAccessToken,
}: {
  getAccessToken: () => Promise<string | null>;
}) {
  const { shows, isLoading } = useStudioShows(getAccessToken);

  return (
    <div className="space-y-6">
      {/* All Shows list */}
      <div>
        <h3 className="text-base font-semibold text-neutral-primary-text mb-3">All Shows</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-primary rounded-xl h-20 border border-neutral-tertiary-border animate-pulse"
              />
            ))}
          </div>
        ) : shows.length === 0 ? (
          <div className="bg-neutral-primary rounded-xl p-8 border border-neutral-tertiary-border text-center">
            <Film className="w-10 h-10 text-neutral-tertiary-text mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-primary-text">No shows yet</p>
            <p className="text-xs text-neutral-tertiary-text mt-1">
              Create your first show to start earning on Pixsee
            </p>
            <Link
              href="/create"
              className="mt-4 inline-flex items-center gap-1.5 bg-brand-pixsee-secondary text-white text-sm px-4 py-2 rounded-full hover:bg-brand-pixsee-hover transition-colors"
            >
              Create a Show
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {shows.map((show) => {
              const totalViews =
                show.episodes?.reduce((sum, ep) => sum + ep.view_count, 0) ??
                show.view_count ??
                0;
              const episodeCount = show.episodes?.length ?? show.episode_count ?? 0;
              const isOnChain = !!show.on_chain_show_id;

              return (
                <Link
                  key={show.id}
                  href={`/dashboard/studio/${show.id}`}
                  className="flex items-center gap-3 bg-neutral-primary rounded-xl p-3 border border-neutral-tertiary-border hover:border-brand-pixsee-secondary/40 transition-colors"
                >
                  {/* Cover */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-neutral-tertiary flex items-center justify-center">
                    {show.cover_image_url ? (
                      <Image
                        src={show.cover_image_url}
                        alt={show.title}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Film className="w-5 h-5 text-neutral-tertiary-text" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-neutral-primary-text truncate">
                      {show.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          show.status === "published"
                            ? "bg-semantic-success-primary/15 text-semantic-success-text"
                            : "bg-neutral-secondary text-neutral-tertiary-text"
                        )}
                      >
                        {show.status === "published" ? "Live" : "Draft"}
                      </span>
                      {isOnChain && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-pixsee-secondary/15 text-brand-pixsee-secondary">
                          On-chain
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-neutral-tertiary-text">
                        <Eye className="w-3 h-3" />
                        {formatCount(totalViews)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-neutral-tertiary-text">
                        <Play className="w-3 h-3" />
                        {episodeCount} ep
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-neutral-tertiary-text shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Box Office Revenue (90% viewer unlock) */}
      <div className="bg-neutral-primary rounded-2xl p-5 border border-neutral-tertiary-border">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-neutral-primary-text">Box Office Revenue</h3>
          <p className="text-xs text-neutral-tertiary-text mt-0.5">
            90% of TIX viewers pay to unlock your videos — claim as USDC (7% platform fee
            deducted on claim)
          </p>
        </div>
        <BoxOfficeRevenueSection getAccessToken={getAccessToken} />
      </div>

      {/* Creator Royalties (1% trade fee) */}
      <div className="bg-neutral-primary rounded-2xl p-5 border border-neutral-tertiary-border">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-neutral-primary-text">Creator Royalties</h3>
          <p className="text-xs text-neutral-tertiary-text mt-0.5">
            1% of every TIX trade on your shows — claim as USDC, no platform fee
          </p>
        </div>
        <CreatorRoyaltiesSection getAccessToken={getAccessToken} />
      </div>
    </div>
  );
}

// ── My Studio Tab ─────────────────────────────────────────────────────────────

function MyStudioTab({
  getAccessToken,
}: {
  getAccessToken: () => Promise<string | null>;
}) {
  const { shows, isLoading, error, refetch } = useStudioShows(getAccessToken);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-tertiary-text">
          {isLoading ? "Loading…" : `${shows.length} show${shows.length !== 1 ? "s" : ""}`}
        </p>
        <Link
          href="/create"
          className="flex items-center gap-1.5 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-3 py-2 rounded-xl font-semibold text-xs transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Show
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-neutral-primary rounded-2xl overflow-hidden border border-neutral-tertiary-border animate-pulse">
              <div className="aspect-video bg-neutral-tertiary" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-neutral-tertiary rounded w-3/4" />
                <div className="h-3 bg-neutral-tertiary rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-semantic-error-primary text-sm mb-3">Failed to load shows. Please try again.</p>
          <button onClick={() => refetch()} className="text-sm text-brand-pixsee-secondary hover:underline">
            Try again
          </button>
        </div>
      ) : shows.length === 0 ? (
        <div className="text-center py-12 px-4 border-2 border-dashed border-neutral-tertiary-border rounded-2xl">
          <Film className="w-10 h-10 text-neutral-tertiary-text mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-primary-text mb-1">No shows yet</p>
          <p className="text-xs text-neutral-tertiary-text mb-4">Create your first show to start earning</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-4 py-2 rounded-xl font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Create a Show
          </Link>
        </div>
      ) : (
        <>
          {shows.filter((s) => s.video_format !== "portrait").length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {shows.filter((s) => s.video_format !== "portrait").map((show) => {
                const episodeCount = show.episodes?.length ?? show.episode_count ?? 0;
                const totalViews = show.episodes?.reduce((sum, ep) => sum + ep.view_count, 0) ?? show.view_count ?? 0;
                const isOnChain = !!show.on_chain_show_id;
                return (
                  <Link
                    key={show.id}
                    href={`/dashboard/studio/${show.id}`}
                    className="group relative bg-neutral-primary rounded-2xl overflow-hidden border border-neutral-tertiary-border hover:border-brand-pixsee-secondary/50 transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-video bg-neutral-secondary overflow-hidden">
                      {show.cover_image_url ? (
                        <Image src={show.cover_image_url} alt={show.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 50vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Film className="w-8 h-8 text-neutral-tertiary-text" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full", show.status === "published" ? "bg-semantic-success-primary/90 text-white" : "bg-neutral-tertiary-text/90 text-white")}>
                          {show.status === "published" ? "Live" : "Draft"}
                        </span>
                      </div>
                      {isOnChain && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-brand-pixsee-secondary/90 text-white">On-chain</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] px-2 py-1 rounded-lg flex items-center gap-1">
                        <Play className="w-3 h-3" />{episodeCount} ep
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-neutral-primary-text truncate mb-1 group-hover:text-brand-pixsee-secondary transition-colors">{show.title}</h3>
                      <div className="flex items-center justify-between text-xs text-neutral-tertiary-text">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{totalViews.toLocaleString()}</span>
                        <span>{formatDate(show.created_at)}</span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isOnChain && (
                        <div className="bg-neutral-primary rounded-full p-1.5 shadow-md">
                          <Pencil className="w-3.5 h-3.5 text-neutral-secondary-text" />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          {shows.filter((s) => s.video_format === "portrait").length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
              {shows.filter((s) => s.video_format === "portrait").map((show) => {
                const episodeCount = show.episodes?.length ?? show.episode_count ?? 0;
                const totalViews = show.episodes?.reduce((sum, ep) => sum + ep.view_count, 0) ?? show.view_count ?? 0;
                const isOnChain = !!show.on_chain_show_id;
                return (
                  <Link
                    key={show.id}
                    href={`/dashboard/studio/${show.id}`}
                    className="group bg-neutral-primary rounded-2xl overflow-hidden border border-neutral-tertiary-border hover:border-brand-pixsee-secondary/50 transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[3/4] bg-neutral-secondary overflow-hidden">
                      {show.cover_image_url ? (
                        <Image src={show.cover_image_url} alt={show.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, 25vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Film className="w-8 h-8 text-neutral-tertiary-text" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full", show.status === "published" ? "bg-semantic-success-primary/90 text-white" : "bg-neutral-tertiary-text/90 text-white")}>
                          {show.status === "published" ? "Live" : "Draft"}
                        </span>
                      </div>
                      {isOnChain && (
                        <div className="absolute bottom-2 left-2">
                          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-brand-pixsee-secondary/90 text-white">On-chain</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                        <Play className="w-3 h-3" />{episodeCount}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h3 className="font-semibold text-xs text-neutral-primary-text truncate group-hover:text-brand-pixsee-secondary transition-colors">{show.title}</h3>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-neutral-tertiary-text">
                        <Eye className="w-3 h-3" />{totalViews.toLocaleString()}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────

export default function MyDashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("portfolio");
  const { getAccessToken } = usePrivy();
  const { profile } = useMe(getAccessToken);
  const { analytics: txAnalytics } = useTransactionAnalytics(getAccessToken);
  const { shows: myShows, isLoading: showsLoading } = useStudioShows(getAccessToken);

  const totalViews = myShows.reduce((sum, s) => {
    return sum + (s.episodes?.reduce((es, ep) => es + ep.view_count, 0) ?? s.view_count ?? 0);
  }, 0);

  const totalEarnings = txAnalytics
    ? parseFloat(txAnalytics.total_royalties_claimed_usdc) +
      parseFloat(txAnalytics.total_box_office_revenue_usdc)
    : null;

  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: "portfolio", label: "My Portfolio", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "profile", label: "My Profile", icon: <User className="w-4 h-4" /> },
    { id: "boxoffice", label: "My Box Office", icon: <Clapperboard className="w-4 h-4" /> },
    { id: "studio", label: "My Studio", icon: <Film className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-foundation-alternate pb-12">
      <div className="max-w-350 mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-paytone text-neutral-primary-text">
            My Dashboard
          </h1>
          <p className="text-neutral-secondary-text mt-1">
            {profile?.name ? `Welcome back, ${profile.name}` : "Your creator overview"}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-neutral-primary rounded-xl px-3 py-4 border border-neutral-tertiary-border text-center">
            <p className="text-2xl font-bold text-neutral-primary-text">
              {showsLoading ? "…" : String(myShows.length)}
            </p>
            <p className="text-xs text-neutral-tertiary-text mt-0.5">Total Shows</p>
          </div>
          <div className="bg-neutral-primary rounded-xl px-3 py-4 border border-neutral-tertiary-border text-center">
            <p className="text-2xl font-bold text-neutral-primary-text">
              {showsLoading ? "…" : formatCount(totalViews)}
            </p>
            <p className="text-xs text-neutral-tertiary-text mt-0.5">Total Views</p>
          </div>
          <div className="bg-brand-primary rounded-xl px-3 py-4 text-center">
            <p className="text-2xl font-bold text-white">
              {totalEarnings != null ? `$${totalEarnings.toFixed(2)}` : "—"}
            </p>
            <p className="text-xs text-white/70 mt-0.5">Total Earnings</p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-6">
          <div className="flex gap-2 pb-1 w-max md:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                  activeTab === tab.id
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-neutral-primary text-neutral-secondary-text border-neutral-tertiary-border hover:border-neutral-secondary-border"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "portfolio" && <MyPortfolioTab getAccessToken={getAccessToken} />}
        {activeTab === "profile" && <MyProfileTab getAccessToken={getAccessToken} />}
        {activeTab === "boxoffice" && <MyBoxOfficeTab getAccessToken={getAccessToken} />}
        {activeTab === "studio" && <MyStudioTab getAccessToken={getAccessToken} />}
      </div>
    </div>
  );
}
