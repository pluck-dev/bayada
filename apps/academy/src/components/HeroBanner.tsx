"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Dictionary } from "@bayada/shared/i18n";

interface Slide {
  tag: string;
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  bg: string;
  accent: string;
}

interface HeroBannerProps {
  locale: string;
  dict: Dictionary;
  stats: { total: number; enrollments: number };
}

const slides: Slide[] = [
  {
    tag: "NEW",
    title: "2025 최신 커리큘럼 업데이트",
    subtitle: "헬스케어 전문가로의 성장,\n지금 시작하세요",
    cta: { label: "강의 둘러보기 →", href: "/courses" },
    bg: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    accent: "#e31b34",
  },
  {
    tag: "BEST",
    title: "질환교육 시리즈",
    subtitle: "당뇨 · 비만 · 류마티스\n완전 정복 프로그램",
    cta: { label: "시리즈 보기 →", href: "/courses?category=질환교육" },
    bg: "from-[#0d1b2a] via-[#1b2838] to-[#2d4059]",
    accent: "#4ea8de",
  },
  {
    tag: "FREE",
    title: "CIST / MBI 평가 도구 사용법",
    subtitle: "인지기능 및 기동성 평가 도구\n핵심 교육 무료 제공",
    cta: { label: "무료 수강하기 →", href: "/courses?price=free" },
    bg: "from-[#1a0a2e] via-[#2d1b4e] to-[#1a1a3e]",
    accent: "#a855f7",
  },
  {
    tag: "PSP",
    title: "환자안전 전문가 과정",
    subtitle: "PSP Class로\n케어 품질을 향상시키세요",
    cta: { label: "과정 살펴보기 →", href: "/courses?category=PSP" },
    bg: "from-[#1a2e1a] via-[#1b3a2a] to-[#0f4035]",
    accent: "#34d399",
  },
];

const AUTOPLAY_INTERVAL = 5000;

export function HeroBanner({ locale }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  // 자동 재생
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next]);

  // 터치 스와이프
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  }

  // 이전/다음 슬라이드 인덱스
  const prevIndex = (current - 1 + slides.length) % slides.length;
  const nextIndex = (current + 1) % slides.length;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#f5f5f7] py-6 sm:py-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 슬라이드 트랙 */}
      <div className="relative mx-auto flex items-center justify-center">
        {/* 이전 슬라이드 (살짝 보임) */}
        <div
          className="absolute left-0 z-0 hidden w-[8%] cursor-pointer sm:block"
          onClick={prev}
        >
          <SlideCard
            slide={slides[prevIndex]}
            locale={locale}
            isActive={false}
          />
        </div>

        {/* 메인 슬라이드 */}
        <div className="relative z-10 w-[92%] sm:w-[82%]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <SlideCard
                slide={slides[current]}
                locale={locale}
                isActive
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 다음 슬라이드 (살짝 보임) */}
        <div
          className="absolute right-0 z-0 hidden w-[8%] cursor-pointer sm:block"
          onClick={next}
        >
          <SlideCard
            slide={slides[nextIndex]}
            locale={locale}
            isActive={false}
          />
        </div>
      </div>

      {/* 하단 컨트롤 */}
      <div className="mx-auto mt-4 flex w-[92%] items-center justify-between sm:mt-5 sm:w-[82%]">
        {/* 슬라이드 카운터 */}
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold tabular-nums text-white">
            {String(current + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        {/* 네비게이션 */}
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-gray-900 hover:text-gray-900"
            aria-label="이전"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPaused(!paused)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-gray-900 hover:text-gray-900"
            aria-label={paused ? "재생" : "일시정지"}
          >
            {paused ? (
              <Play className="h-3.5 w-3.5" />
            ) : (
              <Pause className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-gray-900 hover:text-gray-900"
            aria-label="다음"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── 개별 슬라이드 카드 ── */
function SlideCard({
  slide,
  locale,
  isActive,
}: {
  slide: Slide;
  locale: string;
  isActive: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${slide.bg} ${
        isActive ? "aspect-[2.2/1] sm:aspect-[2.5/1]" : "aspect-[2.2/1] sm:aspect-[2.5/1] opacity-40"
      }`}
    >
      {/* 장식 */}
      <div
        className="absolute right-[5%] top-1/2 h-[70%] w-[35%] -translate-y-1/2 rounded-full opacity-15 blur-3xl"
        style={{ background: slide.accent }}
      />
      <div
        className="absolute right-[10%] top-[20%] h-40 w-40 rounded-full opacity-10 blur-2xl"
        style={{ background: slide.accent }}
      />

      {/* 텍스트 */}
      {isActive && (
        <div className="relative flex h-full flex-col justify-center px-8 sm:px-12 lg:px-16">
          <span
            className="mb-3 inline-block w-fit rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wider text-white sm:text-xs"
            style={{ backgroundColor: slide.accent }}
          >
            {slide.tag}
          </span>
          <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl lg:text-4xl">
            {slide.title}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/70 sm:text-base lg:text-lg">
            {slide.subtitle}
          </p>
          <Link
            href={`/${locale}${slide.cta.href}`}
            className="mt-5 inline-block w-fit rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:mt-6"
          >
            {slide.cta.label}
          </Link>
        </div>
      )}
    </div>
  );
}
