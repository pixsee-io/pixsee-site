"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import DashboardHeader from "./DashboardHeader";
import Link from "next/link";
import Image from "next/image";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleMobileNavClick = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-foundation-alternate">
      {/* Desktop Sidebar */}
      <div className="hidden xl:block sticky top-0 h-screen">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 xl:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full transition-transform duration-300 xl:hidden",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative h-full">
          <div className="w-full absolute top-4 px-3 flex items-center justify-between z-10">
            <Link
              href="/"
              className="items-center gap-2 inline-flex"
              onClick={handleMobileNavClick}
            >
              <Image
                src="/images/pixseee.svg"
                alt="Pixsee"
                width={100}
                height={32}
                className="object-contain"
              />
            </Link>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 rounded-lg bg-neutral-secondary hover:bg-neutral-tertiary text-neutral-primary-text transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <Sidebar onNavClick={handleMobileNavClick} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <DashboardHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
