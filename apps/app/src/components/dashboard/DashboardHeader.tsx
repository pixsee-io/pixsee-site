"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/app/hooks/useAuth";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";
import { useNotifications } from "@/app/hooks/useSocial";
import { usePrivy, useExportWallet, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Menu,
  Search,
  Plus,
  Wallet,
  Bell,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Copy,
  Check,
  Heart,
  MessageCircle,
  UserPlus,
  Reply,
  ArrowDownLeft,
  ArrowUpRight,
  KeyRound,
  Coins,
  TrendingUp,
  TrendingDown,
  Clapperboard,
  Gift,
  Trash2,
  PenLine,
  Radio,
} from "lucide-react";
import AddFundsModal from "@/components/dashboard/earn/modals/AddFundsModal";
import WithdrawModal from "@/components/dashboard/earn/modals/WithdrawModal";

type DashboardHeaderProps = {
  onMenuClick?: () => void;
};

function notifIcon(type: string) {
  switch (type) {
    case "video_liked":         return <Heart className="w-3.5 h-3.5 text-semantic-error-primary" />;
    case "user_followed":       return <UserPlus className="w-3.5 h-3.5 text-brand-pixsee-secondary" />;
    case "comment_replied":     return <Reply className="w-3.5 h-3.5 text-semantic-warning-primary" />;
    case "comment_posted":      return <MessageCircle className="w-3.5 h-3.5 text-brand-pixsee-secondary" />;
    case "royalties_claimed":   return <Coins className="w-3.5 h-3.5 text-semantic-success-primary" />;
    case "creator_fee_claimed": return <Coins className="w-3.5 h-3.5 text-semantic-success-primary" />;
    case "tix_bought":          return <TrendingUp className="w-3.5 h-3.5 text-semantic-success-primary" />;
    case "tix_sold":            return <TrendingDown className="w-3.5 h-3.5 text-semantic-warning-primary" />;
    case "tix_bought_for_show": return <TrendingUp className="w-3.5 h-3.5 text-brand-pixsee-secondary" />;
    case "watch_cashback":      return <Gift className="w-3.5 h-3.5 text-semantic-success-primary" />;
    case "show_created":        return <Clapperboard className="w-3.5 h-3.5 text-brand-pixsee-secondary" />;
    case "show_updated":        return <PenLine className="w-3.5 h-3.5 text-semantic-warning-primary" />;
    case "show_deleted":        return <Trash2 className="w-3.5 h-3.5 text-semantic-error-primary" />;
    case "show_published":      return <Radio className="w-3.5 h-3.5 text-brand-pixsee-secondary" />;
    default:                    return <MessageCircle className="w-3.5 h-3.5 text-neutral-tertiary-text" />;
  }
}

function notifText(n: { type: string; data: Record<string, any> }): string {
  const d = n.data;
  switch (n.type) {
    case "video_liked":         return `${d.liker_name ?? "Someone"} liked your video "${d.video_title ?? ""}"`;
    case "user_followed":       return `${d.follower_name ?? "Someone"} started following you`;
    case "comment_posted":      return `${d.commenter_name ?? "Someone"} commented on "${d.video_title ?? ""}"`;
    case "comment_replied":     return `${d.replier_name ?? "Someone"} replied to your comment`;
    case "royalties_claimed":   return `You claimed ${d.amount_usdc ?? ""} USDC in royalties for "${d.show_title ?? ""}"`;
    case "creator_fee_claimed": return `You claimed ${d.amount ?? ""} ${d.currency ?? "USDC"} in creator fees for "${d.show_title ?? ""}"`;
    case "tix_bought":          return `You bought ${d.tix_amount ?? ""} ${d.tick_symbol ?? "TIX"} for "${d.show_title ?? ""}"`;
    case "tix_sold":            return `You sold ${d.tix_amount ?? ""} ${d.tick_symbol ?? "TIX"} from "${d.show_title ?? ""}"`;
    case "tix_bought_for_show": return `${d.buyer_name ?? "Someone"} bought ${d.tix_amount ?? ""} ${d.tick_symbol ?? "TIX"} for your show "${d.show_title ?? ""}"`;
    case "watch_cashback":      return `You earned ${d.tix_amount ?? ""} ${d.tick_symbol ?? "TIX"} cashback for watching "${d.show_title ?? ""}"`;
    case "show_created":        return `Your show "${d.show_title ?? ""}" was created successfully`;
    case "show_updated":        return `Your show "${d.show_title ?? ""}" was updated`;
    case "show_deleted":        return `Your show "${d.show_title ?? ""}" was deleted`;
    case "show_published":      return `${d.creator_name ?? "A creator"} published "${d.show_title ?? "a show"}"`;
    default:                    return "New notification";
  }
}

const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { getAccessToken } = usePrivy();
  const { exportWallet } = useExportWallet();
  const { wallets } = useWallets();
  const hasEmbeddedWallet = wallets.some((w) => w.walletClientType === "privy");
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [copied, setCopied] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { getUsdcBalance, walletAddress } = usePixseeContract();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(getAccessToken);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  useEffect(() => {
    if (!user) return;
    getUsdcBalance()
      .then((raw) => {
        const num = parseFloat(raw);
        setUsdcBalance(
          num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      })
      .catch(() => {});
  }, [user, getUsdcBalance]);

  const getUserDisplay = () => {
    if (!user) return "User";
    if (user.email?.address) return user.email.address;
    if (user.wallet?.address) {
      return `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(
        -4
      )}`;
    }
    return "User";
  };

  const getInitials = () => {
    if (!user) return "U";
    if (user.email?.address) return user.email.address.charAt(0).toUpperCase();
    return "U";
  };

  const copyWalletAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Cycle: light → dark → system → light
  const cycleTheme = () => {
    const current = theme ?? "system";
    if (current === "light") setTheme("dark");
    else if (current === "dark") setTheme("system");
    else setTheme("light");
  };

  const themeLabel = (() => {
    if (!mounted) return "Theme";
    if (theme === "system") return `System (${resolvedTheme})`;
    if (theme === "dark") return "Dark";
    return "Light";
  })();

  const ThemeIcon = (() => {
    if (!mounted) return Sun;
    if (theme === "system") return Monitor;
    if (theme === "dark") return Moon;
    return Sun;
  })();

  return (
    <>
    <header className="sticky top-0 z-40 bg-neutral-primary text-neutral-primary-text border-b border-neutral-tertiary-border px-3 sm:px-4 md:px-6 py-3">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="xl:hidden p-2 rounded-lg hover:bg-neutral-secondary transition-colors shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-neutral-primary-text" />
        </button>

        {/* Search — single responsive input */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-neutral-tertiary-text pointer-events-none" />
            <input
              type="text"
              placeholder="Search shows"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 bg-neutral-secondary text-neutral-primary-text placeholder:text-neutral-tertiary-text rounded-full border border-neutral-tertiary-border focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary focus:border-transparent text-sm transition-all"
            />
          </div>
        </div>

        {/* Create — icon-only on xs, full on sm+ */}
        <Button
          asChild
          className="hidden sm:flex bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-3 sm:px-4 py-2 gap-1.5 font-medium shrink-0 min-h-10"
        >
          <Link href="/create" aria-label="Create">
            <Plus className="w-4 h-4" />
            <span >Create</span>
          </Link>
        </Button>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-1.5 px-2 sm:px-3 md:px-4 py-2 bg-neutral-secondary rounded-2xl hover:bg-neutral-secondary/80 transition-colors">
                <Wallet className="w-4 h-4 text-neutral-tertiary-text" />
                <span className="text-xs sm:text-sm font-medium text-neutral-primary-text whitespace-nowrap">
                  ${usdcBalance.split(".")[0]}
                  <span className="hidden sm:inline">.{usdcBalance.split(".")[1] ?? "00"}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-neutral-tertiary-text font-normal">
                ${usdcBalance} USDC
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowFundModal(true)}
                className="cursor-pointer"
              >
                <ArrowUpRight className="mr-2 h-4 w-4 text-brand-pixsee-secondary" />
                Fund Wallet
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowWithdrawModal(true)}
                className="cursor-pointer"
              >
                <ArrowDownLeft className="mr-2 h-4 w-4 text-neutral-secondary-text" />
                Withdraw
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen((o) => !o);
                if (!notifOpen && unreadCount > 0) markAllRead();
              }}
              className="relative p-2 rounded-lg hover:bg-neutral-secondary transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-neutral-secondary-text" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 bg-semantic-error-primary rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-neutral-primary border border-neutral-tertiary-border rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-tertiary-border">
                  <span className="font-semibold text-sm text-neutral-primary-text">Notifications</span>
                  {notifications.some((n) => !n.read) && (
                    <button onClick={markAllRead} className="text-xs text-brand-pixsee-secondary hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-neutral-tertiary-border">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-neutral-tertiary-text text-center py-8 italic">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={cn(
                          "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-neutral-secondary transition-colors",
                          !n.read && "bg-brand-pixsee-secondary/5"
                        )}
                      >
                        <div className="w-7 h-7 rounded-full bg-neutral-secondary flex items-center justify-center shrink-0 mt-0.5">
                          {notifIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-primary-text leading-snug">{notifText(n)}</p>
                          <p className="text-[10px] text-neutral-tertiary-text mt-0.5">
                            {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-brand-pixsee-secondary shrink-0 mt-1.5" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-full bg-brand-tertiary hover:bg-neutral-secondary transition-colors"
                aria-label="Account menu"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-br from-brand-pixsee-secondary to-brand-primary flex items-center justify-center overflow-hidden shrink-0">
                  <span className="text-white text-sm font-medium">
                    {getInitials()}
                  </span>
                </div>
                <span className="hidden lg:block text-sm font-medium text-neutral-primary-text max-w-40 truncate">
                  {getUserDisplay()}
                </span>
                <ChevronDown className="hidden lg:block w-4 h-4 text-neutral-tertiary-text" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="truncate">
                {getUserDisplay()}
              </DropdownMenuLabel>

              {walletAddress && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={copyWalletAddress}
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer"
                  >
                    {copied ? (
                      <Check className="mr-2 h-4 w-4 text-semantic-success-primary" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    <span className="flex-1 font-mono text-xs text-neutral-tertiary-text truncate">
                      {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
                    </span>
                    <span className="ml-2 text-xs text-neutral-tertiary-text shrink-0">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={cycleTheme}
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer"
              >
                <ThemeIcon className="mr-2 h-4 w-4" />
                <span className="flex-1">Theme</span>
                <span className="text-xs text-neutral-tertiary-text ml-2 capitalize">
                  {themeLabel}
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {hasEmbeddedWallet && (
                <DropdownMenuItem
                  onClick={() => exportWallet()}
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Export Wallet
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-semantic-error-text focus:text-semantic-error-text"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    {showFundModal && (
      <AddFundsModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        onSuccess={() => setShowFundModal(false)}
        currentBalance={parseFloat(usdcBalance.replace(/,/g, ""))}
      />
    )}
    {showWithdrawModal && (
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={() => setShowWithdrawModal(false)}
        currentBalance={parseFloat(usdcBalance.replace(/,/g, ""))}
      />
    )}
    </>
  );
};

export default DashboardHeader;
