"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RootError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-foundation-alternate flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-xl font-semibold text-neutral-primary-text mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-neutral-tertiary-text mb-6">
          An unexpected error occurred. Your wallet and funds are safe.
        </p>
        {error.digest && (
          <p className="text-xs text-neutral-tertiary-text font-mono mb-4">
            ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
