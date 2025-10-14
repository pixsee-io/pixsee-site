"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-[28px] border-[0.4px] border-white/10 p-1 flex items-center justify-between w-20 shadow-lg ${
        isDark ? "bg-foundation-primary" : "bg-neutral-secondary"
      }`}
    >
      <div
        className={`cursor-pointer ${
          !isDark
            ? `bg-brand-primary rounded-[95px] p-[7px] size-[29px]`
            : "ml-2"
        }`}
      >
        <Sun
          onClick={() => setTheme("light")}
          className="h-[15px] w-[15px] text-white"
          fill="#ffffff"
        />
      </div>
      <div
        className={`cursor-pointer ${
          isDark
            ? `bg-foundation-alternate rounded-[95px] p-[7px] size-[29px]`
            : "mr-2"
        }`}
      >
        <Moon
          onClick={() => setTheme("dark")}
          className="h-[15px] w-[15px] text-slate-700 dark:text-slate-200"
          fill={isDark ? "#8859e8" : "#110b1f"}
          stroke="none"
        />
      </div>
    </div>
  );
}
