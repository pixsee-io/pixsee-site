"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@pixsee/ui/components/button";
import Image from "next/image";

type Props = {};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.pixsee.io";

interface FooterLink {
  label: string;
  href?: string;
  comingSoon?: boolean;
}

const Footer = (props: Props) => {
  const [email, setEmail] = useState("");

  const platformLinks: FooterLink[] = [
    { label: "Watch", href: `${APP_URL}/watch` },
    { label: "Create", href: `${APP_URL}/create` },
    { label: "Earn", href: `${APP_URL}/earn` },
  ];

  const companyLinks: FooterLink[] = [
    { label: "About", href: "/about" },
    { label: "Career", comingSoon: true },
    { label: "Contact", comingSoon: true },
    { label: "Privacy Policy", comingSoon: true },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribed with email:", email);
    setEmail("");
  };

  return (
    <footer className="relative w-full bg-foundation-alternate py-16 px-4 border border-t">
      <div className="max-w-360 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/images/pixseee.svg"
                alt="Pixsee"
                width={120}
                height={60}
                className="h-auto object-contain"
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
                <a
                  key={link.label}
                  href={link.href}
                  className="text-neutral-secondary-text hover:text-neutral-primary-text transition-colors duration-200 text-base"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="col-span-1">
            <p className="text-neutral-primary-text font-semibold text-lg mb-6">
              Company
            </p>
            <nav className="flex flex-col space-y-4">
              {companyLinks.map((link) =>
                link.comingSoon ? (
                  <span
                    key={link.label}
                    className="text-neutral-tertiary-text text-base flex items-center gap-2 cursor-default"
                  >
                    {link.label}
                    <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-secondary text-neutral-tertiary-text">
                      Coming soon
                    </span>
                  </span>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href!}
                    className="text-neutral-secondary-text hover:text-neutral-primary-text transition-colors duration-200 text-base"
                  >
                    {link.label}
                  </Link>
                )
              )}
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
            © Copyright {new Date().getFullYear()}, All Rights Reserved by
            Pixsee Inc
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
