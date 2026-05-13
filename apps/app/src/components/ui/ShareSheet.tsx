"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import { FaXTwitter, FaWhatsapp, FaTelegram } from "react-icons/fa6";
import { cn } from "@/lib/utils";

type ShareSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  description?: string;
};

export const ShareSheet = ({
  isOpen,
  onClose,
  url,
  title,
  description,
}: ShareSheetProps) => {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title ?? "Check this out on Pixsee");

  const platforms = [
    {
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: <FaXTwitter className="w-5 h-5" />,
      bg: "bg-black hover:bg-neutral-800",
      text: "text-white",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: <FaWhatsapp className="w-5 h-5" />,
      bg: "bg-[#25D366] hover:bg-[#20b858]",
      text: "text-white",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <FaTelegram className="w-5 h-5" />,
      bg: "bg-[#0088cc] hover:bg-[#0077b3]",
      text: "text-white",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: title ?? "Pixsee",
        text: description,
        url,
      });
    } catch {
      // user dismissed or not supported
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "relative bg-neutral-primary border border-neutral-tertiary-border rounded-t-3xl sm:rounded-2xl shadow-2xl",
          "w-full sm:max-w-md mx-0 sm:mx-4",
          "animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        )}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-tertiary-border" />
        </div>

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-neutral-primary-text">
                Share
              </h2>
              {title && (
                <p className="text-sm text-neutral-tertiary-text mt-0.5 line-clamp-1">
                  {title}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-secondary transition-colors -mt-0.5 -mr-0.5"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-neutral-tertiary-text" />
            </button>
          </div>

          {/* Platform buttons */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {platforms.map((p) => (
              <a
                key={p.label}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className={cn(
                  "flex flex-col items-center gap-2 py-3 px-2 rounded-xl transition-colors",
                  p.bg, p.text
                )}
              >
                {p.icon}
                <span className="text-xs font-medium">{p.label}</span>
              </a>
            ))}
          </div>

          {/* Copy link row */}
          <div className="flex items-center gap-2 p-3 bg-neutral-secondary rounded-xl border border-neutral-tertiary-border">
            <p className="flex-1 text-sm text-neutral-secondary-text truncate font-mono">
              {url}
            </p>
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0",
                copied
                  ? "bg-semantic-success-subtle text-semantic-success-text"
                  : "bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Native share */}
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl border border-neutral-tertiary-border text-sm text-neutral-secondary-text hover:bg-neutral-secondary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              More options…
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareSheet;
