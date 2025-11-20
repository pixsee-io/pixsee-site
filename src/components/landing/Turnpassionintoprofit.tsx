"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CircleCheck, ArrowUpRight } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import Image from "next/image";

type Props = {};

const TurnPassionIntoProfit = (props: Props) => {
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
    <section className="relative w-full max-h-screen flex justify-center bg-foundation-alternate py-20 px-4">
      <div className="max-w-[90rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            ref={imageResult.ref}
            className={`relative order-2 lg:order-1 ${imageResult.animationClass}`}
            style={{ transitionDelay: "0.4s" }}
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden">
              <Image
                src="/images/phone-mockup.png"
                alt="Phone Mockup"
                width={400}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          <div className="space-y-8 order-1 lg:order-2">
            <div
              ref={badgeResult.ref}
              className={`w-fit ${badgeResult.animationClass}`}
              style={{ transitionDelay: "0s" }}
            >
              <div className="px-4 py-2 rounded-full text-brand-action text-sm font-semibold bg-brand-primary-light">
                For fans
              </div>
            </div>

            <div
              ref={titleResult.ref}
              className={`${titleResult.animationClass}`}
              style={{ transitionDelay: "0.1s" }}
            >
              <h2 className="text-xl lg:text-2xl text-neutral-primary-text">
                Turn Passion Into Profit
              </h2>
            </div>

            <div
              ref={descriptionResult.ref}
              className={`${descriptionResult.animationClass}`}
              style={{ transitionDelay: "0.2s" }}
            >
              <p className="max-w-xl text-sm lg:text-base text-neutral-secondary-text leading-relaxed">
                Your engagement matters. Watch, vote, trade, and earn $PIX
                tokens for every interaction.
              </p>
            </div>

            <div
              ref={featuresResult.ref}
              className={`space-y-4 ${featuresResult.animationClass}`}
              style={{ transitionDelay: "0.3s" }}
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CircleCheck
                      size={24}
                      className="text-brand-action stroke-[3]"
                    />
                  </div>
                  <p className="text-neutral-primary-text font-medium text-base">
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            <div
              ref={buttonResult.ref}
              className={`pt-4 ${buttonResult.animationClass}`}
              style={{ transitionDelay: "0.4s" }}
            >
              <Button
                asChild
                className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full lg:w-48 px-8 py-6 font-semibold text-base"
              >
                <Link href="/start-earning" className="flex items-center gap-2">
                  Start Earning
                  <ArrowUpRight size={18} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TurnPassionIntoProfit;
