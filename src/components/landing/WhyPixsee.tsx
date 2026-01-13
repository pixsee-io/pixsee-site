"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import Image from "next/image";

type Props = {};

interface Feature {
  icon: string; 
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  iconBg: string;
}

const WhyPixsee = (props: Props) => {
  const headerResult = useScrollAnimation({ animationType: "fade-up" });
  const titleResult = useScrollAnimation({ animationType: "fade-up" });
  const descriptionResult = useScrollAnimation({ animationType: "fade-up" });
  const cardsResult = useScrollAnimation({ animationType: "fade-up" });

  const features: Feature[] = [
    {
      icon: "/icons/outline_video.svg",
      title: "Creator Freedom",
      description: "Launch projects without gatekeepers or distributors.",
      buttonText: "Launch",
      buttonHref: "/launch",
      iconBg: "bg-[#BDE1FF]",
    },
    {
        icon: "/icons/outline_video.svg",
      title: "Earn As You Engage",
      description: "Watch, vote, and trade to earn $PIX tokens.",
      buttonText: "Watch & Earn",
      buttonHref: "/watch-earn",
      iconBg: "bg-[#E5C4FF]",
    },
    {
        icon: "/icons/outline_video.svg",
      title: "Community First",
      description: "The audience decides what trends, not algorithms.",
      buttonText: "Join Community",
      buttonHref: "/community",
      iconBg: "bg-[#FFD5E9]",
    },
  ];

  return (
    <section className="relative w-full bg-foundation-primary py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div
          ref={headerResult.ref}
          className={`flex justify-center mb-8 ${headerResult.animationClass}`}
          style={{ transitionDelay: "0s" }}
        >
          <Button
            variant="outline"
            className="flex items-center gap-2 text-xs md:text-base rounded-full px-6 py-2 border-neutral-tertiary-border hover:border-neutral-secondary-border"
            asChild
          >
            <Link href="/about-us">
              Why Pixsee
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>

        <div
          ref={titleResult.ref}
          className={`text-center mb-6 ${titleResult.animationClass}`}
          style={{ transitionDelay: "0.1s" }}
        >
          <h2 className="max-w-2xl mx-auto text-3xl md:text-4xl lg:text-[55px] font-bold text-neutral-secondary-text">
            Rewriting the Rules of{" "}
            <span className="text-brand-pixsee-secondary">Streaming</span>
          </h2>
        </div>

        <div
          ref={descriptionResult.ref}
          className={`text-center mb-16 max-w-3xl mx-auto ${descriptionResult.animationClass}`}
          style={{ transitionDelay: "0.2s" }}
        >
          <p className="text-sm md:text-lg lg:text-2xl text-neutral-secondary-text leading-relaxed">
            The entertainment industry is evolving. Pixsee gives creators full
            control, fans real rewards, and both a stake in success.
          </p>
        </div>

        <div
          ref={cardsResult.ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-9 ${cardsResult.animationClass}`}
          style={{ transitionDelay: "0.3s" }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-neutral-secondary rounded-xl rounded-tr-4xl border-2 border-muted p-8 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className={`${feature.iconBg} w-fit p-2 rounded-lg flex items-center justify-center mb-6 text-3xl`}>
                <Image src={feature.icon} alt={feature.icon} width={24} height={24} />
              </div>

              <h3 className="text-xl text-neutral-secondary-text mb-3">
                {feature.title}
              </h3>
              <p className="text-neutral-secondary-text mb-6">
                {feature.description}
              </p>

              <Button
                variant="outline"
                className="rounded-full px-6 py-2 border-neutral-tertiary-border hover:border-neutral-primary-border hover:text-neutral-secondary-text"
                asChild
              >
                <Link href={feature.buttonHref} className="flex items-center gap-2">
                  {feature.buttonText}
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyPixsee;