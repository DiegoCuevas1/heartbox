"use client";
import { useUserContext } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { FaAngleDown } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import getCSRF from "@/utils/cookie";
import toast from "react-hot-toast";
import { sanitize_res_msg } from "@/utils/utilFunctions";
import { redirect } from "next/navigation";
import Logout from "../logoutbtn";
export default function LeftSideBar() {
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const { userId, authStatus } = useUserContext();
  const menuRef = useRef<HTMLDivElement | null>(null);
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

  if (!authStatus) return null;

  const onDropDownClick = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  const handleLogout = async () => {
    const csrfValue = getCSRF() ?? "";
    try {
      const res = await fetch("http://localhost:8000/api/user/logout", {
        headers: {
          "X-CSRFToken": csrfValue,
        },
        method: "DELETE",
        credentials: "include",
      });
      const res_mesg = await res.text();
      if (res.ok) {
        toast.success(sanitize_res_msg(res_mesg));
        redirect(`/home`);
      } else toast.error(res_mesg);
    } catch (error) {
      toast.error("An error occured while making your request");
      console.log((error as Error).toString());
    }
  };

  return (
    <div className="fixed left-0 w-64 mt-2 h-screen bg-gradient-to-b from-transparent to-[#b1bbdf] p-4  hidden lg:flex flex-col items-center space-y-6">
      <div className="flex flex-col items-center bg-blue-200 p-4 rounded-full">
        <Image
          src="/images/icon-blue.png"
          alt="Heartbox Logo"
          className="w-16 h-16"
          width={50}
          height={50}
        />
      </div>
      <div className="w-full h-1 rounded-md bg-gradient-to-t from-transparent  via-gray-400 to-transparent"></div>
      <nav className="w-full">
        <ul className="flex flex-col font-bold text-center text-gray-900 space-y-4 text-lg">
          <li>
            <Link href="/timeline" className="hover:text-blue-500">
              Home
            </Link>
          </li>
          <li>
            <Link href="/families" className="hover:text-blue-500">
              Heartboxes
            </Link>
          </li>
          <li>
            <Link href="/notifications" className="hover:text-blue-500">
              Notifications
            </Link>
          </li>
          <li>
            <Link href={`/profile/${userId}`} className="hover:text-blue-500">
              Profile
            </Link>
          </li>
          <li className="relative mx-auto">
            <button
              onClick={onDropDownClick}
              className="flex items-center space-x-1"
            >
              <span>More</span>
              <FaAngleDown />
            </button>
            {isDropdownVisible && (
              <div
                ref={menuRef}
                className="absolute top-full w-36 mt-1 left-[-40px] bg-white shadow-lg border rounded"
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
        </ul>
      </nav>
    </div>
  );
}
