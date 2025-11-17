"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useScrollAnimation from "./hooks/useScrollAnimation";
import ComingSoonNavbar from "@/components/layout/ComingSoonNavbar";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const logoResult = useScrollAnimation({ animationType: "fade-up" });
  const headingResult = useScrollAnimation({ animationType: "fade-up" });
  const iconResult = useScrollAnimation({ animationType: "fade-right" });
  const signupResult = useScrollAnimation({ animationType: "fade-up" });
  const socialResult = useScrollAnimation({ animationType: "fade-up" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage("Thank you for subscribing! We'll keep you updated.");
        setEmail("");
      } else {
        setIsSuccess(false);
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setIsSuccess(false);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-foundation-alternate relative overflow-hidden starry-bg">
      <ComingSoonNavbar />
      <div className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none">
        <Image
          src="/images/cloud.png"
          alt=""
          fill
          className="object-cover max-w-4xl mx-auto object-top opacity-90"
          priority
        />
      </div>

      <div
        ref={iconResult.ref}
        className={`absolute top-[90px] right-[24%] w-[180px] h-[180px] z-20 hidden lg:block ${iconResult.animationClass}`}
        style={{ transitionDelay: "0.5s" }}
      >
        <Image
          src="/icons/create_watch_earn.svg"
          alt="Create Watch Earn"
          width={170}
          height={170}
          className="animate-[spin_20s_linear_infinite]"
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-20 relative z-10">
        <section className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-8 pt-28">
          <div className="space-y-2">
            <div
              ref={logoResult.ref}
              className={`flex justify-center ${logoResult.animationClass}`}
              style={{ transitionDelay: "0s" }}
            >
              <Image
                src="/pixsee-logo.png"
                alt="Pixsee"
                width={400}
                height={175}
                className="h-auto object-contain img-purple-to-white"
                priority
              />
            </div>

            <h1
              ref={headingResult.ref}
              className={`text-3xl md:text-4xl font-medium  text-brand-pixsee-primary ${headingResult.animationClass}`}
              style={{ transitionDelay: "0.2s" }}
            >
              Be your own box office
            </h1>
          </div>

          <div
            ref={signupResult.ref}
            className={`pt-12 space-y-6 ${signupResult.animationClass}`}
            style={{ transitionDelay: "0.4s" }}
          >
            <p className="text-xl md:text-2xl text-neutral-secondary-text">
              Sign up for future Updates
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-0 bg-neutral-primary rounded-full shadow-sm border border-neutral-tertiary-border overflow-hidden max-w-[600px] mx-auto"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 min-w-xs px-4 py-7 border-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="py-6 px-8 rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover m-1"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </form>

            {!!message && (
              <div
                className={`mt-4 max-w-[600px] mx-auto rounded-2xl px-4 py-3 text-sm font-medium 
                ${
                  isSuccess
                    ? "bg-semantic-success-subtle text-semantic-success-text border border-semantic-success-primary-border"
                    : "bg-semantic-error-subtle text-semantic-error-text border border-semantic-error-primary-border"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          <div
            ref={socialResult.ref}
            className={`pt-8 space-y-4 ${socialResult.animationClass}`}
            style={{ transitionDelay: "0.6s" }}
          >
            <p className="text-neutral-tertiary-text text-sm">
              Connect with us on socials
            </p>
            <div className="flex items-center justify-center gap-5">
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-black/10 border-[1.5px] border-neutral-secondary-border flex items-center justify-center hover:border-neutral-primary-border hover:scale-105 transition-all shadow-lg"
                aria-label="Instagram"
              >
                <Image
                  src="/icons/pixsee_instagram.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="w-9 h-9"
                />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-black/10 border-[1.5px] border-neutral-secondary-border flex items-center justify-center hover:border-neutral-primary-border hover:scale-105 transition-all shadow-lg"
                aria-label="X (Twitter)"
              >
                <Image
                  src="/images/x-logo.png"
                  alt="X"
                  width={24}
                  height={24}
                />
              </Link>
              <Link
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-black/10 border-[1.5px] border-neutral-secondary-border flex items-center justify-center hover:border-neutral-primary-border hover:scale-105 transition-all shadow-lg"
                aria-label="Discord"
              >
                <Image
                  src="/icons/pixsee_discord.svg"
                  alt="Discord"
                  width={24}
                  height={24}
                />
              </Link>
              <Link
                href="https://pixsee.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-black/10 border-[1.5px] border-neutral-secondary-border flex items-center justify-center hover:border-neutral-primary-border hover:scale-105 transition-all shadow-lg"
                aria-label="Website"
              >
                <Image
                  src="/icons/pixsee_tiktok.svg"
                  alt="Website"
                  width={24}
                  height={24}
                />
              </Link>
            </div>
          </div>
        </section>

        <footer className="text-center py-10 text-neutral-tertiary-text text-sm">
          <p>&copy; {new Date().getFullYear()} Pixsee. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
