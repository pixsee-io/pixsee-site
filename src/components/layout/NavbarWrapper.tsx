"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import DashboardHeader from "../dashboard/DashboardHeader";

type NavbarWrapperProps = {
  onMobileMenuClick?: () => void;
};

const NavbarWrapper = ({ onMobileMenuClick }: NavbarWrapperProps) => {
  const pathname = usePathname();

  if (pathname === "/") return null;

  if (pathname.includes("dashboard")) {
    return <DashboardHeader onMenuClick={onMobileMenuClick} />;
  }

  return <Navbar />;
};

export default NavbarWrapper;
