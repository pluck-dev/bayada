"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Home,
  TrendingUp,
  Gift,
  ArrowRight,
  Users,
  Award,
} from "lucide-react";
import Link from "next/link";
import { providerSegments } from "@/data/audiences";
import {
  AccordionSection,
  ChecklistSection,
  RedBannerCTA,
  DualActionCards,
  StatsRow,
} from "@/components/sections";

const ease = [0.16, 1, 0.3, 1] as const;

const featureIconMap = [GraduationCap, Home, TrendingUp, Gift];

const growthMilestones = [
  {
    title: "요양보호사",
    subtitle: "입문 단계",
    description: "체계적인 교육과 전담 코디네이터의 지원으로 현장에 빠르게 적응합니다.",
  },
  {
    title: "팀 리더",
    subtitle: "성장 단계",
    description: "경험을 쌓으며 신규 인력 멘토링과 케어 품질 관리 역할을 담당합니다.",
  },
  {
    title: "슈퍼바이저",
    subtitle: "전문가 단계",
    description: "지역 단위 케어팀을 총괄하며 서비스 품질과 교육 체계를 주도합니다.",
  },
];

export function OtherProfessionalsClient() {
  const segment = providerSegments.find(
    (s) => s.slug === "other-professionals"
  )!;

  const stats = segment.stats ?? [];
  const features = segment.features ?? [];
  const processSteps = segment.processSteps ?? [];
  const learnMoreItems = segment.learnMoreItems ?? [];

  return (
    <main>
      {/* 1. Warm hero */}
      <section className="bg-[#f5f7f9] py-24 lg:py-32">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Text side */}
            <div>
              <motion.span
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease }}
                className="inline-flex items-center gap-2 rounded-full bg-[#ce0e2d]/10 px-4 py-1.5 text-sm font-semibold text-[#ce0e2d]"
              >
                <Users className="h-4 w-4" />
                비의료인 전문가 네트워크
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease }}
                className="mt-5 font-bold text-black/[0.87]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1.1 }}
              >
                비의료인
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease }}
                className="mt-5 max-w-lg text-lg leading-relaxed text-black/60"
              >
                {segment.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease }}
                className="mt-8"
              >
                <Link
                  href="/careers"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ce0e2d] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#980019]"
                >
                  지원하기
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </div>

            {/* Stat highlight side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease }}
              className="flex items-center justify-center"
            >
              <div className="relative flex flex-col items-center justify-center rounded-3xl bg-white px-16 py-16 text-center ring-1 ring-black/5 shadow-sm">
                <Award className="mb-4 h-12 w-12 text-[#ce0e2d]" />
                <div
                  className="font-bold text-[#ce0e2d]"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
                >
                  2,500+
                </div>
                <p className="mt-2 text-base text-black/60">소속 전문가</p>
                <p className="mt-1 text-sm text-black/40">요양보호사 · 사회복지사</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. 성장 스토리 section - left image + right vertical path */}
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
              성장 스토리
            </h2>
            <p className="mt-3 text-base text-black/60">
              BAYADA와 함께라면 요양보호사에서 슈퍼바이저까지 명확한 경로가 열립니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: large image area */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f5f7f9] to-[#e8ecf0]"
              style={{ minHeight: "420px" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                <div className="mb-4 text-7xl">🧑‍🤝‍🧑</div>
                <p className="text-xl font-bold text-black/[0.87]">
                  함께 성장하는 커뮤니티
                </p>
                <p className="mt-2 max-w-xs text-sm text-black/55">
                  2,500명 이상의 전문가가 BAYADA 안에서 서로 배우고 성장합니다.
                </p>
              </div>
            </motion.div>

            {/* Right: vertical milestones path */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              className="flex flex-col justify-center"
            >
              <div className="relative">
                {/* Vertical connector */}
                <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-gray-200" />

                <div className="space-y-8">
                  {growthMilestones.map((milestone, i) => (
                    <motion.div
                      key={milestone.title}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: i * 0.1, ease }}
                      className="flex gap-5"
                    >
                      {/* Circle node */}
                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-sm font-bold text-white shadow-md">
                        {i + 1}
                      </div>
                      <div className="pb-2 pt-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#ce0e2d]">
                          {milestone.subtitle}
                        </span>
                        <h3 className="mt-0.5 text-lg font-bold text-black/[0.87]">
                          {milestone.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-black/60">
                          {milestone.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. 4 feature cards - 2x2 BORDERED variant */}
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
              BAYADA가 제공하는 것
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map((feature, i) => {
              const Icon = featureIconMap[i] ?? GraduationCap;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease }}
                  className="flex gap-5 rounded-2xl border-2 border-gray-200 bg-white p-7 transition-colors hover:border-[#ce0e2d]/40"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#ce0e2d]/20 bg-[#ce0e2d]/5">
                    <Icon className="h-6 w-6 text-[#ce0e2d]" />
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-base font-semibold text-black/[0.87]">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-black/60">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Stats row - brand variant */}
      <StatsRow stats={stats} variant="brand" title="숫자로 보는 BAYADA" />

      {/* 5. "더 알아보기" - Accordion FULL width */}
      <AccordionSection
        title="더 알아보기"
        subtitle="지원 전 알아두면 좋은 정보들을 확인해 보세요."
        items={learnMoreItems.map((item) => ({
          title: item.title,
          content: item.content,
        }))}
        layout="full"
        variant="bordered"
      />

      {/* 6. ChecklistSection - highlights */}
      <ChecklistSection
        title="BAYADA와 함께하면"
        subtitle="비의료 전문인으로서 누릴 수 있는 혜택을 한눈에 확인하세요."
        items={segment.highlights}
        columns={2}
        variant="check"
      />

      {/* 7. 3-step process - VERTICAL variant */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Label column */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="flex flex-col justify-center"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-[#ce0e2d]">
                How to Join
              </p>
              <h2
                className="mt-3 font-bold text-black/[0.87]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
              >
                합류 프로세스
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/60">
                지원부터 현장 배치까지 간단한 3단계로 시작할 수 있습니다.
              </p>
              <Link
                href="/careers"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-[#ce0e2d] px-7 py-[13px] text-sm font-medium text-white transition-colors hover:bg-[#980019]"
              >
                지금 지원하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Vertical steps */}
            <div className="relative">
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-300" />
              <div className="space-y-8">
                {processSteps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease }}
                    className="flex gap-6"
                  >
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#ce0e2d] shadow-md ring-2 ring-[#ce0e2d]">
                      {i + 1}
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm flex-1">
                      <h3 className="text-base font-semibold text-black/[0.87]">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-black/60">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. RedBannerCTA */}
      <RedBannerCTA
        title={segment.careerTitle ?? "비의료 전문인을 위한 커리어를 시작하세요"}
        description={segment.careerDescription}
        ctaLabel={segment.ctaLabel}
        ctaHref="/careers"
      />

      {/* 9. DualActionCards bottom CTA */}
      <DualActionCards
        locale="ko"
        cards={[
          {
            icon: GraduationCap,
            title: "채용 공고 보기",
            description: "현재 채용 중인 요양보호사·사회복지사 포지션을 확인하세요.",
            ctaLabel: "공고 보러 가기",
            ctaHref: "/careers",
          },
          {
            icon: Users,
            title: "상담 신청하기",
            description: "궁금한 점이 있으신가요? 채용 담당자가 친절하게 안내드립니다.",
            ctaLabel: "1:1 상담 신청",
            ctaHref: "/contact",
          },
        ]}
      />
    </main>
  );
}
