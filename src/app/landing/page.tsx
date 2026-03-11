<<<<<<< HEAD
'use client';
=======
"use client";
>>>>>>> fork/main

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
<<<<<<< HEAD
import React from "react";
=======
import React, { useRef } from "react";
>>>>>>> fork/main

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

<<<<<<< HEAD
      <OwnYourContent />

      {/* <Spotlight /> */}

      <Community />

      <Faq/>

      {/* <Testimonials /> */}
=======
      <OwnYourContent ref={ownContentRef} />

      <Community />

      <Faq />
>>>>>>> fork/main

      <ReadyToCTA />
    </div>
  );
};

<<<<<<< HEAD
export default Page;

=======
export default Page;
>>>>>>> fork/main
