"use client";

import { type ElementType } from "react";
import { motion } from "framer-motion";
import { cn } from "@bayada/ui";

interface Feature {
  icon: ElementType;
  title: string;
  description: string;
}

interface FeatureIconGridProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  variant?: "card" | "minimal" | "bordered";
}

const ease = [0.16, 1, 0.3, 1] as const;

const columnClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function FeatureIconGrid({
  title,
  subtitle,
  features,
  columns = 3,
  variant = "card",
}: FeatureIconGridProps) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        {/* 섹션 헤더 */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-12 text-center"
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
              <p className="mx-auto mt-3 max-w-2xl text-base text-black/60">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* 그리드 */}
        <div className={cn("grid gap-6", columnClasses[columns])}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease,
                }}
                className={cn(
                  "flex flex-col rounded-xl p-6",
                  variant === "card" &&
                    "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-md transition-shadow",
                  variant === "minimal" && "bg-transparent",
                  variant === "bordered" &&
                    "border border-gray-200 hover:border-gray-300 transition-colors"
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg",
                    variant === "minimal"
                      ? "bg-[#ce0e2d]/10"
                      : "bg-[#f0f4f7]"
                  )}
                >
                  <Icon className="h-6 w-6 text-[#ce0e2d]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-black/[0.87]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/60">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
