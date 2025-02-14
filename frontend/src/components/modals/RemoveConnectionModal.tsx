"use client";
import { motion, AnimatePresence } from "framer-motion";

interface RemoveConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export default function RemoveConnectionModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
}: RemoveConnectionModalProps) {
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
          className="bg-white rounded-lg p-6 w-full max-w-md"
        >
          <h2 className="text-2xl font-loves font-bold text-center mb-4">
            Remove Connection
          </h2>
          <p className="text-center mb-6">
            Are you sure you want to remove {userName} from your connections?
            This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-300"
            >
              Remove
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
