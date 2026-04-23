"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PlusCircle,
  Play,
  Coins,
  TrendingUp,
  Wallet,
  User,
  ChevronsLeft,
  Clapperboard,
  Users,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "About Us",
    href: "/about",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "Create",
    href: "/dashboard/create",
    icon: <PlusCircle className="w-5 h-5" />,
  },
  {
    label: "Watch",
    href: "/dashboard/watch",
    icon: <Play className="w-5 h-5" />,
  },
  {
    label: "Earn",
    href: "/dashboard/earn",
    icon: <Coins className="w-5 h-5" />,
  },
  {
    label: "My Studio",
    href: "/dashboard/studio",
    icon: <Clapperboard />,
  },
  {
    label: "Trade",
    href: "/dashboard/trade",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    label: "My Profile",
    href: "/dashboard/profile",
    icon: <User className="w-5 h-5" />,
  },
];

type SidebarProps = {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavClick?: () => void;
};

const Sidebar = ({
  className,
  isCollapsed = false,
  onToggleCollapse,
  onNavClick,
}: SidebarProps) => {
  const pathname = usePathname();

  const userBalance = "10,000";

  return (
    <aside
      className={cn(
        "h-screen bg-neutral-primary text-neutral-primary-text border-r border-neutral-tertiary-border flex flex-col px-3 py-4 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      <Link href="/" className="hidden xl:flex items-center gap-2">
        <Image
          src="/images/pixseee.svg"
          alt="Pixsee"
          width={100}
          height={32}
          className="transition-all duration-300 object-contain"
        />
      </Link>

      {/* Navigation */}
      <nav className="mt-20 md:mt-14 flex-1 space-y-1">
        {navItems.map((item) => {
          const currentPath = pathname ?? "";
          const isActive =
            currentPath === item.href ||
            currentPath.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-primary text-white shadow-md"
                  : "text-neutral-secondary-text hover:bg-neutral-secondary hover:text-neutral-primary-text",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span
                className={cn(
                  isActive ? "text-white" : "text-neutral-tertiary-text"
                )}
              >
                {item.icon}
              </span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {onToggleCollapse && (
          <div
            className={`mt-4 flex ${
              isCollapsed ? "justify-center" : "justify-end"
            }`}
          >
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg bg-brand-primary transition-colors hidden lg:flex"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronsLeft
                className={`w-4 h-4 text-white transition-transform duration-300 ${
                  isCollapsed ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
          </div>
        )}
      </nav>

      {/* Balance Card */}
      {/* {!isCollapsed && (
        <div className="p-4">
          <div className="bg-brand-tertiary rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-neutral-primary rounded flex items-center justify-center">
                <Wallet className="w-4 h-4 text-neutral-primary-text" />
              </div>
              <span className="text-sm font-medium text-neutral-primary-text">
                Balance
              </span>
            </div>
            <p className="text-2xl font-bold text-brand-pixsee-secondary">
              {userBalance} SPIX
            </p>
            <div className="mt-3">
              <Image
                src="/images/coins.svg"
                alt="Coins"
                width={150}
                height={80}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )} */}

      {/* Collapsed Balance Indicator */}
      {/* {isCollapsed && (
        <div className="p-3">
          <div
            className="bg-brand-tertiary rounded-xl p-2 flex items-center justify-center"
            title={`${userBalance} SPIX`}
          >
            <Wallet className="w-5 h-5 text-brand-pixsee-secondary" />
          </div>
        </div>
      )} */}
    </aside>
  );
};

export default Sidebar;
