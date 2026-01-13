"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Minus, Plus } from "lucide-react";

const faqItems = [
  {
    question: "Is there a free trial available?",
    answer:
      "Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes, you can upgrade, downgrade or switch plans at any time. The change takes effect immediately or at the start of your next billing cycle, depending on your preference.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "You can cancel your subscription at any time. There are no long-term contracts. Upon cancellation, you'll continue to have access until the end of your current billing period.",
  },
  {
    question: "Can other info be added to an invoice?",
    answer:
      "Yes, you can add custom fields like PO number, tax ID, company name, address or any additional information that should appear on your invoices.",
  },
  {
    question: "How does billing work?",
    answer:
      "We bill monthly or annually depending on your selected plan. All major credit cards are accepted. You'll receive an invoice via email and can also download it from your account dashboard.",
  },
  {
    question: "How do I change my account email?",
    answer:
      "Go to your account settings → Profile → click 'Edit email' and follow the verification steps. You'll need to confirm both the old and new email addresses for security reasons.",
  },
];

export default function Faq() {
  return (
    <section className="w-full py-16 md:py-20 lg:py-24 bg-background">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="md:pb-10 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl tracking-tight">
              Frequently asked questions
            </h1>
            <p className="mt-4 text-base md:text-xl text-muted-foreground">
              Everything you need to know about Pixsee.
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b last:border-b-0 border-neutral-tertiary-border py-6"
                >
                  <AccordionTrigger
                    className={`
    hover:no-underline 
    text-left 
    text-lg md:text-xl 
    text-neutral-primary-text
    transition-all
    [&[data-state=open]_.plus]:hidden
    [&[data-state=open]_.minus]:block
  `}
                  >
                    <div className="flex items-center justify-between w-full pr-4">
                      <span>{item.question}</span>

                      <div className="shrink-0 ml-6">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary transition-transform">
                          <Plus className="h-5 w-5 plus transition-transform" />
                          <Minus className="h-5 w-5 minus hidden transition-transform" />
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-5 pb-2 pr-4">
                    <p className="text-sm md:text-base leading-relaxed text-neutral-secondary-text">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
