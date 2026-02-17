"use client";

import { usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PROTECTED_PREFIXES = ["/dashboard", "/wallet"];
const REDIRECT_KEY = "pixsee-auth-redirect";

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function AuthNavigationGuard() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready || !authenticated) return;

    const redirectTo = window.sessionStorage.getItem(REDIRECT_KEY);
    if (!redirectTo) return;

    window.sessionStorage.removeItem(REDIRECT_KEY);

    if (redirectTo !== pathname) {
      router.push(redirectTo);
    }
  }, [authenticated, pathname, ready, router]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!ready || authenticated) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (!isProtectedPath(url.pathname)) return;

      event.preventDefault();
      const redirectPath = `${url.pathname}${url.search}${url.hash}`;
      window.sessionStorage.setItem(REDIRECT_KEY, redirectPath);
      void login();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [authenticated, login, ready]);

  return null;
}
