"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DeiBudButton } from "./DeiBudButton";
import { DeiBudChat } from "./DeiBudChat";

export function DeiBudProvider() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && <DeiBudChat />}
      </AnimatePresence>
      <DeiBudButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
    </div>
  );
}
