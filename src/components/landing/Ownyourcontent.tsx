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
    <section className="relative w-full max-h-screen bg-foundation-primary py-20 px-4 flex justify-center items-center overflow-hidden">
      <div className="max-w-[90rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 order-1">
            <div
              ref={badgeResult.ref}
              className={`w-fit ${badgeResult.animationClass}`}
              style={{ transitionDelay: "0s" }}
            >
              <div className="px-4 py-2 rounded-full text-brand-action text-sm font-semibold bg-brand-primary-light">
                $PIX Token
              </div>
            </div>

            <div
              ref={titleResult.ref}
              className={`${titleResult.animationClass}`}
              style={{ transitionDelay: "0.1s" }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-primary-text">
                Own Your Content, Keep Your Revenue
              </h2>
            </div>

            <div
              ref={descriptionResult.ref}
              className={`${descriptionResult.animationClass}`}
              style={{ transitionDelay: "0.2s" }}
            >
              <p className="max-w-xl text-base lg:text-lg text-neutral-secondary-text leading-relaxed">
                Upload your shows, set your terms, and earn directly from your
                audience. No middlemen, no hidden fees.
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
                className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-8 py-6 font-semibold text-base"
              >
                <Link href="/start-earning" className="flex items-center gap-2">
                  Start Earning XP
                  <ArrowUpRight size={18} />
                </Link>
              </Button>
            </div>
          </div>

          <div
            ref={imageResult.ref}
            className={`mt-[40rem] relative order-2 lg:order-2 ${imageResult.animationClass}`}
            style={{ transitionDelay: "0.4s" }}
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden">
              <Image
                src="/images/hand_holding_phone.png"
                alt="Phone Mockup with Hand"
                width={500}
                height={600}
                className="w-full h-auto"
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
