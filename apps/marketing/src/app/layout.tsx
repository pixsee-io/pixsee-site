import type { Metadata } from "next";
import { Inter, Paytone_One } from "next/font/google";
import "./globals.css";

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
  title: "Pixsee - Be Your Own Box Office",
  description:
    "Pixsee is a decentralized video platform where creators own their content, set their own prices, and earn directly from their audience.",
  openGraph: {
    title: "Pixsee - Be Your Own Box Office",
    description:
      "Create, watch, and earn on the creator-first video platform built on Base.",
    url: "https://pixsee.io",
    siteName: "Pixsee",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${paytone.variable}`} suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
