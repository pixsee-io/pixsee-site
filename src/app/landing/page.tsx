import Hero from "@/components/landing/Hero";
import WhyPixsee from "@/components/landing/WhyPixsee";
import React from "react";

type Props = {};

const Page = (props: Props) => {
  return (
    <div>
      <Hero />

      <WhyPixsee />
    </div>
  );
};

export default Page;
