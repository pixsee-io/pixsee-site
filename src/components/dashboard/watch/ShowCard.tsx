"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Heart, MoreVertical, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShowCardProps } from "@/app/utils";

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
  className,
}: ShowCardProps) => {
  return (
    <div className={cn("group", "bg-white rounded-2xl shadow-md", className)}>
      <Link href={`/dashboard/watch/${id}`}>
        <div className="relative aspect-3/4 rounded-t-2xl overflow-hidden mb-3">
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
              <button className="w-12 h-12 rounded-full bg-brand-pixsee-secondary flex items-center justify-center hover:bg-brand-pixsee-hover transition-colors">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </button>
            </div>

            {/* Description */}
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
      <div className="flex items-start justify-between gap-2 p-5">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-primary-text truncate">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
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
            <span className="text-sm text-neutral-tertiary-text truncate">
              {creatorName}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-neutral-tertiary-text">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {views}
            </span>
            <span className="flex items-center gap-1 text-semantic-error-primary">
              <Heart className="w-4 h-4 fill-current" />
              {likes}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button className="p-1.5 rounded-lg hover:bg-neutral-secondary transition-colors">
            <MoreVertical className="w-4 h-4 text-neutral-tertiary-text" />
          </button>

          <Button
            size="sm"
            className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover rounded-full text-white text-xs px-8"
          >
            Watch
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShowCard;
