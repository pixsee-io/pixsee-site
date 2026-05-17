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
  User,
  ChevronsLeft,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Watch", href: "/watch", icon: <Play className="w-5 h-5" /> },
  { label: "Create", href: "/create", icon: <PlusCircle className="w-5 h-5" /> },
  { label: "Earn", href: "/earn", icon: <Coins className="w-5 h-5" /> },
  { label: "Trade", href: "/trade", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
];

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

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" && (pathname?.startsWith(href + "/") ?? false));

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
        {navItems.map(renderNavItem)}

        <div className="pt-2 border-t border-neutral-tertiary-border">
          {bottomNavItems.map(renderNavItem)}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
