"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import useScrollAnimation from "@/app/hooks/useScrollAnimation";
import Image from "next/image";

type Props = {};

interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  quote: string;
  avatar: string;
}

const Testimonials = (props: Props) => {
  const headerResult = useScrollAnimation({ animationType: "fade-up" });
  const titleResult = useScrollAnimation({ animationType: "fade-up" });
  const descriptionResult = useScrollAnimation({ animationType: "fade-up" });
  const testimonialsResult = useScrollAnimation({ animationType: "fade-up" });

  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Guillermo Rauch",
      title: "CEO",
      company: "Vercel",
      quote:
        "The @mintify team absolutely nailed combining docs search and AI Q&A in a delightful experience.",
      avatar: "/images/Guillermo.png",
    },
    {
      id: "2",
      name: "Vlad Matsiiako",
      title: "Co-founder",
      company: "Infisical",
      quote:
        "This is a must-have if you're building any kind of developer tools. We used other options in the past, which feels outdated in terms of look-n-feel when compared to Mintify. The team helped us set up two different websites and even migrated all the content for us. I can't recommend it enough.",

      avatar: "/images/Guillermo.png",
    },
    {
      id: "3",
      name: "Zeno Rocha",
      title: "CEO",
      company: "Resend",
      quote:
        "Mintify is absolutely amazing! Their team has been such a pleasure to work with, and just look at our docs - they look gorgeous! I definitely think everyone should try Mintify out!",
      avatar: "/images/Guillermo.png",
    },
    {
      id: "4",
      name: "Adam Carrigan",
      title: "Co-founder",
      company: "MindsDB",
      quote:
        "My team loves Mintify! Great product and a super supportive team.",
      avatar: "/images/Guillermo.png",
    },
    {
      id: "5",
      name: "Chun Jiang",
      title: "CEO",
      company: "Monterey AI",
      quote:
        "Absolutely the best. It is freaking easy to set up, and the team has been great to work with!",
      avatar: "/images/Guillermo.png",
    },
    {
      id: "6",
      name: "Charly Poly",
      title: "CEO",
      company: "Defer",
      quote:
        "Why spend a week coding your own documentation (and optimizing it for SEO, design, etc.) while Mintify brings you the best in class documentation in a few minutes? Worked on documentation for years, in unicorns and open source and I'm sold!",
      avatar: "/images/Guillermo.png",
    },
  ];

  return (
    <section className="relative w-full bg-foundation-alternate py-20 px-4">
      <div className="max-w-[90rem] mx-auto">
        <div
          ref={headerResult.ref}
          className={`flex justify-center mb-8 ${headerResult.animationClass}`}
          style={{ transitionDelay: "0s" }}
        >
          <Button
            variant="outline"
            className="rounded-full px-6 py-2 border-neutral-tertiary-border hover:border-neutral-secondary-border"
          >
            <Heart
              size={18}
              className="text-semantic-error-primary mr-2 fill-semantic-error-primary"
            />
            Wall of love
          </Button>
        </div>

        <div
          ref={titleResult.ref}
          className={`text-center mb-4 ${titleResult.animationClass}`}
          style={{ transitionDelay: "0.1s" }}
        >
          <h2 className="max-w-3xl mx-auto text-4xl lg:text-[55px] font-bold text-neutral-primary-text">
            Love from{" "}
            <span className="text-brand-pixsee-secondary">Pixsee</span> users
          </h2>
        </div>

        <div
          ref={descriptionResult.ref}
          className={`text-center mb-16 max-w-2xl mx-auto ${descriptionResult.animationClass}`}
          style={{ transitionDelay: "0.2s" }}
        >
          <p className="text-lg lg:text-xl text-neutral-secondary-text leading-relaxed">
            Creators are earning. Fans are discovering. The future of streaming
            is unfolding on Pixsee.
          </p>
        </div>

        <div
          ref={testimonialsResult.ref}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${testimonialsResult.animationClass}`}
          style={{ transitionDelay: "0.3s" }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-foundation-primary border border-neutral-tertiary-border rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-neutral-primary-text font-semibold">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs lg:text-sm text-neutral-secondary-text">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </div>
              </div>

              <p className="text-neutral-secondary-text text-base leading-relaxed">
                {testimonial.quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
