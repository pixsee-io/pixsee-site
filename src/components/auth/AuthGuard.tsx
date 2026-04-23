"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

type AuthGuardProps = {
  children: React.ReactNode;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { ready, authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/landing");
    }
  }, [ready, authenticated, router]);

  // While Privy is still initialising, show a minimal loading state so we
  // don't flash protected content or fire unauthenticated API calls.
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

  // Ready but not authenticated: the useEffect above will redirect.
  // Render nothing in the meantime so 401-producing pages never mount.
  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
