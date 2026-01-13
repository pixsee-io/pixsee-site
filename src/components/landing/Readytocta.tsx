"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, ArrowUpRight } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";

type Props = {};

const ReadyToCTA = (props: Props) => {
  const containerResult = useScrollAnimation({ animationType: "fade-up" });
  const titleResult = useScrollAnimation({ animationType: "fade-up" });
  const descriptionResult = useScrollAnimation({ animationType: "fade-up" });
  const buttonsResult = useScrollAnimation({ animationType: "fade-up" });

  return (
    <section className="relative w-full bg-foundation-primary py-20 px-4 ">
      <div className="max-w-[90rem] mx-auto">
        <div
          ref={containerResult.ref}
          className={`cta_bg relative overflow-hidden rounded-3xl lg:rounded-[2.5rem] ${containerResult.animationClass}`}
          style={{ transitionDelay: "0s" }}
        >
          <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-6 lg:px-12 py-12 lg:py-24 text-center">
            <div
              ref={titleResult.ref}
              className={`${titleResult.animationClass}`}
              style={{ transitionDelay: "0.1s" }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white max-w-4xl mx-auto">
                Ready to Create or Watch?
              </h2>
            </div>

            <div
              ref={descriptionResult.ref}
              className={`${descriptionResult.animationClass}`}
              style={{ transitionDelay: "0.2s" }}
            >
              <p className="text-sm md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
                Join thousands of creators and fans building the future of
                streaming
              </p>
            </div>

            <div
              ref={buttonsResult.ref}
              className={`flex flex-col sm:flex-row gap-4 ${buttonsResult.animationClass}`}
              style={{ transitionDelay: "0.3s" }}
            >
              <Button
                asChild
                className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-8 py-3 md:py-6 font-semibold text-base shadow-lg"
              >
                <Link href="/explore-shows" className="flex items-center gap-2">
                  <Globe size={20} />
                  Explore Shows
                </Link>
              </Button>

              <Button
                asChild
                className="bg-white hover:bg-white/90 text-brand-action rounded-full px-8 py-3 md:py-6 font-semibold text-base shadow-lg"
              >
                <Link href="/launch-show" className="flex items-center gap-2">
                  Launch a show
                  <ArrowUpRight size={20} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadyToCTA;
