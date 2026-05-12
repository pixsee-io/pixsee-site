"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightCircle, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@pixsee/ui/components/button";
import Container from "@pixsee/ui/components/Container";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.pixsee.io";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar({
  showThemeToggle = false,
}: {
  showThemeToggle?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <nav className="w-full py-4 lg:p-4 bg-neutral-primary text-neutral-primary-text sticky top-0 z-50 backdrop-blur-sm transition-all duration-300 starry-bg border-b border-neutral-tertiary-border/50">
      <Container className="flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/images/pixseee.svg"
            alt="Pixsee"
            width={120}
            height={60}
            className="w-20 md:w-full h-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((item) => (
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
          {showThemeToggle && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-neutral-secondary transition-colors text-neutral-primary-text"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          <Button
            asChild
            className="rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-6 py-5 font-medium text-sm flex items-center gap-2 shadow-lg transition-all duration-200"
          >
            <a href={APP_URL}>
              Launch App
              <ArrowRightCircle size={18} />
            </a>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 hover:bg-neutral-secondary rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={24} className="text-neutral-primary-text" />
          ) : (
            <Menu size={24} className="text-neutral-primary-text" />
          )}
        </button>
      </Container>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-foundation-alternate border-t border-neutral-tertiary-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <Container className="py-4 flex flex-col gap-3">
            {navLinks.map((item) => (
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
              {showThemeToggle && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-2 text-neutral-primary-text hover:text-brand-pixsee-primary transition-colors duration-200 font-medium py-2"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
              )}

              <Button
                asChild
                className="rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-6 py-5 font-medium w-full flex items-center justify-center gap-2"
              >
                <a href={APP_URL} onClick={() => setIsOpen(false)}>
                  Launch App
                  <ArrowRightCircle size={18} />
                </a>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </nav>
  );
}
