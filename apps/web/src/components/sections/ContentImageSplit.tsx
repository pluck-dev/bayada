"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@bayada/ui";

interface ContentImageSplitProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt?: string;
  reversed?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  locale?: string;
  children?: ReactNode;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function ContentImageSplit({
  title,
  description,
  imageUrl,
  imageAlt = "",
  reversed = false,
  ctaLabel,
  ctaHref,
  children,
}: ContentImageSplitProps) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div
        className={cn(
          "mx-auto grid max-w-[1512px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-12",
          reversed && "lg:[direction:rtl] lg:[&>*]:[direction:ltr]"
        )}
      >
        {/* 텍스트 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col justify-center"
        >
          <h2
            className="font-bold leading-[1.15] text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/60">
            {description}
          </p>
          {children && <div className="mt-6">{children}</div>}
          {ctaLabel && ctaHref && (
            <div className="mt-8">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#ce0e2d] transition-colors hover:text-[#980019]"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </motion.div>

        {/* 이미지 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl"
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </motion.div>
      </div>
    </section>
  );
}
