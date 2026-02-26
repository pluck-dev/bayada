"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface RedBannerCTAProps {
  title: string;
  description?: string;
  ctaLabel: string;
  ctaHref: string;
  locale?: string;
  features?: string[];
}

const ease = [0.16, 1, 0.3, 1] as const;

export function RedBannerCTA({
  title,
  description,
  ctaLabel,
  ctaHref,
  features,
}: RedBannerCTAProps) {
  return (
    <section className="bg-[#ce0e2d]">
      <div className="mx-auto max-w-[1512px] px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="text-center"
        >
          <h2
            className="font-bold text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            {title}
          </h2>
          {description && (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              {description}
            </p>
          )}

          {/* 특성 리스트 */}
          {features && features.length > 0 && (
            <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3">
              {features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-[#ce0e2d] transition-colors hover:bg-white/90"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
