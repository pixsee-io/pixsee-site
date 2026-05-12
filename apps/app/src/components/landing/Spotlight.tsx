"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Play } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import Image from "next/image";

type Props = {};

interface MetricCard {
  label: string;
  value: string;
  valueColor: string;
}

const Spotlight = (props: Props) => {
  const headerResult = useScrollAnimation({ animationType: "fade-up" });
  const titleResult = useScrollAnimation({ animationType: "fade-up" });
  const descriptionResult = useScrollAnimation({ animationType: "fade-up" });
  const metricsResult = useScrollAnimation({ animationType: "fade-up" });
  const imageResult = useScrollAnimation({ animationType: "fade-left" });

  const metrics: MetricCard[] = [
    {
      label: "Current Tix price",
      value: "$0.015/min",
      valueColor: "text-semantic-success-primary",
    },
    {
      label: "Curator APR",
      value: "24.5%",
      valueColor: "text-brand-action",
    },
    {
      label: "Episodes",
      value: "8",
      valueColor: "text-brand-pixsee-secondary",
    },
    {
      label: "Total min watched",
      value: "3.1M",
      valueColor: "text-semantic-error-primary",
    },
  ];

  return (
    <section className="relative w-full bg-brand-action py-20 px-4">
      <div className="max-w-[90rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            ref={imageResult.ref}
            className={`relative order-2 lg:order-1 ${imageResult.animationClass}`}
            style={{ transitionDelay: "0.4s" }}
          >
            <div className="relative w-[43rem] h-[38rem] rounded-3xl overflow-hidden bg-black">
              <Image
                src="/images/frame.png"
                alt="Quantum Dreams Genesis"
                fill
                className="object-cover"
                priority
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 hover:bg-black/10 transition-all">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer mb-4">
                  <Play
                    size={28}
                    className="fill-brand-action text-brand-action ml-1"
                  />
                </div>
                <p className="text-white font-semibold text-lg">Watch Now</p>
              </div>
            </div>
          </div>

          <div className="space-y-8 order-1 lg:order-2">
            <div
              ref={headerResult.ref}
              className={`w-fit ${headerResult.animationClass}`}
              style={{ transitionDelay: "0s" }}
            >
              <Button
                variant="outline"
                className="rounded-full px-6 py-2 border-white text-white hover:bg-foundation-primary/10 bg-foundation-primary/10"
                asChild
              >
                <Link href="/spotlight" className="flex items-center gap-2">
                  Spotlight
                  <ArrowUpRight size={16} />
                </Link>
              </Button>
            </div>

            <div
              ref={titleResult.ref}
              className={`${titleResult.animationClass}`}
              style={{ transitionDelay: "0.1s" }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                Quantum Dreams: Genesis
              </h2>
            </div>

            <div
              ref={descriptionResult.ref}
              className={`${descriptionResult.animationClass}`}
              style={{ transitionDelay: "0.2s" }}
            >
              <p className="max-w-2xl text-base lg:text-lg text-white/90 leading-relaxed">
                A mind-bending journey through parallel realities. Join the
                creator as they explore the boundaries between consciousness and
                digital existence in this exclusive 8-episode series.
              </p>
            </div>

            <div
              ref={metricsResult.ref}
              className={`grid grid-cols-2 gap-4 ${metricsResult.animationClass}`}
              style={{ transitionDelay: "0.3s" }}
            >
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="bg-foundation-primary rounded-2xl p-6 shadow-lg"
                >
                  <p className="text-neutral-secondary-text text-sm font-medium mb-2">
                    {metric.label}
                  </p>
                  <p
                    className={`text-2xl lg:text-3xl font-bold ${metric.valueColor}`}
                  >
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Spotlight;
