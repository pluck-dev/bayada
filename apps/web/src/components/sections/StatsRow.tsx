"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@bayada/ui";

interface Stat {
  value: string;
  label: string;
  suffix?: string;
}

interface StatsRowProps {
  title?: string;
  stats: Stat[];
  variant?: "light" | "dark" | "brand";
}

const ease = [0.16, 1, 0.3, 1] as const;

function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const numericMatch = value.match(/^[\d,]+/);
    if (!numericMatch) {
      setDisplay(value);
      return;
    }

    const end = parseInt(numericMatch[0].replace(/,/g, ""), 10);
    const remaining = value.slice(numericMatch[0].length);
    const duration = 2000;
    const startTime = Date.now();

    function step() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(eased * end);

      setDisplay(current.toLocaleString() + remaining);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplay(end.toLocaleString() + remaining);
      }
    }

    requestAnimationFrame(step);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function StatsRow({
  title,
  stats,
  variant = "light",
}: StatsRowProps) {
  const isDark = variant === "dark";
  const isBrand = variant === "brand";

  return (
    <section
      className={cn(
        "py-16 lg:py-20",
        isDark && "bg-[#1B2A4A]",
        isBrand && "bg-[#ce0e2d]",
        !isDark && !isBrand && "bg-[#f0f4f7]"
      )}
    >
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className={cn(
              "mb-12 text-center font-bold",
              isDark || isBrand ? "text-white" : "text-black/[0.87]"
            )}
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            {title}
          </motion.h2>
        )}

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease }}
              className="text-center"
            >
              <div
                className={cn(
                  "text-4xl font-bold tracking-tight lg:text-5xl",
                  isDark || isBrand ? "text-white" : "text-[#ce0e2d]"
                )}
              >
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <p
                className={cn(
                  "mt-2 text-sm font-medium",
                  isDark ? "text-white/70" : isBrand ? "text-white/80" : "text-black/60"
                )}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
