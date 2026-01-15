"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, TrendingUp } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import { motion } from "framer-motion";

type Props = {};

type FloatingCardProps = {
  iconSrc: string;
  topText: string;
  bottomText: string;
  delay?: number;
};

function FloatingCard({
  iconSrc,
  topText,
  bottomText,
  delay = 0.6,
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 120,
        damping: 18,
      }}
      whileHover={{
        x: 10,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
        },
      }}
      className="
        w-40 sm:w-48 md:w-56 xl:w-61.25 
        bg-white/90 flex items-center gap-2 sm:gap-3 md:gap-5 
        backdrop-blur-md rounded-xl sm:rounded-2xl 
        p-2 sm:p-2.5 md:p-3 
        shadow-lg
      "
    >
      <Image
        src={iconSrc}
        alt=""
        width={60}
        height={60}
        className="w-10 h-10 sm:w-12 sm:h-12 lg:w-15 lg:h-15"
      />

      <div className="flex flex-col gap-1 sm:gap-1.5 md:gap-2">
        <p className="text-sm md:text-xl xl:text-2xl text-brand-primary  font-bold">{topText}</p>
        <p className="text-sm text-black font-medium">
          {bottomText}
        </p>
      </div>
    </motion.div>
  );
}

const Hero = (props: Props) => {
  const headingResult = useScrollAnimation({ animationType: "fade-up" });
  const descriptionResult = useScrollAnimation({ animationType: "fade-up" });
  const buttonsResult = useScrollAnimation({ animationType: "fade-up" });
  const phoneResult = useScrollAnimation({ animationType: "fade-left" });
  const featuresResult = useScrollAnimation({ animationType: "fade-up" });
  const iconResult = useScrollAnimation({ animationType: "fade-right" });

  const features = [
    {
      title: "Creator-owned box office",
      borderColor: "border-l-blue-400",
    },
    {
      title: "Dynamic Ticket Pricing",
      borderColor: "border-l-red-400",
    },
    {
      title: "Transparent Ad/Revenue Sharing",
      borderColor: "border-l-yellow-400",
    },
    {
      title: "Realtime Watch & Earn Rewards",
      borderColor: "border-l-green-400",
    },
  ];

  return (
    <>
      <section className="relative min-h-screen flex items-center bg-foundation-primary overflow-hidden pb-10 px-4 sm:px-6 md:px-8 landing_hero_bg">
        <div className="w-full max-w-360 mx-auto flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 justify-between items-center">
          <div className="w-full space-y-6 sm:space-y-7 md:space-y-8 lg:max-w-3xl">
            <div
              ref={headingResult.ref}
              className={`relative mt-9 md:mt-20 xl:mt-0 space-y-3 sm:space-y-4 ${headingResult.animationClass}`}
              style={{ transitionDelay: "0s" }}
            >
              <h1 className="max-w-xl text-4xl md:text-5xl text-center md:text-start lg:text-6xl xl:text-7xl 2xl:text-[85px] font-paytone text-brand-pixsee-secondary leading-tight">
                Be Your Own Box Office
              </h1>

              <div
                ref={iconResult.ref}
                className={`absolute -top-16 sm:-top-20 right-4 sm:right-12 md:right-18 w-20 h-20 sm:w-24 sm:h-24 md:w-27.5 md:h-27.5 z-20 hidden lg:block ${iconResult.animationClass}`}
                style={{ transitionDelay: "0.5s" }}
              >
                <Image
                  src="/icons/create_watch_earn.svg"
                  alt="Create Watch Earn"
                  width={170}
                  height={170}
                  className="animate-[spin_20s_linear_infinite]"
                />
              </div>
            </div>

            <div
              ref={descriptionResult.ref}
              className={`w-full space-y-4 sm:space-y-6 ${descriptionResult.animationClass}`}
              style={{ transitionDelay: "0.2s" }}
            >
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center md:text-start text-neutral-primary-text leading-relaxed">
                <span className="font-bold text-brand-pixsee-secondary">
                  Create
                </span>{" "}
                and launch your show on your terms.{" "}
                <span className="font-bold text-brand-pixsee-secondary">
                  Watch
                </span>{" "}
                and pay only for what you watch.{" "}
                <span className="font-bold text-brand-pixsee-secondary">
                  Earn
                </span>{" "}
                by Creating, Watching, Voting and Trading to share in the upside
                of the content you make, watch, and support.
              </p>
            </div>

            <div
              ref={buttonsResult.ref}
              className={`flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 ${buttonsResult.animationClass}`}
              style={{ transitionDelay: "0.4s" }}
            >
              <Button
                asChild
                className="rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white text-sm px-5 md:px-8 py-5 md:py-6 font-semibold md:text-base flex items-center justify-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl w-full sm:w-auto"
              >
                <Link href="/explore-shows">
                  <Globe size={18} className="sm:w-5 sm:h-5" />
                  Explore Shows
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-full px-5 md:px-8 py-5 md:py-6 font-semibold text-sm md:text-base flex items-center justify-center gap-2 border-2 border-neutral-primary-text hover:bg-neutral-secondary transition-all duration-200 w-full sm:w-auto"
              >
                <Link href="/begin-trading">
                  <TrendingUp size={18} className="sm:w-5 sm:h-5" />
                  Begin Trading
                </Link>
              </Button>
            </div>
          </div>

          <div
            ref={phoneResult.ref}
            className={`w-full lg:max-w-2xl xl:max-w-3xl relative flex justify-center items-center ${phoneResult.animationClass}`}
            style={{ transitionDelay: "0.3s" }}
          >
            <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-full">
              <Image
                src="/images/landing_hero.png"
                alt="Pixsee App"
                width={705}
                height={869}
                className="w-full h-auto drop-shadow-2xl"
                priority
              />

              <div className="absolute top-1/4 sm:top-1/3 -right-2 sm:-right-8 lg:-right-6 flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4">
                <FloatingCard
                  iconSrc="/icons/create.svg"
                  topText="Create"
                  bottomText="Launch"
                  delay={0.6}
                />

                <FloatingCard
                  iconSrc="/icons/watch.svg"
                  topText="Watch"
                  bottomText="Vote"
                  delay={0.7}
                />

                <FloatingCard
                  iconSrc="/icons/earnn.svg"
                  topText="Earn"
                  bottomText="240 $PIX"
                  delay={0.8}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={featuresResult.ref}
        className={`w-full bg-brand-primary py-6 sm:py-8 px-4 sm:px-6 md:px-8 ${featuresResult.animationClass}`}
        style={{ transitionDelay: "0s" }}
      >
        <div className="max-w-360 mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-0">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`border-l-4 ${feature.borderColor} pl-3 sm:pl-4 py-3 sm:py-4 lg:py-0`}
              >
                <h3 className="text-white font-bold font-inter text-xs sm:text-sm md:text-base lg:text-lg">
                  {feature.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
