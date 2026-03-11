"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CircleCheck, ArrowUpRight } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import Image from "next/image";

type Props = {};

const TurnPassionIntoProfit = React.forwardRef<HTMLElement, Props>(
  (props, ref) => {
    const badgeResult = useScrollAnimation({ animationType: "fade-up" });
    const titleResult = useScrollAnimation({ animationType: "fade-up" });
    const descriptionResult = useScrollAnimation({ animationType: "fade-up" });
    const featuresResult = useScrollAnimation({ animationType: "fade-up" });
    const buttonResult = useScrollAnimation({ animationType: "fade-up" });
    const imageResult = useScrollAnimation({ animationType: "fade-left" });

    const features = [
      "Only pay for what you want to watch",
      "Earn by watching, voting or doing quests",
      "Unlock exclusive Perks & access have a voice",
      "Trade TIX -buy low and high",
    ];

    return (
      <section
        ref={ref}
        className="relative w-full flex justify-center bg-foundation-alternate py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 xl:pb-0"
      >
        <div className="max-w-[90rem] mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 md:gap-12 lg:gap-16">
            <div
              ref={imageResult.ref}
              className={`relative w-full lg:w-auto order-1 lg:order-1 ${imageResult.animationClass}`}
              style={{ transitionDelay: "0.4s" }}
            >
              <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-auto rounded-2xl sm:rounded-3xl overflow-hidden">
                <Image
                  src="/images/turn-passion.png"
                  alt="Turn Passion Into Profit"
                  width={400}
                  height={800}
                  className="w-full h-full lg:min-h-[35rem] xl:min-h-[35rem] object-cover"
                  priority
                />
              </div>
            </div>

            <div className="w-full lg:max-w-2xl space-y-5 sm:space-y-6 md:space-y-7 order-2 lg:order-2">
              <div
                ref={badgeResult.ref}
                className={`w-fit ${badgeResult.animationClass}`}
                style={{ transitionDelay: "0s" }}
              >
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-brand-action text-xs sm:text-sm font-semibold bg-brand-primary-light">
                  For fans
                </div>
              </div>

              <div
                ref={titleResult.ref}
                className={`${titleResult.animationClass}`}
                style={{ transitionDelay: "0.1s" }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-primary-text">
                  Turn Passion Into Profit
                </h2>
              </div>

              <div
                ref={descriptionResult.ref}
                className={`${descriptionResult.animationClass}`}
                style={{ transitionDelay: "0.2s" }}
              >
                <p className="max-w-xl text-base sm:text-lg md:text-xl text-neutral-secondary-text leading-relaxed">
                  Your engagement matters. Watch, vote, trade, and earn $PIX
                  tokens for every interaction.
                </p>
              </div>

              <div
                ref={featuresResult.ref}
                className={`space-y-3 sm:space-y-4 ${featuresResult.animationClass}`}
                style={{ transitionDelay: "0.3s" }}
              >
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4">
                    <div className="shrink-0 mt-0.5 sm:mt-1">
                      <CircleCheck
                        size={20}
                        className="sm:w-6 sm:h-6 text-brand-action stroke-3"
                      />
                    </div>
                    <p className="text-sm sm:text-base text-neutral-primary-text font-medium">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>

              <div
                ref={buttonResult.ref}
                className={`pt-2 sm:pt-4 ${buttonResult.animationClass}`}
                style={{ transitionDelay: "0.4s" }}
              >
                <Button
                  asChild
                  className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full w-full sm:w-auto sm:min-w-[12rem] lg:w-48 px-6 sm:px-8 py-5 sm:py-6 font-semibold text-sm sm:text-base"
                >
                  <Link
                    href="/dashboard/earn"
                    className="flex items-center justify-center gap-2"
                  >
                    Start Earning
                    <ArrowUpRight
                      size={16}
                      className="sm:w-4.5 sm:h-4.5"
                    />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

TurnPassionIntoProfit.displayName = "TurnPassionIntoProfit";

export default TurnPassionIntoProfit;
