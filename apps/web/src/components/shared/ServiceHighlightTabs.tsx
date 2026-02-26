"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ServiceTab {
  label: string;
  content: ReactNode;
  icon?: LucideIcon;
}

interface ServiceHighlightTabsProps {
  tabs: ServiceTab[];
  title?: string;
  description?: string;
  className?: string;
}

export function ServiceHighlightTabs({
  tabs,
  title,
  description,
  className = "",
}: ServiceHighlightTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className={`bg-white py-16 lg:py-24 ${className}`}>
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-12">
        {(title || description) && (
          <div className="mb-10 text-center">
            {title && (
              <h2 className="text-3xl font-bold text-black/[0.87] sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mx-auto mt-3 max-w-[600px] text-base leading-relaxed text-black/60">
                {description}
              </p>
            )}
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === index;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(index)}
                className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors focus:outline-none ${
                  isActive
                    ? "text-[#ce0e2d]"
                    : "text-black/54 hover:text-black/[0.87]"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ce0e2d]"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {tabs[activeTab]?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
