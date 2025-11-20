"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import ShowCard from "./ShowCard";

type Props = {};

interface Show {
  id: string;
  title: string;
  creator: string;
  videoSrc: string;
  views: string;
  likes: string;
  floorPrice: string;
}

const DiscoverNewShows = (props: Props) => {
  const headerResult = useScrollAnimation({ animationType: "fade-up" });
  const titleResult = useScrollAnimation({ animationType: "fade-up" });
  const descriptionResult = useScrollAnimation({ animationType: "fade-up" });
  const cardsResult = useScrollAnimation({ animationType: "fade-up" });

  const shows: Show[] = [
    {
      id: "1",
      title: "Midnight Chronicles Ep. 1",
      creator: "Alex Chen",
      videoSrc: "/images/play_video.png",
      views: "1.2M",
      likes: "1.2M",
      floorPrice: "$12.5 PIX",
    },
    {
      id: "2",
      title: "Midnight Chronicles Ep. 1",
      creator: "Alex Chen",
      videoSrc: "/images/play_video.png",
      views: "1.2M",
      likes: "1.2M",
      floorPrice: "$12.5 PIX",
    },
    {
      id: "3",
      title: "Midnight Chronicles Ep. 1",
      creator: "Alex Chen",
      videoSrc: "/images/play_video.png",
      views: "1.2M",
      likes: "1.2M",
      floorPrice: "$12.5 PIX",
    },
  ];

  return (
    <section className="relative w-full bg-foundation-alternate py-20 px-4">
      <div className="max-w-[90rem] mx-auto">
        {/* Header Button */}
        <div
          ref={headerResult.ref}
          className={`flex justify-center mb-8 ${headerResult.animationClass}`}
          style={{ transitionDelay: "0s" }}
        >
          <Button
            variant="outline"
            className="rounded-full px-6 py-2 border-neutral-tertiary-border hover:border-neutral-secondary-border"
            asChild
          >
            <Link href="/featured-show" className="flex items-center gap-2">
              Featured show
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>

        {/* Title */}
        <div
          ref={titleResult.ref}
          className={`text-center mb-6 ${titleResult.animationClass}`}
          style={{ transitionDelay: "0.1s" }}
        >
          <h2 className="max-w-3xl mx-auto text-4xl lg:text-[55px] font-bold text-neutral-primary-text">
            Discover New <span className="text-brand-pixsee-secondary">Shows</span>
          </h2>
        </div>

        {/* Description */}
        <div
          ref={descriptionResult.ref}
          className={`text-center mb-16 max-w-3xl mx-auto ${descriptionResult.animationClass}`}
          style={{ transitionDelay: "0.2s" }}
        >
          <p className="text-lg lg:text-xl text-neutral-secondary-text leading-relaxed">
            The entertainment industry is evolving. Pixsee gives creators full
            control, fans real rewards, and both a stake in success.
          </p>
        </div>

        {/* Shows Grid */}
        <div
          ref={cardsResult.ref}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${cardsResult.animationClass}`}
          style={{ transitionDelay: "0.3s" }}
        >
          {shows.map((show) => (
            <ShowCard
              key={show.id}
              id={show.id}
              title={show.title}
              creator={show.creator}
              videoSrc={show.videoSrc}
              views={show.views}
              likes={show.likes}
              floorPrice={show.floorPrice}
              isInteractive={false}
              showLabels={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiscoverNewShows;