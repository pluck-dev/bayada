"use client";

import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeiBudButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function DeiBudButton({ isOpen, onClick }: DeiBudButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ce0e2d] text-white shadow-lg shadow-[#ce0e2d]/30 transition-colors hover:bg-[#b00c27]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? "채팅 닫기" : "DeiBud AI 상담"}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="h-6 w-6" />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MessageCircle className="h-6 w-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
