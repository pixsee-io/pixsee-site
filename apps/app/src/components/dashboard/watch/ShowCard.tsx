"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  MoreVertical,
  Play,
  BookmarkPlus,
  BookmarkCheck,
  Share2,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShowCardProps } from "@/app/utils";
import ShareSheet from "@/components/ui/ShareSheet";

type GetAccessToken = () => Promise<string | null>;

type ShowCardExtendedProps = ShowCardProps & {
  getAccessToken?: GetAccessToken;
  inWatchlist?: boolean;
  onWatchlistToggle?: () => void;
};

function timeAgo(dateStr?: string): string | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (years >= 1) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months >= 1) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks >= 1) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return "Just now";
}

const ShowCard = ({
  id,
  title,
  thumbnailUrl,
  creatorName,
  creatorAvatar,
  views,
  likes,
  description,
  isPlaying = false,
  isLiked: isLikedProp,
  videoFormat = "portrait",
  className,
  inWatchlist = false,
  onWatchlistToggle,
  createdAt,
}: ShowCardExtendedProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Click-outside closes dropdown
  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setMenuOpen((prev) => !prev);
  }, [menuOpen]);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWatchlistToggle?.();
    setMenuOpen(false);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    setShareOpen(true);
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl transition-colors duration-200 hover:bg-neutral-secondary cursor-pointer",
        className
      )}
    >
      <Link href={`/watch/${id}`} className="block">
        <div
          className={cn(
            "relative rounded-t-2xl overflow-hidden",
            videoFormat === "landscape" ? "aspect-video" : "aspect-3/4"
          )}
        >
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div
            className={cn(
              "absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20 flex flex-col items-center justify-center transition-opacity duration-300",
              isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-pixsee-secondary flex items-center justify-center hover:bg-brand-pixsee-hover transition-colors">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
            {description && (
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3 pt-12">
                <p className="text-white text-xs text-center line-clamp-3">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Card Footer */}
      {videoFormat === "landscape" ? (
        <div className="flex items-start gap-3 px-1 py-3 sm:py-4">
          <div className="w-10 h-10 rounded-full bg-neutral-tertiary overflow-hidden shrink-0 mt-0.5">
            {creatorAvatar ? (
              <Image src={creatorAvatar} alt={creatorName} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-medium text-neutral-secondary-text">
                {creatorName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/watch/${id}`} className="block">
              <h3 className="font-semibold text-sm text-neutral-primary-text line-clamp-2 leading-snug">
                {title}
              </h3>
            </Link>
            <p className="text-xs text-neutral-tertiary-text mt-1 truncate">{creatorName}</p>
            <p className="text-xs text-neutral-tertiary-text mt-0.5">
              {views} views{timeAgo(createdAt) ? ` · ${timeAgo(createdAt)}` : ""}
            </p>
          </div>
          <button
            ref={btnRef}
            onClick={handleMenuClick}
            className="p-1 rounded-lg hover:bg-neutral-secondary transition-colors shrink-0"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4 text-neutral-tertiary-text" />
          </button>
        </div>
      ) : (
        /* Portrait footer */
        <div className="flex items-start justify-between gap-2 px-1.5 py-3 sm:py-4">
          <div className="flex-1 min-w-0">
            <Link href={`/watch/${id}`} className="block">
              <h3 className="font-semibold text-sm text-neutral-primary-text line-clamp-2">
                {title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-5 h-5 rounded-full bg-neutral-tertiary overflow-hidden shrink-0">
                  {creatorAvatar ? (
                    <Image src={creatorAvatar} alt={creatorName} width={20} height={20} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-secondary-text">
                      {creatorName.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-xs text-neutral-tertiary-text truncate">{creatorName}</span>
              </div>
            </Link>
            <p className="mt-1.5 text-xs text-neutral-tertiary-text">
              {views} views{timeAgo(createdAt) ? ` · ${timeAgo(createdAt)}` : ""}
            </p>
          </div>
          <button
            ref={btnRef}
            onClick={handleMenuClick}
            className="p-1.5 rounded-lg hover:bg-neutral-secondary transition-colors shrink-0"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4 text-neutral-tertiary-text" />
          </button>
        </div>
      )}

      {menuOpen && menuPos && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={{ position: "absolute", top: menuPos.top, right: menuPos.right }}
          className="z-9999 w-48 bg-neutral-primary border border-neutral-tertiary-border rounded-xl shadow-2xl py-1"
        >
          {onWatchlistToggle && (
            <button
              onClick={handleWatchlistClick}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-neutral-primary-text hover:bg-neutral-secondary transition-colors text-left"
            >
              {inWatchlist ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-brand-pixsee-secondary shrink-0" />
                  Remove from Watchlist
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 shrink-0" />
                  Add to Watchlist
                </>
              )}
            </button>
          )}
          <button
            onClick={handleShareClick}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-neutral-primary-text hover:bg-neutral-secondary transition-colors text-left"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            Share
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-semantic-error-primary hover:bg-neutral-secondary transition-colors text-left"
          >
            <Flag className="w-4 h-4 shrink-0" />
            Report
          </button>
        </div>,
        document.body
      )}

      <ShareSheet
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        url={typeof window !== "undefined" ? `${window.location.origin}/watch/${id}` : `/watch/${id}`}
        title={title}
      />
    </div>
  );
};

export default ShowCard;
