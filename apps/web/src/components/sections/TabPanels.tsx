"use client";

import { type ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@bayada/ui";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabPanelsProps {
  title?: string;
  tabs: Tab[];
  variant?: "underline" | "pill" | "boxed";
}

const ease = [0.16, 1, 0.3, 1] as const;

export function TabPanels({
  title,
  tabs,
  variant = "underline",
}: TabPanelsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");

  const activeTab = tabs.find((t) => t.id === activeId);

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-10 text-center font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            {title}
          </motion.h2>
        )}

        {/* 탭 네비게이션 */}
        <div
          className={cn(
            "scrollbar-hide mb-8 flex overflow-x-auto",
            variant === "underline" && "gap-0 border-b border-gray-200",
            variant === "pill" && "gap-2",
            variant === "boxed" && "gap-0 rounded-lg border border-gray-200 p-1"
          )}
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "relative shrink-0 whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors",
                  /* underline 스타일 */
                  variant === "underline" && [
                    "border-b-2",
                    isActive
                      ? "border-[#ce0e2d] text-[#ce0e2d]"
                      : "border-transparent text-black/50 hover:text-black/70",
                  ],
                  /* pill 스타일 */
                  variant === "pill" && [
                    "rounded-full",
                    isActive
                      ? "bg-[#ce0e2d] text-white"
                      : "bg-[#f0f4f7] text-black/60 hover:bg-gray-200",
                  ],
                  /* boxed 스타일 */
                  variant === "boxed" && [
                    "flex-1 rounded-md text-center",
                    isActive
                      ? "bg-white text-black/[0.87] shadow-sm"
                      : "text-black/50 hover:text-black/70",
                  ]
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 탭 패널 */}
        <AnimatePresence mode="wait">
          {activeTab && (
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease }}
              role="tabpanel"
            >
              {activeTab.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
