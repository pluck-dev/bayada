"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Phone,
  Mail,
  ArrowRight,
  Check,
  Workflow,
  Database,
  Activity,
} from "lucide-react";
import {
  AccordionSection,
  RedBannerCTA,
} from "@/components/sections";
import { providerSegments } from "@/data/audiences";

const ease = [0.16, 1, 0.3, 1] as const;

// ---------- 섹션 1: 클린 화이트 히어로 ----------
function NursingHero({ locale }: { locale: string }) {
  const segment = providerSegments.find((s) => s.slug === "nursing-visit-center")!;
  const pills = [
    { value: "60+", label: "파트너 센터" },
    { value: "99%", label: "서비스 처리율" },
    { value: "4.8", label: "파트너 만족도" },
  ];

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="max-w-3xl"
        >
          {/* 태그 */}
          <span className="inline-block rounded-full bg-[#ce0e2d]/10 px-4 py-1.5 text-sm font-semibold text-[#ce0e2d]">
            서비스 제공센터
          </span>

          <h1
            className="mt-4 font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            방문간호센터
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-black/60">
            {segment.description}
          </p>

          {/* 스탯 필 3개 인라인 */}
          <div className="mt-8 flex flex-wrap gap-3">
            {pills.map((pill) => (
              <div
                key={pill.label}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-[#f5f7f9] px-5 py-2.5"
              >
                <span className="text-lg font-bold text-[#ce0e2d]">{pill.value}</span>
                <span className="text-sm text-black/60">{pill.label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#980019]"
            >
              파트너십 신청
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/who-we-serve`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-8 py-3.5 text-base font-semibold text-black/70 transition-colors hover:bg-gray-50"
            >
              서비스 둘러보기
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- 섹션 2: 가로 스크롤 피처 카드 ----------
function HorizontalFeatureStrip() {
  const segment = providerSegments.find((s) => s.slug === "nursing-visit-center")!;
  const features = segment.features ?? [];

  return (
    <section className="bg-[#f5f7f9] py-12 lg:py-16">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mb-6 text-sm font-semibold uppercase tracking-widest text-black/40"
        >
          핵심 지원 영역
        </motion.p>

        {/* 가로 스크롤 스트립 */}
        <div className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease }}
              className="w-[280px] shrink-0 snap-start rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:w-[320px]"
            >
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-4 text-base font-bold text-black/[0.87]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-black/60">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- 섹션 3: 지원 체계 비교 테이블 ----------
function SupportTierTable() {
  const tiers = [
    { name: "기본 지원", color: "text-black/60", bg: "bg-gray-50" },
    { name: "프리미엄 지원", color: "text-[#ce0e2d]", bg: "bg-[#ce0e2d]/5" },
    { name: "전담 파트너", color: "text-black/[0.87]", bg: "bg-[#f5f7f9]" },
  ];

  const rows = [
    { item: "숙련 간호사 파견", basic: true, premium: true, dedicated: true },
    { item: "긴급 인력 지원 (24h)", basic: false, premium: true, dedicated: true },
    { item: "정기 역량 교육", basic: true, premium: true, dedicated: true },
    { item: "맞춤 교육 커리큘럼", basic: false, premium: true, dedicated: true },
    { item: "케어 품질 모니터링", basic: false, premium: true, dedicated: true },
    { item: "전담 컨설턴트 배정", basic: false, premium: false, dedicated: true },
    { item: "DeiCloud 시스템 연동", basic: false, premium: true, dedicated: true },
    { item: "월별 성과 리포트", basic: false, premium: true, dedicated: true },
  ];

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
            지원 체계
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
            센터 규모와 필요에 따라 맞춤형 지원 패키지를 선택하세요.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm"
        >
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-1/3 p-5 text-left text-sm font-semibold text-black/40">
                  지원 항목
                </th>
                {tiers.map((tier) => (
                  <th
                    key={tier.name}
                    className={`p-5 text-center text-sm font-bold ${tier.color} ${tier.bg}`}
                  >
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={row.item} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="p-5 font-medium text-black/[0.87]">{row.item}</td>
                  {[row.basic, row.premium, row.dedicated].map((has, ci) => (
                    <td key={ci} className="p-5 text-center">
                      {has ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ce0e2d] text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="text-black/20">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- 섹션 4: 풀-쿼트 테스티모니얼 ----------
function PullQuoteTestimonial() {
  const segment = providerSegments.find((s) => s.slug === "nursing-visit-center")!;
  const testimonial = segment.testimonials?.[0];
  if (!testimonial) return null;

  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="relative mx-auto max-w-4xl"
        >
          {/* 큰 따옴표 장식 */}
          <div
            aria-hidden="true"
            className="absolute -left-2 -top-6 font-serif text-[120px] leading-none text-[#ce0e2d]/15 lg:-left-8 lg:text-[160px]"
          >
            &ldquo;
          </div>

          <div className="relative pl-6 lg:pl-10">
            <blockquote className="text-xl font-medium italic leading-relaxed text-black/[0.87] lg:text-2xl">
              {testimonial.quote}
            </blockquote>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <div className="text-right">
                <p className="text-base font-bold text-black/[0.87]">{testimonial.author}</p>
                {testimonial.role && (
                  <p className="mt-0.5 text-sm text-black/50">{testimonial.role}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- 섹션 5: DeiCloud 연동 ----------
function DeiCloudSection() {
  const benefits = [
    {
      icon: Workflow,
      title: "업무 자동화",
      description: "방문 일정, 케어 기록, 청구 처리를 자동화하여 행정 부담을 최대 60% 줄입니다.",
    },
    {
      icon: Database,
      title: "데이터 동기화",
      description: "간호사·수급자 데이터를 실시간으로 동기화해 정보 오류와 누락을 방지합니다.",
    },
    {
      icon: Activity,
      title: "실시간 모니터링",
      description: "방문 현황, 케어 완료율, 이상 징후를 대시보드에서 즉시 파악합니다.",
    },
  ];

  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          {/* 좌측 텍스트 */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
              DeiCloud 연동
            </span>
            <h2
              className="mt-3 font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              운영 시스템 연동으로<br />센터 효율을 높이세요
            </h2>
            <p className="mt-4 text-base leading-relaxed text-black/60">
              DeiCloud 기반 방문간호 운영 플랫폼과 연동하면 업무 자동화,
              실시간 데이터 공유, 품질 모니터링을 한 화면에서 관리할 수 있습니다.
            </p>
            <Link
              href="#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-7 py-[13px] text-sm font-medium text-white transition-colors hover:bg-[#980019]"
            >
              DeiCloud 도입 문의
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* 우측 혜택 카드 */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease }}
                  className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-black/5 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                    <Icon className="h-5 w-5 text-[#ce0e2d]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-black/[0.87]">{benefit.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-black/60">{benefit.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 섹션 6: 연락처 ----------
function ContactSection({ locale }: { locale: string }) {
  return (
    <section id="contact" className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="text-center"
        >
          <h2
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            지금 바로 연락하세요
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
            파트너십 담당자가 빠르게 답변드립니다.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
          <motion.a
            href="tel:16701379"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-[#f5f7f9] p-8 transition-shadow hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ce0e2d]">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-black/50">전화 문의</p>
              <p className="mt-1 text-xl font-bold text-black/[0.87]">1670-1379</p>
              <p className="mt-0.5 text-xs text-black/40">평일 09:00 – 18:00</p>
            </div>
          </motion.a>

          <motion.a
            href="mailto:partner@bayada.co.kr"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-[#f5f7f9] p-8 transition-shadow hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ce0e2d]">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-black/50">이메일 문의</p>
              <p className="mt-1 text-base font-bold text-black/[0.87]">partner@bayada.co.kr</p>
              <p className="mt-0.5 text-xs text-black/40">24시간 접수 가능</p>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}

// ---------- 메인 컴포넌트 ----------
interface NursingVisitClientProps {
  locale: string;
}

export function NursingVisitClient({ locale }: NursingVisitClientProps) {
  const segment = providerSegments.find((s) => s.slug === "nursing-visit-center")!;

  return (
    <>
      {/* 1. 클린 화이트 히어로 + 3 스탯 필 */}
      <NursingHero locale={locale} />

      {/* 2. 가로 스크롤 피처 카드 스트립 */}
      <HorizontalFeatureStrip />

      {/* 3. 지원 체계 비교 테이블 */}
      <SupportTierTable />

      {/* 4. 풀-쿼트 테스티모니얼 */}
      <PullQuoteTestimonial />

      {/* 5. FAQ 아코디언 - bordered variant */}
      <AccordionSection
        title="자주 묻는 질문"
        subtitle="방문간호센터 파트너십에 대해 궁금한 내용을 확인하세요."
        items={(segment.faqs ?? []).map((faq) => ({
          title: faq.question,
          content: faq.answer,
        }))}
        variant="bordered"
      />

      {/* 6. DeiCloud 연동 섹션 - 다크 배경 */}
      <DeiCloudSection />

      {/* 7. RedBannerCTA */}
      <RedBannerCTA
        title="방문간호센터 파트너십 신청"
        description="BAYADA와 함께 방문간호 서비스 품질을 높이고 운영 효율을 개선하세요. 지금 파트너십을 시작하세요."
        ctaLabel="파트너십 신청하기"
        ctaHref={`/${locale}/contact`}
        features={["숙련 간호사 파견", "전문 교육 지원", "DeiCloud 연동", "24h 긴급 지원"]}
      />

      {/* 8. 연락처 섹션 */}
      <ContactSection locale={locale} />
    </>
  );
}
