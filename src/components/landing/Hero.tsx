"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, TrendingUp } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";

type Props = {};

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
      <section className="relative min-h-screen flex items-center bg-foundation-primary overflow-hidden pb-10">
        <div className="absolute -top-70 left-0 -right-160 h-125 pointer-events-none ">
          <Image
            src="/images/cloud.png"
            alt=""
            fill
            className="object-cover max-w-4xl mx-auto object-top opacity-90 "
            priority
          />
        </div>

        <div className="w-full max-w-360 mx-auto px-4 flex flex-col lg:flex-row gap-9 md:gap-0 justify-between items-center">
          <div className="w-full space-y-8 md:max-w-3xl">
            <div
              ref={headingResult.ref}
              className={`relative mt-9 md:mt-20 xl:mt-0 space-y-4 ${headingResult.animationClass}`}
              style={{ transitionDelay: "0s" }}
            >
              <h1 className="max-w-xl text-4xl text-center md:text-start lg:text-[85px] font-paytone text-brand-pixsee-secondary">
                Be Your Own Box Office
              </h1>

              <div
                ref={iconResult.ref}
                className={`absolute -top-20 right-18 w-27.5 h-27.5 z-20 hidden lg:block ${iconResult.animationClass}`}
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
              className={`w-full space-y-6 ${descriptionResult.animationClass}`}
              style={{ transitionDelay: "0.2s" }}
            >
              <p className="text-sm lg:text-2xl text-center md:text-start text-neutral-primary-text leading-relaxed">
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
              className={`flex flex-col md:flex-row gap-4 pt-4 ${buttonsResult.animationClass}`}
              style={{ transitionDelay: "0.4s" }}
            >
              <Button
                asChild
                className="rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white text-sm px-5 md:px-8 py-5 md:py-6 font-semibold md:text-base flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <Link href="/explore-shows">
                  <Globe size={20} />
                  Explore Shows
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-full px-5 md:px-8 py-5 md:py-6 font-semibold text-sm md:text-base flex items-center gap-2 border-2 border-neutral-primary-text hover:bg-neutral-secondary transition-all duration-200"
              >
                <Link href="/begin-trading">
                  <TrendingUp size={20} />
                  Begin Trading
                </Link>
              </Button>
            </div>
          </div>

          <div
            ref={phoneResult.ref}
            className={`w-full md:max-w-3xl relative flex justify-center items-center ${phoneResult.animationClass}`}
            style={{ transitionDelay: "0.3s" }}
          >
            <div className="relative w-full ">
              <Image
                src="/images/landing-img.png"
                alt="Pixsee App"
                width={705}
                height={869}
                className="w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={featuresResult.ref}
        className={`w-full bg-[#7C369B]/90 py-8 px-4 ${featuresResult.animationClass}`}
        style={{ transitionDelay: "0s" }}
      >
        <div className="max-w-[90rem] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`border-l-4 ${feature.borderColor} pl-4 py-4 lg:py-0`}
              >
                <h3 className="text-white font-bold font-inter text-sm lg:text-lg">
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
