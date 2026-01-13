"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { CircleArrowOutUpRight } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import Image from "next/image";

type Props = {};

interface FeaturedShow {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorAvatar: string;
  tixPrice: string;
  curatorApr: string;
  episodes: string;
  totalMinWatched: string;
}

const DiscoverNewShows = (props: Props) => {
  const headerResult = useScrollAnimation({ animationType: "fade-up" });
  const titleResult = useScrollAnimation({ animationType: "fade-up" });
  const descriptionResult = useScrollAnimation({ animationType: "fade-up" });
  const cardsResult = useScrollAnimation({ animationType: "fade-up" });

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: true,
      stopOnMouseEnter: false,
    })
  );

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const featuredShows: FeaturedShow[] = [
    {
      id: "1",
      title: "Quantum Dreams: Genesis",
      description:
        "A mind-bending journey through parallel realities. Join the creator as they explore the boundaries between consciousness and digital existence in this exclusive 8-episode series.",
      creator: "Guillermo Rauch",
      creatorAvatar: "/images/guillermo.png",
      tixPrice: "$0.015/min",
      curatorApr: "24.5%",
      episodes: "8",
      totalMinWatched: "1.2M min",
    },
    {
      id: "2",
      title: "Midnight Chronicles",
      description:
        "Dive into a noir-inspired world of mystery and intrigue. Uncover secrets that blur the line between reality and nightmare.",
      creator: "Alex Chen",
      creatorAvatar: "/images/guillermo.png",
      tixPrice: "$0.025/min",
      curatorApr: "28.1%",
      episodes: "12",
      totalMinWatched: "2.8M min",
    },
    {
      id: "3",
      title: "Neon Shadows",
      description:
        "Cyberpunk adventure through a dystopian city. Fight for survival and uncover the truth behind the corporate overlords.",
      creator: "Sofia Ramirez",
      creatorAvatar: "/images/guillermo.png",
      tixPrice: "$0.018/min",
      curatorApr: "22.3%",
      episodes: "10",
      totalMinWatched: "1.9M min",
    },
  ];

  return (
    <section className="relative w-full bg-foundation-alternate py-20 px-4 shows_bg">
      <div className="max-w-360 mx-auto">
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
            </Link>
          </Button>
        </div>

        <div
          ref={titleResult.ref}
          className={`text-center mb-6 ${titleResult.animationClass}`}
          style={{ transitionDelay: "0.1s" }}
        >
          <h2 className="max-w-3xl mx-auto text-4xl lg:text-[55px] font-bold text-white">
            Discover New{" "}
            <span className="text-brand-pixsee-secondary">Shows</span>
          </h2>
        </div>

        <div
          ref={descriptionResult.ref}
          className={`text-center mb-16 max-w-3xl mx-auto ${descriptionResult.animationClass}`}
          style={{ transitionDelay: "0.2s" }}
        >
          <p className="text-sm md:text-lg lg:text-xl text-white leading-relaxed">
            The entertainment industry is evolving. Pixsee gives creators full
            control, fans real rewards, and both a stake in success.
          </p>
        </div>

        <div
          ref={cardsResult.ref}
          className={`w-full ${cardsResult.animationClass}`}
          style={{ transitionDelay: "0.3s" }}
        >
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
              {featuredShows.map((show) => (
                <CarouselItem key={show.id} className="pl-4">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 lg:gap-16">
                    <div className="flex-col space-y-8 max-w-2xl">
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                        {show.title}
                      </h2>

                      <p className="text-white text-sm md:text-lg leading-relaxed">
                        {show.description}
                      </p>

                      <div className="flex items-center space-x-4">
                        <Image
                          src={show.creatorAvatar}
                          alt={show.creator}
                          width={50}
                          height={50}
                          className="rounded-full w-10 h-10 md:w-12 md:h-12"
                        />
                        <span className="text-white text-sm md:text-base">
                          {show.creator}
                        </span>
                      </div>

                      <Button
                        className="w-fit rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-9 py-3 md:py-5 font-medium text-sm flex items-center gap-2 shadow-lg transition-all duration-200"
                        asChild
                      >
                        <Link href={`/shows/${show.id}`}>
                          Play show
                          <CircleArrowOutUpRight size={18} />
                        </Link>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full lg:w-auto">
                      <div className="border border-gray-700 py-4 px-4 md:px-8 rounded-md flex flex-col gap-2 text-white bg-black/20 backdrop-blur-sm">
                        <p className="text-sm opacity-80">Current Tix price</p>
                        <p className="text-lg md:text-xl font-bold text-[#57C250]">
                          {show.tixPrice}
                        </p>
                      </div>

                      <div className="border border-gray-700 py-4 px-4 md:px-8 rounded-md flex flex-col gap-2 text-white bg-black/20 backdrop-blur-sm">
                        <p className="text-sm opacity-80">Curator APR</p>
                        <p className="text-lg md:text-xl font-bold text-[#1687E5]">
                          {show.curatorApr}
                        </p>
                      </div>

                      <div className="border border-gray-700 py-4 px-4 md:px-8 rounded-md flex flex-col gap-2 text-white bg-black/20 backdrop-blur-sm">
                        <p className="text-sm opacity-80">Episodes</p>
                        <p className="text-lg md:text-xl font-bold text-[#1687E5]">
                          {show.episodes}
                        </p>
                      </div>

                      <div className="border border-gray-700 py-4 px-4 md:px-8 rounded-md flex flex-col gap-2 text-white bg-black/20 backdrop-blur-sm">
                        <p className="text-sm opacity-80">Total min watched</p>
                        <p className="text-lg md:text-xl font-bold text-[#FF3795]">
                          {show.totalMinWatched}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="flex justify-center mt-8 gap-3">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${
                    current === index + 1
                      ? "bg-brand-pixsee-secondary scale-125"
                      : "bg-white/40 hover:bg-white/70"
                  }
                `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverNewShows;
