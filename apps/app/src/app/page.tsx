"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRightCircle } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

export default function Home() {
  const { ready, authenticated, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.replace("/watch");
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-foundation-alternate">
        <div
          className="h-8 w-8 rounded-full border-2 border-neutral-tertiary-border border-t-brand-pixsee-secondary animate-spin"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-foundation-alternate px-4">
      <div className="flex flex-col items-center gap-8 max-w-sm w-full text-center">
        <Image
          src="/images/pixseee.svg"
          alt="Pixsee"
          width={140}
          height={56}
          className="h-auto"
          priority
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-neutral-primary-text font-paytone">
            Be Your Own Box Office
          </h1>
          <p className="text-sm text-neutral-secondary-text">
            Create, watch, and earn on the creator-first video platform.
          </p>
        </div>
        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-8 py-4 font-medium text-sm shadow-lg transition-all duration-200"
        >
          Sign In / Connect Wallet
          <ArrowRightCircle size={18} />
        </button>
      </div>
    </div>
  );
}
