"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logout from "../logoutbtn";
import { useUserContext } from "@/context/AuthContext";

const NavBar = () => {
  const { userId, userFN, userLN, authStatus } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    let handler = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });

  return (
    <nav>
      <div className="flex fixed z-[1000] justify-around w-screen px-8 items-center h-28 bg-gradient-to-l from-[#4D94D0] via-[#4d80D0] to-[#4D94D0]">
        <div className="flex w-12"></div>
        <div className="flex items-center">
          <Link
            href={authStatus ? "/timeline" : "/home"}
            className="text-black"
          >
            <Image
              alt="Logo"
              src="/images/heartbox_logo.png"
              height={25}
              width={80}
            />
          </Link>
        </div>

        <div className="flex items-center">
          <button
            onClick={toggleMenu}
            className="hover:scale-y-150 transition-all"
          >
            <Image
              alt="Menu Icon"
              src="/images/3bars.png"
              className="w-8 h-4 hover:scale-y-110"
              width={100}
              height={100}
            />
          </button>

          {isMenuOpen && (
            <div
              id="main-menu-id"
              ref={menuRef}
              className="z-[1000] fixed top-[112px] flex-col right-0 w-[190px] text-white shadow-xl rounded-bl-sm  flex bg-[#fbd1d1]"
            >
              <div className="flex justify-right flex-col mx-auto text-right space-y-2 mt-2">
                <Link
                  href={authStatus ? "/timeline" : "/home"}
                  onClick={toggleMenu}
                  className="font-loves font-bold text-black text-xl border-b-[1.5px]  border-[#d9a4a4]"
                >
                  HOME
                </Link>
                {authStatus && (
                  <Link
                    href={"/home"}
                    onClick={toggleMenu}
                    className="font-loves font-bold text-black text-xl border-b-[1.5px]  border-[#d9a4a4]"
                  >
                    Notifications
                  </Link>
                )}
                {authStatus && (
                  <Link
                    href={"/home"}
                    onClick={toggleMenu}
                    className="font-loves font-bold text-black text-xl border-b-[1.5px]  border-[#d9a4a4]"
                  >
                    Families
                  </Link>
                )}
                <Link
                  href={"/home"}
                  onClick={toggleMenu}
                  className="font-loves font-bold text-black text-xl border-b-[1.5px] border-[#d9a4a4]"
                >
                  About Us
                </Link>
                <Link
                  href={"/faq"}
                  onClick={toggleMenu}
                  className="font-loves font-bold text-black text-xl border-b-[1.5px] border-[#d9a4a4]"
                >
                  FAQ
                </Link>
                {authStatus && (
                  <Link
                    href={"/home"}
                    onClick={toggleMenu}
                    className="font-loves font-bold text-black text-xl border-b-[1.5px] border-[#d9a4a4] "
                  >
                    SETTINGS
                  </Link>
                )}
              </div>
              {!authStatus && (
                <div className="mt-4 ml-10 pb-4">
                  <button
                    className="flex space-x-2 py-1 px-5 rounded-sm text-white drop-shadow-xl font-loves font-bold text-xl bg-[#d31c60] hover:cursor-pointer hover:bg-[#ee80a9] active:scale-95 transition-all"
                    onClick={toggleMenu}
                  >
                    <Link href={"/auth/sign-in"}>SIGN IN</Link>
                  </button>
                </div>
              )}
              <div className="ml-8 mt-4 pb-4" onClick={toggleMenu}>
                <Logout />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
