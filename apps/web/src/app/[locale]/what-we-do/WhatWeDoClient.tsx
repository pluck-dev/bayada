"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall,
  ClipboardList,
  HeartPulse,
  Play,
  ChevronRight,
  Check,
  X,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import type { ServiceData } from "@/types";

// ── 애니메이션 variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// ── 숫자 카운팅 훅 ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── 통계 아이템 ───────────────────────────────────────────────────────────────
function StatItem({
  value,
  suffix,
  label,
  started,
  delay = 0,
}: {
  value: number;
  suffix: string;
  label: string;
  started: boolean;
  delay?: number;
}) {
  const [localStart, setLocalStart] = useState(false);
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setLocalStart(true), delay);
    return () => clearTimeout(t);
  }, [started, delay]);
  const count = useCountUp(value, 1600, localStart);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-4xl font-black tracking-tight text-[#ce0e2d] sm:text-5xl">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="text-sm font-medium text-black/50">{label}</span>
    </div>
  );
}

// ── 서비스 카드 ───────────────────────────────────────────────────────────────
function ServiceCard({
  service,
  locale,
  index,
}: {
  service: ServiceData;
  locale: string;
  index: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <Link
        href={`/${locale}/what-we-do/${service.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      >
        {/* 뱃지 */}
        {service.badge && (
          <span className="absolute right-4 top-4 rounded-full bg-[#ce0e2d]/10 px-3 py-1 text-xs font-semibold text-[#ce0e2d]">
            {service.badge}
          </span>
        )}

        {/* 아이콘 */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5f7f9] text-2xl transition-transform duration-300 group-hover:scale-110">
          {service.icon}
        </div>

        {/* 텍스트 */}
        <h3 className="mt-4 text-base font-bold text-black/[0.87] transition-colors group-hover:text-[#ce0e2d]">
          {service.nameEn}
        </h3>
        <p className="mt-0.5 text-xs font-semibold text-[#ce0e2d]/70">
          {service.nameKo}
        </p>
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-black/60">
          {service.description}
        </p>

        {/* 링크 */}
        <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-[#ce0e2d] opacity-0 transition-all duration-200 group-hover:opacity-100">
          자세히 보기
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </motion.div>
  );
}

// ── 메인 클라이언트 컴포넌트 ──────────────────────────────────────────────────
export default function WhatWeDoClient({
  services,
  locale,
}: {
  services: ServiceData[];
  locale: string;
}) {
  const [activeTab, setActiveTab] = useState<"home" | "specialty">("home");
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);

  // 통계 카운트 시작 감지
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const homeServices = services.slice(0, 6);
  const specialtyServices = services.slice(6);
  const featuredService = services[0];
  const gridServices =
    activeTab === "home" ? homeServices.slice(1) : specialtyServices;

  const processSteps = [
    { icon: <PhoneCall className="h-5 w-5" />, title: "상담", desc: "전화·온라인 상담" },
    { icon: <ClipboardList className="h-5 w-5" />, title: "평가", desc: "전문가 방문 평가" },
    { icon: <HeartPulse className="h-5 w-5" />, title: "플랜", desc: "맞춤 케어 설계" },
    { icon: <Play className="h-5 w-5" />, title: "시작", desc: "서비스 즉시 시작" },
  ];

  const comparisonRows = [
    { label: "전문 자격 간호사", general: false, basic: true, premium: true },
    { label: "24시간 긴급 대응", general: false, basic: false, premium: true },
    { label: "개인 맞춤 케어 플랜", general: false, basic: true, premium: true },
    { label: "50년 글로벌 노하우", general: false, basic: true, premium: true },
    { label: "가족 케어 매니저 배정", general: false, basic: false, premium: true },
    { label: "다학제 팀 케어", general: false, basic: false, premium: true },
  ];

  return (
    <>
      {/* ── 1. 히어로 ────────────────────────────────────────────────────────── */}
      <section className="bg-[#f5f7f9] px-4 pt-24 pb-16">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="text-center">
            {/* 라벨 */}
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]"
            >
              BAYADA HOME HEALTH CARE
            </motion.p>

            {/* 타이틀 */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              우리가 하는 일
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-3 max-w-2xl text-base text-black/60"
            >
              50년의 글로벌 경험을 바탕으로 가정에서 제공하는{" "}
              <strong className="font-semibold text-black/[0.87]">12가지 전문 홈헬스케어 서비스</strong>로
              <br className="hidden sm:block" />
              고객 한 분 한 분의 건강과 삶의 질을 높입니다.
            </motion.p>

            {/* CTA 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                <PhoneCall className="h-4 w-4" />
                무료 상담 신청
              </Link>
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
              >
                서비스 둘러보기
                <ChevronRight className="h-4 w-4" />
              </a>
            </motion.div>

            {/* 통계 */}
            <div ref={statsRef}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4"
              >
                <StatItem value={50} suffix="년" label="글로벌 경험" started={statsStarted} delay={0} />
                <StatItem value={12} suffix="가지" label="전문 서비스" started={statsStarted} delay={120} />
                <StatItem value={33000} suffix="+" label="글로벌 전문가" started={statsStarted} delay={240} />
                <StatItem value={22} suffix="개국" label="서비스 국가" started={statsStarted} delay={360} />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. 카테고리 탭 + 피쳐드 서비스 + 그리드 ──────────────────────────── */}
      <section id="services" className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          {/* 섹션 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              Our Services
            </p>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              전문 홈헬스케어 서비스
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
              가정에서 전문적인 의료·요양 서비스를 경험하세요.
            </p>
          </motion.div>

          {/* 탭 */}
          <div className="mb-10 flex justify-center">
            <div className="relative flex rounded-full border border-black/10 bg-[#f5f7f9] p-1">
              {[
                { key: "home", label: "홈헬스케어 서비스" },
                { key: "specialty", label: "전문 서비스" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as "home" | "specialty")}
                  className={`relative z-10 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.key
                      ? "text-white"
                      : "text-black/50 hover:text-black/[0.87]"
                  }`}
                >
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-full bg-[#ce0e2d]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* 피쳐드 서비스 (홈헬스케어 탭에서만) */}
              {activeTab === "home" && (
                <div className="mb-8 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm">
                  <div className="grid lg:grid-cols-2">
                    {/* 이미지 영역 */}
                    <div className="relative min-h-[280px] overflow-hidden bg-[#f5f7f9] lg:min-h-[420px]">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[160px] opacity-10">{featuredService.icon}</span>
                      </div>
                      <div className="absolute inset-0 flex flex-col justify-end p-8">
                        <span className="mb-2 inline-block rounded-full bg-[#ce0e2d]/10 px-3 py-1 text-xs font-semibold text-[#ce0e2d]">
                          대표 서비스
                        </span>
                        <h3
                          className="font-bold text-black/[0.87]"
                          style={{ fontSize: "clamp(1.5rem, 2vw, 2rem)" }}
                        >
                          {featuredService.nameEn}
                        </h3>
                        <p className="text-sm font-medium text-black/50">
                          {featuredService.nameKo}
                        </p>
                      </div>
                    </div>

                    {/* 콘텐츠 영역 */}
                    <div className="flex flex-col justify-center p-8 lg:p-12">
                      <p className="leading-relaxed text-black/60">
                        {featuredService.description}
                      </p>

                      <ul className="mt-6 space-y-3">
                        {featuredService.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                              <Check className="h-3 w-3 text-[#ce0e2d]" />
                            </div>
                            <span className="text-sm text-black/60">{h}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                          href={`/${locale}/what-we-do/${featuredService.slug}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
                        >
                          서비스 자세히 보기
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/${locale}/contact`}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
                        >
                          상담 신청
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 서비스 그리드 */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {gridServices.map((service, i) => (
                  <ServiceCard
                    key={service.slug}
                    service={service}
                    locale={locale}
                    index={i}
                  />
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── 3. How it works ──────────────────────────────────────────────────── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="mb-16 text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              Process
            </p>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              어떻게 시작하나요?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
              4단계의 간단한 프로세스로 전문 홈헬스케어 서비스를 시작하세요.
            </p>
          </motion.div>

          <div className="relative">
            {/* 연결선 */}
            <div className="absolute top-8 left-[calc(12.5%)] right-[calc(12.5%)] hidden h-0.5 bg-[#ce0e2d]/20 md:block" />

            <div className="grid gap-8 md:grid-cols-4">
              {processSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  viewport={{ once: true, margin: "-80px" }}
                  className="flex flex-col items-center text-center"
                >
                  {/* 아이콘 원 */}
                  <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ce0e2d] text-white shadow-sm">
                    {step.icon}
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.87] text-xs font-black text-white">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-black/[0.87]">{step.title}</h3>
                  <p className="mt-2 text-sm text-black/60">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 비교 섹션 ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              Why BAYADA
            </p>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              바야다를 선택해야 하는 이유
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
              일반 요양 서비스와 바야다의 차이를 직접 비교해 보세요.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm"
          >
            {/* 헤더 */}
            <div className="grid grid-cols-4 border-b border-black/5">
              <div className="p-5 text-sm font-semibold text-black/50">항목</div>
              {[
                { label: "일반 요양", sub: "타사 서비스", highlight: false },
                { label: "BAYADA 기본", sub: "표준 케어", highlight: false },
                {
                  label: "BAYADA 프리미엄",
                  sub: "최고 수준 케어",
                  highlight: true,
                },
              ].map((col) => (
                <div
                  key={col.label}
                  className={`p-5 text-center ${col.highlight ? "bg-[#ce0e2d]/5" : ""}`}
                >
                  <p
                    className={`text-sm font-bold ${col.highlight ? "text-[#ce0e2d]" : "text-black/[0.87]"}`}
                  >
                    {col.label}
                  </p>
                  <p className="mt-0.5 text-xs text-black/50">{col.sub}</p>
                </div>
              ))}
            </div>

            {/* 행 */}
            {comparisonRows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 border-b border-black/[0.04] transition-colors hover:bg-black/[0.02] ${
                  i === comparisonRows.length - 1 ? "border-b-0" : ""
                }`}
              >
                <div className="flex items-center p-4 text-sm text-black/60">
                  {row.label}
                </div>
                <div className="flex items-center justify-center p-4">
                  {row.general ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-black/20" />
                  )}
                </div>
                <div className="flex items-center justify-center p-4">
                  {row.basic ? (
                    <Check className="h-5 w-5 text-[#ce0e2d]" />
                  ) : (
                    <X className="h-5 w-5 text-black/20" />
                  )}
                </div>
                <div className="flex items-center justify-center bg-[#ce0e2d]/5 p-4">
                  {row.premium ? (
                    <Check className="h-5 w-5 text-[#ce0e2d]" />
                  ) : (
                    <X className="h-5 w-5 text-black/20" />
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 5. 하단 CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
                Get Started
              </p>
              <h2
                className="font-bold text-black/[0.87]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
              >
                지금 바로 시작하세요
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-black/60">
                전문 상담사가 고객님의 상황에 맞는 최적의 서비스를 안내해 드립니다.
                첫 상담은 무료입니다.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
                >
                  <PhoneCall className="h-5 w-5" />
                  무료 상담 신청
                </Link>
                <Link
                  href={`/${locale}/membership`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
                >
                  <MessageCircle className="h-5 w-5" />
                  AI 상담 시작하기
                </Link>
              </div>

              {/* 신뢰 배지 */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-black/50">
                <span className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-[#ce0e2d]" />
                  무료 첫 상담
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-[#ce0e2d]" />
                  24시간 응대 가능
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-[#ce0e2d]" />
                  전국 서비스
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
