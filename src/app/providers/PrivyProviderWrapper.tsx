"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { useTheme } from "next-themes";

export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: theme === "dark" ? "dark" : "light",
          accentColor: "#8B5CF6",
          logo: "/icons/pixsee_brand_logo.svg",
        },
        // login methods
        loginMethods: ["email", "wallet", "google", "twitter"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets", // or "all-users" / "off"
          },
          // solana: {   ← optional, to be added if we need Solana embedded wallets
          //   createOnLogin: "users-without-wallets",
          // },
        },
        legal: {
          termsAndConditionsUrl: "/terms",
          privacyPolicyUrl: "/privacy",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
