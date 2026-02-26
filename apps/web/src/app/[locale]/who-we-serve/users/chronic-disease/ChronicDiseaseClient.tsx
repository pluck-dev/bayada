"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Pill,
  Radio,
  Hospital,
  Activity,
  ChevronDown,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { userSegments } from "@/data/audiences";
import { ProcessTimeline, AccordionSection } from "@/components/sections";

const ease = [0.16, 1, 0.3, 1] as const;

const featureIcons = [Stethoscope, Pill, Radio, Hospital, Activity];

function HeroSection({ segment }: { segment: (typeof userSegments)[0] }) {
  const heroPills = [
    { label: "40% 합병증 감소", color: "bg-red-50 text-[#ce0e2d]" },
    { label: "4.8/5.0 만족도", color: "bg-blue-50 text-blue-700" },
    { label: "85% 복약 순응도", color: "bg-green-50 text-green-700" },
  ];

  return (
    <section className="relative bg-white">
      {/* 상단 빨간 액센트 라인 */}
      <div className="h-1 w-full bg-[#ce0e2d]" />

      <div className="mx-auto max-w-[1512px] px-4 py-20 sm:px-6 lg:px-12 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* 좌측 텍스트 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-sm border-l-4 border-[#ce0e2d] pl-3">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
                Clinical Care
              </span>
            </div>

            <h1
              className="font-extrabold leading-[1.1] text-black/[0.87]"
              style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)" }}
            >
              만성질환관리
            </h1>

            <p className="mt-5 text-base leading-relaxed text-black/60 lg:text-lg">
              {segment.contentHeadline}
            </p>

            {/* 스탯 pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {heroPills.map((pill) => (
                <span
                  key={pill.label}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${pill.color}`}
                >
                  {pill.label}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-[13px] text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                맞춤 케어 상담 받기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/* 우측 - 임상 데이터 카드 */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="grid grid-cols-2 gap-4"
          >
            {(segment.stats ?? []).map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1, ease }}
                className="rounded-xl bg-[#f5f7f9] p-5 ring-1 ring-black/5"
              >
                <div
                  className="font-extrabold text-[#ce0e2d]"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
                >
                  {stat.value}
                  {stat.suffix}
                </div>
                <p className="mt-1 text-sm text-black/50">{stat.label}</p>
              </motion.div>
            ))}

            {/* 추가 카드 */}
            <div className="col-span-2 rounded-xl bg-[#ce0e2d]/5 p-5 ring-1 ring-[#ce0e2d]/15">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-[#ce0e2d]" />
                <div>
                  <p className="text-lg font-bold text-black/[0.87]">
                    합병증 조기 발견 시스템
                  </p>
                  <p className="text-sm text-black/50">
                    원격 모니터링으로 이상 징후를 즉시 감지
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DiseaseTabsSection({ segment }: { segment: (typeof userSegments)[0] }) {
  const items = segment.learnMoreItems ?? [];
  const tabs = items.slice(0, 3); // 당뇨병, 고혈압, 치매
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-10 text-center"
        >
          <h2
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            질환별 전문 케어
          </h2>
          <p className="mt-3 text-base text-black/60">
            각 질환의 특성에 맞는 맞춤형 케어 프로토콜을 제공합니다
          </p>
        </motion.div>

        {/* 탭 네비게이션 */}
        <div className="mb-8 flex gap-2 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              type="button"
              key={tab.title}
              onClick={() => setActiveTab(index)}
              className={`shrink-0 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                activeTab === index
                  ? "bg-[#ce0e2d] text-white shadow-sm"
                  : "bg-white text-black/60 ring-1 ring-black/5 hover:bg-[#f5f7f9]"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease }}
            className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5"
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_1px_1fr]">
              <div>
                <h3 className="mb-3 text-xl font-bold text-black/[0.87]">
                  {tabs[activeTab]?.title}
                </h3>
                <p className="text-base leading-relaxed text-black/60">
                  {tabs[activeTab]?.content}
                </p>
              </div>

              {/* 구분선 */}
              <div className="hidden bg-black/5 lg:block" />

              {/* 케어 포인트 */}
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
                  핵심 관리 포인트
                </p>
                <ul className="space-y-3">
                  {["전담 간호사 배정", "주기적 모니터링", "의료기관 연계", "맞춤 생활 코칭"].map(
                    (point) => (
                      <li key={point} className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ce0e2d]" />
                        <span className="text-sm text-black/60">{point}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function NumberedFeatureList({ segment }: { segment: (typeof userSegments)[0] }) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-12"
        >
          <h2
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            전문 케어 서비스
          </h2>
          <p className="mt-3 text-base text-black/60">
            근거 기반 프로토콜로 제공하는 5가지 핵심 서비스
          </p>
        </motion.div>

        <div className="space-y-6">
          {(segment.features ?? []).map((feature, index) => {
            const Icon = featureIcons[index] ?? Stethoscope;
            const num = String(index + 1).padStart(2, "0");

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.08, ease }}
                className="flex items-start gap-6 border-b border-black/5 pb-6 last:border-0 last:pb-0"
              >
                {/* 번호 */}
                <span
                  className="shrink-0 font-extrabold leading-none text-black/[0.06]"
                  style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
                >
                  {num}
                </span>

                {/* 아이콘 + 콘텐츠 */}
                <div className="flex flex-1 items-start gap-5 pt-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                    <Icon className="h-5 w-5 text-[#ce0e2d]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black/[0.87]">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-black/60">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DashboardSection() {
  const metrics = [
    {
      label: "혈압 추이",
      value: "128/82",
      unit: "mmHg",
      status: "정상",
      color: "text-green-600",
      bg: "bg-green-50",
      bars: [65, 70, 60, 75, 68, 72, 65],
    },
    {
      label: "혈당 수치",
      value: "108",
      unit: "mg/dL",
      status: "관리 중",
      color: "text-blue-600",
      bg: "bg-blue-50",
      bars: [80, 90, 70, 85, 75, 80, 78],
    },
    {
      label: "복약 순응도",
      value: "92",
      unit: "%",
      status: "우수",
      color: "text-[#ce0e2d]",
      bg: "bg-red-50",
      bars: [85, 90, 88, 95, 90, 92, 92],
    },
  ];

  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-12 text-center"
        >
          <h2
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            모니터링 대시보드
          </h2>
          <p className="mt-3 text-base text-black/60">
            실시간 건강 지표를 통해 만성질환을 과학적으로 관리합니다
          </p>
        </motion.div>

        {/* 대시보드 UI */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 lg:p-8"
        >
          {/* 상단 헤더 */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black/50">환자 건강 모니터링</p>
              <p className="text-base font-bold text-black/[0.87]">최근 7일 데이터</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 ring-1 ring-green-200">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-green-600">실시간 연결</span>
            </div>
          </div>

          {/* 메트릭 카드들 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {metrics.map((metric, mIndex) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: mIndex * 0.1, ease }}
                className="rounded-xl bg-[#f5f7f9] p-5 ring-1 ring-black/5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-black/50">{metric.label}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${metric.bg} ${metric.color}`}
                  >
                    {metric.status}
                  </span>
                </div>

                {/* 수치 */}
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-black/[0.87]">
                    {metric.value}
                  </span>
                  <span className="ml-1 text-sm text-black/40">{metric.unit}</span>
                </div>

                {/* 미니 바 차트 */}
                <div className="flex items-end gap-1">
                  {metric.bars.map((height, barIndex) => (
                    <motion.div
                      key={barIndex}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: mIndex * 0.1 + barIndex * 0.05,
                        ease,
                      }}
                      className="flex-1 rounded-sm bg-[#ce0e2d]/20"
                      style={{ minHeight: "4px", maxHeight: "40px" }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* 하단 알림 */}
          <div className="mt-4 rounded-xl bg-[#ce0e2d]/5 p-4 ring-1 ring-[#ce0e2d]/15">
            <p className="text-sm font-semibold text-[#ce0e2d]">
              케어팀 알림
            </p>
            <p className="mt-1 text-xs text-black/50">
              오늘 오전 10:23 — 혈압 수치 정상 범위 유지 확인. 담당 간호사
              김지현이 복약 지도 완료.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function BottomCTA({ segment }: { segment: (typeof userSegments)[0] }) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="rounded-2xl bg-[#f5f7f9] p-10 text-center ring-1 ring-black/5 lg:p-16"
        >
          <h2
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            맞춤 만성질환 관리 시작하기
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-black/60">
            전문 케어팀이 귀하의 질환 상태를 분석하고 최적의 케어 플랜을
            제안해 드립니다
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-[13px] text-base font-medium text-white transition-colors hover:bg-[#980019]"
            >
              무료 케어 상담 받기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] px-6 py-[13px] text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
            >
              서비스 요금 보기
            </Link>
          </div>

          {/* 신뢰 항목 */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-black/40">
            {segment.highlights.map((h) => (
              <div key={h} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#ce0e2d]" />
                {h}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function ChronicDiseaseClient({ locale: _locale }: { locale: string }) {
  const segment = userSegments.find((s) => s.slug === "chronic-disease")!;

  return (
    <main>
      {/* 1. 클린 히어로 */}
      <HeroSection segment={segment} />

      {/* 2. 질환별 탭 */}
      <DiseaseTabsSection segment={segment} />

      {/* 3. 번호 붙은 기능 리스트 */}
      <NumberedFeatureList segment={segment} />

      {/* 4. 모니터링 대시보드 */}
      <DashboardSection />

      {/* 5. 4단계 교차 프로세스 */}
      <ProcessTimeline
        title="케어 제공 프로세스"
        subtitle="전문 케어팀과 함께하는 체계적인 만성질환 관리 단계"
        steps={(segment.processSteps ?? []).slice(0, 4)}
        variant="alternating"
      />

      {/* 6. FAQ 아코디언 */}
      <AccordionSection
        title="자주 묻는 질문"
        subtitle="만성질환 케어 서비스에 대한 궁금증을 해소하세요"
        items={(segment.faqs ?? []).map((f) => ({
          title: f.question,
          content: f.answer,
        }))}
        variant="bordered"
      />

      {/* 7. 하단 CTA */}
      <BottomCTA segment={segment} />
    </main>
  );
}
