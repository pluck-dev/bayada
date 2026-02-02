"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 플로팅 요소 패럴랙스
  const float1X = useTransform(mouseX, [0, 1], [-15, 15]);
  const float1Y = useTransform(mouseY, [0, 1], [-15, 15]);
  const float2X = useTransform(mouseX, [0, 1], [10, -10]);
  const float2Y = useTransform(mouseY, [0, 1], [10, -10]);
  const float3X = useTransform(mouseX, [0, 1], [-8, 8]);
  const float3Y = useTransform(mouseY, [0, 1], [8, -8]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] overflow-hidden bg-[color:var(--fg)]"
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0008] via-[#0a0a0a] to-[#0d0d1a]" />

      {/* 플로팅 장식 요소 */}
      <motion.div
        style={{ x: float1X, y: float1Y }}
        className="absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-[#ce0e2d]/8 blur-[100px]"
      />
      <motion.div
        style={{ x: float2X, y: float2Y }}
        className="absolute right-[15%] top-[30%] h-56 w-56 rounded-full bg-blue-500/6 blur-[80px]"
      />
      <motion.div
        style={{ x: float3X, y: float3Y }}
        className="absolute bottom-[20%] left-[40%] h-64 w-64 rounded-full bg-[#ce0e2d]/5 blur-[90px]"
      />

      {/* 격자 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          {/* 태그라인 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#ce0e2d] animate-pulse" />
            <span className="text-sm font-medium text-white/70">
              50 Years of Home Health Care Excellence
            </span>
          </motion.div>

          {/* 메인 헤드라인 */}
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
            Better Health,
            <br />
            <span className="bg-gradient-to-r from-[#ce0e2d] to-[#ff6b81] bg-clip-text text-transparent">
              Better Life
            </span>
            <br />
            at Home.
          </h1>

          {/* 설명 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-white/50"
          >
            전 세계 360개 이상의 사무소, 33,000명의 전문 인력.
            <br />
            BAYADA가 만드는 홈헬스케어의 새로운 기준.
          </motion.p>

          {/* 3개 CTA 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href={`/${locale}/who-we-serve/users`}
              className="group inline-flex items-center gap-2 rounded-full bg-[#ce0e2d] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[#b00c27] hover:shadow-lg hover:shadow-[#ce0e2d]/25"
            >
              서비스 이용하기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={`/${locale}/who-we-serve/providers`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/5"
            >
              서비스 제공하기
            </Link>
            <Link
              href={`/${locale}/who-we-serve/providers/local-government`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-4 text-sm font-medium text-white/70 transition-all hover:border-white/30 hover:text-white"
            >
              지자체 협력
            </Link>
          </motion.div>
        </motion.div>

        {/* 스크롤 인디케이터 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-white/30">Scroll</span>
            <ChevronDown className="h-4 w-4 text-white/30" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
