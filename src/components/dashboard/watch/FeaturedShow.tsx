"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Eye, Heart, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeaturedShowData } from "@/app/utils";

type FeaturedShowProps = {
  shows: FeaturedShowData[];
  className?: string;
  autoplayDelay?: number;
};

const FeaturedShow = ({
  shows,
  className,
  autoplayDelay = 5000,
}: FeaturedShowProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  );

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!shows.length) return null;

  return (
    <div className={cn("relative", className)}>
      <Carousel
        setApi={setApi}
        plugins={[autoplayPlugin.current]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {shows.map((show) => (
            <CarouselItem key={show.id}>
              <div
                className={cn(
                  "relative rounded-xl sm:rounded-2xl overflow-hidden",
                  "aspect-[4/5] xs:aspect-[5/6] sm:aspect-[3/2] md:aspect-[16/7] xl:aspect-[3/1]",
                  "group"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Image
                  src={show.thumbnailUrl}
                  alt={show.title}
                  fill
                  className="object-cover brightness-[0.85] transition-transform duration-700 group-hover:scale-105"
                  priority={true} 
                />

                <div
                  className={cn(
                    "absolute inset-0 transition-all duration-300",
                    isHovered
                      ? "bg-gradient-to-r from-black/85 via-black/65 to-black/30"
                      : "bg-gradient-to-r from-black/75 via-black/45 to-transparent/30"
                  )}
                />

                <div className="absolute inset-0 flex items-end sm:items-center pb-6 sm:pb-0">
                  <div className="p-5 sm:p-7 md:p-9 lg:p-12 w-full max-w-2xl">
                    <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-paytone text-white mb-2 sm:mb-4 leading-tight">
                      {show.title}
                    </h2>

                    <p
                      className={cn(
                        "text-white/90 text-xs xs:text-sm sm:text-base mb-3 sm:mb-5",
                        "line-clamp-2 sm:line-clamp-3 transition-all duration-300",
                        isHovered && "sm:line-clamp-4"
                      )}
                    >
                      {show.description}
                    </p>

                    <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-5">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-neutral-tertiary overflow-hidden shrink-0">
                        {show.creatorAvatar ? (
                          <Image
                            src={show.creatorAvatar}
                            alt={show.creatorName}
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs sm:text-sm text-white bg-brand-pixsee-secondary">
                            {show.creatorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-white text-sm sm:text-base font-medium truncate">
                        {show.creatorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6 text-xs sm:text-sm text-white/80">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {show.views}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-semantic-error-primary text-semantic-error-primary" />
                        {show.likes}
                      </span>
                    </div>

                    <Button
                      asChild
                      className="w-full sm:w-auto bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-lg px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base gap-2 font-medium"
                    >
                      <Link href={`/dashboard/watch/${show.id}`}>
                        Play Show
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {shows.length > 1 && (
          <>
            <CarouselPrevious className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/25 backdrop-blur-md border-0 hover:bg-white/40 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-all" />
            <CarouselNext className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/25 backdrop-blur-md border-0 hover:bg-white/40 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-all" />
          </>
        )}
      </Carousel>

      {shows.length > 1 && (
        <div className="flex justify-center mt-4 sm:mt-6 gap-2.5 sm:gap-3">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 touch-manipulation",
                current === index
                  ? "bg-brand-pixsee-secondary w-6 sm:w-8"
                  : "bg-brand-pixsee-secondary/30 hover:bg-brand-pixsee-secondary/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedShow;
