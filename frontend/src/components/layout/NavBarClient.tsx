"use client";
import { cldImage } from "@/utils/media";
import { apiFetch } from "@/utils/api";

import Link from "next/link";
import { FaBell, FaSearch, FaBars } from "react-icons/fa";
import SearchBar from "./SearchBar";
import { useUserContext } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import Image from "next/image";
import { NotificationType } from "@/app/types/notification";
import { useNotifications } from "@/context/NotificationContext";

const NavBarClient = () => {
  const { isAuthenticated } = useUserContext();
  const { unreadCount, decrementUnreadCount } = useNotifications();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearch(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiFetch(
        "/api/user/notifications?unread_only=true",
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && showNotifications) {
      fetchNotifications();
    }
  }, [isAuthenticated, showNotifications]);

  const getNotificationMessage = (notification: NotificationType) => {
    switch (notification.notification_type) {
      case "GROUP_JOIN":
        return `${notification.sender_details.first_name} joined ${notification.family_details?.family_name}`;
      case "CONNECTION_REQUEST":
        return `${notification.sender_details.first_name} sent you a connection request`;
      case "CONNECTION_ACCEPTED":
        return `${notification.sender_details.first_name} accepted your connection request`;
      case "COMMENT":
        return `${notification.sender_details.first_name} commented: ${notification.comment_message}`;
      case "LIKE":
        return `${notification.sender_details.first_name} liked your post`;
      default:
        return "New notification";
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const response = await apiFetch(
        `/api/user/notification/${notificationId}/read`,
        {
          method: "POST",
        },
      );
      if (response.ok) {
        decrementUnreadCount();
        setNotifications(
          notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif,
          ),
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-3">
        <Link
          href={isAuthenticated ? "/timeline" : "/home"}
          className="flex items-center space-x-3"
        >
          <Image
            src="/images/icon-blue.png"
            alt="Logo"
            width={50}
            height={50}
            style={{ width: "auto", height: "auto" }}
          />
          <h1 className="md:flex hidden font-semibold text-2xl text-gray-900">
            Heartbox
          </h1>
        </Link>
      </div>

      {!isAuthenticated && (
        <div className="flex items-center space-x-6">
          <Link
            href="/home"
            className={`text-lg ${
              pathname === "/home"
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-lg ${
              pathname === "/about"
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            About Us
          </Link>
          <Link
            href="/faq"
            className={`text-lg ${
              pathname === "/faq"
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            FAQ
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/sign-in"
              className={`text-lg ${
                pathname === "/auth/sign-in"
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-lg px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="flex items-center space-x-4">
          {/* Search bar for larger screens */}
          <div className="hidden md:block">
            <SearchBar />
          </div>

          {/* Search icon and expandable search bar for mobile */}
          <div ref={searchRef} className="md:hidden relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaSearch className="text-xl" />
            </button>

            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-[280px] bg-white shadow-lg rounded-lg p-2 z-50"
                >
                  <SearchBar />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notification Bell and Dropdown */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <FaBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-[320px] bg-white shadow-lg rounded-lg overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    <Link
                      href="/notifications"
                      className="text-sm text-blue-600 hover:text-blue-700"
                      onClick={() => setShowNotifications(false)}
                    >
                      View All
                    </Link>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors bg-blue-50"
                          onClick={() => {
                            markNotificationAsRead(notification.id);
                            setShowNotifications(false);
                          }}
                        >
                          <Link
                            href={
                              notification.notification_type === "COMMENT"
                                ? `/posts/${notification.post_id}`
                                : `/profile/${notification.sender_details.id}`
                            }
                            className="flex items-start space-x-3"
                          >
                            <Image
                              unoptimized
                              src={cldImage(
                                notification.sender_details.profile_picture,
                                80,
                              )}
                              alt="Profile"
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {getNotificationMessage(notification)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(
                                  notification.timestamp,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger Menu */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="xl:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaBars className="text-xl" />
          </button>
        </div>
      )}

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {showMobileMenu && (
          <MobileSidebar onClose={() => setShowMobileMenu(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBarClient;
