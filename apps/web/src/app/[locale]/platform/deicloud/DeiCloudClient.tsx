"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
  BarChart3,
  ChevronDown,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { ContentImageSplit } from "@/components/sections/ContentImageSplit";
import { getPlatformBySlug } from "@/data/platforms";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
  BarChart3,
};

const ease = [0.16, 1, 0.3, 1] as const;

const BEFORE_AFTER = [
  {
    label: "행정 업무",
    before: "10시간/주",
    after: "6시간/주",
    improvement: "40% 절감",
    trend: "down" as const,
  },
  {
    label: "청구 오류율",
    before: "5%",
    after: "0.04%",
    improvement: "99.2% 감소",
    trend: "down" as const,
  },
  {
    label: "기관 매출",
    before: "기준치",
    after: "+18%",
    improvement: "18% 향상",
    trend: "up" as const,
  },
];

function HeroSection({
  stats,
}: {
  stats: NonNullable<ReturnType<typeof getPlatformBySlug>>["stats"];
}) {
  return (
    <section className="bg-[#f5f7f9] py-24 lg:py-36">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          {/* 출시 예정 배지 */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-lg bg-amber-100 px-4 py-2"
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-sm font-medium text-amber-700">
              출시 예정
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.1 }}
          >
            DeiCloud —{" "}
            <span className="text-[#ce0e2d]">운영 SaaS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/60"
          >
            돌봄 기관의 인력 관리, 스케줄링, 청구 정산을 하나의 플랫폼으로.
            행정 업무를 줄이고 케어에 집중하세요.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <a
              href="#early-apply"
              className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
            >
              사전 신청하기
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
            >
              도입 문의
            </a>
          </motion.div>
        </div>

        {/* 4개 스탯 */}
        {stats && stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease }}
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white px-6 py-6 text-center ring-1 ring-black/5 shadow-sm"
              >
                <p className="text-3xl font-bold text-black/[0.87]">
                  {stat.value}
                  <span className="text-[#ce0e2d]">{stat.suffix}</span>
                </p>
                <p className="mt-2 text-xs text-black/50">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function FeatureMatrix({
  features,
}: {
  features: NonNullable<
    ReturnType<typeof getPlatformBySlug>
  >["keyFeatures"];
}) {
  if (!features) return null;

  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-14 text-center"
        >
          <h2
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            핵심 기능
          </h2>
          <p className="mt-3 text-base text-black/60">
            DeiCloud가 제공하는 5가지 운영 혁신 기능
          </p>
        </motion.div>

        <div className="space-y-0 divide-y divide-black/5 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          {features.map((feat, i) => {
            const Icon = ICON_MAP[feat.icon];
            const isReversed = i % 2 === 1;

            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: isReversed ? 24 : -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.05 * i, ease }}
                className={`flex flex-col gap-6 px-8 py-8 sm:flex-row sm:items-center sm:gap-12 ${
                  isReversed ? "sm:flex-row-reverse" : ""
                }`}
              >
                {/* 아이콘 + 타이틀 */}
                <div className="flex shrink-0 items-center gap-4 sm:w-64">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                    {Icon ? (
                      <Icon className="h-5 w-5 text-[#ce0e2d]" />
                    ) : (
                      <span className="text-base">{feat.icon}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-black/[0.87]">
                    {feat.title}
                  </h3>
                </div>

                {/* 설명 */}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-black/60">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TechSpecTable({
  techSpecs,
}: {
  techSpecs: NonNullable<
    ReturnType<typeof getPlatformBySlug>
  >["techSpecs"];
}) {
  if (!techSpecs || techSpecs.length === 0) return null;

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
            기술 사양
          </h2>
          <p className="mt-3 text-base text-black/60">
            엔터프라이즈급 인프라와 보안
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="mx-auto max-w-4xl overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-sm"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5 bg-[#f5f7f9]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-black/50">
                  항목
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black/50">
                  사양
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 bg-white">
              {techSpecs.map((spec, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.06 * i, ease }}
                  className="transition-colors hover:bg-[#f5f7f9]"
                >
                  <td className="px-6 py-5 text-sm font-semibold text-black/[0.87] whitespace-nowrap">
                    {spec.label}
                  </td>
                  <td className="px-6 py-5 font-mono text-sm text-black/60">
                    {spec.value}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
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
            도입 효과
          </h2>
          <p className="mt-3 text-base text-black/60">
            DeiCloud 도입 전후 비교
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {BEFORE_AFTER.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 * i, ease }}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm"
            >
              <div className="px-6 py-5">
                <p className="text-sm font-semibold text-black/40 uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-black/5">
                {/* 이전 */}
                <div className="bg-red-50 px-6 py-6">
                  <p className="mb-1 text-xs font-medium text-red-400">
                    도입 전
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {item.before}
                  </p>
                </div>
                {/* 이후 */}
                <div className="bg-emerald-50 px-6 py-6">
                  <p className="mb-1 text-xs font-medium text-emerald-500">
                    도입 후
                  </p>
                  <p className="text-xl font-bold text-emerald-600">
                    {item.after}
                  </p>
                </div>
              </div>
              {/* 개선치 배너 */}
              <div className="flex items-center justify-center gap-2 bg-[#f5f7f9] px-6 py-3">
                {item.trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                )}
                <span className="text-sm font-bold text-emerald-600">
                  {item.improvement}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({
  faqs,
}: {
  faqs: NonNullable<ReturnType<typeof getPlatformBySlug>>["faqs"];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!faqs || faqs.length === 0) return null;

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
            자주 묻는 질문
          </h2>
        </motion.div>
        <div className="mx-auto max-w-3xl divide-y divide-black/5">
          {faqs.map((faq, i) => (
            <div key={i} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:bg-black/[0.02]"
              >
                <span className="text-base font-semibold text-black/[0.87]">
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <ChevronDown className="h-5 w-5 shrink-0 text-black/40" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <p className="pb-5 text-sm leading-relaxed text-black/60">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EarlyApplySection() {
  return (
    <section
      id="early-apply"
      className="bg-[#f5f7f9] py-20"
    >
      <div className="mx-auto max-w-[1512px] px-4 text-center sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="mb-4 inline-block rounded-lg bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
            초기 도입 할인 혜택
          </span>
          <h2
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            사전 신청하고
            <br />
            출시 혜택을 받으세요
          </h2>
          <p className="mt-4 text-base text-black/60">
            사전 신청 기관에 초기 도입 할인 및 우선 온보딩 지원을 제공합니다
          </p>

          <motion.form
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="mx-auto mt-10 flex max-w-md flex-col gap-4 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="기관 이메일을 입력하세요"
              className="flex-1 rounded-lg bg-white px-5 py-[13px] text-sm text-black/[0.87] placeholder-black/30 ring-1 ring-black/10 outline-none focus:ring-[#ce0e2d]/60 transition-all"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-sm font-medium text-white transition-colors hover:bg-[#980019] whitespace-nowrap"
            >
              사전 신청하기
            </button>
          </motion.form>
          <p className="mt-4 text-xs text-black/40">
            개인정보는 사전 신청 목적으로만 사용되며 안전하게 보호됩니다
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function DeiCloudClient() {
  const platform = getPlatformBySlug("deicloud");
  if (!platform) return null;

  return (
    <main>
      {/* 1. 히어로 */}
      <HeroSection stats={platform.stats} />

      {/* 2. ContentImageSplit */}
      {platform.contentHeadline && platform.contentDescription && platform.contentImageUrl && (
        <ContentImageSplit
          title={platform.contentHeadline}
          description={platform.contentDescription}
          imageUrl={platform.contentImageUrl}
          imageAlt="DeiCloud 플랫폼 소개"
        />
      )}

      {/* 3. 기능 매트릭스 */}
      <FeatureMatrix features={platform.keyFeatures} />

      {/* 4. 기술 사양 테이블 */}
      <TechSpecTable techSpecs={platform.techSpecs} />

      {/* 5. 도입 효과 비포/애프터 */}
      <BeforeAfterSection />

      {/* 6. FAQ */}
      <FaqSection faqs={platform.faqs} />

      {/* 7. 사전 신청 CTA */}
      <EarlyApplySection />
    </main>
  );
}
