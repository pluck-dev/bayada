"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ExternalLink, X } from "lucide-react";

const SLIDES = [
  { src: "/images/hero/hero-1.webp", alt: "BAYADA 홈헬스케어 서비스 1" },
  { src: "/images/hero/hero-2.webp", alt: "BAYADA 홈헬스케어 서비스 2" },
  { src: "/images/hero/hero-3.webp", alt: "BAYADA 홈헬스케어 서비스 3" },
];

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [showJobsPopup, setShowJobsPopup] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-[620px] w-full overflow-hidden bg-white">
      {/* 배경 이미지 슬라이더 */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover object-center"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* 좌측 그라데이션 오버레이 - bayada.com 동일 */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(91deg, rgb(255, 255, 255) 35%, rgba(255, 255, 255, 0.85) 45%, rgba(242, 248, 251, 0) 65%)",
        }}
      />

      {/* 텍스트 콘텐츠 */}
      <div className="relative z-[3] mx-auto flex h-full max-w-screen-xl items-center px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[560px]"
        >
          <h1 className="font-bold leading-[1.1] text-black/[0.87]" style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}>
            무엇보다 소중한 것에
            <br />
            집중할 수 있도록 —
            <br />
            비교할 수 없는 돌봄
          </h1>

          <p className="mt-6 text-base leading-relaxed text-black/60 sm:text-lg">
            사명감과 진심을 바탕으로, 우리는 최고 수준의 홈 헬스케어 서비스를 제공합니다.
            이를 통해 고객과 가족이 안전하고, 편안하며, 독립적인 삶을 유지할 수 있도록 돕습니다.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                document.getElementById("services-by-age")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-[13px] text-base font-medium text-white transition-all duration-300 hover:bg-[#980019] hover:outline hover:outline-4 hover:outline-[rgb(250,230,234)]"
            >
              <Heart className="h-[18px] w-[18px]" />
              서비스 찾기
            </button>

            <button
              type="button"
              onClick={() => setShowJobsPopup(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#dfe6eb] px-6 py-[13px] text-base font-medium text-black/[0.87] transition-all duration-300 hover:bg-[#D6DEE5] hover:outline hover:outline-4 hover:outline-[rgb(244,246,247)]"
            >
              바야다와 함께 일하기
              <ExternalLink className="h-[18px] w-[18px]" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 슬라이드 인디케이터 */}
      <div className="absolute bottom-6 left-1/2 z-[4] flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 bg-[#ce0e2d]"
                : "w-2 bg-black/20 hover:bg-black/40"
            }`}
            aria-label={`슬라이드 ${i + 1}`}
          />
        ))}
      </div>

      {/* 채용 팝업 - Excel F20: 바야다와 함께 일하기 클릭 시 팝업 */}
      <AnimatePresence>
        {showJobsPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowJobsPopup(false)}
          >
            <motion.div
              className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowJobsPopup(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-black/40 transition-colors hover:bg-gray-100 hover:text-black/70"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-bold text-black/[0.87]">
                바야다와 함께 일하기
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-black/60">
                BAYADA에서 의미 있는 커리어를 시작하세요. 현재 채용 중인 포지션을 확인해 보세요.
              </p>

              <div className="mt-6 space-y-3">
                <a
                  href={`/${locale}/careers`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#980019]"
                >
                  국내 채용 정보 보기
                </a>
                <a
                  href="https://jobs.bayada.com/en/jobs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#dfe6eb] px-6 py-3 text-sm font-medium text-black/[0.87] transition-colors hover:bg-[#ccd6de]"
                >
                  글로벌 채용 사이트 (영문)
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
