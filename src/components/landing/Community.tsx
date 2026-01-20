"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import Image from "next/image";

type TimelineSectionProps = {
  children: React.ReactNode;
  delay?: number;
  pl?: string;
  lineHeight?: string;
};

interface SocialLink {
  name: string;
  icon: string;
  href: string;
}

const Community = () => {
  const socialsResult = useScrollAnimation({ animationType: "fade-up" });

  const socialLinks: SocialLink[] = [
    {
      name: "Pix",
      icon: "/images/pix.png",
      href: "https://pump.fun/coin/7Lafx33QDj3ATpT3gHzUuwukav2CUjGAhKwgZpM2pump",
    },
    {
      name: "Telegram",
      icon: "/images/p_telegram.png",
      href: "https://telegram.org",
    },
    {
      name: "X(Twitter)",
      icon: "/images/p_twitter.png",
      href: "https://x.com/PixseeIO",
    },
    {
      name: "Discord",
      icon: "/images/p_discord.png",
      href: "https://discord.com",
    },
    {
      name: "Tiktok",
      icon: "/images/p_tiktok.png",
      href: "https://tiktok.com",
    },
  ];

  function CommunityGallery() {
    return (
      <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4">
        <ImageFrame
          src="/images/community_1.png"
          className="w-64 hrink-0"
        />

        <div className="hidden lg:flex flex-col gap-2 sm:gap-3 md:gap-4 shrink-0">
          <ImageFrame src="/images/community1.png" className="w-64" />
          <ImageFrame src="/images/community2.png" className="w-64" />
        </div>

        <ImageFrame
          src="/images/community3.png"
          className="w-64 h-auto shrink-0"
        />

        <div className="hidden lg:flex flex-col gap-4 shrink-0">
          <ImageFrame src="/images/community1.png" className="w-64" />
          <ImageFrame src="/images/community2.png" className="w-64" />
        </div>

        <ImageFrame
              src="/images/community_5.png"
          className=" w-64 shrink-0"
        />
      </div>
    );
  }

  function ImageFrame({
    src,
    className = "",
  }: {
    src: string;
    className?: string;
  }) {
    return (
      <div
        className={`max-h-60 sm:max-h-64 md:max-h-70 overflow-hidden shadow-lg sm:shadow-xl md:shadow-2xl rounded-lg ${className}`}
      >
        <Image
          src={src}
          alt="Community moment"
          width={320}
          height={380}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  function TimelineSection({
    children,
    delay = 0,
    pl = "pl-12 sm:pl-16 md:pl-20",
    lineHeight = "h-101.75",
  }: TimelineSectionProps) {
    const { ref, animationClass } = useScrollAnimation({
      animationType: "fade-up",
    });

    return (
      <div
        ref={ref}
        className={`relative mb-12 sm:mb-16 md:mb-20 ${pl} ${animationClass}`}
        style={{ transitionDelay: `${delay}s` }}
      >
        <Image
          src="/images/vertical-line.png"
          alt=""
          width={28}
          height={28}
          className={`hidden md:block absolute left-0 top-3 sm:top-4 md:top-5 w-6 sm:w-8 md:w-10 object-contain ${lineHeight}`}
        />

        {children}
      </div>
    );
  }

  return (
    <section className="relative w-full bg-brand-action py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 community_bg">
      <div className="max-w-360 mx-auto relative">
        <TimelineSection delay={0} pl="pl-0 md:pl-20">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[55px] text-white mb-2 sm:mb-3">
            Join our{" "}
            <span className="text-semantic-error-primary">Community</span>
          </h3>
          <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl">
            Be a part of the Pixsee Attention Economy, a growing network of
            creators and content lovers shaping the next generation of
            storytelling.
          </p>

          <CommunityGallery />
        </TimelineSection>

        <div className="w-full h-px mb-12 sm:mb-16 md:mb-20 bg-semantic-error-primary" />

        <TimelineSection
          delay={0.2}
          pl="pl-0 md:pl-24 lg:pl-32"
          lineHeight="h-60 sm:h-64 md:h-70"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[55px] text-white mb-2 sm:mb-3">
            Ways to <span className="text-semantic-error-primary">join</span>{" "}
            the Community
          </h3>
          <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl">
            Connect, follow, and create with us across your favorite platforms.
          </p>

          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 `}
            style={{ transitionDelay: "0.1s" }}
          >
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="bg-white border-2 border-neutral-tertiary-border rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-center hover:border-brand-action hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4"
              >
                <Image
                  src={social.icon}
                  alt={social.name}
                  width={32}
                  height={32}
                  className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 object-contain"
                  unoptimized
                />
                <span className="font-semibold text-black text-xs sm:text-sm">
                  {social.name}
                </span>
              </Link>
            ))}
          </div>
        </TimelineSection>

        <div className="w-full h-px mb-12 sm:mb-16 md:mb-20 bg-semantic-error-primary" />

        <TimelineSection
          delay={0.4}
          pl="pl-0 md:pl-24 lg:pl-32"
          lineHeight="h-44 sm:h-48 md:h-52"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Become a <span className="text-semantic-error-primary">Beta</span>{" "}
            Tester 🎉
          </h3>

          <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl">
            Get early access to Pixsee tools and rewards before public launch.
            Early testers earn exclusive NFT badges.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4`}
            style={{ transitionDelay: "0.1s" }}
          >
            <Button
              asChild
              className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 font-semibold text-sm sm:text-base"
            >
              <Link
                href="/beta-testing"
                className="flex items-center justify-center gap-2"
              >
                Join Beta Testing 🎉
              </Link>
            </Button>

            <Button
              variant="outline"
              className="rounded-full w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 font-semibold text-sm sm:text-base border-2"
              asChild
            >
              <Link
                href="/feedback"
                className="flex items-center justify-center gap-2"
              >
                Share your Feedback
                <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              </Link>
            </Button>
          </div>
        </TimelineSection>
      </div>
    </section>
  );
};

export default Community;
