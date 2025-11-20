"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Eye, TrendingUp } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import ShowCard from "./ShowCard";

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
    <section className="relative w-full bg-brand-pixsee-secondary py-20 px-4">
      <div className="max-w-[90rem] mx-auto">
        <div
          ref={headerResult.ref}
          className={`mb-8 ${headerResult.animationClass}`}
          style={{ transitionDelay: "0s" }}
        >
          <h2 className="text-4xl lg:text-[55px] font-bold text-white">
            How Pixsee Works
          </h2>
        </div>

        <div
          ref={titleResult.ref}
          className={`mb-16 max-w-2xl ${titleResult.animationClass}`}
          style={{ transitionDelay: "0.1s" }}
        >
          <p className="text-lg lg:text-2xl text-blue-100 leading-relaxed">
            Watch, vote, and trade — every action you take fuels creators,
            rewards fans, and shapes the next hit show.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-28 items-start ">
          <div
            ref={stepsResult.ref}
            className={`space-y-6 ${stepsResult.animationClass}`}
            style={{ transitionDelay: "0.2s" }}
          >
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative flex items-center gap-6 text-neutral-primary-text"
              >
                {index !== steps.length - 1 && (
                  <div className="absolute left-6 top-20 w-1 h-32 border-l-3 border-dashed border-white/40"></div>
                )}

                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-foundation-primary flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                    {step.number}
                  </div>
                </div>

                <div
                  className="flex-1 bg-foundation-primary rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-l-8 border-l-brand-primary cursor-pointer"
                  onMouseEnter={() => setActiveStep(step.number)}
                >
                  <p className="text-2xl font-semibold mb-3">{step.title}</p>
                  <p className=" text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            ref={mockupResult.ref}
            className={`relative ${mockupResult.animationClass}`}
            style={{ transitionDelay: "0.3s" }}
          >
            <ShowCard
              id="how-pixsee-works"
              title="Midnight Chronicles Ep. 1"
              creator="Alex Chen"
              videoSrc="/images/play_video.png"
              views="1.2M"
              likes="1.2M"
              floorPrice="$12.5 PIX"
              isInteractive={true}
              showLabels={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowPixseeWorks;
