"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const NavbarWrapper = () => {
  const pathname = usePathname();

  // Don't show navbar on root page
  if (pathname === "/") return null;

  if (pathname.includes("dashboard")) return null;

  return <Navbar />;
};

export default NavbarWrapper;