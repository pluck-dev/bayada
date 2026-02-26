"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Dumbbell,
  Users,
  Link2,
  Phone,
  ArrowRight,
  Quote,
  Building2,
  Heart,
  Stethoscope,
  Wrench,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { userSegments } from "@/data/audiences";
import { StatsRow, DualActionCards } from "@/components/sections";

const ease = [0.16, 1, 0.3, 1] as const;

const featureIcons = [Home, Dumbbell, Users, Link2];

const resourceCategories = [
  {
    icon: Building2,
    title: "복지관",
    desc: "장애인 복지관 및 자립생활센터 연계",
    count: "15+",
  },
  {
    icon: Users,
    title: "활동지원기관",
    desc: "장애인 활동지원 급여 제공 기관 연계",
    count: "20+",
  },
  {
    icon: Stethoscope,
    title: "의료기관",
    desc: "재활의학과·신경과 전문 의료기관 연계",
    count: "12+",
  },
  {
    icon: Wrench,
    title: "보조기기",
    desc: "보조기기 지원 및 교육 기관 연계",
    count: "8+",
  },
];

function HeroSection({ segment }: { segment: (typeof userSegments)[0] }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto max-w-[1512px] px-4 py-24 sm:px-6 lg:px-12 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* 좌측 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            {/* 포용 배지 */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-xs font-bold uppercase tracking-widest text-black/40">
                Empowerment & Inclusion
              </span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <h1
              className="font-extrabold leading-[1.1] text-black/[0.87]"
              style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)" }}
            >
              장애인생활관리
            </h1>

            <p
              className="mt-5 whitespace-pre-line font-medium leading-relaxed text-black/60"
              style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)" }}
            >
              {segment.contentHeadline}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-[13px] text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                서비스 상담 받기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] px-6 py-[13px] text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
              >
                서비스 보기
              </Link>
            </div>
          </motion.div>

          {/* 우측 - 하이라이트 카드 그리드 */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {segment.highlights.map((highlight, index) => (
                <motion.div
                  key={highlight}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + index * 0.1,
                    ease,
                  }}
                  className={`rounded-2xl p-5 ${
                    index % 3 === 0
                      ? "bg-[#ce0e2d]/10 ring-1 ring-[#ce0e2d]/15"
                      : index % 3 === 1
                        ? "bg-[#ce0e2d] text-white"
                        : "bg-[#f5f7f9] ring-1 ring-black/5"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      index % 3 === 1 ? "text-white" : "text-black/[0.87]"
                    }`}
                  >
                    {highlight}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SupportTypesSection({ segment }: { segment: (typeof userSegments)[0] }) {
  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
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
            지원 유형
          </h2>
          <p className="mt-3 text-base text-black/60">
            장애인의 독립적인 삶을 위한 4가지 핵심 지원 서비스
          </p>
        </motion.div>

        <div className="space-y-4">
          {(segment.features ?? []).map((feature, index) => {
            const Icon = featureIcons[index] ?? Home;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: isEven ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease }}
                className="flex items-center gap-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5"
              >
                {/* 아이콘 */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                  <Icon className="h-7 w-7 text-[#ce0e2d]" />
                </div>

                {/* 콘텐츠 */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-black/[0.87]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-black/60">
                    {feature.description}
                  </p>
                </div>

                {/* 화살표 */}
                <div className="hidden shrink-0 rounded-xl bg-[#ce0e2d]/10 p-2 lg:flex">
                  <ArrowRight className="h-5 w-5 text-[#ce0e2d]" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FullWidthTestimonial({ segment }: { segment: (typeof userSegments)[0] }) {
  const testimonial = (segment.testimonials ?? [])[0];
  if (!testimonial) return null;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="relative text-center"
        >
          {/* 큰 따옴표 */}
          <Quote
            className="mx-auto mb-6 h-16 w-16 text-black/10"
            aria-hidden
          />

          <blockquote
            className="mx-auto max-w-3xl font-medium leading-relaxed text-black/[0.87]"
            style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
          >
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-black/10" />
            <div className="text-center">
              <p className="text-base font-bold text-black/[0.87]">
                {testimonial.author}
              </p>
              {testimonial.role && (
                <p className="mt-0.5 text-sm text-black/50">{testimonial.role}</p>
              )}
            </div>
            <div className="h-px w-16 bg-black/10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function VerticalProcessSection({ segment }: { segment: (typeof userSegments)[0] }) {
  const steps = (segment.processSteps ?? []).slice(0, 4);

  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
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
            지원 시작 절차
          </h2>
          <p className="mt-3 text-base text-black/60">
            개인 맞춤 지원 계획부터 서비스 시작까지
          </p>
        </motion.div>

        {/* 왼쪽 타임라인 */}
        <div className="relative max-w-2xl">
          {/* 세로 라인 */}
          <div className="absolute left-5 top-5 h-[calc(100%-2.5rem)] w-0.5 bg-black/10" />

          <div className="space-y-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.12, ease }}
                className="relative flex gap-6"
              >
                {/* 원 */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d] text-sm font-bold text-white shadow-sm">
                  {index + 1}
                </div>

                <div className="pb-2 pt-1.5">
                  <h3 className="text-lg font-bold text-black/[0.87]">
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
    </section>
  );
}

function ResourceDirectory() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-10"
        >
          <h2
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            연계 자원 디렉토리
          </h2>
          <p className="mt-3 text-base text-black/60">
            BAYADA가 연결해 드리는 4가지 핵심 지원 기관 카테고리
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {resourceCategories.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease }}
                className="group cursor-pointer rounded-2xl bg-[#f5f7f9] p-6 ring-1 ring-black/5 transition-all hover:shadow-md hover:ring-black/10"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                    <Icon className="h-5 w-5 text-[#ce0e2d]" />
                  </div>
                  <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-semibold text-black/50">
                    {resource.count}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-black/[0.87]">{resource.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-black/60">
                  {resource.desc}
                </p>

                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-black/40 transition-colors group-hover:text-[#ce0e2d]">
                  기관 연계 요청
                  <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            );
          })}
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
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-8 font-bold text-black/[0.87]"
          style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
        >
          자주 묻는 질문
        </motion.h2>

        <div className="mx-auto max-w-3xl space-y-0">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
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
                    <p className="pb-5 text-sm leading-relaxed text-black/60">
                      {faq.answer}
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

function ExpandableLearnMore({ segment }: { segment: (typeof userSegments)[0] }) {
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.06, ease }}
              className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left hover:opacity-70 transition-opacity"
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
                    <p className="px-5 pb-5 text-sm leading-relaxed text-black/60">
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

export function DisabilityClient({ locale }: { locale: string }) {
  const segment = userSegments.find((s) => s.slug === "disability")!;

  return (
    <main>
      {/* 1. 포용 히어로 */}
      <HeroSection segment={segment} />

      {/* 2. 지원 유형 - 큰 가로 카드 */}
      <SupportTypesSection segment={segment} />

      {/* 3. 통계 (다크 변형) */}
      <StatsRow
        stats={segment.stats ?? []}
        variant="dark"
        title="BAYADA 장애인 케어 성과"
      />

      {/* 4. 풀 와이드 후기 */}
      <FullWidthTestimonial segment={segment} />

      {/* 5. 수직 타임라인 절차 */}
      <VerticalProcessSection segment={segment} />

      {/* 6. 연계 자원 디렉토리 */}
      <ResourceDirectory />

      {/* 7. FAQ */}
      <FAQSection segment={segment} />

      {/* 8. 더 알아보기 (확장 카드) */}
      <ExpandableLearnMore segment={segment} />

      {/* 9. DualActionCards */}
      <DualActionCards
        locale={locale}
        cards={[
          {
            icon: Phone,
            title: "맞춤 지원 상담",
            description:
              "전문 케어 매니저가 장애 유형과 생활 환경에 맞는 지원 계획을 수립해 드립니다.",
            ctaLabel: "상담 신청하기",
            ctaHref: "/contact",
          },
          {
            icon: Heart,
            title: "활동지원급여 안내",
            description:
              "장애인 활동지원급여 신청 방법과 BAYADA 서비스 연계 방법을 안내해 드립니다.",
            ctaLabel: "급여 안내 보기",
            ctaHref: "/services",
          },
        ]}
      />
    </main>
  );
}
