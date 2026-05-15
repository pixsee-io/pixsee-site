"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PlusCircle,
  Play,
  Coins,
  User,
  ChevronsLeft,
  Clapperboard,
  TrendingUp,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type NavGroup = {
  label: string;
  icon: React.ReactNode;
  children: NavItem[];
};

const topNavItems: NavItem[] = [
  { label: "Watch", href: "/watch", icon: <Play className="w-5 h-5" /> },
  { label: "Create", href: "/create", icon: <PlusCircle className="w-5 h-5" /> },
  { label: "Earn", href: "/earn", icon: <Coins className="w-5 h-5" /> },
  { label: "Trade", href: "/trade", icon: <TrendingUp className="w-5 h-5" /> },
];

const dashboardGroup: NavGroup = {
  label: "Dashboard",
  icon: <LayoutDashboard className="w-5 h-5" />,
  children: [
    { label: "My Box Office", href: "/dashboard/studio", icon: <Clapperboard className="w-5 h-5" /> },
  ],
};

const bottomNavItems: NavItem[] = [
  { label: "My Profile", href: "/profile", icon: <User className="w-5 h-5" /> },
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
  const isDashboardActive = pathname?.startsWith("/dashboard") ?? false;
  const [dashboardOpen, setDashboardOpen] = useState(isDashboardActive);

  const isActive = (href: string) =>
    pathname === href || (pathname?.startsWith(href + "/") ?? false);

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
      active
        ? "bg-brand-primary text-white shadow-md"
        : "text-neutral-secondary-text hover:bg-neutral-secondary hover:text-neutral-primary-text",
      isCollapsed && "justify-center px-2"
    );

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={onNavClick}
      className={linkClass(isActive(item.href))}
      title={isCollapsed ? item.label : undefined}
    >
      <span className={cn(isActive(item.href) ? "text-white" : "text-neutral-tertiary-text")}>
        {item.icon}
      </span>
      {!isCollapsed && <span>{item.label}</span>}
    </Link>
  );

  return (
    <aside
      className={cn(
        "h-screen bg-neutral-primary text-neutral-primary-text border-r border-neutral-tertiary-border flex flex-col px-3 py-4 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className="w-full flex items-end justify-between">
        {!isCollapsed && (
          <Link href="/" className="w-full hidden xl:flex">
            <Image
              src="/images/pixseee.svg"
              alt="Pixsee"
              width={100}
              height={32}
              className="transition-all duration-300 object-contain"
            />
          </Link>
        )}
        {onToggleCollapse && (
          <div className={`flex ${isCollapsed ? "justify-center" : "justify-end"}`}>
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
      </div>

      <nav className="mt-20 md:mt-14 flex-1 space-y-1">
        {topNavItems.map(renderNavItem)}

        {/* Dashboard group */}
        {isCollapsed ? (
          // Collapsed: show both children directly as icon-only links
          dashboardGroup.children.map(renderNavItem)
        ) : (
          <div>
            <button
              onClick={() => setDashboardOpen((o) => !o)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                isDashboardActive
                  ? "text-brand-pixsee-secondary"
                  : "text-neutral-secondary-text hover:bg-neutral-secondary hover:text-neutral-primary-text"
              )}
            >
              <span className={cn(isDashboardActive ? "text-brand-pixsee-secondary" : "text-neutral-tertiary-text")}>
                {dashboardGroup.icon}
              </span>
              <span className="flex-1 text-left">{dashboardGroup.label}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  dashboardOpen ? "rotate-180" : "rotate-0"
                )}
              />
            </button>

            {dashboardOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-neutral-tertiary-border pl-3">
                {dashboardGroup.children.map(renderNavItem)}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-neutral-tertiary-border">
          {bottomNavItems.map(renderNavItem)}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
