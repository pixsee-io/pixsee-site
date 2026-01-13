"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Zap,
  TrendingUp,
  CircleCheck,
  ArrowUpRight,
  PlayCircle,
} from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import Image from "next/image";

type Props = {};

interface TabContent {
  id: string;
  label: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  cta: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  imageSrc: string;
  imageAlt: string;
  badge: string;
  badgeColor: string;
}

const PixseeEconomy = (props: Props) => {
  const [activeTab, setActiveTab] = useState("creators");

  const headerResult = useScrollAnimation({ animationType: "fade-up" });
  const titleResult = useScrollAnimation({ animationType: "fade-up" });
  const descriptionResult = useScrollAnimation({ animationType: "fade-up" });
  const tabsResult = useScrollAnimation({ animationType: "fade-up" });
  const contentResult = useScrollAnimation({ animationType: "fade-up" });

  const tabs: TabContent[] = [
    {
      id: "creators",
      label: "For Creators",
      icon: <PlayCircle size={20} />,
      title: "Own Your Content, Keep Your Revenue",
      description:
        "Upload your shows, set your terms, and earn directly from your audience. No middlemen, no hidden fees.",
      features: [
        "Build a loyal fanbase by sharing revenue",
        "Unlock exclusive creator tools and analytics",
        "Earn $PIX from views, votes, and engagement",
        "90% of Tix sales go directly to creators",
      ],
      cta: {
        text: "Launch Show",
        href: "/launch-show",
        icon: <ArrowUpRight size={18} />,
      },
      imageSrc: "/images/attention-economy.png",
      imageAlt: "Creator",
      badge: "For Creators",
      badgeColor: "bg-brand-primary-light",
    },
    {
      id: "fans",
      label: "For Fans",
      icon: <TrendingUp size={20} />,
      title: "Watch, Vote, Earn — Your Voice Matters",
      description:
        "Discover exclusive content, support creators you love, and earn rewards for your engagement.",
      features: [
        "Earn $PIX by watching and voting",
        "Own collectible episode tickets",
        "Trade tickets on the secondary market",
        "Shape what gets greenlit next",
      ],
      cta: {
        text: "Start Watching",
        href: "/explore-shows",
      },
      imageSrc: "/images/attention_economy.png",
      imageAlt: "Fan",
      badge: "For Fans",
      badgeColor: "bg-brand-primary-light",
    },
    {
      id: "token",
      label: "$PIX Token",
      icon: <TrendingUp size={20} />,
      title: "The Currency of Entertainment",
      description:
        "Earn, trade, and spend $PIX across the Pixsee ecosystem. Your token, your power.",
      features: [
        "Earn $PIX through platform activities",
        "Trade episode tickets with other fans",
        "Unlock exclusive perks and early access",
        "Participate in governance decisions",
      ],
      cta: {
        text: "Learn More",
        href: "/pix-token",
      },
      imageSrc: "/images/attention_economy.png",
      imageAlt: "PIX Token",
      badge: "$PIX Token",
      badgeColor: "bg-brand-primary-light",
    },
  ];

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <section className="relative w-full bg-foundation-primary py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-[90rem] mx-auto">
        <div
          ref={headerResult.ref}
          className={`flex justify-center mb-6 sm:mb-8 ${headerResult.animationClass}`}
          style={{ transitionDelay: "0s" }}
        >
          <Button
            variant="outline"
            className="rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base border-neutral-tertiary-border hover:border-neutral-secondary-border"
            asChild
          >
            <Link href="/featured-show" className="flex items-center gap-2">
              Featured show
              <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>

        <div
          ref={titleResult.ref}
          className={`text-center mb-4 sm:mb-6 ${titleResult.animationClass}`}
          style={{ transitionDelay: "0.1s" }}
        >
          <h2 className="max-w-4xl mx-auto text-3xl sm:text-4xl md:text-5xl lg:text-[55px] font-bold text-neutral-primary-text px-4">
            The <span className="text-brand-action">Pixsee </span> Attention
            Economy
          </h2>
        </div>

        <div
          ref={descriptionResult.ref}
          className={`text-center mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto ${descriptionResult.animationClass}`}
          style={{ transitionDelay: "0.2s" }}
        >
          <p className="text-base sm:text-lg md:text-xl text-neutral-secondary-text leading-relaxed px-4">
            A shared ecosystem where creators, fans, and traders earn together.
          </p>
        </div>

        <div
          ref={tabsResult.ref}
          className={`flex justify-center mb-10 sm:mb-12 md:mb-16 overflow-x-auto ${tabsResult.animationClass}`}
          style={{ transitionDelay: "0.3s" }}
        >
          <div className="flex gap-1 sm:gap-2 border rounded-full p-1.5 sm:p-2 w-fit border-neutral-tertiary-border min-w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-brand-pixsee-secondary/70 bg-brand-primary-light shadow-lg"
                    : "text-neutral-primary-text hover:bg-neutral-tertiary"
                }`}
              >
                <span className="hidden sm:inline">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={contentResult.ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center ${contentResult.animationClass}`}
          style={{ transitionDelay: "0.4s" }}
        >
          <div className="space-y-6 sm:space-y-7 md:space-y-8 order-2 lg:order-1">
            <div
              className={`w-fit flex gap-2 items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-brand-pixsee-secondary/70 text-xs sm:text-sm font-semibold ${currentTab.badgeColor}`}
            >
              <PlayCircle size={14} className="sm:w-4 sm:h-4" />
              {currentTab.badge}
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-primary-text mb-3 sm:mb-4">
                {currentTab.title}
              </h3>
              <p className="text-base sm:text-lg text-neutral-secondary-text leading-relaxed">
                {currentTab.description}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {currentTab.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4">
                  <div className="shrink-0 mt-0.5 sm:mt-1">
                    <CircleCheck
                      size={20}
                      className="sm:w-6 sm:h-6 text-brand-pixsee-secondary/70 stroke-3"
                    />
                  </div>
                  <p className="text-sm sm:text-base text-neutral-primary-text font-medium">
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <Button
                asChild
                className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full w-full sm:w-auto sm:min-w-[12rem] lg:w-48 px-6 sm:px-8 py-5 sm:py-6 font-semibold text-sm sm:text-base"
              >
                <Link
                  href={currentTab.cta.href}
                  className="flex items-center justify-center gap-2"
                >
                  {currentTab.cta.text}
                  {currentTab.cta.icon || <ArrowUpRight size={18} />}
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative h-64 sm:h-80 md:h-96 lg:h-full lg:min-h-96 order-1 lg:order-2">
            <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-brand-action/10 to-brand-action/10">
              <Image
                src={currentTab.imageSrc}
                alt={currentTab.imageAlt}
                fill
                className="object-cover"
                priority
              />

              <div className="absolute bottom-4 sm:bottom-8 md:bottom-12 left-4 sm:left-6 md:left-8 bg-brand-action text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold shadow-lg">
                {currentTab.id === "creators"
                  ? "Keep your Revenue"
                  : currentTab.id === "fans"
                  ? "Earn Rewards"
                  : "Trade & Earn"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PixseeEconomy;
