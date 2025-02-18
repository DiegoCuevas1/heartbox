"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNotifications } from "@/context/NotificationContext";

export default function MarkAllAsRead() {
  const { resetUnreadCount } = useNotifications();
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);

  useEffect(() => {
    const markAllAsRead = async () => {
      if (hasMarkedAsRead) return;

      try {
        setHasMarkedAsRead(true);
        const response = await fetch(
          "http://localhost:8000/api/user/notification/mark-all-read",
          {
            method: "POST",
            credentials: "include",
          }
        );
        if (!response.ok) {
          console.error("Failed to mark notifications as read");
          return;
        }

        const data = await response.json();
        resetUnreadCount();
      } catch (error) {
        console.error("Error marking notifications as read:", error);
        toast.error("Failed to mark notifications as read");
      }
    };

    markAllAsRead();
  }, [resetUnreadCount, hasMarkedAsRead]);

  return null;
}
