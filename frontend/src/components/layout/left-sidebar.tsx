"use client";
import { useUserContext } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";

import {
  FaAngleDown,
  FaAngleUp,
  FaBell,
  FaEllipsisH,
  FaHeart,
  FaHome,
  FaUser,
} from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import Logout from "../logoutbtn";
import { usePathname } from "next/navigation";
import Categories from "./Categories";

export default function LeftSideBar() {
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const { user, isAuthenticated } = useUserContext();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (isDropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownVisible]);

  if (!isAuthenticated) return null;

  const onDropDownClick = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  return (
    <div className="fixed w-64 mt-2 h-screen p-4 hidden lg:flex flex-col items-center space-y-6 left-64 border-r-2 ">
      <Link
        href={`/profile/${user?.id}`}
        className="flex items-center group hover:text-blue-500 space-x-2"
      >
        <Image
          src={`https://res.cloudinary.com/dcyk5quni/${user?.profile_picture}`}
          alt={"Profile Picture"}
          width={100}
          height={100}
          className="w-16 h-16 rounded-full border-2 border-gray-300 group-hover:border-blue-500" // Optional: Make the image round
        />
        <div className="flex items-center space-x-2 ">
          <h3 className="text-xl font-semibold mt-2">
            {user?.first_name} {user?.last_name}
          </h3>
        </div>
      </Link>

      <div className="w-full h-1 rounded-md bg-gradient-to-t from-transparent  via-gray-400 to-transparent"></div>
      <nav className="w-full px-8">
        <ul className="flex flex-col font-bold text-gray-900 space-y-5 text-xl">
          <li>
            <Link
              href="/timeline"
              className={`hover:text-blue-500 flex items-center space-x-3 ${
                pathname === "/timeline" ? "text-blue-800" : ""
              }`}
            >
              <FaHome className="text-2xl" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              href="/families"
              className={`hover:text-blue-500 flex items-center space-x-3 ${
                pathname === "/families" ? "text-blue-800" : ""
              }`}
            >
              <FaHeart className="text-2xl" />
              <span>Heartboxes</span>
            </Link>
          </li>
          <li>
            <Link
              href="/notifications"
              className={`hover:text-blue-500 flex items-center space-x-3 ${
                pathname === "/notifications" ? "text-blue-800" : ""
              }`}
            >
              <FaBell className="text-2xl" />
              <span>Notifications</span>
            </Link>
          </li>
          <li>
            <Link
              href={`/profile/${user?.id}`}
              className={`hover:text-blue-500 flex items-center space-x-3 ${
                pathname.startsWith("/profile") ? "text-blue-800" : ""
              }`}
            >
              <FaUser className="text-2xl" />
              <span>Profile</span>
            </Link>
          </li>
          <li className="relative">
            <button
              onClick={onDropDownClick}
              className="flex items-center space-x-3 hover:text-blue-500"
            >
              <FaEllipsisH className="text-2xl" />
              <span>More</span>
              <FaAngleDown
                className={`transition-transform duration-300 transform ${
                  isDropdownVisible ? "rotate-180" : "rotate-360"
                }`}
              />
            </button>
            {isDropdownVisible && (
              <div
                ref={menuRef}
                className="absolute top-full w-32 text-gray-900 mt-1 left-0 pb-2 bg-white shadow-lg border rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <ul className="py-2">
                  <Link href={""}>
                    <li className="px-4 py-2 hover:bg-gray-100">Settings</li>
                  </Link>
                  <Link href={""}>
                    <li className="px-4 py-2 hover:bg-gray-100">FAQ</li>
                  </Link>
                  <Link href={""}>
                    <li className="px-4 py-2 hover:bg-gray-100">About Us</li>
                  </Link>

                  <Logout />
                </ul>
              </div>
            )}
          </li>
          <hr className="border-t-2 border-gray-300" />

          <Categories />
        </ul>
      </nav>
    </div>
  );
}
