"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/app/hooks/useAuth";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "lucide-react";

type DashboardHeaderProps = {
  onMenuClick?: () => void;
};

const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [copied, setCopied] = useState(false);
  const { getUsdcBalance, walletAddress } = usePixseeContract();

  useEffect(() => {
    setMounted(true);
  }, []);

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
          className="hidden sm:flex bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-3 sm:px-4 py-2 gap-1.5 font-medium shrink-0 min-h-[40px]"
        >
          <Link href="/dashboard/create" aria-label="Create">
            <Plus className="w-4 h-4" />
            <span >Create</span>
          </Link>
        </Button>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2 sm:px-3 md:px-4 py-2 bg-neutral-secondary rounded-2xl">
            <Wallet className="w-4 h-4 text-neutral-tertiary-text" />
            <span className="text-xs sm:text-sm font-medium text-neutral-primary-text whitespace-nowrap">
              ${usdcBalance.split(".")[0]}
              <span className="hidden sm:inline">.{usdcBalance.split(".")[1] ?? "00"}</span>
            </span>
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg hover:bg-neutral-secondary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-neutral-secondary-text" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-semantic-error-primary rounded-full" />
          </button>

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
                <span className="hidden lg:block text-sm font-medium text-neutral-primary-text max-w-[10rem] truncate">
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
  );
};

export default DashboardHeader;
