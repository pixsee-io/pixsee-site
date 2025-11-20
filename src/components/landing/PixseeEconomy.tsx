"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, CircleCheck, ArrowUpRight } from "lucide-react";
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
      icon: <Zap size={20} />,
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
      imageSrc: "/images/attention_economy.png",
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
    <section className="relative w-full bg-foundation-primary py-20 px-4">
      <div className="max-w-[90rem] mx-auto">
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
              <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>

        <div
          ref={titleResult.ref}
          className={`text-center mb-6 ${titleResult.animationClass}`}
          style={{ transitionDelay: "0.1s" }}
        >
          <h2 className="max-w-4xl mx-auto text-4xl lg:text-[55px] font-bold text-neutral-primary-text">
            The <span className="text-brand-action">Pixsee </span> Economy
          </h2>
        </div>

        <div
          ref={descriptionResult.ref}
          className={`text-center mb-12 max-w-2xl mx-auto ${descriptionResult.animationClass}`}
          style={{ transitionDelay: "0.2s" }}
        >
          <p className="text-lg lg:text-xl text-neutral-secondary-text leading-relaxed">
            A shared ecosystem where creators, fans, and traders earn together.
          </p>
        </div>

        <div
          ref={tabsResult.ref}
          className={`flex justify-center mb-16 ${tabsResult.animationClass}`}
          style={{ transitionDelay: "0.3s" }}
        >
          <div className="flex gap-2 border rounded-full p-2 w-fit border-neutral-tertiary-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-brand-action bg-brand-primary-light shadow-lg"
                    : "text-neutral-primary-text hover:bg-neutral-tertiary"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={contentResult.ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${contentResult.animationClass}`}
          style={{ transitionDelay: "0.4s" }}
        >
          <div className="space-y-8">
            <div
              className={`w-fit px-4 py-2 rounded-full text-brand-action text-sm font-semibold ${currentTab.badgeColor}`}
            >
              {currentTab.badge}
            </div>

            <div>
              <h3 className="text-3xl lg:text-4xl font-bold text-neutral-primary-text mb-4">
                {currentTab.title}
              </h3>
              <p className="text-lg text-neutral-secondary-text leading-relaxed">
                {currentTab.description}
              </p>
            </div>

            <div className="space-y-4">
              {currentTab.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CircleCheck
                      size={24}
                      className="text-brand-action stroke-[3]"
                    />
                  </div>
                  <p className="text-neutral-primary-text font-medium">
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <Button
                asChild
                className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full lg:w-48 px-8 py-6 font-semibold text-base"
              >
                <Link
                  href={currentTab.cta.href}
                  className="flex items-center gap-2"
                >
                  {currentTab.cta.text}
                  {currentTab.cta.icon || <ArrowUpRight size={18} />}
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative h-full min-h-96">
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-brand-action/10 to-brand-action/10">
              <Image
                src={currentTab.imageSrc}
                alt={currentTab.imageAlt}
                fill
                className="object-cover"
                priority
              />

              <div className="absolute bottom-12 left-8 bg-brand-action text-white px-6 py-3 rounded-full font-semibold shadow-lg">
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
