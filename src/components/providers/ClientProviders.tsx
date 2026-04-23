"use client";

import dynamic from "next/dynamic";
import { SocialStateProvider } from "@/app/context/SocialStateContext";

const PrivyProviderWrapper = dynamic(
  () => import("@/app/providers/PrivyProviderWrapper"),
  { ssr: false }
);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocialStateProvider>
      <PrivyProviderWrapper>{children}</PrivyProviderWrapper>
    </SocialStateProvider>
  );
}