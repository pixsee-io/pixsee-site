"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Eye, TrendingUp } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import ShowCard from "./ShowCard";
import Image from "next/image";

type Props = {};

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const HowPixseeWorks = (props: Props) => {
  const [activeStep, setActiveStep] = useState(1);

  const headerResult = useScrollAnimation({ animationType: "fade-up" });
  const titleResult = useScrollAnimation({ animationType: "fade-up" });
  const stepsResult = useScrollAnimation({ animationType: "fade-left" });
  const mockupResult = useScrollAnimation({ animationType: "fade-right" });

  const steps: Step[] = [
    {
      number: 1,
      title: "Create",
      description:
        "Discover exclusive indie shows and unlock content with $PIX.",
      icon: <TrendingUp size={24} />,
      color: "from-blue-400 to-blue-500",
    },
    {
      number: 2,
      title: "Watch",
      description: "Use your engagement to influence what rises on the charts.",
      icon: <Eye size={24} />,
      color: "from-purple-400 to-purple-500",
    },
    {
      number: 3,
      title: "Earn",
      description:
        "Own collectible tickets, trade them, and earn from the shows you back.",
      icon: <Heart size={24} />,
      color: "from-pink-400 to-pink-500",
    },
  ];

  return (
    <section className="relative w-full bg-brand-pixsee-secondary pt-12 sm:pt-16 md:pt-20 px-4 sm:px-6 md:px-8 pb-12 sm:pb-16 md:pb-20 xl:pb-0">
      <div className="max-w-[90rem] mx-auto">
        <div
          ref={headerResult.ref}
          className={`mb-6 sm:mb-8 ${headerResult.animationClass}`}
          style={{ transitionDelay: "0s" }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[55px] font-bold text-white">
            How Pixsee Works
          </h2>
        </div>

        <div
          ref={titleResult.ref}
          className={`mb-10 sm:mb-12 md:mb-16 max-w-2xl ${titleResult.animationClass}`}
          style={{ transitionDelay: "0.1s" }}
        >
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 leading-relaxed">
            Watch, vote, and trade — every action you take fuels creators,
            rewards fans, and shapes the next hit show.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 sm:gap-10 md:gap-12 justify-between items-start">
          <div
            ref={stepsResult.ref}
            className={`space-y-4 sm:space-y-5 md:space-y-6 w-full lg:w-auto ${stepsResult.animationClass}`}
            style={{ transitionDelay: "0.2s" }}
          >
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative flex items-center gap-3 sm:gap-4 md:gap-6 text-neutral-primary-text"
              >
                {index !== steps.length - 1 && (
                  <div className="absolute hidden md:block left-5 sm:left-6 top-16 sm:top-20 w-0.5 sm:w-1 h-20 sm:h-28 md:h-32 border-l-2 sm:border-l-3 border-dashed border-white/40"></div>
                )}

                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-foundation-primary flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold border-3 sm:border-4 border-white shadow-lg">
                    {step.number}
                  </div>
                </div>

                <div
                  className="flex-1 bg-foundation-primary rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 sm:border-l-5 border-l-brand-primary cursor-pointer"
                  onMouseEnter={() => setActiveStep(step.number)}
                  onTouchStart={() => setActiveStep(step.number)}
                >
                  <p className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">{step.title}</p>
                  <p className="text-sm sm:text-base ">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            ref={mockupResult.ref}
            className={`relative w-full lg:w-auto flex justify-center lg:justify-start ${mockupResult.animationClass}`}
            style={{ transitionDelay: "0.3s" }}
          >
            <Image
              src={"/images/HowPixseeWorksImg.png"}
              alt="How Pixsee Works"
              width={500}
              height={500}
              className="w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowPixseeWorks;