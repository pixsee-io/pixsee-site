"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Coins,
  Plus,
  Eye,
  EyeOff,
  Users,
  Play,
  LogIn,
  Flame,
  Gift,
  Vote,
  HelpCircle,
  ChevronRight,
  ArrowUpRight,
  Trophy,
  ThumbsUp,
  ThumbsUpIcon,
  CircleQuestionMark,
  User,
} from "lucide-react";
import RewardsTab from "./tabs/RewardsTab";
import QuestTab from "./tabs/QuestTab";
import LeaderboardTab from "./tabs/LeaderBoardTab";
import AddFundsModal from "./modals/AddFundsModal";
import TransactionSuccessModal from "./modals/TransactionSuccessModal";
import ReferralModal from "./modals/ReferralModal";
import ClaimRewardModal from "./modals/ClaimRewardModal";
import UserProfileModal from "./modals/UserProfileModal";
import WithdrawModal from "./modals/WithdrawModal";

// Types
type TabId = "earn" | "rewards" | "leaderboard" | "quest" | "votes";

type OverviewStat = {
  label: string;
  value: string;
};

type RewardCard = {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  progress: string;
  percentage: number;
  reward: string;
  status: "in-progress" | "completed" | "claimable";
  progressColor: string;
};

type EarningStream = {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  buttonText: string;
  buttonColor: string;
  cardBg: string;
  borderColor: string;
};

type RecentEarning = {
  id: string;
  type: string;
  description: string;
  amount: string;
  date: string;
};

// Mock Data
const overviewStats: OverviewStat[] = [
  { label: "Total $PIX", value: "12,450" },
  { label: "Aggregate Earnings", value: "$2,450" },
  { label: "Currently Claimable", value: "$450.05" },
  { label: "Voting APR", value: "24.5%" },
];

const rewardCards: RewardCard[] = [
  {
    id: "referral",
    icon: <Users className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    title: "Referral Champion",
    progress: "12 / 20",
    percentage: 60,
    reward: "2000 XP",
    status: "in-progress",
    progressColor: "bg-semantic-success-primary",
  },
  {
    id: "binge",
    icon: <Play className="w-5 h-5 text-brand-primary" />,
    iconBg: "bg-brand-tertiary",
    title: "Binge Watcher",
    progress: "1245 / 2000",
    percentage: 60,
    reward: "2000 XP",
    status: "in-progress",
    progressColor: "bg-semantic-warning-primary",
  },
  {
    id: "signup",
    icon: <LogIn className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    title: "Signup",
    progress: "Completed",
    percentage: 60,
    reward: "2000 XP",
    status: "claimable",
    progressColor: "bg-semantic-success-primary",
  },
  {
    id: "streak",
    icon: <Flame className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-brand-pixsee-tertiary",
    title: "7-day Streak",
    progress: "7 / 7",
    percentage: 60,
    reward: "2000 XP",
    status: "in-progress",
    progressColor: "bg-semantic-success-primary",
  },
];

const earningStreams: EarningStream[] = [
  {
    id: "watch",
    icon: <Play className="w-5 h-5 text-brand-pixsee-secondary" />,
    iconBg: "bg-white",
    title: "Watch & Engage",
    subtitle: "Earn while you watch",
    stats: [
      { label: "$PIX Earned", value: "2,450" },
      { label: "Cashback(10%)", value: "$24.50" },
      { label: "Minutes Watched", value: "$24.50" },
    ],
    buttonText: "Keep watching",
    buttonColor: "bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover",
    cardBg: "bg-[#E8F4FD]",
    borderColor: "border-brand-pixsee-secondary/30",
  },
  {
    id: "voting",
    icon: <ThumbsUpIcon className="w-5 h-5 text-[#FF3795]" />,
    iconBg: "bg-white",
    title: "Voting",
    subtitle: "Vote on shows you believe in",
    stats: [
      { label: "Tokens Allocated", value: "2,450" },
      { label: "Current APR", value: "$24.50" },
      { label: "Earnings", value: "$122.50" },
    ],
    buttonText: "Manage Votes",
    buttonColor: "bg-[#FF3795] hover:bg-pink-600",
    cardBg: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  {
    id: "referrals",
    icon: (
      <Users className="w-5 h-5 text-semantic-success-primary fill-semantic-success-primary" />
    ),
    iconBg: "bg-white",
    title: "Referrals",
    subtitle: "Invite friends and earn together",
    stats: [
      { label: "XP Per Referral", value: "500" },
      { label: "Bonus from Refs", value: "15%" },
      { label: "Total Referrals", value: "12" },
    ],
    buttonText: "Invite Friends",
    buttonColor: "bg-semantic-success-primary hover:bg-semantic-success-text",
    cardBg: "bg-semantic-success-primary/20",
    borderColor: "border-neutral-tertiary-border",
  },
  {
    id: "quests",
    icon: <CircleQuestionMark className="w-5 h-5 text-brand-primary" />,
    iconBg: "bg-white",
    title: "Quests",
    subtitle: "Complete challenges for rewards",
    stats: [
      { label: "Active Quests", value: "5" },
      { label: "XP Available", value: "3,500" },
      { label: "Completion", value: "60%" },
    ],
    buttonText: "View Quest",
    buttonColor: "bg-brand-primary hover:bg-brand-primary-dark",
    cardBg: "bg-brand-tertiary",
    borderColor: "border-brand-secondary/30",
  },
];

const recentEarnings: RecentEarning[] = [
  {
    id: "1",
    type: "Watch Rewards",
    description: "Watched Episode 1: The Beginning",
    amount: "12,000",
    date: "Jun 12",
  },
  {
    id: "2",
    type: "Watch Rewards",
    description: "Watched Episode 1: The Beginning",
    amount: "12,000",
    date: "Jun 12",
  },
  {
    id: "3",
    type: "Watch Rewards",
    description: "Watched Episode 1: The Beginning",
    amount: "12,000",
    date: "Jun 12",
  },
  {
    id: "4",
    type: "Watch Rewards",
    description: "Watched Episode 1: The Beginning",
    amount: "12,000",
    date: "Jun 12",
  },
  {
    id: "5",
    type: "Watch Rewards",
    description: "Watched Episode 1: The Beginning",
    amount: "12,000",
    date: "Jun 12",
  },
];

// Sub-components
const OverviewCard = ({ stat }: { stat: OverviewStat }) => (
  <div className="bg-white rounded-xl px-3 py-4 sm:px-4 sm:py-6 border border-neutral-tertiary-border">
    <p className="text-xs sm:text-sm text-neutral-tertiary-text mb-1 leading-tight">
      {stat.label}
    </p>
    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-primary-text truncate">
      {stat.value}
    </p>
  </div>
);

const RewardProgressCard = ({
  reward,
  onClaim,
}: {
  reward: RewardCard;
  onClaim: (reward: RewardCard) => void;
}) => (
  <div className="bg-white rounded-xl px-4 py-6 border border-neutral-tertiary-border">
    <div
      className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        reward.iconBg
      )}
    >
      {reward.icon}
    </div>

    <h3 className="font-semibold text-neutral-primary-text mb-2">
      {reward.title}
    </h3>

    <div className="flex items-center justify-between text-sm mb-2">
      <span
        className={cn(
          reward.status === "claimable"
            ? "text-semantic-success-text"
            : "text-neutral-secondary-text"
        )}
      >
        {reward.progress}
      </span>
      <span className="text-neutral-tertiary-text">{reward.percentage}%</span>
    </div>

    <div className="h-1.5 bg-neutral-tertiary rounded-full mb-3 overflow-hidden">
      <div
        className={cn("h-full rounded-full", reward.progressColor)}
        style={{ width: `${reward.percentage}%` }}
      />
    </div>

    <div className="flex items-center justify-between text-sm mb-3">
      <span className="text-neutral-tertiary-text">Reward</span>
      <span className="font-semibold text-neutral-primary-text">
        {reward.reward}
      </span>
    </div>

    <Button
      onClick={() => reward.status === "claimable" && onClaim(reward)}
      className={cn(
        "w-full rounded-full text-sm",
        reward.status === "claimable"
          ? "bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white"
          : "bg-brand-pixsee-tertiary text-brand-pixsee-secondary hover:bg-brand-pixsee-secondary/20"
      )}
    >
      {reward.status === "claimable" ? "Claim Reward" : "In progress"}
    </Button>
  </div>
);

const EarningStreamCard = ({
  stream,
  onAction,
}: {
  stream: EarningStream;
  onAction: (streamId: string) => void;
}) => (
  <div
    className={cn(
      "rounded-xl p-4 sm:p-5 border",
      stream.cardBg,
      stream.borderColor
    )}
  >
    <div className="flex items-start gap-3 mb-4">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          stream.iconBg
        )}
      >
        {stream.icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-neutral-primary-text">
          {stream.title}
        </h3>
        <p className="text-sm text-neutral-tertiary-text">{stream.subtitle}</p>
      </div>
    </div>

    <div className="space-y-2 mb-4">
      {stream.stats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between gap-2">
          <span className="text-sm text-neutral-secondary-text truncate">
            {stat.label}
          </span>
          <span className="text-sm font-semibold text-neutral-primary-text flex-shrink-0">
            {stat.value}
          </span>
        </div>
      ))}
    </div>

    <Button
      onClick={() => onAction(stream.id)}
      className={cn(
        "w-full h-10 md:h-11 rounded-full text-sm text-white",
        stream.buttonColor
      )}
    >
      {stream.buttonText}
      <ChevronRight className="w-4 h-4 ml-1" />
    </Button>
  </div>
);

const RecentEarningRow = ({ earning }: { earning: RecentEarning }) => (
  <div className="flex items-center justify-between gap-3 p-3 py-5 sm:p-4 bg-white rounded-xl border border-neutral-tertiary-border">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF3795]" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm sm:text-base text-neutral-primary-text truncate">
          {earning.type}
        </p>
        <p className="text-xs sm:text-sm text-neutral-tertiary-text truncate">
          {earning.description}
        </p>
      </div>
    </div>

    {/* Right: amount + date — flex-shrink-0 so it never compresses */}
    <div className="text-right flex-shrink-0">
      <p className="font-semibold text-sm sm:text-base text-semantic-success-text flex items-center justify-end gap-1">
        + <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {earning.amount}
      </p>
      <p className="text-xs sm:text-sm text-neutral-tertiary-text">
        {earning.date}
      </p>
    </div>
  </div>
);

const EarnPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("earn");
  const [showBalance, setShowBalance] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(80);

  // Modal states
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransactionSuccess, setShowTransactionSuccess] = useState(false);
  const [transactionType, setTransactionType] = useState<
    "deposit" | "withdraw"
  >("deposit");
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardCard | null>(null);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const tabs: { id: TabId; label: string; icon?: React.ReactNode }[] = [
    { id: "earn", label: "Earn", icon: <Coins className="w-4 h-4" /> },
    { id: "rewards", label: "Rewards", icon: <Gift className="w-4 h-4" /> },
    { id: "votes", label: "Voting", icon: <ThumbsUp className="w-4 h-4" /> },
    { id: "quest", label: "Quest", icon: <HelpCircle className="w-4 h-4" /> },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: <Trophy className="w-4 h-4" />,
    },
  ];

  const handleAddFundsSuccess = (amount: number) => {
    setShowAddFundsModal(false);
    setTransactionType("deposit");
    setTransactionAmount(amount);
    setCurrentBalance((prev) => prev + amount);
    setShowTransactionSuccess(true);
  };

  const handleWithdrawSuccess = (amount: number) => {
    setShowWithdrawModal(false);
    setTransactionType("withdraw");
    setTransactionAmount(amount);
    setCurrentBalance((prev) => prev - amount);
    setShowTransactionSuccess(true);
  };

  const handleClaimReward = (reward: RewardCard) => {
    setSelectedReward(reward);
    setShowClaimRewardModal(true);
  };

  const handleEarningStreamAction = (streamId: string) => {
    if (streamId === "referrals") {
      setShowReferralModal(true);
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser({
      name: user.name,
      avatarUrl: user.avatarUrl,
      rank: user.rank,
      followers: user.followers,
      points: user.points,
    });
    setShowUserProfileModal(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "rewards":
        return <RewardsTab onClaimReward={handleClaimReward as any} />;
      case "quest":
        return <QuestTab />;
      case "leaderboard":
        return <LeaderboardTab onUserClick={handleUserClick} />;
      case "earn":
      default:
        return (
          <>
            {/* Overview Section */}
            <section className="mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-paytone text-neutral-primary-text mb-4">
                Overview
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                {overviewStats.map((stat, index) => (
                  <OverviewCard key={index} stat={stat} />
                ))}
              </div>
            </section>

            {/* Your Next Rewards Section */}
            <section className="mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-paytone text-neutral-primary-text mb-4">
                Your Next Rewards
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {rewardCards.map((reward) => (
                  <RewardProgressCard
                    key={reward.id}
                    reward={reward}
                    onClaim={handleClaimReward}
                  />
                ))}
              </div>
            </section>

            {/* Earning Streams Section */}
            <section className="mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-paytone text-neutral-primary-text mb-4">
                Earning Streams
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {earningStreams.map((stream) => (
                  <EarningStreamCard
                    key={stream.id}
                    stream={stream}
                    onAction={handleEarningStreamAction}
                  />
                ))}
              </div>
            </section>

            {/* Recent Earnings Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-paytone text-neutral-primary-text">
                  Recents Earnings
                </h2>
                <button className="text-brand-pixsee-secondary hover:underline text-xs sm:text-sm font-medium whitespace-nowrap ml-2">
                  View all Activity
                </button>
              </div>
              <div className="space-y-3">
                {recentEarnings.map((earning) => (
                  <RecentEarningRow key={earning.id} earning={earning} />
                ))}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-foundation-alternate pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-paytone text-neutral-primary-text">
            Earn
          </h1>
          <p className="text-neutral-secondary-text mt-1">
            Track your watch rewards and engagement progress.
          </p>
        </div>

        {/* Balance Card */}
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-brand-primary p-5 sm:p-6 md:p-8 py-10 sm:py-12 md:py-14 balance_bg">
          <div className="relative z-10 text-center">
            <p className="text-white/80 text-sm mb-2">Balance</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                {showBalance ? `$${currentBalance.toFixed(2)}` : "••••••"}
              </h2>
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Button
                onClick={() => setShowAddFundsModal(true)}
                className="w-full sm:w-auto bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-8 py-2 gap-2"
              >
                Fund Wallet
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowWithdrawModal(true)}
                variant="outline"
                className="w-full sm:w-auto bg-transparent text-white border-white/50 rounded-full px-8 py-2 gap-2 hover:bg-white/10"
              >
                Withdraw
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-white/60 text-sm">$1 USD = 10 $PIX</p>
          </div>
        </div>

        {/* Tab Navigation — edge-bleed scroll on mobile */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-8">
          <div className="flex gap-2 md:gap-3 pb-1 w-max md:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 border",
                  activeTab === tab.id
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-neutral-secondary-text border-neutral-tertiary-border hover:border-neutral-secondary-border"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Modals */}
      <AddFundsModal
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        onSuccess={handleAddFundsSuccess}
        currentBalance={currentBalance}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={handleWithdrawSuccess}
        currentBalance={currentBalance}
      />

      <TransactionSuccessModal
        isOpen={showTransactionSuccess}
        onClose={() => setShowTransactionSuccess(false)}
        type={transactionType}
        amount={transactionAmount}
      />

      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        referralLink="Https://www.Pixsee.com/refer-1234"
        referralProgress={{ current: 1, total: 5 }}
      />

      {selectedReward && (
        <ClaimRewardModal
          isOpen={showClaimRewardModal}
          onClose={() => {
            setShowClaimRewardModal(false);
            setSelectedReward(null);
          }}
          onClaim={() => {
            setShowClaimRewardModal(false);
            setSelectedReward(null);
          }}
          reward={{
            title: selectedReward.title,
            progress: "5 of 5 Referral",
            tixAmount: 2000,
            usdAmount: 20,
          }}
        />
      )}

      {selectedUser && (
        <UserProfileModal
          isOpen={showUserProfileModal}
          onClose={() => {
            setShowUserProfileModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default EarnPage;
