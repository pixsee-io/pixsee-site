import type { Metadata } from "next";
import { Inter, Paytone_One } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import FooterWrapper from "@/components/layout/FooterWrapper";
import ClientProviders from "@/components/providers/ClientProviders";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={paytone.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>

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
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
