"use client";
import { useEffect } from "react";
import NavBarClient from "./NavBarClient";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();
  const isHomePage =
    pathname === "/home" || pathname === "/auth/forgot-password";

  return (
    <nav
      className={`w-full ${isHomePage ? "absolute" : "fixed"} top-0 z-50 bg-transparent`}
    >
      <div className="flex p-4 items-center justify-between max-w-screen-xl mx-auto">
        <NavBarClient />
      </div>
    </nav>
  );
};

export default NavBar;
