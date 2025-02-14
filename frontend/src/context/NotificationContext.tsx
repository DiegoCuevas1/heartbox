"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUserContext } from "./AuthContext";

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
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
        const response = await fetch(
          "http://localhost:8000/api/user/notification/count",
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
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
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
