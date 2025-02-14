"use client";
import { useState, useEffect } from "react";
import { NotificationType } from "../types/notification";
import Notification from "./notification";
import { motion } from "framer-motion";

async function getData() {
  try {
    const res = await fetch(
      `http://localhost:8000/api/user/notifications?unread_only=false`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!res.ok) {
      throw Error("Failed to fetch notifications");
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    return error;
  }
}

export default function NotificationGenerator() {
  const [notifications, setNotifications] = useState<NotificationType[]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        duration: 0.8,
        bounce: 0.2,
      },
    },
  };

  useEffect(() => {
    setIsLoading(true);
    async function fetchData() {
      try {
        const fetchedData = await getData();
        // Process data or set it to state as needed
        setNotifications(fetchedData);
      } catch (error: any) {
        console.error("Error in fetchData:", error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[80vw] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-links"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="flex-col space-y-4 w-[400px]"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {notifications &&
          Array.isArray(notifications) &&
          notifications.map((notification, index) => (
            <motion.div key={notification.id || index} variants={item}>
              <Notification notification={notification} />
            </motion.div>
          ))}
      </motion.div>
      {notifications && notifications.length === 0 && (
        <motion.div
          className="flex justify-center text-links text-xl font-loves font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          No Notifications yet...
        </motion.div>
      )}
    </>
  );
}
