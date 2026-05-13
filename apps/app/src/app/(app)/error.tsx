"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">😵</p>
        <h2 className="text-lg font-semibold text-neutral-primary-text mb-2">
          This page crashed
        </h2>
        <p className="text-sm text-neutral-tertiary-text mb-1">
          An error occurred on this page. The rest of the app is unaffected.
        </p>
        <p className="text-sm text-neutral-tertiary-text mb-6">
          Your wallet and funds are safe.
        </p>
        {error.digest && (
          <p className="text-xs text-neutral-tertiary-text font-mono mb-5">
            ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-neutral-secondary hover:bg-neutral-tertiary text-neutral-primary-text text-sm font-medium px-5 py-2 rounded-full transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
