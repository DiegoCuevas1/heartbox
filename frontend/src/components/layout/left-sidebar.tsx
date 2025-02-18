"use client";
import { useUserContext } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import Link from "next/link";
import Image from "next/image";

import {
  FaAngleDown,
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

interface LeftSideBarProps {
  onLinkClick?: (href: string) => void;
}

export default function LeftSideBar({ onLinkClick }: LeftSideBarProps) {
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const { unreadCount } = useNotifications();
  const { user, isAuthenticated } = useUserContext();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const handleClick = (href: string) => {
    if (onLinkClick) {
      onLinkClick(href);
    }
  };

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
    <div className="flex h-full flex-col items-center border-r-2  ">
      <Link
        href={`/profile/${user?.id}`}
        onClick={() => handleClick(`/profile/${user?.id}`)}
        className="flex items-center group hover:text-blue-500 space-x-2  "
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

      <nav className="w-[100%] px-8 mt-4">
        <ul className="flex flex-col font-bold text-gray-900 space-y-5 text-xl">
          <li>
            <Link
              href="/timeline"
              onClick={() => handleClick("/timeline")}
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
              onClick={() => handleClick("/families")}
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
              onClick={() => handleClick("/notifications")}
              className={`hover:text-blue-500 flex items-center space-x-3 ${
                pathname === "/notifications" ? "text-blue-800" : ""
              }`}
            >
              <div className="relative">
                <FaBell className="text-2xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
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
          <li>
            <Link
              href="/create-post"
              className={`hover:text-blue-500 flex items-center space-x-3 ${
                pathname === "/create-post" ? "text-blue-800" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span>Create Post</span>
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

          <Categories onLinkClick={handleClick} />
        </ul>
      </nav>
    </div>
  );
}
