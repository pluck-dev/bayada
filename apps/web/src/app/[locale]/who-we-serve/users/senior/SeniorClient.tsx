"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Syringe,
  UtensilsCrossed,
  Heart,
  Smile,
  Shield,
  Users,
  Phone,
  ClipboardCheck,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { userSegments } from "@/data/audiences";
import {
  ContentImageSplit,
  StatsRow,
  RedBannerCTA,
  DualActionCards,
} from "@/components/sections";

const ease = [0.16, 1, 0.3, 1] as const;

const featureIcons = [Syringe, UtensilsCrossed, Heart, Smile, Shield, Users];

// 이용 절차 단계 아이콘
const processIcons = [Phone, ClipboardCheck, CheckCircle2, Heart, ArrowRight];

function HeroSection({ segment }: { segment: (typeof userSegments)[0] }) {
  return (
    <section className="relative overflow-hidden bg-[#f5f7f9]">
      <div className="relative mx-auto max-w-[1512px] px-4 py-24 sm:px-6 lg:px-12 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* 텍스트 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            {/* 배지 */}
            <span className="inline-block rounded-full bg-[#ce0e2d]/10 px-4 py-1.5 text-sm font-semibold text-[#ce0e2d]">
              시니어 케어
            </span>

            <h1
              className="mt-4 font-extrabold leading-[1.1] text-black/[0.87]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              시니어
            </h1>

            <p
              className="mt-5 whitespace-pre-line font-medium leading-relaxed text-black/60"
              style={{ fontSize: "clamp(1.1rem, 2vw, 1.3rem)" }}
            >
              {segment.contentHeadline}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-[13px] text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                서비스 보기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] px-6 py-[13px] text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
              >
                무료 상담 신청
              </Link>
            </div>

            {/* 신뢰 지표 */}
            <div className="mt-10 flex flex-wrap gap-6">
              {segment.highlights.map((h) => (
                <div key={h} className="flex items-center gap-2 text-sm text-black/50">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#ce0e2d]" />
                  {h}
                </div>
              ))}
            </div>
          </motion.div>

          {/* 이미지 영역 - 따뜻한 카드 스타일 */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
              {/* 이미지 플레이스홀더 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                    <Heart className="h-16 w-16 text-[#ce0e2d]" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-black/40">
                    전문 홈케어 서비스
                  </p>
                </div>
              </div>

              {/* 플로팅 카드 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease }}
                className="absolute bottom-6 left-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black/[0.87]">98% 만족도</p>
                    <p className="text-xs text-black/50">이용자·가족 평가</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease }}
                className="absolute right-6 top-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-[#ce0e2d]">5,000+</p>
                  <p className="text-xs text-black/50">누적 이용자</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureCardsGrid({ segment }: { segment: (typeof userSegments)[0] }) {
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
            BAYADA 시니어 케어 서비스
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-black/60">
            어르신의 삶의 모든 영역을 세심하게 돌보는 통합 케어 서비스입니다
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(segment.features ?? []).map((feature, index) => {
            const Icon = featureIcons[index] ?? Heart;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.08, ease }}
                className="group flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                  <Icon className="h-5 w-5 text-[#ce0e2d]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-black/[0.87]">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-black/60">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({ segment }: { segment: (typeof userSegments)[0] }) {
  const steps = segment.processSteps ?? [];
  return (
    <section className="bg-white py-16 lg:py-24">
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
            이용 절차
          </h2>
          <p className="mt-3 text-base text-black/60">
            간단한 5단계로 전문 케어 서비스를 시작하세요
          </p>
        </motion.div>

        {/* 가로 프로세스 */}
        <div className="relative">
          {/* 연결 점선 (데스크탑) */}
          <div className="absolute left-[10%] right-[10%] top-[22px] hidden h-px border-t-2 border-dashed border-[#ce0e2d]/20 lg:block" />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = processIcons[index] ?? CheckCircle2;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* 아이콘 원 */}
                  <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-[#ce0e2d] shadow-sm">
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  {/* 단계 번호 */}
                  <span className="mt-3 text-xs font-bold uppercase tracking-widest text-[#ce0e2d]">
                    STEP {index + 1}
                  </span>

                  <h3 className="mt-1 text-base font-bold text-black/[0.87]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-black/50">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ segment }: { segment: (typeof userSegments)[0] }) {
  const testimonials = segment.testimonials ?? [];
  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-10 text-center font-bold text-black/[0.87]"
          style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
        >
          이용자 후기
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease }}
              className="relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5"
            >
              {/* 큰 따옴표 장식 */}
              <span
                className="absolute left-6 top-4 font-serif text-7xl leading-none text-[#ce0e2d]/10"
                aria-hidden
              >
                &ldquo;
              </span>

              <p className="relative z-10 text-base leading-relaxed text-black/60">
                {testimonial.quote}
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-black/5 pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                  <span className="text-base font-bold text-[#ce0e2d]">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-black/[0.87]">
                    {testimonial.author}
                  </p>
                  {testimonial.role && (
                    <p className="text-xs text-black/50">{testimonial.role}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LearnMoreSection({ segment }: { segment: (typeof userSegments)[0] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = segment.learnMoreItems ?? [];

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-8 font-bold text-black/[0.87]"
          style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
        >
          더 알아보기
        </motion.h2>

        <div className="space-y-0">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.06, ease }}
              className="border-b border-black/5"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left hover:opacity-70 transition-opacity"
              >
                <span className="text-base font-semibold text-black/[0.87]">
                  {item.title}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5 shrink-0 text-black/40" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm leading-relaxed text-black/60">
                      {item.content}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ segment }: { segment: (typeof userSegments)[0] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = segment.faqs ?? [];

  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
          >
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              자주 묻는 질문
            </h2>
            <p className="mt-3 text-base text-black/60">
              시니어 케어 서비스에 대해 궁금한 점들을 답변드립니다
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="space-y-3"
          >
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left hover:opacity-70 transition-opacity"
                >
                  <span className="text-base font-semibold text-black/[0.87]">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 shrink-0 text-black/40" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-black/60">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function SeniorClient({ locale }: { locale: string }) {
  const segment = userSegments.find((s) => s.slug === "senior")!;

  return (
    <main>
      {/* 1. 히어로 */}
      <HeroSection segment={segment} />

      {/* 2. 케어 여정 */}
      <ContentImageSplit
        title={(segment.contentHeadline ?? "").replace(/\n/g, " ")}
        description={segment.contentDescription ?? ""}
        imageUrl={segment.contentImageUrl ?? "/images/audiences/senior-care.webp"}
        imageAlt="시니어 케어 서비스"
        ctaLabel="자세히 알아보기"
        ctaHref="/contact"
      />

      {/* 3. 6개 기능 카드 3x2 */}
      <FeatureCardsGrid segment={segment} />

      {/* 4. 통계 */}
      <StatsRow stats={segment.stats ?? []} variant="brand" />

      {/* 5. 이용 절차 (5단계 가로) */}
      <ProcessSection segment={segment} />

      {/* 6. 이용자 후기 2개 나란히 */}
      <TestimonialsSection segment={segment} />

      {/* 7. 더 알아보기 아코디언 */}
      <LearnMoreSection segment={segment} />

      {/* 8. FAQ (SPLIT 레이아웃) */}
      <FAQSection segment={segment} />

      {/* 9. RedBannerCTA */}
      <RedBannerCTA
        title={segment.careerTitle ?? "어르신 케어에 헌신하는 분들을 찾습니다"}
        description={segment.careerDescription}
        ctaLabel="채용 정보 보기"
        ctaHref="/careers"
      />

      {/* 10. DualActionCards */}
      <DualActionCards
        locale={locale}
        cards={[
          {
            icon: Phone,
            title: "무료 상담 신청",
            description:
              "케어 매니저가 어르신의 상황에 맞는 최적의 서비스를 안내해 드립니다.",
            ctaLabel: "상담 신청하기",
            ctaHref: "/contact",
          },
          {
            icon: Heart,
            title: "서비스 요금 확인",
            description:
              "장기요양보험 적용 시 합리적인 비용으로 전문 케어를 받을 수 있습니다.",
            ctaLabel: "요금 안내 보기",
            ctaHref: "/services",
          },
        ]}
      />
    </main>
  );
}
