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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConnections = connections.filter((connection) => {
    const fullName =
      `${connection.first_name} ${connection.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

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
          {/* Search input */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Connections</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 font-bold text-3xl"
            >
              ×
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-links focus:border-transparent"
            />
          </div>
          {/* Modal content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-links"></div>
            </div>
          ) : connections.length === 0 ? (
            <div>You have no connections how?</div>
          ) : filteredConnections.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No connections found matching your search.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConnections.map((connection) => (
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
