"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

type AuthGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * AuthGuard component that protects routes requiring authentication.
 * Use this as a wrapper in dashboard layout for client-side protection.
 * Works alongside middleware for double protection.
 */
const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !authenticated) {
      // Store the intended destination for redirect after login
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/landing?redirect=${redirectUrl}`);
    }
  }, [ready, authenticated, router, pathname]);

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-foundation-alternate">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-pixsee-secondary border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-secondary-text">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // If not authenticated, show nothing (redirect will happen)
  if (!authenticated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-foundation-alternate">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-pixsee-secondary border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-secondary-text">
              User not authenticated. Redirecting to login...
            </p>
          </div>
        </div>
      )
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default AuthGuard;
