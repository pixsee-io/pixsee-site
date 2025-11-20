"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import Image from "next/image";

type Props = {};

interface SocialLink {
  name: string;
  icon: string;
  href: string;
}

const Community = (props: Props) => {
  const section1Result = useScrollAnimation({ animationType: "fade-up" });
  const section2Result = useScrollAnimation({ animationType: "fade-up" });
  const socialsResult = useScrollAnimation({ animationType: "fade-up" });
  const section3Result = useScrollAnimation({ animationType: "fade-up" });
  const betaButtonsResult = useScrollAnimation({ animationType: "fade-up" });

  const socialLinks: SocialLink[] = [
    {
      name: "Memecoin",
      icon: "/images/pix_token.png",
      href: "https://memecoin.com",
    },
    {
      name: "Telegram",
      icon: "/images/p_telegram.png",
      href: "https://telegram.org",
    },
    {
      name: "X(Twitter)",
      icon: "/images/p_twitter.png",
      href: "https://twitter.com",
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

  return (
    <section className="relative w-full bg-foundation-primary py-20 px-4">
      <div className="max-w-[90rem] mx-auto">
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-action via-brand-action to-brand-action"></div>

          <div
            ref={section1Result.ref}
            className={`mb-24 pl-32 ${section1Result.animationClass}`}
            style={{ transitionDelay: "0s" }}
          >
            <div className="absolute left-0 top-0 w-16 h-16 bg-brand-action rounded-full flex items-center justify-center border-4 border-foundation-primary shadow-lg">
              <CheckCircle size={28} className="text-white" />
            </div>

            <div>
              <h3 className="text-3xl lg:text-[55px] text-neutral-primary-text mb-3">
                Join our <span className="text-brand-action">Community</span>
              </h3>
              <p className="text-neutral-secondary-text text-base lg:text-xl mb-8 max-w-2xl">
                Be a part of the Pixsee Attention Economy, a growing network of
                creators and content lovers shaping the next generation of
                storytelling.
              </p>

              <div className="relative">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 ">
                  <div className="bg-black rounded-3xl px-8 py-6 text-center text-white shadow-2xl">
                    <p className="text-5xl font-bold text-brand-action">50k</p>
                    <p className="text-sm uppercase tracking-wider text-neutral-secondary-text mt-1">
                      Active Watchers
                    </p>
                  </div>

                  <div className="flex flex-col space-y-4 ">
                    <div className="rounded-2xl overflow-hidden shadow-2xl ">
                      <Image
                        src="/images/community1.png"
                        alt="Creator"
                        width={280}
                        height={140}
                        className="w-64 lg:w-72 h-auto object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden shadow-2xl   ">
                      <Image
                        src="/images/community2.png"
                        alt="Creator"
                        width={280}
                        height={140}
                        className="w-64 lg:w-72 h-auto object-cover"
                      />
                    </div>
                  </div>

                  <div className="bg-black rounded-3xl px-8 py-6 text-center text-white shadow-2xl">
                    <p className="text-5xl font-bold text-brand-pixsee-secondary">
                      12K+
                    </p>
                    <p className="text-sm uppercase tracking-wider text-neutral-secondary-text mt-1">
                      Creators
                    </p>
                  </div>

                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="/images/community3.png"
                      alt="Creator"
                      width={320}
                      height={380}
                      className="w-72 h-auto object-cover"
                    />
                  </div>

                  <div className="bg-black rounded-3xl px-8 py-6 text-center text-white shadow-2xl">
                    <p className="text-5xl font-bold text-brand-action">
                      300K+
                    </p>
                    <p className="text-sm uppercase tracking-wider text-neutral-secondary-text mt-1">
                      $PIX Traded
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            ref={section2Result.ref}
            className={`mb-24 pl-32 ${section2Result.animationClass}`}
            style={{ transitionDelay: "0.2s" }}
          >
            <div className="absolute left-0 top-0 w-16 h-16 bg-brand-action rounded-full flex items-center justify-center border-4 border-foundation-primary shadow-lg">
              <CheckCircle size={28} className="text-white" />
            </div>

            <div>
              <h3 className="text-3xl lg:text-[55px] text-neutral-primary-text mb-3">
                Ways to{" "}
                <span className="text-brand-pixsee-secondary">join</span> the
                Community
              </h3>
              <p className="text-neutral-secondary-text text-base lg:text-xl mb-8 max-w-2xl">
                Connect, follow, and create with us across your favorite
                platforms.
              </p>

              <div
                ref={socialsResult.ref}
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${socialsResult.animationClass}`}
                style={{ transitionDelay: "0.1s" }}
              >
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="border-2 border-neutral-tertiary-border rounded-2xl p-6 text-center hover:border-brand-action hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-4"
                  >
                    <Image
                      src={social.icon}
                      alt={social.name}
                      width={32}
                      height={32}
                      className="h-16 w-16 object-contain"
                      unoptimized
                    />
                    <span className="font-semibold text-neutral-primary-text text-sm">
                      {social.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div
            ref={section3Result.ref}
            className={`pl-32 ${section3Result.animationClass}`}
            style={{ transitionDelay: "0.4s" }}
          >
            <div className="absolute left-0 top-0 w-16 h-16 bg-brand-action rounded-full flex items-center justify-center border-4 border-foundation-primary shadow-lg">
              <CheckCircle size={28} className="text-white" />
            </div>

            <div>
              <h3 className="text-3xl lg:text-4xl font-bold text-neutral-primary-text mb-3">
                Become a{" "}
                <span className="text-semantic-error-primary">Beta</span> Tester
                🎉
              </h3>
              <p className="text-neutral-secondary-text text-base lg:text-lg mb-8 max-w-2xl">
                Get early access to Pixsee tools and rewards before public
                launch. Early testers earn exclusive NFT badges.
              </p>

              <div
                ref={betaButtonsResult.ref}
                className={`flex flex-col sm:flex-row gap-4 ${betaButtonsResult.animationClass}`}
                style={{ transitionDelay: "0.1s" }}
              >
                <Button
                  asChild
                  className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-8 py-6 font-semibold text-base"
                >
                  <Link
                    href="/beta-testing"
                    className="flex items-center gap-2"
                  >
                    Join Beta Testing 🎉
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="rounded-full px-8 py-6 font-semibold text-base border-2"
                  asChild
                >
                  <Link href="/feedback" className="flex items-center gap-2">
                    Share your Feedback
                    <MessageCircle size={18} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
