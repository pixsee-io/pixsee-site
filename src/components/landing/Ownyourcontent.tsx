"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CircleCheck, ArrowUpRight } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import Image from "next/image";

type Props = {};

const OwnYourContent = (props: Props) => {
  const badgeResult = useScrollAnimation({ animationType: "fade-up" });
  const titleResult = useScrollAnimation({ animationType: "fade-up" });
  const descriptionResult = useScrollAnimation({ animationType: "fade-up" });
  const featuresResult = useScrollAnimation({ animationType: "fade-up" });
  const buttonResult = useScrollAnimation({ animationType: "fade-up" });
  const imageResult = useScrollAnimation({ animationType: "fade-right" });

  const features = [
    "Token is used to vote, boosting and sharing in the marketplace fees",
    "PIX token are earned through watching, trading creating quest",
    "Unlock exclusive creator tools and analytics",
    "Earn $PIX from views, votes, and engagement",
  ];

  return (
    <section className="relative w-full bg-foundation-primary py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 xl:pb-0 flex justify-center items-center">
      <div className="max-w-[90rem] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          <div className="space-y-5 sm:space-y-6 md:space-y-8 order-2 lg:order-1">
            <div
              ref={badgeResult.ref}
              className={`w-fit ${badgeResult.animationClass}`}
              style={{ transitionDelay: "0s" }}
            >
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-brand-action text-xs sm:text-sm font-semibold bg-brand-primary-light">
                $PIX Token
              </div>
            </div>

            <div
              ref={titleResult.ref}
              className={`${titleResult.animationClass}`}
              style={{ transitionDelay: "0.1s" }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[55px] font-bold text-neutral-primary-text">
                Own Your Content, Keep Your Revenue
              </h2>
            </div>

            <div
              ref={descriptionResult.ref}
              className={`${descriptionResult.animationClass}`}
              style={{ transitionDelay: "0.2s" }}
            >
              <p className="max-w-xl text-base sm:text-lg md:text-xl text-neutral-secondary-text leading-relaxed">
                Upload your shows, set your terms, and earn directly from your
                audience. No middlemen, no hidden fees.
              </p>
            </div>

            <div
              ref={featuresResult.ref}
              className={`space-y-3 sm:space-y-4 ${featuresResult.animationClass}`}
              style={{ transitionDelay: "0.3s" }}
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                    <CircleCheck
                      size={20}
                      className="sm:w-6 sm:h-6 text-brand-action stroke-[3]"
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
                className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full w-full sm:w-auto sm:min-w-[12rem] px-6 sm:px-8 py-5 sm:py-6 font-semibold text-sm sm:text-base"
              >
                <Link
                  href="/start-earning"
                  className="flex items-center justify-center gap-2"
                >
                  Start Earning XP
                  <ArrowUpRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </Link>
              </Button>
            </div>
          </div>

          <div
            ref={imageResult.ref}
            className={`relative w-full order-1 lg:order-2 ${imageResult.animationClass}`}
            style={{ transitionDelay: "0.4s" }}
          >
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-auto rounded-2xl sm:rounded-3xl overflow-hidden">
              <Image
                src="/images/monetize_img.png"
                alt="Phone Mockup with Hand"
                width={500}
                height={600}
                className="w-full h-full lg:min-h-[35rem] xl:min-h-[35rem] object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnYourContent;
