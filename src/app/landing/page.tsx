"use client";

import Community from "@/components/landing/Community";
import DiscoverNewShows from "@/components/landing/DiscoverNewShows";
import Hero from "@/components/landing/Hero";
import HowPixseeWorks from "@/components/landing/HowPixseeWorks";
import OwnYourContent from "@/components/landing/Ownyourcontent";
import PixseeEconomy from "@/components/landing/PixseeEconomy";
import ReadyToCTA from "@/components/landing/Readytocta";
import TurnPassionIntoProfit from "@/components/landing/Turnpassionintoprofit";
import WhyPixsee from "@/components/landing/WhyPixsee";
import Faq from "@/components/layout/Faq";
import React, { useRef } from "react";

type Props = {};

const Page = (props: Props) => {
  const turnPassionRef = useRef<HTMLElement | null>(null);
  const ownContentRef = useRef<HTMLElement | null>(null);

  return (
    <div className="">
      <Hero />

      <WhyPixsee />

      <HowPixseeWorks />

      <DiscoverNewShows />

      <PixseeEconomy
        turnPassionRef={turnPassionRef}
        ownContentRef={ownContentRef}
      />

      <TurnPassionIntoProfit ref={turnPassionRef} />

      <OwnYourContent ref={ownContentRef} />

      <Community />

      <Faq />

      <ReadyToCTA />
    </div>
  );
};

export default Page;