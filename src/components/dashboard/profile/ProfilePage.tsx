"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Eye,
  Users,
  TrendingUp,
  DollarSign,
  Play,
  Plus,
  Calendar,
  ArrowUp,
  EyeOff,
  Verified,
  Edit,
  Loader2,
} from "lucide-react";
import ShowCard from "@/components/dashboard/watch/ShowCard";
import EditProfileModal from "./modals/EditProfileModal";
import WithdrawModal from "@/components/dashboard/earn/modals/WithdrawModal";
import Image from "next/image";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useMe, useWatchHistory, useWatchlist, useSeePoints } from "@/app/hooks/useSocial";
import { formatCount, useMyShows } from "@/app/hooks/useVideo";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";

// Types
type ProfileTabId = "overview" | "published" | "watchlist" | "history" | "earnings";

type AnalyticsStat = {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  change?: string;
};

type WatchHistoryItem = {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  views: string;
  uploadedAt: string;
  earnAmount: string;
  progress: number;
};

type RewardSource = {
  label: string;
  percentage: number;
  color: string;
};


const analyticsStats: AnalyticsStat[] = [
  {
    id: "views",
    icon: <Eye className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    label: "Total Views",
    value: "12,450",
    change: "+10%",
  },
  {
    id: "subscribers",
    icon: <Users className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    label: "Subscribers",
    value: "12,450",
    change: "+10%",
  },
  {
    id: "duration",
    icon: <TrendingUp className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    label: "Avg watch Duration",
    value: "12,450",
    change: "+10%",
  },
  {
    id: "revenue",
    icon: <DollarSign className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    label: "Revenue (30d)",
    value: "12,450",
    change: "+10%",
  },
  {
    id: "shows",
    icon: <Eye className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    label: "Shows Watched",
    value: "45",
  },
  {
    id: "watchtime",
    icon: <Users className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    label: "Watch Time",
    value: "65hr",
  },
  {
    id: "genre",
    icon: <TrendingUp className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    label: "Favorites Genres",
    value: "Education",
  },
  {
    id: "streak",
    icon: <DollarSign className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    label: "Day Streak",
    value: "7-Days",
  },
];



const rewardSources: RewardSource[] = [
  { label: "Watch Rewards", percentage: 60, color: "bg-brand-primary" },
  {
    label: "Engagement Bonus",
    percentage: 40,
    color: "bg-brand-pixsee-secondary",
  },
  { label: "Referrals", percentage: 30, color: "bg-pink-500" },
];

// Sub-components
const AnalyticsCard = ({ stat }: { stat: AnalyticsStat }) => (
  <div className="bg-neutral-primary rounded-xl px-4 py-6 border border-neutral-tertiary-border">
    <div
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center mb-3",
        stat.iconBg
      )}
    >
      {stat.icon}
    </div>
    <p className="text-sm text-neutral-tertiary-text mb-1">{stat.label}</p>
    <div className="flex items-center justify-between">
      <p className="text-2xl font-bold text-neutral-primary-text">
        {stat.value}
      </p>
      {stat.change && (
        <span className="flex items-center text-sm text-semantic-success-text">
          <ArrowUp className="w-3 h-3 mr-1" />
          {stat.change}
        </span>
      )}
    </div>
  </div>
);

const WatchHistoryCard = ({ item }: { item: WatchHistoryItem }) => (
  <div className="bg-neutral-primary rounded-xl p-4 border border-neutral-tertiary-border">
    {/* Mobile: stacked layout. sm+: side-by-side */}
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Thumbnail — full width on mobile, fixed width on sm+ */}
      <div className="relative w-full sm:w-40 h-44 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-neutral-tertiary">
        {item.thumbnailUrl && (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-brand-pixsee-secondary fill-brand-pixsee-secondary" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {item.duration}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-neutral-tertiary-text">
              Episode {item.episodeNumber}
            </p>
            <h4 className="font-semibold text-brand-pixsee-secondary truncate">
              {item.title}
            </h4>
          </div>
          <span className="text-xs text-brand-pixsee-secondary bg-brand-pixsee-secondary/30 px-2 py-1 rounded-lg whitespace-nowrap shrink-0">
            Earn {item.earnAmount}
          </span>
        </div>
        <p className="text-sm text-neutral-secondary-text line-clamp-2 mt-1">
          {item.description}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-tertiary-text">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {item.views}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {item.uploadedAt}
          </span>
        </div>
      </div>
    </div>

    {/* Progress bar */}
    <div className="mt-3 h-1.5 bg-neutral-tertiary rounded-full overflow-hidden">
      <div
        className="h-full bg-brand-primary rounded-full"
        style={{ width: `${item.progress}%` }}
      />
    </div>
  </div>
);

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<ProfileTabId>("overview");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const { getAccessToken } = usePrivy();
  const { profile, updateProfile } = useMe(getAccessToken);
  const { history: watchHistoryData, isLoading: historyLoading } = useWatchHistory(getAccessToken);
  const { items: watchlistItems, isLoading: watchlistLoading } = useWatchlist(getAccessToken);
  const { shows: myShows, isLoading: myShowsLoading } = useMyShows(getAccessToken);
  const { getUsdcBalance } = usePixseeContract();
  const { balance: seePoints, earnData } = useSeePoints(getAccessToken);

  useEffect(() => {
    getUsdcBalance().then(setUsdcBalance).catch(() => {});
  }, [getUsdcBalance]);

  const displayName = profile?.name ?? profile?.username ?? "User";
  const displayUsername = profile?.username ? `@${profile.username}` : profile?.email ?? "";
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";
  const followersCount = profile?.followers_count?.toLocaleString() ?? "0";
  const followingCount = profile?.following_count?.toLocaleString() ?? "0";
  const tokenBalance = profile?.token_balance
    ? parseFloat(profile.token_balance).toLocaleString("en-US", { maximumFractionDigits: 2 })
    : null;

  const tabs: { id: ProfileTabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "published", label: "Published Shows" },
    { id: "watchlist", label: "Watchlist" },
    { id: "history", label: "Watch History" },
    { id: "earnings", label: "Earnings" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "published":
        return (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-paytone text-neutral-primary-text">
                Published Shows
              </h2>
              <Button className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full gap-2 w-full sm:w-auto">
                Upload New Shows
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {myShowsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-tertiary-text" />
              </div>
            ) : myShows.length === 0 ? (
              <p className="text-sm text-neutral-tertiary-text text-center py-12 italic">No published shows yet.</p>
            ) : (
              <>
                {myShows.filter((s) => s.videoFormat === "landscape").length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
                    {myShows.filter((s) => s.videoFormat === "landscape").map((show) => (
                      <ShowCard key={show.id} {...show} />
                    ))}
                  </div>
                )}
                {myShows.filter((s) => s.videoFormat !== "landscape").length > 0 && (
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                    {myShows.filter((s) => s.videoFormat !== "landscape").map((show) => (
                      <ShowCard key={show.id} {...show} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "history":
        return (
          <div>
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-6">
              Watch History
            </h2>
            {historyLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-tertiary-text" />
              </div>
            ) : watchHistoryData.length > 0 ? (
              <div className="space-y-4">
                {watchHistoryData.map((item: any) => {
                  const video = item.video ?? item;
                  return (
                  <Link key={video.id} href={`/dashboard/watch/${video.show_id ?? video.id}`} className="block hover:opacity-90 transition-opacity">
                  <WatchHistoryCard
                    item={{
                      id: String(video.id),
                      episodeNumber: video.episode_number ?? 1,
                      title: video.title ?? "Untitled",
                      description: video.description ?? "",
                      thumbnailUrl: video.thumbnail_url ?? video.cover_image_url ?? "/images/movie1.png",
                      duration: video.duration ? `${Math.floor(video.duration / 60)}m` : "—",
                      views: video.view_count ? `${video.view_count} Views` : "0 Views",
                      uploadedAt: item.last_viewed_at
                        ? new Date(item.last_viewed_at).toLocaleDateString()
                        : video.created_at
                        ? new Date(video.created_at).toLocaleDateString()
                        : "",
                      earnAmount: "—",
                      progress: item.progress_percentage ?? 0,
                    }}
                  />
                  </Link>
                )})}
              </div>
            ) : (
              <p className="text-sm text-neutral-tertiary-text text-center py-12 italic">
                No watch history yet.
              </p>
            )}
          </div>
        );

      case "watchlist":
        return (
          <div>
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-6">
              Watchlist
            </h2>
            {watchlistLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-tertiary-text" />
              </div>
            ) : watchlistItems.length === 0 ? (
              <p className="text-sm text-neutral-tertiary-text text-center py-12 italic">
                No saved shows yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                {watchlistItems.map((item) => {
                  const s = item.show ?? item.video;
                  if (!s) return null;
                  const fmt = s.video_format === "landscape" ? "landscape" : "portrait";
                  return (
                    <div
                      key={item.id}
                      className={fmt === "landscape" ? "col-span-2" : "col-span-1"}
                    >
                      <ShowCard
                        id={String(s.id)}
                        title={s.title ?? "Untitled"}
                        thumbnailUrl={s.cover_image_url ?? s.thumbnail_url ?? s.cover_url ?? "/images/movie1.png"}
                        creatorName={s.creator?.name ?? s.creator?.username ?? s.user?.name ?? "Unknown"}
                        creatorAvatar={s.creator?.avatar_url ?? s.user?.avatar_url}
                        views={formatCount(s.view_count ?? s.views_count)}
                        likes={formatCount(s.likes_count ?? s.like_count)}
                        description={s.description}
                        isLiked={s.is_liked}
                        videoFormat={fmt}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "earnings":
        return (
          <div>
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-6">
              Earnings
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Balance Card */}
              <div className="relative rounded-2xl overflow-hidden bg-brand-primary p-6 py-10 sm:py-12 balance_bg">
                <div className="flex flex-col items-center justify-center relative z-10 gap-4">
                  {/* USDC */}
                  <div className="text-center">
                    <p className="text-white/70 text-xs mb-1">USDC Balance</p>
                    <div className="flex items-center gap-2 justify-center">
                      <p className="text-3xl sm:text-4xl font-bold text-white">
                        {showBalance
                          ? (usdcBalance != null
                            ? `$${parseFloat(usdcBalance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "—")
                          : "••••••"}
                      </p>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {/* $PIX + SEE Points row */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-white/60 text-xs mb-0.5">$PIX</p>
                      <p className="text-lg font-semibold text-white/80">
                        {showBalance ? "0" : "•••"}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                      <p className="text-white/60 text-xs mb-0.5">SEE Points</p>
                      <p className="text-lg font-semibold text-white/80">
                        {showBalance ? (seePoints != null ? seePoints.toLocaleString() : "—") : "•••"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowWithdraw(true)}
                    className="bg-transparent hover:bg-white/10 text-white border-white/50 rounded-full px-8 py-5 gap-2 w-full sm:w-auto"
                  >
                    Withdraw
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Reward Sources */}
              <div className="bg-neutral-primary rounded-2xl p-4 sm:p-6 border border-neutral-tertiary-border">
                <p className="text-lg font-paytone text-neutral-primary-text mb-4">
                  SEE Points Breakdown
                </p>
                <div className="space-y-4">
                  {(() => {
                    const total = earnData
                      ? ((earnData.watch_points ?? 0) + (earnData.engagement_points ?? 0) + (earnData.referral_points ?? 0))
                      : 0;
                    const sources = earnData && total > 0
                      ? [
                          { label: "Watch Rewards", pts: earnData.watch_points ?? 0, color: "bg-brand-primary" },
                          { label: "Engagement", pts: earnData.engagement_points ?? 0, color: "bg-brand-pixsee-secondary" },
                          { label: "Referrals", pts: earnData.referral_points ?? 0, color: "bg-pink-500" },
                        ].filter((s) => s.pts > 0)
                      : rewardSources.map((s) => ({ label: s.label, pts: s.percentage, color: s.color }));
                    const maxPts = Math.max(...sources.map((s) => s.pts), 1);
                    return sources.map((source, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-neutral-secondary-text">{source.label}</span>
                          <span className="text-sm font-medium text-neutral-primary-text">
                            {earnData && total > 0 ? `${source.pts.toLocaleString()} pts` : `${source.pts}%`}
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-tertiary rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", source.color)}
                            style={{ width: `${Math.round((source.pts / maxPts) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        );

      case "overview":
      default: {
        const overviewStats: AnalyticsStat[] = [
          {
            id: "views",
            icon: <Eye className="w-5 h-5 text-brand-pixsee-secondary" />,
            iconBg: "bg-brand-pixsee-tertiary",
            label: "Total Views",
            value: myShows.reduce((sum, s) => sum + (parseInt(s.views.replace(/[^\d]/g, "")) || 0), 0) > 0
              ? formatCount(myShows.reduce((sum, s) => sum + (parseInt(s.views.replace(/[^\d]/g, "")) || 0), 0))
              : "—",
          },
          {
            id: "subscribers",
            icon: <Users className="w-5 h-5 text-brand-pixsee-secondary" />,
            iconBg: "bg-brand-pixsee-tertiary",
            label: "Subscribers",
            value: followersCount,
          },
          {
            id: "shows",
            icon: <Play className="w-5 h-5 text-brand-pixsee-secondary" />,
            iconBg: "bg-brand-pixsee-tertiary",
            label: "Published Shows",
            value: myShows.length > 0 ? String(myShows.length) : (myShowsLoading ? "…" : "0"),
          },
          {
            id: "watchlist",
            icon: <TrendingUp className="w-5 h-5 text-brand-pixsee-secondary" />,
            iconBg: "bg-brand-pixsee-tertiary",
            label: "Watchlist",
            value: watchlistItems.length > 0 ? String(watchlistItems.length) : "0",
          },
          {
            id: "history",
            icon: <Eye className="w-5 h-5 text-brand-pixsee-secondary" />,
            iconBg: "bg-brand-pixsee-tertiary",
            label: "Shows Watched",
            value: watchHistoryData.length > 0 ? String(watchHistoryData.length) : "0",
          },
          {
            id: "balance",
            icon: <DollarSign className="w-5 h-5 text-brand-pixsee-secondary" />,
            iconBg: "bg-brand-pixsee-tertiary",
            label: "USDC Balance",
            value: usdcBalance != null ? `$${parseFloat(usdcBalance).toFixed(2)}` : "—",
          },
          {
            id: "following",
            icon: <Users className="w-5 h-5 text-brand-pixsee-secondary" />,
            iconBg: "bg-brand-pixsee-tertiary",
            label: "Following",
            value: followingCount,
          },
          {
            id: "pix",
            icon: <DollarSign className="w-5 h-5 text-brand-pixsee-secondary" />,
            iconBg: "bg-brand-pixsee-tertiary",
            label: "$PIX Balance",
            value: tokenBalance ?? "0",
          },
        ];
        return (
          <div>
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-6">
              Analytics Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {overviewStats.map((stat) => (
                <AnalyticsCard key={stat.id} stat={stat} />
              ))}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-foundation-alternate pb-12">
      <div className="max-w-350 mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-paytone text-neutral-primary-text">
            My profile
          </h1>
          <p className="text-neutral-secondary-text mt-1">
            Track your watch rewards and engagement progress.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-neutral-primary rounded-2xl p-4 sm:p-6 mb-6 border border-neutral-tertiary-border">
          <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col items-center md:flex-row md:items-center gap-4 w-full md:w-auto">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full bg-neutral-tertiary overflow-hidden flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt={displayName} width={80} height={80} className="object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-neutral-secondary-text">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Name + stats */}
              <div className="mt-2 md:mt-0 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <p className="text-xl font-semibold text-neutral-primary-text">
                    {displayName}
                  </p>
                </div>
                {displayUsername && (
                  <p className="text-sm text-neutral-tertiary-text">{displayUsername}</p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                  <div className="flex flex-col items-center md:items-start gap-1">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-neutral-tertiary-text" />
                      <span className="text-sm text-neutral-tertiary-text">Followers</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-primary-text">{followersCount}</span>
                  </div>

                  <div className="h-8 w-0.5 bg-neutral-tertiary" />

                  <div className="flex flex-col items-center md:items-start gap-1">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-neutral-tertiary-text" />
                      <span className="text-sm text-neutral-tertiary-text">Following</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-primary-text">{followingCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: joined date + token balance + edit button */}
            <div className="flex flex-col items-center gap-3 w-full md:w-auto">
              <p className="text-sm text-neutral-tertiary-text">
                Joined {joinedDate}
              </p>
              {tokenBalance !== null && (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-brand-pixsee-tertiary rounded-full">
                  <span className="text-sm font-semibold text-brand-pixsee-secondary">
                    {tokenBalance} $PIX
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setShowEditProfile(true)}
                className="border border-neutral-tertiary-border rounded-full gap-2 w-full sm:w-auto md:min-w-40"
              >
                Edit Profile
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6 mb-8 border-b border-neutral-tertiary-border overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors shrink-0",
                activeTab === tab.id
                  ? "text-brand-pixsee-secondary border-b-2 border-brand-pixsee-secondary"
                  : "text-neutral-tertiary-text hover:text-neutral-secondary-text"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        profile={profile}
        updateProfile={updateProfile}
      />

      <WithdrawModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        currentBalance={usdcBalance != null ? parseFloat(usdcBalance) : 0}
        onSuccess={() => {
          getUsdcBalance().then(setUsdcBalance).catch(() => {});
          setShowWithdraw(false);
        }}
      />
    </div>
  );
};

export default ProfilePage;
