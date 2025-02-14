"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNotifications } from "@/context/NotificationContext";

export default function MarkAllAsRead() {
  const { resetUnreadCount } = useNotifications();

  useEffect(() => {
    const markAllAsRead = async () => {
      try {
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
  }, [resetUnreadCount]);

  return null;
}
