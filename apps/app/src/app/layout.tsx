import type { Metadata, Viewport } from "next";
import { Inter, Paytone_One } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import ClientProviders from "@/components/providers/ClientProviders";
import PWAInstallButton from "@/components/PWAInstallButton";
import { Toaster } from "sonner";

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
  title: "Pixsee App",
  description: "Be your own box office — create, watch, and earn on Pixsee",
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
    <html lang="en" className={paytone.variable} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
          disableTransitionOnChange
        >
          <ClientProviders>
            {children}
            <PWAInstallButton />
            <Toaster richColors position="top-right" />
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
