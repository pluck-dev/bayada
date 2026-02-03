"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
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
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    accent: "#e31b34",
  },
  {
    tag: "BEST",
    title: "질환교육 시리즈",
    subtitle: "당뇨 · 비만 · 류마티스\n완전 정복 프로그램",
    cta: { label: "시리즈 보기 →", href: "/courses?category=질환교육" },
    bg: "linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #2d4059 100%)",
    accent: "#4ea8de",
  },
  {
    tag: "FREE",
    title: "CIST / MBI 평가 도구 사용법",
    subtitle: "인지기능 및 기동성 평가 도구\n핵심 교육 무료 제공",
    cta: { label: "무료 수강하기 →", href: "/courses?price=free" },
    bg: "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a1a3e 100%)",
    accent: "#a855f7",
  },
  {
    tag: "PSP",
    title: "환자안전 전문가 과정",
    subtitle: "PSP Class로\n케어 품질을 향상시키세요",
    cta: { label: "과정 살펴보기 →", href: "/courses?category=PSP" },
    bg: "linear-gradient(135deg, #1a2e1a 0%, #1b3a2a 50%, #0f4035 100%)",
    accent: "#34d399",
  },
];

const AUTOPLAY_INTERVAL = 5000;
// 슬라이드 1개 너비(%) + 갭
const SLIDE_WIDTH = 84;
const GAP = 1.5;

export function HeroBanner({ locale }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);

  const total = slides.length;

  const next = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((prev) => (prev + 1) % total);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, total]);

  const prev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((prev) => (prev - 1 + total) % total);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, total]);

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

  // 무한 스크롤을 위해 앞뒤로 슬라이드 복제
  // [last, ...slides, first] 형태로 배치
  const extendedSlides = [
    slides[total - 1],
    ...slides,
    slides[0],
  ];

  // translateX 계산: current=0일 때 index 1(첫번째 실제 슬라이드)이 가운데
  // 가운데 정렬: 뷰포트 중앙에 현재 슬라이드가 오도록
  const offset =
    -(current + 1) * (SLIDE_WIDTH + GAP) + (100 - SLIDE_WIDTH) / 2;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#f5f5f7] py-6 sm:py-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 슬라이드 트랙 */}
      <div
        className="flex transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          transform: `translateX(${offset}%)`,
          gap: `${GAP}%`,
        }}
      >
        {extendedSlides.map((slide, i) => {
          const realIndex = i - 1; // 첫번째 복제 슬라이드 offset
          const isActive = realIndex === current;

          return (
            <div
              key={`${slide.tag}-${i}`}
              className="flex-shrink-0 cursor-pointer"
              style={{ width: `${SLIDE_WIDTH}%` }}
              onClick={() => {
                if (!isActive) {
                  if (realIndex > current) next();
                  else prev();
                }
              }}
            >
              <div
                className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
                  isActive
                    ? "scale-100 opacity-100 shadow-2xl"
                    : "scale-[0.96] opacity-50"
                }`}
                style={{
                  background: slide.bg,
                  aspectRatio: "2.4 / 1",
                }}
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

                {/* 텍스트 콘텐츠 */}
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
                  {isActive && (
                    <Link
                      href={`/${locale}${slide.cta.href}`}
                      className="mt-5 inline-block w-fit rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:mt-6"
                    >
                      {slide.cta.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 컨트롤 */}
      <div className="mx-auto mt-4 flex items-center justify-between px-4 sm:mt-5 sm:px-8 lg:px-16" style={{ maxWidth: `${SLIDE_WIDTH + 2}%` }}>
        {/* 슬라이드 카운터 */}
        <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold tabular-nums text-white">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>

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
