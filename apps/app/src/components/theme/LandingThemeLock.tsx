"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// /landing is the only route intentionally locked to light mode. This
// component toggles the `force-light` class on <body> so that both the
// shared <Navbar /> (which lives in the root layout above landing's own
// layout) and the landing content inherit the light palette regardless
// of the user's theme preference.
export default function LandingThemeLock() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    const isLanding = pathname === "/landing" || pathname.startsWith("/landing/");
    const { body } = document;

    if (isLanding) {
      body.classList.add("force-light");
    } else {
      body.classList.remove("force-light");
    }

    return () => {
      body.classList.remove("force-light");
    };
  }, [pathname]);

  return null;
}
