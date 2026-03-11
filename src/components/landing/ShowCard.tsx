"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Play } from "lucide-react";
import Image from "next/image";

interface ShowCardProps {
  id: string;
  title: string;
  creator: string;
  videoSrc: string;
  views: string;
  likes: string;
  floorPrice: string;
  isInteractive?: boolean;
  showLabels?: boolean;
}

const ShowCard = ({
  id,
  title,
  creator,
  videoSrc,
  views,
  likes,
  floorPrice,
  isInteractive = false,
  showLabels = false,
}: ShowCardProps) => {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-t-3xl bg-black h-96">
        <Image
          src={videoSrc}
          alt={title}
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-all">
          <div className="w-16 h-16 bg-foundation-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <Play
              size={28}
              className="fill-brand-pixsee-primary text-brand-pixsee-primary ml-1"
            />
          </div>
        </div>
      </div>

      {showLabels && (
        <div className="absolute top-1/3 -left-20 bg-brand-action text-white px-12 py-3 rounded-full font-semibold shadow-lg z-30">
          Watch
        </div>
      )}

      <div className="bg-foundation-primary rounded-b-3xl p-8 shadow-xl relative z-10">
        <p className="text-lg font-semibold text-neutral-primary-text mb-2">
          {title}
        </p>
        <p className="text-sm text-neutral-secondary-text mb-6">{creator}</p>

        <div className="flex items-center gap-7 mb-6">
          <div className="flex items-center gap-3">
            <Eye size={20} className="text-neutral-secondary-text" />
            <span className="font-semibold text-neutral-primary-text">
              {views}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={20} className="text-red-400 fill-red-400" />
            <span className="font-semibold text-neutral-primary-text">
              {likes}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pb-6 border-b border-neutral-tertiary-border mb-6">
          <div>
            <p className="text-xs text-neutral-secondary-text mb-1">
              Floor Price
            </p>
            <p className="text-lg font-bold text-brand-pixsee-secondary">
              {floorPrice}
            </p>
          </div>
          <Button className="px-12 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full font-semibold py-5 text-base">
            Watch
          </Button>
        </div>
      </div>

      {isInteractive && (
        <>
          <Button className="absolute bottom-52 -right-20 bg-brand-action text-white px-12 py-6 rounded-full font-semibold shadow-lg z-20">
            Trade
          </Button>

          <Button className="absolute -bottom-4 -left-16 bg-brand-action text-white px-12 py-6 rounded-full font-semibold shadow-lg z-20">
            Vote
          </Button>
        </>
      )}
    </div>
  );
};

export default ShowCard;
