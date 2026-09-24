"use client";
import { apiFetch } from "@/utils/api";

import { createContext, useContext, useEffect, useState } from "react";
import { useUserContext } from "./AuthContext";

const POLL_INTERVAL_MS = 60_000;

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useUserContext();

  const decrementUnreadCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await apiFetch("/api/user/notification/count");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    if (!isAuthenticated) return;

    // Poll only while the tab is visible; refresh as soon as it comes back.
    // Background tabs polling every few seconds are the biggest source of
    // API requests for an app like this.
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (interval) return;
      fetchUnreadCount();
      interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    };
    const stop = () => {
      clearInterval(interval);
      interval = undefined;
    };
    const onVisibilityChange = () =>
      document.visibilityState === "visible" ? start() : stop();

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        decrementUnreadCount,
        resetUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
