"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/app/types";
import Link from "next/link";
import Image from "next/image";

interface ConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ConnectionsModal({
  isOpen,
  onClose,
  userId,
}: ConnectionsModalProps) {
  const [connections, setConnections] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      async function fetchConnections() {
        try {
          const response = await fetch(
            `http://localhost:8000/api/user/connections`,
            {
              credentials: "include",
            }
          );
          if (!response.ok) throw new Error("Failed to fetch connections");
          const data = await response.json();
          setConnections(data);
        } catch (error) {
          console.error("Error fetching connections:", error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchConnections();
    }
  }, [isOpen, userId, connections.length]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            ×
          </button>
          {/* Modal content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-links"></div>
            </div>
          ) : connections.length === 0 ? (
            <div>You have no connections how?</div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <Link
                  key={connection.id}
                  href={`/profile/${connection.id}`}
                  onClick={onClose}
                >
                  <div className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <Image
                      src={`https://res.cloudinary.com/dcyk5quni/${connection.profile_picture}`}
                      alt={`${connection.first_name} ${connection.last_name}'s profile picture`}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">
                        {connection.first_name} {connection.last_name}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
