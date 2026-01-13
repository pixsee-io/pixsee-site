'use client';

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
import React from "react";

type Props = {};

const Page = (props: Props) => {
  return (
    <div className="">
      <Hero />

      <WhyPixsee />

      <HowPixseeWorks />

      <DiscoverNewShows />

      <PixseeEconomy />

      <TurnPassionIntoProfit />

      <OwnYourContent />

      {/* <Spotlight /> */}

      <Community />

      <Faq/>

      {/* <Testimonials /> */}

      <ReadyToCTA />
    </div>
  );
};

export default Page;

export const dynamic = 'force-dynamic'