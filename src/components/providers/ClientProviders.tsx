"use client";

import dynamic from "next/dynamic";

const PrivyProviderWrapper = dynamic(
  () => import("@/app/providers/PrivyProviderWrapper"),
  { ssr: false }
);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivyProviderWrapper>{children}</PrivyProviderWrapper>;
}