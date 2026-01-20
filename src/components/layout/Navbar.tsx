"use client";

import React, { useState } from "react";
import Container from "../ui/Container";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/ModeToggle";
import { ArrowRightCircle, Menu, X, LogOut, Wallet, User } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";


type Props = {};

const Navbar = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { ready, authenticated, user, login, logout } = usePrivy();

  const navItems = [
    { label: "Watch", href: "#watch" },
    { label: "Create", href: "#create" },
    { label: "Earn", href: "#earn" },
    { label: "Trade", href: "#trade" },
  ];

  // Show loading state while Privy is initializing
  const isLoading = !ready;

  // Get user's display name or wallet address
  const getUserDisplay = () => {
    if (!user) return "";

    // Prefer email, then wallet address
    if (user.email?.address) {
      return user.email.address;
    }

    if (user.wallet?.address) {
      return `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(
        -4
      )}`;
    }

    return "User";
  };

  return (
    <nav className="w-full py-4 bg-foundation-alternate sticky top-0 z-50 backdrop-blur-sm transition-all duration-300 starry-bg border-b border-neutral-tertiary-border/50">
      <Container className="flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/icons/pixsee_brand_logo.svg"
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
          {authenticated ? (
            // Authenticated user dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full px-4 py-2 font-medium text-sm flex items-center gap-2"
                >
                  <User size={16} />
                  {getUserDisplay()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wallet" className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    Wallet
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Non-authenticated state
            <>
              <button
                onClick={login}
                disabled={isLoading}
                className="text-neutral-primary-text hover:text-brand-pixsee-primary transition-colors duration-200 font-medium text-sm disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Sign in"}
              </button>

              <Button
                className="rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-6 py-5 font-medium text-sm flex items-center gap-2 shadow-lg transition-all duration-200"
                onClick={login}
                disabled={isLoading}
              >
                Get started
                <ArrowRightCircle size={18} />
              </Button>
            </>
          )}

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
              {authenticated ? (
                <>
                  <div className="text-sm text-neutral-secondary-text py-2">
                    {getUserDisplay()}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-neutral-primary-text hover:text-brand-pixsee-primary transition-colors duration-200 font-medium py-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/wallet"
                    onClick={() => setIsOpen(false)}
                    className="text-neutral-primary-text hover:text-brand-pixsee-primary transition-colors duration-200 font-medium py-2"
                  >
                    Wallet
                  </Link>
                  <Button
                    variant="outline"
                    className="rounded-full px-6 py-5 font-medium w-full flex items-center justify-center gap-2 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut size={18} />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      login();
                      setIsOpen(false);
                    }}
                    disabled={isLoading}
                    className="text-neutral-primary-text hover:text-brand-pixsee-primary transition-colors duration-200 font-medium py-2 text-left disabled:opacity-50"
                  >
                    {isLoading ? "Loading..." : "Sign in"}
                  </button>

                  <Button
                    className="rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-6 py-5 font-medium w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      login();
                      setIsOpen(false);
                    }}
                    disabled={isLoading}
                  >
                    Get started
                    <ArrowRightCircle size={18} />
                  </Button>
                </>
              )}
            </div>
          </Container>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
