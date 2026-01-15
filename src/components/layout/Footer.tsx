"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type Props = {};

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer = (props: Props) => {
  const [email, setEmail] = useState("");

  const platformLinks: FooterLink[] = [
    { label: "Watch", href: "/watch" },
    { label: "Create", href: "/create" },
    { label: "Earn", href: "/earn" },
    { label: "Token", href: "/token" },
  ];

  const companyLinks: FooterLink[] = [
    { label: "About", href: "/about" },
    { label: "Career", href: "/career" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribed with email:", email);
    setEmail("");
  };

  return (
    <footer className="relative w-full bg-foundation-alternate py-16 px-4">
      <div className="max-w-[90rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/icons/Pixsee_logo.svg"
                alt="Pixsee"
                width={120}
                height={60}
                className="h-auto object-contain img-purple-to-white"
                priority
              />
            </Link>

            <p className="mt-8 text-neutral-secondary-text text-base leading-relaxed max-w-xs">
              Empowering creators and fans through decentralized streaming and
              Web3 ownership.
            </p>
          </div>

          <div className="col-span-1">
            <p className="text-neutral-primary-text font-semibold text-lg mb-6">
              Platform
            </p>
            <nav className="flex flex-col space-y-4">
              {platformLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-neutral-secondary-text hover:text-neutral-primary-text transition-colors duration-200 text-base"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="col-span-1">
            <p className="text-neutral-primary-text font-semibold text-lg mb-6">
              Company
            </p>
            <nav className="flex flex-col space-y-4">
              {companyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-neutral-secondary-text hover:text-neutral-primary-text transition-colors duration-200 text-base"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="col-span-1">
            <p className="text-neutral-primary-text font-semibold text-lg mb-6">
              Newsletter
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-full bg-neutral-secondary border border-neutral-tertiary-border text-neutral-primary-text placeholder-neutral-tertiary-text focus:outline-none focus:ring-2 focus:ring-brand-action focus:ring-offset-2 focus:ring-offset-foundation-primary"
              />

              <Button
                type="submit"
                className="w-full bg-brand-action hover:bg-brand-action/90 text-white rounded-full py-6 font-semibold"
              >
                Subscribe Now
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-neutral-tertiary-border mb-8"></div>

        <div className="flex flex-col md:flex-row items-center justify-center">
          <p className="text-neutral-secondary-text text-sm text-center md:text-left">
            © Copyright 2025, All Rights Reserved by Pixsee Inc
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
