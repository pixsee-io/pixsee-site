"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Heart,
  MoreVertical,
  Play,
  BookmarkPlus,
  BookmarkCheck,
  Share2,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShowCardProps } from "@/app/utils";
import { useSocialState } from "@/app/context/SocialStateContext";

type GetAccessToken = () => Promise<string | null>;

type ShowCardExtendedProps = ShowCardProps & {
  getAccessToken?: GetAccessToken;
  inWatchlist?: boolean;
  onWatchlistToggle?: () => void;
};

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
}: ShowCardExtendedProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Read liked state from Zustand cache (populated when visiting ShowDetails)
  const { getLiked } = useSocialState();
  const cached = getLiked(parseInt(id));
  const liked = cached !== undefined ? cached : isLikedProp ?? false;

  // Click-outside closes dropdown
  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWatchlistToggle?.();
    setMenuOpen(false);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard
        .writeText(`${window.location.origin}/dashboard/watch/${id}`)
        .catch(() => {});
    }
    setMenuOpen(false);
  };

  return (
    <div
      className={cn(
        "group relative bg-neutral-primary border border-neutral-tertiary-border rounded-2xl shadow-md",
        className
      )}
    >
      <Link href={`/dashboard/watch/${id}`} className="block">
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
      <div className="flex items-start justify-between gap-2 p-3 sm:p-4 md:p-5">
        <div className="flex-1 min-w-0">
          <Link href={`/dashboard/watch/${id}`} className="block">
            <h3 className="font-semibold text-sm sm:text-base text-neutral-primary-text truncate">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
              <div className="w-5 h-5 rounded-full bg-neutral-tertiary overflow-hidden shrink-0">
                {creatorAvatar ? (
                  <Image
                    src={creatorAvatar}
                    alt={creatorName}
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-secondary-text">
                    {creatorName.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-xs sm:text-sm text-neutral-tertiary-text truncate">
                {creatorName}
              </span>
            </div>
          </Link>

          <div className="mt-2 text-xs sm:text-sm text-neutral-tertiary-text">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {views} views
            </span>
          </div>
        </div>

        {/* Right: 3-dot menu + Watch */}
        <div
          className="flex flex-col items-end gap-2 shrink-0 relative"
          ref={menuRef}
        >
          <button
            onClick={handleMenuClick}
            className="p-1.5 rounded-lg hover:bg-neutral-secondary transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4 text-neutral-tertiary-text" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-100 w-48 bg-neutral-primary border border-neutral-tertiary-border rounded-xl shadow-2xl py-1">
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-semantic-error-primary hover:bg-neutral-secondary transition-colors text-left"
              >
                <Flag className="w-4 h-4 shrink-0" />
                Report
              </button>
            </div>
          )}

          <Link href={`/dashboard/watch/${id}`}>
            <Button
              size="sm"
              className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover rounded-full text-white text-xs px-6 md:px-8 h-8"
            >
              Watch
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShowCard;
