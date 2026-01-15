"use client";

import React, { useState } from "react";
import Container from "../ui/Container";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/ModeToggle";
import { ArrowRightCircle, Menu, X } from "lucide-react";

type Props = {};

const Navbar = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Watch", href: "#watch" },
    { label: "Create", href: "#create" },
    { label: "Earn", href: "#earn" },
    { label: "Trade", href: "#trade" },
  ];

  return (
    <nav className="w-full py-4 bg-foundation-alternate sticky top-0 z-50 backdrop-blur-sm transition-all duration-300 starry-bg border-b border-neutral-tertiary-border/50">
      <Container className="flex items-center justify-between">
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/icons/Pixsee_icon.svg"
            alt="Pixsee"
            width={120}
            height={60}
            className="w-20 md:w-full h-auto object-contain img-purple-to-white"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-neutral-primary-text hover:text-brand-pixsee-primary transition-colors duration-200 font-medium text-base"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="#signin"
            className="text-neutral-primary-text hover:text-brand-pixsee-primary transition-colors duration-200 font-medium text-sm"
          >
            Sign in
          </Link>

          <Button
            className="rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-6 py-5 font-medium text-sm flex items-center gap-2 shadow-lg transition-all duration-200"
            asChild
          >
            <Link href="/get-started">
              Get started
              <ArrowRightCircle size={18} />
            </Link>
          </Button>

          <ModeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-3">
          <ModeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-neutral-secondary rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X size={24} className="text-neutral-primary-text" />
            ) : (
              <Menu size={24} className="text-neutral-primary-text" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-foundation-alternate border-t border-neutral-tertiary-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <Container className="py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-neutral-primary-text hover:text-brand-pixsee-primary transition-colors duration-200 font-medium py-2"
              >
                {item.label}
              </Link>
            ))}

            <div className="border-t border-neutral-tertiary-border/50 pt-3 mt-3 flex flex-col gap-3">
              <Link
                href="#signin"
                onClick={() => setIsOpen(false)}
                className="text-neutral-primary-text hover:text-brand-pixsee-primary transition-colors duration-200 font-medium py-2"
              >
                Sign in
              </Link>

              <Button
                className="rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-6 py-5 font-medium w-full flex items-center justify-center gap-2"
                asChild
              >
                <Link href="/get-started" onClick={() => setIsOpen(false)}>
                  Get started
                  <ArrowRightCircle size={18} />
                </Link>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
