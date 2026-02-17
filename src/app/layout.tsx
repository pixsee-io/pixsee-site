import type { Metadata, Viewport } from "next";
import { Inter, Paytone_One } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import FooterWrapper from "@/components/layout/FooterWrapper";
import ClientProviders from "@/components/providers/ClientProviders";
import PWAInstallButton from "@/components/PWAInstallButton";

const paytone = Paytone_One({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-paytone",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pixsee - Be your own box office",
  description: "Join Pixsee for future updates and be your own box office",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pixsee",
  },
  icons: {
    apple: [{ url: "/icons/icon-192x192.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={paytone.variable}>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
        >
          <ClientProviders>
            <NavbarWrapper />
            {children}
            <FooterWrapper />
            <PWAInstallButton />
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
