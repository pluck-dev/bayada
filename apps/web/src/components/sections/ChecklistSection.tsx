"use client";

import { type ElementType } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@bayada/ui";

interface ChecklistSectionProps {
  title?: string;
  subtitle?: string;
  items: string[];
  columns?: 1 | 2 | 3;
  variant?: "check" | "number" | "bullet";
  icon?: ElementType;
}

const ease = [0.16, 1, 0.3, 1] as const;

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
} as const;

export function ChecklistSection({
  title,
  subtitle,
  items,
  columns = 2,
  variant = "check",
  icon: CustomIcon,
}: ChecklistSectionProps) {
  const IconComponent = CustomIcon ?? Check;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-10"
          >
            {title && (
              <h2
                className="font-bold text-black/[0.87]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 max-w-2xl text-base text-black/60">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        <div className={cn("grid gap-x-8 gap-y-4", columnClasses[columns])}>
          {items.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.05, ease }}
              className="flex items-start gap-3"
            >
              {/* 아이콘/번호 */}
              {variant === "number" ? (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-xs font-bold text-white">
                  {index + 1}
                </span>
              ) : variant === "bullet" ? (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ce0e2d]" />
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                  <IconComponent className="h-4 w-4 text-[#ce0e2d]" />
                </span>
              )}
              <span className="pt-0.5 text-base text-black/[0.87]">
                {item}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
