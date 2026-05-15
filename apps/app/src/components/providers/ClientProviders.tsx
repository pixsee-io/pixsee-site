"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SocialStateProvider } from "@/app/context/SocialStateContext";
import { shouldRetry } from "@/app/lib/apiClient";

const PrivyProviderWrapper = dynamic(
  () => import("@/app/providers/PrivyProviderWrapper"),
  { ssr: false }
);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute default — components can override
        retry: shouldRetry,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // useState ensures the QueryClient is created once per component lifetime
  // and not re-created on every render (important for Next.js client components)
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SocialStateProvider>
        <PrivyProviderWrapper>{children}</PrivyProviderWrapper>
      </SocialStateProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
