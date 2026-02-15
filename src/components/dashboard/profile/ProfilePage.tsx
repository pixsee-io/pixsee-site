"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Eye,
  Users,
  TrendingUp,
  DollarSign,
  Play,
  Plus,
  CheckCircle,
  Calendar,
  ArrowUp,
  ExternalLink,
  EyeOff,
} from "lucide-react";
import ShowCard from "@/components/dashboard/watch/ShowCard";
import EditProfileModal from "./modals/EditProfileModal";
import { publishedShows } from "@/app/utils";
import Image from "next/image";

// Types
type ProfileTabId = "overview" | "published" | "history" | "saved" | "earnings";

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

// Mock Data
const userProfile = {
  name: "John Doe",
  username: "@john_doe",
  avatarUrl: "/images/avatars/john-doe.jpg",
  isVerified: true,
  isCreator: true,
  followers: "12,450",
  following: "12,450",
  joinedDate: "November, 2025",
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

// Using ShowCard compatible data structure

const watchHistory: WatchHistoryItem[] = [
  {
    id: "1",
    episodeNumber: 1,
    title: "First Contact",
    description:
      "Dr. Maya Foster receives an encrypted transmission that changes everything she thought she knew about our place in the universe.",
    thumbnailUrl: "/images/shows/episode-1.jpg",
    duration: "15m",
    views: "1.2k Views",
    uploadedAt: "1 week ago",
    earnAmount: "20 $PIX",
    progress: 80,
  },
  {
    id: "2",
    episodeNumber: 1,
    title: "First Contact",
    description:
      "Dr. Maya Foster receives an encrypted transmission that changes everything she thought she knew about our place in the universe.",
    thumbnailUrl: "/images/shows/episode-2.jpg",
    duration: "15m",
    views: "1.2k Views",
    uploadedAt: "1 week ago",
    earnAmount: "20 $PIX",
    progress: 50,
  },
  {
    id: "3",
    episodeNumber: 1,
    title: "First Contact",
    description:
      "Dr. Maya Foster receives an encrypted transmission that changes everything she thought she knew about our place in the universe.",
    thumbnailUrl: "/images/shows/episode-3.jpg",
    duration: "15m",
    views: "1.2k Views",
    uploadedAt: "1 week ago",
    earnAmount: "20 $PIX",
    progress: 30,
  },
];

const savedShows = [
  {
    id: "5",
    title: "Last Text",
    thumbnailUrl: "/images/movie2.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
  },
  {
    id: "6",
    title: "Second Chance",
    thumbnailUrl: "/images/movie3.png",
    creatorName: "Alex Chen",
    views: "1.2M",
    likes: "1.2M",
    description:
      "Six years ago, Regina chose to break up with her boyfriend Julian to avoid. Six years ago, Regina chose to break with her boyfriend Julian to avoid a tragic fate. Now, as they reunite, they must confront their past and the consequences of their choices in this emotional rollercoaster of love and redemption.",
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

// Sub-components (only unique ones - not duplicating ShowCard)
const AnalyticsCard = ({ stat }: { stat: AnalyticsStat }) => (
  <div className="bg-white rounded-xl px-4 py-6 border border-neutral-tertiary-border">
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
  <div className="bg-white rounded-xl p-4 border border-neutral-tertiary-border">
    <div className="flex gap-4">
      {/* Thumbnail */}
      <div className="relative w-40 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-tertiary">
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
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-neutral-tertiary-text">
              Episode {item.episodeNumber}
            </p>
            <h4 className="font-semibold text-brand-pixsee-secondary">
              {item.title}
            </h4>
          </div>
          <span className="text-xs text-brand-pixsee-secondary bg-brand-pixsee-secondary/30 px-2 py-1 rounded-lg">
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

  const tabs: { id: ProfileTabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "published", label: "Published Shows" },
    { id: "history", label: "Watch History" },
    { id: "saved", label: "Saved" },
    { id: "earnings", label: "Earnings" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "published":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-paytone text-neutral-primary-text">
                Published Shows
              </h2>
              <Button className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full gap-2">
                Upload New Shows
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {publishedShows.map((show) => (
                <ShowCard key={show.id} {...show} />
              ))}
            </div>
          </div>
        );

      case "history":
        return (
          <div>
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-6">
              Watch History
            </h2>
            <div className="space-y-4">
              {watchHistory.map((item) => (
                <WatchHistoryCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        );

      case "saved":
        return (
          <div>
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-6">
              Saved shows
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {savedShows.map((show) => (
                <ShowCard key={show.id} {...show} />
              ))}
            </div>
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
              <div className="relative rounded-2xl overflow-hidden bg-brand-primary p-6 balance_bg">
                <div className="flex flex-col items-center justify-center relative z-10">
                  <p className="text-white/80 text-sm mb-2">Balance</p>
                  <div className="flex items-center gap-2 mb-6">
                    <p className="text-4xl font-bold text-white">
                      {showBalance ? "$80.00" : "••••••"}
                    </p>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {showBalance ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    className="min-w-lg bg-transparent hover:bg-white/10 text-white border-white/50 rounded-full px-8 py-6 gap-2"
                  >
                    Withdraw
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Reward Sources */}
              <div className="bg-white rounded-2xl p-6 border border-neutral-tertiary-border">
                <p className="text-lg font-paytone text-neutral-primary-text mb-4">
                  Reward sources
                </p>
                <div className="space-y-4">
                  {rewardSources.map((source, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-secondary-text">
                          {source.label}
                        </span>
                        <span className="text-sm font-medium text-neutral-primary-text">
                          {source.percentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-tertiary rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", source.color)}
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "overview":
      default:
        return (
          <div>
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-6">
              Analytics Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsStats.map((stat) => (
                <AnalyticsCard key={stat.id} stat={stat} />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-foundation-alternate pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-paytone text-neutral-primary-text">
            My profile
          </h1>
          <p className="text-neutral-secondary-text mt-1">
            Track your watch rewards and engagement progress.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-neutral-tertiary-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="rounded-full bg-neutral-tertiary overflow-hidden">
                  <Image
                    src={"/images/guillermo.png"}
                    alt="user"
                    width={80}
                    height={80}
                  />
                </div>
                {userProfile.isCreator && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#ECE5FF] text-black text-xs px-3 py-1 rounded-full">
                    Creator
                  </span>
                )}
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-neutral-primary-text">
                    {userProfile.name}
                  </h2>
                  {userProfile.isVerified && (
                    <CheckCircle className="w-5 h-5 text-brand-pixsee-secondary fill-brand-pixsee-secondary" />
                  )}
                </div>
                <p className="text-neutral-tertiary-text">
                  {userProfile.username}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-neutral-tertiary-text" />
                      <span className="text-sm text-neutral-tertiary-text">
                        Followers
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-primary-text">
                      {userProfile.followers}
                    </span>
                  </div>

                  <div className="h-8 w-0.5 bg-gray-400"/>

                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-neutral-tertiary-text" />
                      <span className="text-sm text-neutral-tertiary-text">
                        Following
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-primary-text">
                      {userProfile.following}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm text-neutral-tertiary-text">
                Joined {userProfile.joinedDate}
              </p>
              <Button
                variant="outline"
                onClick={() => setShowEditProfile(true)}
                className="rounded-full gap-2"
              >
                Edit Profile
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 mb-8 border-b border-neutral-tertiary-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-sm font-medium whitespace-nowrap transition-colors",
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </div>
  );
};

export default ProfilePage;
