"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@bayada/ui";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { Dictionary } from "@bayada/shared/i18n";

interface HeroSectionProps {
  dict: Dictionary;
  locale: string;
}

export function HeroSection({ dict, locale }: HeroSectionProps) {
  const t = dict.web.home;

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-[color:var(--fg)]">
      {/* 배경 이미지 */}
      <Image
        src="/images/hero/bayada_main.png"
        alt=""
        fill
        className="object-cover opacity-30"
        priority
      />

      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          {/* 태그라인 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm"
          >
            <span className="text-sm font-medium text-white/90">
              {t.heroTagline}
            </span>
          </motion.div>

          {/* 메인 헤드라인 */}
          <h1 className="text-display-xl font-bold text-white">
            {t.heroTitle}
            <br />
            <span className="text-[#ff6b81]">{t.heroSubtitle}</span>
          </h1>

          {/* 설명 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 max-w-xl text-body-lg text-white/70"
          >
            {t.heroDescription}
          </motion.p>

          {/* CTA 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link href={`/${locale}/consultation`}>
              <Button
                size="lg"
                className="bg-[#ce0e2d] text-white hover:bg-[#a80b24]"
              >
                {t.heroCta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={`/${locale}/services`}>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                {t.heroCtaSecondary}
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* 스크롤 인디케이터 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-white/50">{dict.web.common.scrollDown}</span>
            <ChevronDown className="h-5 w-5 text-white/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
