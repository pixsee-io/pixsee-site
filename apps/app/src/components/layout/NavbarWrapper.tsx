"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const NavbarWrapper = () => {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";

  // Don't show navbar on root page
  if (currentPath === "/") return null;

  if (currentPath.includes("dashboard")) return null;

  return <Navbar />;
};

export default NavbarWrapper;
