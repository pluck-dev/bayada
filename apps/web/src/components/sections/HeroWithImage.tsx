"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@bayada/ui";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface HeroWithImageProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  breadcrumbs?: BreadcrumbItem[];
  ctaLabel?: string;
  ctaHref?: string;
  locale: string;
  variant?: "dark" | "light" | "gradient";
}

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroWithImage({
  title,
  subtitle,
  imageUrl,
  breadcrumbs,
  ctaLabel,
  ctaHref,
  locale,
  variant = "dark",
}: HeroWithImageProps) {
  // 모든 variant를 밝은 배경 기반으로 통일
  const hasSideImage = imageUrl && (variant === "light" || variant === "gradient");

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        variant === "gradient"
          ? "bg-[#f5f7f9]"
          : "bg-white"
      )}
    >
      <div
        className={cn(
          "relative mx-auto max-w-[1512px] px-4 py-20 sm:px-6 lg:px-12 lg:py-28",
          hasSideImage && "grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
        )}
      >
        {/* 텍스트 영역 */}
        <div>
          {/* 브레드크럼 */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              aria-label="브레드크럼"
              className="mb-6"
            >
              <ol className="flex flex-wrap items-center gap-1 text-sm">
                <li>
                  <Link
                    href={`/${locale}`}
                    className="text-black/40 transition-colors hover:text-black/70"
                  >
                    홈
                  </Link>
                </li>
                {breadcrumbs.map((crumb, i) => (
                  <li key={crumb.href} className="flex items-center gap-1">
                    <ChevronRight className="h-3.5 w-3.5 text-black/30" />
                    {i === breadcrumbs.length - 1 ? (
                      <span className="font-medium text-black/[0.87]">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-black/40 transition-colors hover:text-black/70"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </motion.nav>
          )}

          {/* 타이틀 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            {title}
          </motion.h1>

          {/* 서브타이틀 */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              className="mt-4 max-w-2xl text-base text-black/60"
            >
              {subtitle}
            </motion.p>
          )}

          {/* CTA 버튼 */}
          {ctaLabel && ctaHref && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              className="mt-8"
            >
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-[13px] text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                {ctaLabel}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </div>

        {/* 이미지 영역 (light / gradient variant) */}
        {hasSideImage && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm"
          >
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
