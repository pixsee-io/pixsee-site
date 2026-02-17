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
    <main className="w-full min-h-screen bg-foundation-alternate relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 z-10 animate-[gridGlide_24s_linear_infinite]"
        style={{
          backgroundImage: "url('/images/bg_grid_pattern_white.png')",
          backgroundSize: "900px 400px",
          backgroundRepeat: "repeat",
          backgroundBlendMode: "screen",
          backgroundPosition: "center",
          mixBlendMode: "screen",
        }}
      />

      <div className="absolute inset-0 pointer-events-none z-10">
        <div
          className="absolute inset-0 animate-[lightningPulse_8s_linear_infinite]"
          style={{
            background:
              "radial-gradient(circle at 68% 42%, rgba(255,255,255,0.45), transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0 animate-[lightningPulseAlt_12s_linear_infinite]"
          style={{
            background:
              "radial-gradient(circle at 32% 58%, rgba(255,240,200,0.38), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 animate-[lightningStrand_14s_linear_infinite] opacity-70"
          style={{
            background:
              "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.35) 48%, transparent 55%)",
          }}
        />
      </div>

      <ComingSoonNavbar />

      <div className="w-full relative mx-auto max-w-6xl z-10 px-4 sm:px-6">
        <div className="absolute -top-10 md:-top-30 left-1/2 -translate-x-1/2 w-[150vw] sm:w-[150vw] lg:w-[110vw] xl:w-275 pointer-events-none z-0">
          <Image
            src="/images/cloudy.svg"
            alt=""
            width={1200}
            height={800}
            className="w-full h-auto animate-[cloudDrift_16s_ease-in-out_infinite]"
            priority
          />
        </div>

        <div
          ref={iconResult.ref}
          className={`absolute top-0 right-40 w-45 h-45 z-20 hidden lg:block ${iconResult.animationClass}`}
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

        <div className="w-full flex flex-col items-center justify-center text-center space-y-4">
          <div className="space-y-2 w-full pt-32 sm:pt-40 lg:pt-60">
            <div
              ref={logoResult.ref}
              className={`flex justify-center ${logoResult.animationClass}`}
              style={{ transitionDelay: "0s" }}
            >
              <Image
                src="/images/pixsee_landing_logo.png"
                alt="Pixsee"
                width={400}
                height={175}
                className="w-60 sm:w-[320px] xl:w-100 h-auto object-contain img-purple-to-white"
                priority
              />
            </div>

            <h1
              ref={headingResult.ref}
              className={`text-2xl sm:text-3xl md:text-4xl font-medium font-inter text-brand-pixsee-primary ${headingResult.animationClass}`}
              style={{ transitionDelay: "0.2s" }}
            >
              Be your own box office
            </h1>
          </div>

          {/* Signup block */}
          <div
            ref={signupResult.ref}
            className={`mt-7 space-y-4 w-full ${signupResult.animationClass}`}
            style={{ transitionDelay: "0.4s" }}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-neutral-secondary-text">
              Sign up for future Updates
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-150 mx-auto">
              <div className="flex flex-col sm:hidden gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full px-4 rounded-full border border-neutral-tertiary-border bg-neutral-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>

              <div className="hidden sm:flex items-center gap-0 bg-neutral-primary rounded-full shadow-sm border border-neutral-tertiary-border overflow-hidden">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-7 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-6 px-8 rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover m-1 flex-shrink-0"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>

            <div>
              <a
                href="https://pump.fun/coin/7Lafx33QDj3ATpT3gHzUuwukav2CUjGAhKwgZpM2pump"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#692f96] px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold tracking-wide text-white shadow-md transition-transform duration-150 hover:scale-[1.03] hover:bg-[#7e38b3] active:scale-[0.97] max-w-[90vw] sm:max-w-none"
              >
                <span className="md:hidden">7Lafx33...M2pump</span>
                <span className="hidden md:inline">
                  7Lafx33QDj3ATpT3gHzUuwukav2CUjGAhKwgZpM2pump
                </span>
              </a>
            </div>

            {!!message && (
              <div
                className={`mt-4 max-w-150 mx-auto rounded-2xl px-4 py-3 text-sm font-medium
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

          {/* Socials */}
          <div
            ref={socialResult.ref}
            className={`mt-4 space-y-4 ${socialResult.animationClass}`}
            style={{ transitionDelay: "0.6s" }}
          >
            <p className="text-neutral-tertiary-text text-sm">
              Connect with us on socials
            </p>
            <div className="flex items-center justify-center gap-4 sm:gap-5">
              {[
                {
                  href: "https://instagram.com",
                  src: "/icons/pixsee_instagram.svg",
                  alt: "Instagram",
                  imgClass: "w-9 h-9",
                },
                {
                  href: "https://x.com/PixseeIO",
                  src: "/images/x-logo.png",
                  alt: "X (Twitter)",
                  imgClass: "w-6 h-6",
                },
                {
                  href: "https://discord.com",
                  src: "/icons/pixsee_discord.svg",
                  alt: "Discord",
                  imgClass: "w-6 h-6",
                },
                {
                  href: "https://pixsee.com",
                  src: "/icons/pixsee_tiktok.svg",
                  alt: "Website",
                  imgClass: "w-6 h-6",
                },
              ].map(({ href, src, alt, imgClass }) => (
                <Link
                  key={alt}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/10 border-[1.5px] border-neutral-secondary-border flex items-center justify-center hover:border-neutral-primary-border hover:scale-105 transition-all shadow-lg"
                  aria-label={alt}
                >
                  <Image
                    src={src}
                    alt={alt}
                    width={24}
                    height={24}
                    className={imgClass}
                  />
                </Link>
              ))}
            </div>
          </div>

          <footer className="mt-7 text-center text-neutral-tertiary-text text-sm">
            <p>
              &copy; {new Date().getFullYear()} Pixsee. All rights reserved.
            </p>
          </footer>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes cloudDrift {
          0% {
            transform: translateY(-2%) scale(1);
          }
          50% {
            transform: translateY(3%) scale(1.02);
          }
          100% {
            transform: translateY(-2%) scale(1);
          }
        }
        @keyframes gridGlide {
          0% {
            background-position: center 0px;
          }
          50% {
            background-position: calc(50% + 25px) 30px;
          }
          100% {
            background-position: center 0px;
          }
        }
        @keyframes lightningPulse {
          0%,
          52%,
          100% {
            opacity: 0;
          }
          53% {
            opacity: 0.95;
          }
          55% {
            opacity: 0.2;
          }
          60% {
            opacity: 0.7;
          }
          63% {
            opacity: 0;
          }
        }
        @keyframes lightningPulseAlt {
          0%,
          28%,
          100% {
            opacity: 0;
          }
          29% {
            opacity: 0.85;
          }
          31% {
            opacity: 0.15;
          }
          36% {
            opacity: 0.6;
          }
          38% {
            opacity: 0;
          }
        }
        @keyframes lightningStrand {
          0%,
          70%,
          100% {
            opacity: 0;
            transform: translateX(-10%) skewX(-18deg);
          }
          71% {
            opacity: 0.85;
            transform: translateX(0%) skewX(-12deg);
          }
          73% {
            opacity: 0.2;
            transform: translateX(6%) skewX(-8deg);
          }
          78% {
            opacity: 0.65;
            transform: translateX(-4%) skewX(-16deg);
          }
          80% {
            opacity: 0;
            transform: translateX(0%) skewX(-18deg);
          }
        }
      `}</style>
    </main>
  );
}
