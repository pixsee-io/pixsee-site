"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
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
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

type DashboardHeaderProps = {
  onMenuClick?: () => void;
};

const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = usePrivy();

  const getUserDisplay = () => {
    if (!user) return "User";

    if (user.email?.address) {
      return user.email.address;
    }

    if (user.wallet?.address) {
      return `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(
        -4
      )}`;
    }

    return "User";
  };

  const getInitials = () => {
    if (!user) return "U";

    if (user.email?.address) {
      return user.email.address.charAt(0).toUpperCase();
    }

    return "U";
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-tertiary-border px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-neutral-secondary transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-neutral-primary-text" />
        </button>

        <Link href="/" className="hidden lg:flex items-center gap-2">
          <Image
            src="/images/pixseee.svg"
            alt="Pixsee"
            width={100}
            height={32}
            className="transition-all duration-300 object-contain"
          />
        </Link>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 w-full xl:min-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-5 md:h-5 text-neutral-tertiary-text" />
              <input
                type="text"
                placeholder="Search shows"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="xl:hidden w-full pl-7 md:pl-10 pr-2 py-1.5 bg-neutral-secondary rounded-full border border-neutral-tertiary-border focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary focus:border-transparent text-sm transition-all"
              />

              <input
                type="text"
                placeholder="Search shows and creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hidden xl:block w-full pl-10 pr-4 py-2.5 bg-neutral-secondary rounded-full border border-neutral-tertiary-border focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <Button
            asChild
            className="hidden sm:flex bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-4 py-2 gap-2 font-medium"
          >
            <Link href="/dashboard/create">
              Create
              <Plus className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1.5 md:gap-5 lg:gap-9">
          <div className="flex items-center gap-2 md:px-4 md:py-2 bg-neutral-secondary rounded-2xl">
            <Wallet className="w-4 h-4 text-neutral-tertiary-text" />
            <span className="hidden md:block text-sm font-medium text-neutral-primary-text">
              $1300.00
            </span>
          </div>

          <button className="relative p-2 rounded-lg hover:bg-neutral-secondary transition-colors">
            <Bell className="w-5 h-5 text-neutral-secondary-text" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-semantic-error-primary rounded-full" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-full bg-[#ECE5FF] hover:bg-neutral-secondary transition-colors">
                <div className="w-4 h-4 md:w-8 md:h-8 rounded-full bg-linear-to-br from-brand-pixsee-secondary to-brand-primary flex items-center justify-center overflow-hidden">
                  <span className="text-white text-sm font-medium">
                    {getInitials()}
                  </span>
                </div>
                <span className="hidden lg:block text-sm font-medium text-neutral-primary-text max-w-30 truncate">
                  {getUserDisplay()}
                </span>
                <ChevronDown className="hidden lg:block w-4 h-4 text-neutral-tertiary-text" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/portfolio" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  My Portfolio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/wallet" className="cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallet
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-600"
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
