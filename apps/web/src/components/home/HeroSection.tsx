"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ExternalLink } from "lucide-react";

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
            Care Beyond Compare—
            <br />
            가족이 소중한 순간에
            <br />
            집중할 수 있도록.
          </h1>

          <p className="mt-6 text-base leading-relaxed text-black/60 sm:text-lg">
            전 세계 360개 이상의 사무소, 33,000명의 전문 인력.
            BAYADA가 만드는 홈헬스케어의 새로운 기준.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/who-we-serve/users`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-[13px] text-base font-medium text-white transition-all duration-300 hover:bg-[#980019] hover:outline hover:outline-4 hover:outline-[rgb(250,230,234)]"
            >
              <Heart className="h-[18px] w-[18px]" />
              서비스 알아보기
            </Link>

            <Link
              href={`/${locale}/who-we-serve/providers`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#dfe6eb] px-6 py-[13px] text-base font-medium text-black/[0.87] transition-all duration-300 hover:bg-[#D6DEE5] hover:outline hover:outline-4 hover:outline-[rgb(244,246,247)]"
            >
              함께 일하기
              <ExternalLink className="h-[18px] w-[18px]" />
            </Link>
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
    </section>
  );
}
