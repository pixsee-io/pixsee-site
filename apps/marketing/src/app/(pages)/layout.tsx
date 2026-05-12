import { ThemeProvider } from "@pixsee/ui/components/theme-provider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Navbar showThemeToggle />
      {children}
      <Footer />
    </ThemeProvider>
  );
}
