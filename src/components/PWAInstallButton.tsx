"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod|android|mobile/i.test(navigator.userAgent);
  }, []);

  const isIos = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }, []);

  const isStandalone = useMemo(() => {
    if (typeof window === "undefined") return false;
    const iosStandalone =
      typeof window.navigator !== "undefined" &&
      "standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    return window.matchMedia("(display-mode: standalone)").matches || iosStandalone;
  }, []);

  useEffect(() => {
    const dismissed = window.localStorage.getItem("pwa-install-dismissed");
    setIsDismissed(dismissed === "true");
    setIsInstalled(isStandalone);

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    window.localStorage.setItem("pwa-install-dismissed", "true");
    setIsDismissed(true);
  };

  if (!isMobile || isInstalled || isDismissed) return null;

  const showInstallPrompt = Boolean(deferredPrompt);
  const showIosPrompt = !showInstallPrompt && isIos && !isStandalone;
  if (!showInstallPrompt && !showIosPrompt) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 rounded-xl border border-neutral-tertiary-border bg-neutral-primary p-4 shadow-xl">
      <p className="text-sm font-semibold text-neutral-primary-text">
        Install Pixsee
      </p>
      <p className="mt-1 text-xs text-neutral-secondary-text">
        {showInstallPrompt
          ? "Get a faster, app-like experience with offline support."
          : "On iPhone/iPad, tap Share, then Add to Home Screen."}
      </p>

      <div className="mt-3 flex items-center gap-2">
        {showInstallPrompt ? (
          <Button onClick={handleInstall} className="h-8 px-3 text-xs">
            Install App
          </Button>
        ) : null}
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="h-8 px-3 text-xs"
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
