"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Coins,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Users,
  Play,
  LogIn,
  Flame,
  Gift,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Clapperboard,
  PenLine,
  Trash2,
  Trophy,
  ThumbsUp,
  ThumbsUpIcon,
  CircleQuestionMark,
  Loader2,
  Wallet,
  Lock,
  X,
} from "lucide-react";
import LeaderboardTab from "./tabs/LeaderBoardTab";
import AddFundsModal from "./modals/AddFundsModal";
import ReferralModal from "./modals/ReferralModal";
import ClaimRewardModal from "./modals/ClaimRewardModal";
import UserProfileModal from "./modals/UserProfileModal";
import WithdrawModal from "./modals/WithdrawModal";
import { usePrivy } from "@privy-io/react-auth";
import { useMe, useTransactions, useWatchHistory, useSeePoints, useTransactionAnalytics } from "@/app/hooks/useSocial";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";
import { useTixPortfolio } from "@/app/hooks/useTixPortfolio";
import { CreatorRoyaltiesSection } from "@/components/dashboard/earn/CreatorRoyaltiesSection";
import { BoxOfficeRevenueSection } from "@/components/dashboard/earn/BoxOfficeRevenueSection";
import { RoyaltyScheduleCard } from "@/components/dashboard/earn/RoyaltyScheduleCard";
import { formatCount } from "@/app/hooks/useVideo";
import { useWallets } from "@privy-io/react-auth";
import { CONTRACT_ADDRESSES, CHAIN_ID, MOCK_USDC_FAUCET_ABI } from "@/app/lib/pixsee-contracts";
import { type Address } from "viem";

// Types
type TabId = "earn" | "rewards" | "leaderboard" | "votes";

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
  comingSoon?: boolean;
  actionHref?: string;
};

type RecentEarning = {
  id: string;
  type: string;
  description: string;
  amount: string;
  date: string;
  ledgerType?: string;
};

// Static fallback data (non-dynamic fields)
const VOTING_APR = "24.5%";

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
    iconBg: "bg-neutral-primary",
    title: "Watch & Engage",
    subtitle: "Earn while you watch",
    stats: [
      { label: "$PIX Earned", value: "2,450" },
      { label: "Cashback(10%)", value: "$24.50" },
      { label: "Minutes Watched", value: "$24.50" },
    ],
    buttonText: "Keep watching",
    buttonColor: "bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover",
    cardBg: "bg-brand-pixsee-secondary/10",
    borderColor: "border-brand-pixsee-secondary/30",
    actionHref: "/watch",
  },
  {
    id: "voting",
    icon: <ThumbsUpIcon className="w-5 h-5 text-[#FF3795]" />,
    iconBg: "bg-neutral-primary",
    title: "Voting",
    subtitle: "Vote on shows you believe in",
    stats: [],
    buttonText: "Manage Votes",
    buttonColor: "bg-[#FF3795] hover:bg-pink-600",
    cardBg: "bg-[#FF3795]/10",
    borderColor: "border-[#FF3795]/30",
    comingSoon: true,
  },
  {
    id: "referrals",
    icon: (
      <Users className="w-5 h-5 text-semantic-success-primary fill-semantic-success-primary" />
    ),
    iconBg: "bg-neutral-primary",
    title: "Referrals",
    subtitle: "Invite friends and earn together",
    stats: [],
    buttonText: "Invite Friends",
    buttonColor: "bg-semantic-success-primary hover:bg-semantic-success-text",
    cardBg: "bg-semantic-success-primary/20",
    borderColor: "border-neutral-tertiary-border",
    comingSoon: true,
  },
  {
    id: "quests",
    icon: <CircleQuestionMark className="w-5 h-5 text-brand-primary" />,
    iconBg: "bg-neutral-primary",
    title: "Quests",
    subtitle: "Complete challenges for rewards",
    stats: [],
    buttonText: "View Quest",
    buttonColor: "bg-brand-primary hover:bg-brand-primary-dark",
    cardBg: "bg-brand-tertiary",
    borderColor: "border-brand-secondary/30",
    comingSoon: true,
  },
];


// Sub-components
const OverviewCard = ({ stat }: { stat: OverviewStat }) => (
  <div className="bg-neutral-primary rounded-xl px-3 py-4 sm:px-4 sm:py-6 border border-neutral-tertiary-border">
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
  <div className="bg-neutral-primary rounded-xl px-4 py-6 border border-neutral-tertiary-border">
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
      disabled
      className="w-full rounded-full text-sm bg-neutral-secondary text-neutral-tertiary-text cursor-not-allowed opacity-60"
    >
      Coming soon
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
      "rounded-xl p-4 sm:p-5 border flex flex-col",
      stream.cardBg,
      stream.borderColor
    )}
  >
    <div className="flex items-start gap-3 mb-4">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          stream.iconBg
        )}
      >
        {stream.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-neutral-primary-text">{stream.title}</h3>
          {stream.comingSoon && (
            <span className="text-[10px] font-medium text-neutral-tertiary-text border border-neutral-tertiary-border px-1.5 py-0.5 rounded-full">
              Coming soon
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-tertiary-text">{stream.subtitle}</p>
      </div>
    </div>

    <div className="space-y-2 mb-4 flex-1">
      {stream.stats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between gap-2">
          <span className="text-sm text-neutral-secondary-text truncate">{stat.label}</span>
          <span className={cn("text-sm font-semibold shrink-0", stat.value === "Coming soon" ? "text-neutral-tertiary-text" : "text-neutral-primary-text")}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>

    {stream.comingSoon ? null : stream.actionHref ? (
      <Link
        href={stream.actionHref}
        className={cn(
          "w-full h-10 md:h-11 rounded-full text-sm text-white flex items-center justify-center gap-1.5 font-medium transition-colors",
          stream.buttonColor
        )}
      >
        {stream.buttonText}
        <ChevronRight className="w-4 h-4" />
      </Link>
    ) : (
      <Button
        onClick={() => onAction(stream.id)}
        className={cn("w-full h-10 md:h-11 rounded-full text-sm text-white", stream.buttonColor)}
      >
        {stream.buttonText}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    )}
  </div>
);

// ── Earnings Breakdown Card ───────────────────────────────────────────────────

type EarningsBreakdownCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  claimedTotal?: string;
  pendingAmount?: string;
  valueNote?: string; // overrides "You've claimed a total of…" label
  actionLabel: string;
  onAction?: () => void;
  actionHref?: string;
  comingSoon?: boolean;
  note?: string;
  amountColor?: string;
};

const EarningsBreakdownCard = ({
  icon,
  iconBg,
  title,
  subtitle,
  claimedTotal,
  pendingAmount,
  valueNote,
  actionLabel,
  onAction,
  actionHref,
  comingSoon,
  note,
  amountColor = "text-neutral-primary-text",
}: EarningsBreakdownCardProps) => (
  <div className="bg-neutral-primary rounded-xl p-4 border border-neutral-tertiary-border flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          iconBg
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-neutral-primary-text truncate">
          {title}
        </p>
        <p className="text-xs text-neutral-tertiary-text">{subtitle}</p>
      </div>
    </div>

    <div className="flex-1 space-y-1.5">
      {comingSoon ? (
        <span className="inline-flex items-center text-xs font-medium text-neutral-tertiary-text bg-neutral-secondary px-2.5 py-1 rounded-full">
          Coming soon
        </span>
      ) : (
        <>
          <div>
            <p className={cn("text-2xl font-bold", amountColor)}>
              {claimedTotal ?? "—"}
            </p>
            <p className="text-xs text-neutral-tertiary-text mt-0.5">
              {valueNote ?? `You've claimed a total of ${claimedTotal ?? "—"} USDC`}
            </p>
          </div>
          {pendingAmount && parseFloat(pendingAmount) > 0 && (
            <p className="text-xs font-medium text-semantic-warning-primary">
              You have ${parseFloat(pendingAmount).toFixed(4)} USDC pending to claim
            </p>
          )}
        </>
      )}
      {note && !comingSoon && (
        <p className="text-xs text-neutral-tertiary-text mt-2 bg-neutral-secondary/60 px-2 py-1.5 rounded-lg leading-relaxed">
          {note}
        </p>
      )}
    </div>

    {!comingSoon && (
      actionHref ? (
        <a
          href={actionHref}
          className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-full text-sm font-medium bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white transition-colors"
        >
          {actionLabel}
          <ChevronRight className="w-4 h-4" />
        </a>
      ) : (
        <Button
          onClick={onAction}
          className="w-full rounded-full text-sm bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white"
        >
          {actionLabel}
        </Button>
      )
    )}
  </div>
);

// ── Box Office Revenue Modal (90% of viewer unlock payments) ──────────────────
// "Box Office Revenue" = what creators earn when viewers pay TIX to unlock episodes.
// 90% of each payment accumulates as pendingRoyaltyTix, claimed as USDC (minus 7% platform fee).

function ClaimRoyaltiesModal({
  isOpen,
  onClose,
  getAccessToken,
  onTotalsLoaded,
  onClaimed,
}: {
  isOpen: boolean;
  onClose: () => void;
  getAccessToken: () => Promise<string | null>;
  onTotalsLoaded: (pendingGross: string) => void;
  onClaimed?: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-neutral-primary rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-neutral-primary-text">Box Office Revenue</h2>
          <button
            onClick={onClose}
            className="text-neutral-tertiary-text hover:text-neutral-primary-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-neutral-tertiary-text mb-4 leading-relaxed">
          Earned when viewers pay TIX to unlock your videos (90% of each payment).
          The contract deducts 7% as a platform fee and sends the remaining 93% to you as USDC.
        </p>

        <div className="max-h-72 overflow-y-auto pr-1">
          <BoxOfficeRevenueSection
            getAccessToken={getAccessToken}
            onTotalsLoaded={(pending) => onTotalsLoaded(pending)}
            onClaimed={onClaimed}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-tertiary-border">
          <RoyaltyScheduleCard getAccessToken={getAccessToken} />
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          className="w-full mt-4 rounded-full border-neutral-tertiary-border text-neutral-secondary-text"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

// ── Creator Royalties Modal (1% of every TIX trade) ───────────────────────────
// "Creator Royalties" = ongoing 1% fee from every TIX buy/sell on the creator's show.

function ClaimBoxOfficeModal({
  isOpen,
  onClose,
  getAccessToken,
  onTotalLoaded,
  onClaimed,
}: {
  isOpen: boolean;
  onClose: () => void;
  getAccessToken: () => Promise<string | null>;
  onTotalLoaded: (total: string) => void;
  onClaimed?: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-neutral-primary rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-neutral-primary-text">Creator Royalties</h2>
          <button onClick={onClose} className="text-neutral-tertiary-text hover:text-neutral-primary-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-neutral-tertiary-text mb-4 leading-relaxed">
          1% of every TIX trade on your show accumulates here as USDC. Claim anytime — no platform fee deducted at this step.
        </p>
        <div className="max-h-72 overflow-y-auto pr-1">
          <CreatorRoyaltiesSection
            getAccessToken={getAccessToken}
            onTotalLoaded={onTotalLoaded}
            onClaimed={onClaimed}
          />
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full mt-4 rounded-full border-neutral-tertiary-border text-neutral-secondary-text"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

// ── Transaction icon helper ───────────────────────────────────────────────────

// Maps raw backend transaction types to human-readable display labels
function txDisplayLabel(type: string): string {
  switch (type) {
    case "royalties_claimed":   return "Box Office Revenue";
    case "creator_fees_claimed": return "Creator Royalties";
    case "tix_bought":          return "TIX Bought";
    case "tix_sold":            return "TIX Sold";
    case "watch_cashback":
    case "watch_reward":
    case "cashback":            return "Watch Cashback";
    case "show_created":        return "Show Created";
    case "show_updated":        return "Show Updated";
    case "show_deleted":        return "Show Deleted";
    default: return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

// Maps "royalties claimed for X" descriptions to cleaner box office labels
function txDisplayDescription(type: string, description: string): string {
  if (type === "royalties_claimed" && description.toLowerCase().startsWith("royalties claimed for")) {
    return description.replace(/^royalties claimed for/i, "Box office revenue claimed for");
  }
  return description;
}

function txIcon(type: string) {
  switch (type) {
    case "tix_bought":          return { icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-semantic-success-primary" />, bg: "bg-semantic-success-primary/10" };
    case "tix_sold":            return { icon: <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-semantic-warning-primary" />, bg: "bg-semantic-warning-primary/10" };
    case "royalties_claimed":   return { icon: <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-semantic-success-primary" />, bg: "bg-semantic-success-primary/10" };
    case "creator_fees_claimed": return { icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />, bg: "bg-brand-tertiary" };
    case "watch_cashback":
    case "watch_reward":
    case "cashback":            return { icon: <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-brand-pixsee-secondary" />, bg: "bg-brand-pixsee-secondary/10" };
    case "show_created":        return { icon: <Clapperboard className="w-4 h-4 sm:w-5 sm:h-5 text-brand-pixsee-secondary" />, bg: "bg-brand-pixsee-secondary/10" };
    case "show_updated":        return { icon: <PenLine className="w-4 h-4 sm:w-5 sm:h-5 text-semantic-warning-primary" />, bg: "bg-semantic-warning-primary/10" };
    case "show_deleted":        return { icon: <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-semantic-error-primary" />, bg: "bg-semantic-error-primary/10" };
    default:                    return { icon: <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF3795]" />, bg: "bg-semantic-error-primary/10" };
  }
}

const RecentEarningRow = ({ earning, currency }: { earning: RecentEarning; currency?: string }) => {
  const { icon, bg } = txIcon(earning.type.toLowerCase().replace(/ /g, "_"));
  const amountNum = parseFloat(earning.amount);
  const hasAmount = !isNaN(amountNum) && amountNum > 0;
  const isDebit = earning.ledgerType === "spend" || earning.ledgerType === "purchase";
  return (
    <div className="flex items-center justify-between gap-3 p-3 py-5 sm:p-4 bg-neutral-primary rounded-xl border border-neutral-tertiary-border">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0", bg)}>
          {icon}
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

      <div className="text-right shrink-0">
        <p className={cn("font-semibold text-sm sm:text-base flex items-center justify-end gap-1", isDebit ? "text-semantic-error-text" : "text-semantic-success-text")}>
          {hasAmount ? (
            <>{isDebit ? "−" : "+"} <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ${earning.amount}{currency ? ` ${currency}` : ""}</>
          ) : (
            <span className="text-neutral-tertiary-text font-normal">—</span>
          )}
        </p>
        <p className="text-xs sm:text-sm text-neutral-tertiary-text">
          {earning.date}
        </p>
      </div>
    </div>
  );
};

// ── Main EarnPage ─────────────────────────────────────────────────────────────

const EarnPage = () => {
  const { getAccessToken } = usePrivy();
  const { profile, isLoading: profileLoading } = useMe(getAccessToken);
  const { transactions, isLoading: txLoading, refetch: refetchTx } = useTransactions(getAccessToken);
  const { analytics: txAnalytics } = useTransactionAnalytics(getAccessToken);
  const { history: watchHistory } = useWatchHistory(getAccessToken);
  const { balance: seePoints } = useSeePoints(getAccessToken);
  const { getUsdcBalance, walletAddress } = usePixseeContract();

  // Portfolio data for holdings card and creator shows list
  const portfolio = useTixPortfolio(walletAddress);

  const [activeTab, setActiveTab] = useState<TabId>("earn");
  const [showBalance, setShowBalance] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);

  // Load USDC balance from chain
  useEffect(() => {
    getUsdcBalance().then(setUsdcBalance).catch(() => {});
  }, [getUsdcBalance]);

  // Keep the fund/withdraw flow working with local state; sync from USDC balance initially
  useEffect(() => {
    if (usdcBalance != null) setCurrentBalance(parseFloat(usdcBalance));
  }, [usdcBalance]);

  // Card totals from transaction-analytics (backend now aggregates correctly)
  const boxOfficeClaimedTotal = txAnalytics
    ? parseFloat(txAnalytics.total_royalties_claimed_usdc).toFixed(4)
    : null;

  const creatorRoyaltiesClaimedTotal = txAnalytics
    ? parseFloat(txAnalytics.total_box_office_revenue_usdc).toFixed(4)
    : null;

  // Refetch balance from chain after fund/withdraw completes
  const refetchBalance = () => {
    getUsdcBalance().then(setUsdcBalance).catch(() => {});
  };

  // Combined callback: refresh both transactions and USDC balance after any claim
  const handleClaimed = () => {
    refetchTx();
    refetchBalance();
  };

  // Testnet faucet — only shown when CHAIN_ID === 84532 (Base Sepolia)
  const { wallets } = useWallets();
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetDone, setFaucetDone] = useState(false);
  const [faucetError, setFaucetError] = useState<string | null>(null);
  const claimTestUsdc = async () => {
    const activeWallet = wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];
    if (!activeWallet) return;
    setFaucetLoading(true);
    try {
      const provider = await activeWallet.getEthereumProvider();
      const { createWalletClient, custom } = await import("viem");
      const { baseSepolia } = await import("viem/chains");
      const walletClient = createWalletClient({ chain: baseSepolia, transport: custom(provider) });
      const [account] = await walletClient.getAddresses();
      await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.usdc as Address,
        abi: MOCK_USDC_FAUCET_ABI,
        functionName: "faucet",
        account,
        gas: 100_000n,
      });
      setFaucetDone(true);
      setTimeout(() => {
        setFaucetDone(false);
        refetchBalance();
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("insufficient funds for gas")) {
        setFaucetError("no-gas");
      } else {
        console.error("[Faucet] failed:", err);
      }
    } finally {
      setFaucetLoading(false);
    }
  };

  // ── Derived earnings data ────────────────────────────────────────────────────

  // TIX portfolio value (mark value = spot price × balance for each holding)
  const tixPortfolioValue = portfolio.holdings.reduce(
    (sum, h) => sum + parseFloat(h.valueUsdcDisplay),
    0
  );

  // ── Modal states ─────────────────────────────────────────────────────────────

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardCard | null>(null);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showClaimRoyaltiesModal, setShowClaimRoyaltiesModal] = useState(false);
  const [showClaimBoxOfficeModal, setShowClaimBoxOfficeModal] = useState(false);
  // Pending on-chain amounts (from live contract reads via hidden sections)
  const [boxOfficePendingGross, setBoxOfficePendingGross] = useState<string | null>(null);
  const [creatorRoyaltiesPending, setCreatorRoyaltiesPending] = useState<string | null>(null);

  // Leaderboard placed next to Rewards per product direction
  const tabs: { id: TabId; label: string; icon?: React.ReactNode; comingSoon?: boolean }[] = [
    { id: "earn", label: "Earn", icon: <Coins className="w-4 h-4" /> },
    { id: "rewards", label: "Rewards", icon: <Gift className="w-4 h-4" />, comingSoon: true },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
    { id: "votes", label: "Voting", icon: <ThumbsUp className="w-4 h-4" />, comingSoon: true },
  ];

  const handleAddFundsSuccess = () => {
    setShowAddFundsModal(false);
    refetchBalance();
  };

  const handleWithdrawSuccess = () => {
    refetchBalance();
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
      case "votes":
        return (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <span className="text-4xl">🚧</span>
            <p className="text-lg font-semibold text-neutral-primary-text">Coming soon</p>
            <p className="text-sm text-neutral-tertiary-text max-w-xs">This feature is under construction. Check back soon!</p>
          </div>
        );
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
                <OverviewCard stat={{ label: "USDC Balance", value: usdcBalance != null ? `$${parseFloat(usdcBalance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—" }} />
                <OverviewCard stat={{ label: "SEE Points", value: seePoints != null ? seePoints.toLocaleString() : "—" }} />
                <OverviewCard stat={{ label: "Transactions", value: txLoading ? "…" : String(transactions.length) }} />
                <OverviewCard stat={{ label: "Videos Watched", value: String(watchHistory.length) }} />
              </div>
            </section>

            {/* ── Your Earnings Breakdown ── */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-paytone text-neutral-primary-text">
                  Your Earnings
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

                {/* Holdings */}
                <EarningsBreakdownCard
                  icon={<Wallet className="w-5 h-5 text-brand-primary" />}
                  iconBg="bg-brand-tertiary"
                  title="Your Holdings"
                  subtitle="TIX portfolio value (mark)"
                  claimedTotal={
                    portfolio.isLoading
                      ? "…"
                      : `$${tixPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  }
                  valueNote="Current portfolio value (spot price × balance)"
                  actionLabel="Go to Trade"
                  actionHref="/trade"
                  amountColor="text-brand-primary"
                />

                {/* Box Office Revenue — 90% of viewer unlock payments */}
                <EarningsBreakdownCard
                  icon={<Coins className="w-5 h-5 text-semantic-success-primary" />}
                  iconBg="bg-semantic-success-primary/10"
                  title="Box Office Revenue"
                  subtitle="90% of TIX viewers pay to unlock your videos"
                  claimedTotal={
                    boxOfficeClaimedTotal != null
                      ? `$${parseFloat(boxOfficeClaimedTotal).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
                      : txLoading ? "…" : undefined
                  }
                  pendingAmount={boxOfficePendingGross ?? undefined}
                  actionLabel="Claim Revenue"
                  onAction={() => setShowClaimRoyaltiesModal(true)}
                  note="7% platform fee is deducted automatically by the contract on each claim"
                  amountColor="text-semantic-success-text"
                />

                {/* Creator Royalties — 1% of every TIX trade → ShowFeeDistributor.creatorFeeBalance */}
                <EarningsBreakdownCard
                  icon={<TrendingUp className="w-5 h-5 text-brand-primary" />}
                  iconBg="bg-brand-tertiary"
                  title="Creator Royalties"
                  subtitle="1% of every TIX trade on your shows"
                  claimedTotal={
                    creatorRoyaltiesClaimedTotal != null
                      ? `$${parseFloat(creatorRoyaltiesClaimedTotal).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
                      : txLoading ? "…" : undefined
                  }
                  pendingAmount={creatorRoyaltiesPending ?? undefined}
                  actionLabel="Claim Royalties"
                  onAction={() => setShowClaimBoxOfficeModal(true)}
                  note="Paid as USDC directly to your wallet. No platform fee on claim."
                  amountColor="text-brand-primary"
                />

                {/* Watch Rewards — 10% TIX cashback auto-sent on-chain when you unlock episodes */}
                <div className="bg-neutral-primary rounded-xl p-4 border border-neutral-tertiary-border flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-brand-pixsee-secondary/10">
                      <Gift className="w-5 h-5 text-brand-pixsee-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-neutral-primary-text">Watch Rewards</p>
                      <p className="text-xs text-neutral-tertiary-text">10% TIX cashback on every episode you unlock</p>
                    </div>
                  </div>

                  {txLoading ? (
                    <div className="flex items-center gap-2 text-xs text-neutral-tertiary-text py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
                    </div>
                  ) : transactions.filter((t) => t.type === "watch_cashback" || t.type === "watch_reward" || t.type === "cashback").length > 0 ? (
                    <>
                      <div>
                        <p className="text-2xl font-bold text-brand-pixsee-secondary">
                          {transactions
                            .filter((t) => t.type === "watch_cashback" || t.type === "watch_reward" || t.type === "cashback")
                            .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0)
                            .toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} TIX
                        </p>
                        <p className="text-xs text-neutral-tertiary-text mt-0.5">Total cashback earned</p>
                      </div>
                      <div className="space-y-1.5 max-h-28 overflow-y-auto">
                        {transactions.filter((t) => t.type === "watch_cashback" || t.type === "watch_reward" || t.type === "cashback").slice(0, 6).map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between text-xs">
                            <span className="text-neutral-secondary-text truncate">{tx.description ?? "Episode unlock"}</span>
                            <span className="shrink-0 font-medium text-brand-pixsee-secondary ml-2">+{tx.amount} TIX</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-neutral-tertiary-text italic">
                      No rewards yet — unlock paid episodes to earn 10% TIX cashback.
                    </p>
                  )}

                  <p className="text-xs text-neutral-tertiary-text bg-neutral-secondary/60 px-2 py-1.5 rounded-lg leading-relaxed">
                    When you unlock an episode, 10% of the TIX spent is automatically returned to your wallet. Use them to watch more or sell in Trade (3% fee).
                  </p>

                  <a
                    href="/trade"
                    className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-full text-sm font-medium bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white transition-colors"
                  >
                    Trade TIX
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Voting Rewards */}
                <EarningsBreakdownCard
                  icon={<ThumbsUp className="w-5 h-5 text-[#FF3795]" />}
                  iconBg="bg-[#FF3795]/10"
                  title="Voting Rewards"
                  subtitle="From voting on shows"
                  actionLabel="Coming Soon"
                  comingSoon
                />

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
                {[
                  {
                    ...earningStreams[0],
                    stats: [
                      { label: "$PIX Earned", value: "Coming soon" },
                      { label: "Cashback (10%)", value: (() => {
                        const cashbackTxs = transactions.filter((t) => t.type === "watch_cashback" || t.type === "watch_reward" || t.type === "cashback");
                        if (txLoading) return "…";
                        if (cashbackTxs.length === 0) return "—";
                        const total = cashbackTxs.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
                        return `${total.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} TIX`;
                      })() },
                      { label: "Videos Watched", value: txLoading ? "…" : String(watchHistory.length) },
                    ],
                  },
                  earningStreams[1],
                  earningStreams[2],
                  earningStreams[3],
                ].map((stream) => (
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
                  Recent Transactions
                </h2>
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={() => refetchTx()}
                    disabled={txLoading}
                    className="p-1.5 rounded-lg hover:bg-neutral-secondary transition-colors disabled:opacity-50"
                    aria-label="Refresh transactions"
                  >
                    <RefreshCw className={cn("w-4 h-4 text-neutral-tertiary-text", txLoading && "animate-spin")} />
                  </button>
                  <Link href="/profile?tab=transactions" className="text-brand-pixsee-secondary hover:underline text-xs sm:text-sm font-medium whitespace-nowrap">
                    View all Activity
                  </Link>
                </div>
              </div>
              {txLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-tertiary-text" />
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-neutral-tertiary-text text-center py-8 italic">
                  No transactions yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((tx) => (
                    <RecentEarningRow
                      key={tx.id}
                      currency={tx.currency}
                      earning={{
                        id: String(tx.id),
                        type: tx.label ?? txDisplayLabel(tx.type),
                        description: tx.description ?? txDisplayDescription(tx.type, ""),
                        amount: tx.amount,
                        date: new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                        ledgerType: tx.ledger_type,
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-foundation-alternate pb-12">
      <div className="max-w-350 mx-auto px-4 md:px-6 lg:px-8 py-6">
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
                {showBalance
                  ? usdcBalance != null
                    ? `$${parseFloat(usdcBalance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `$${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "••••••"}
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

            {/* Testnet faucet — only visible on Base Sepolia */}
            {CHAIN_ID === 84532 && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => { setFaucetError(null); claimTestUsdc(); }}
                  disabled={faucetLoading || faucetDone}
                  className="flex items-center gap-1.5 text-base text-white hover:text-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {faucetLoading ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Minting test USDC…</>
                  ) : faucetDone ? (
                    "✓ 100,000 test USDC sent!"
                  ) : (
                    "🧪 Get 100,000 test USDC (testnet only)"
                  )}
                </button>
                {faucetError === "no-gas" && (
                  <p className="text-xs text-yellow-300/80 text-center max-w-xs leading-relaxed">
                    Your embedded wallet needs <strong>Base Sepolia ETH</strong> for gas — regular Sepolia ETH won&apos;t work here.{" "}
                    <a
                      href="https://www.alchemy.com/faucets/base-sepolia"
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-yellow-200"
                    >
                      Get Base Sepolia ETH →
                    </a>
                    {" "}and send a small amount (0.001 ETH is enough) to:{" "}
                    <span className="font-mono text-white/70 break-all">
                      {wallets.find((w) => w.walletClientType === "privy")?.address ?? "—"}
                    </span>
                  </p>
                )}
              </div>
            )}
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
                    : "bg-neutral-primary text-neutral-secondary-text border-neutral-tertiary-border hover:border-neutral-secondary-border"
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.comingSoon && <span className="text-xs opacity-70 ml-0.5">(soon)</span>}
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
        onClose={() => { setShowWithdrawModal(false); handleWithdrawSuccess(); }}
        onSuccess={handleWithdrawSuccess}
        currentBalance={currentBalance}
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

      {/* Always-mounted: populate on-chain pending amounts before modals are opened */}
      <div className="hidden">
        <CreatorRoyaltiesSection
          getAccessToken={getAccessToken}
          onTotalLoaded={setCreatorRoyaltiesPending}
          onClaimed={handleClaimed}
        />
        <BoxOfficeRevenueSection
          getAccessToken={getAccessToken}
          onTotalsLoaded={(pending) => setBoxOfficePendingGross(pending)}
          onClaimed={handleClaimed}
        />
      </div>

      <ClaimRoyaltiesModal
        isOpen={showClaimRoyaltiesModal}
        onClose={() => setShowClaimRoyaltiesModal(false)}
        getAccessToken={getAccessToken}
        onTotalsLoaded={(pending) => setBoxOfficePendingGross(pending)}
        onClaimed={handleClaimed}
      />

      <ClaimBoxOfficeModal
        isOpen={showClaimBoxOfficeModal}
        onClose={() => setShowClaimBoxOfficeModal(false)}
        getAccessToken={getAccessToken}
        onTotalLoaded={setCreatorRoyaltiesPending}
        onClaimed={handleClaimed}
      />
    </div>
  );
};

export default EarnPage;
