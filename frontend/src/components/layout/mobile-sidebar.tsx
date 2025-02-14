"use client";

import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import LeftSideBar from "./left-sidebar";
import { useRouter } from "next/navigation";

interface MobileSidebarProps {
  onClose: () => void;
}

export default function MobileSidebar({ onClose }: MobileSidebarProps) {
  const router = useRouter();

  const handleLinkClick = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-40"
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl"
      >
        <div className="p-4 flex justify-start">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          <LeftSideBar onLinkClick={handleLinkClick} />
        </div>
      </motion.div>
    </>
  );
}
