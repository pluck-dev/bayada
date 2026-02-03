"use client";

import { Button } from "@bayada/ui";
import { ArrowRight, ChevronDown, PlayCircle } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import type { Dictionary } from "@bayada/shared/i18n";

interface HeroBannerProps {
  locale: string;
  dict: Dictionary;
  stats: { total: number; enrollments: number };
}

export function HeroBanner({ locale, dict, stats }: HeroBannerProps) {
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
      className="relative min-h-[100svh] overflow-hidden bg-[color:var(--text-primary)]"
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0008] via-[#0a0a0a] to-[#0d0d1a]" />

      {/* 패럴랙스 플로팅 장식 */}
      <motion.div
        style={{ x: float1X, y: float1Y }}
        className="absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-[#e31b34]/8 blur-[100px]"
      />
      <motion.div
        style={{ x: float2X, y: float2Y }}
        className="absolute right-[15%] top-[30%] h-56 w-56 rounded-full bg-blue-500/6 blur-[80px]"
      />
      <motion.div
        style={{ x: float3X, y: float3Y }}
        className="absolute bottom-[20%] left-[40%] h-64 w-64 rounded-full bg-[#e31b34]/5 blur-[90px]"
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

      {/* 콘텐츠 */}
      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
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
            <span className="h-1.5 w-1.5 rounded-full bg-[#e31b34] animate-pulse" />
            <span className="text-sm font-medium text-white/70">
              2025년 최신 커리큘럼 업데이트
            </span>
          </motion.div>

          {/* 메인 헤드라인 */}
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
            성장을 위한
            <br />
            <span className="bg-gradient-to-r from-[#e31b34] to-[#ff6b81] bg-clip-text text-transparent">
              가장 확실한 시작
            </span>
          </h1>

          {/* 설명 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-white/50"
          >
            BAYADA Academy는 검증된 전문가들과 함께하는 프리미엄 교육 플랫폼입니다.
            <br />
            지금 바로 당신의 커리어를 한 단계 높여보세요.
          </motion.p>

          {/* CTA 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href={`/${locale}/courses`}
              className="group inline-flex items-center gap-2 rounded-full bg-[#e31b34] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[#a30b24] hover:shadow-lg hover:shadow-[#e31b34]/25"
            >
              {dict.common.courses}
              <PlayCircle className="h-4 w-4 fill-white text-[#e31b34] transition-transform group-hover:scale-110" />
            </Link>
            <Link
              href={`/${locale}/auth/register`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/5"
            >
              {dict.common.register}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-16 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl sm:grid-cols-4"
          >
            <div className="p-5 text-center transition-colors hover:bg-white/5 sm:p-6">
              <p className="text-2xl font-bold tracking-tight text-white">{stats.total}+</p>
              <p className="mt-1 text-xs font-medium text-white/40">{dict.academy.allCourses}</p>
            </div>
            <div className="p-5 text-center transition-colors hover:bg-white/5 sm:p-6">
              <p className="text-2xl font-bold tracking-tight text-white">{stats.enrollments.toLocaleString()}+</p>
              <p className="mt-1 text-xs font-medium text-white/40">{dict.academy.students}</p>
            </div>
            <div className="p-5 text-center transition-colors hover:bg-white/5 sm:p-6">
              <p className="text-2xl font-bold tracking-tight text-white">98%</p>
              <p className="mt-1 text-xs font-medium text-white/40">{dict.academy.completed}</p>
            </div>
            <div className="p-5 text-center transition-colors hover:bg-white/5 sm:p-6">
              <p className="text-2xl font-bold tracking-tight text-white">4.9</p>
              <p className="mt-1 text-xs font-medium text-white/40">평균 만족도</p>
            </div>
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
