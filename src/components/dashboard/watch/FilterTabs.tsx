"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type FilterTab = {
  id: string;
  label: string;
};

type FilterTabsProps = {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
};

const FilterTabs = ({ tabs, activeTab, onTabChange, className }: FilterTabsProps) => {
  return (
    <div className={cn("flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
              isActive
                ? "bg-brand-primary text-white"
                : "bg-neutral-primary text-neutral-secondary-text border border-neutral-tertiary-border hover:bg-neutral-secondary hover:text-neutral-primary-text"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;