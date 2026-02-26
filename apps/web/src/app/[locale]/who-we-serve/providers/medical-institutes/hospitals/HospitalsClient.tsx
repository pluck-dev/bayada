"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Phone,
  TrendingDown,
  Star,
  BarChart3,
  FileText,
  Users,
  MessageSquare,
  ChevronRight,
  Building2,
  ClipboardList,
} from "lucide-react";
import { providerSegments } from "@/data/audiences";
import {
  ContentImageSplit,
  DualActionCards,
  TabPanels,
} from "@/components/sections";

const ease = [0.16, 1, 0.3, 1] as const;

// 카운터 훅
function useCounter(target: number, duration = 1800, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);
  return count;
}

// 메트릭 카드
function MetricCard({
  before,
  after,
  label,
  suffix,
  icon: Icon,
  delay,
  trigger,
}: {
  before: number;
  after: number;
  label: string;
  suffix: string;
  icon: React.ElementType;
  delay: number;
  trigger: boolean;
}) {
  const afterCount = useCounter(after, 1600, trigger);
  const beforeCount = useCounter(before, 1200, trigger);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease }}
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ce0e2d]/10">
          <Icon className="h-5 w-5 text-[#ce0e2d]" />
        </div>
        <span className="text-sm font-medium text-black/50">{label}</span>
      </div>

      {/* before → after */}
      <div className="flex items-end gap-3">
        <div className="text-center">
          <p className="text-xs text-black/40">도입 전</p>
          <p className="text-2xl font-bold text-black/30">
            {beforeCount}
            {suffix}
          </p>
        </div>
        <ChevronRight className="mb-2 h-5 w-5 text-[#ce0e2d]" />
        <div className="text-center">
          <p className="text-xs text-[#ce0e2d]">도입 후</p>
          <p className="text-3xl font-bold text-black/[0.87]">
            {afterCount}
            {suffix}
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-[#ce0e2d]"
          initial={{ width: 0 }}
          animate={trigger ? { width: `${(after / (before || 100)) * 100}%` } : { width: 0 }}
          transition={{ duration: 1.5, delay: delay + 0.3, ease }}
          style={{ maxWidth: "100%" }}
        />
      </div>
    </motion.div>
  );
}

export default function HospitalsClient({ locale }: { locale: string }) {
  const segment = providerSegments.find((s) => s.slug === "hospitals")!;

  // 메트릭 섹션 트리거
  const metricRef = useRef<HTMLDivElement>(null);
  const metricInView = useInView(metricRef, { once: true, margin: "-80px" });

  // 탭: learnMoreItems
  const tabs =
    segment.learnMoreItems?.map((item, i) => ({
      id: `tab-${i}`,
      label: item.title,
      content: (
        <div className="rounded-xl bg-[#f5f7f9] p-6 text-base leading-relaxed text-black/70">
          {item.content}
        </div>
      ),
    })) ?? [];

  const stats = segment.stats ?? [];

  return (
    <main>
      {/* 1. 라이트 히어로 */}
      <section className="relative overflow-hidden bg-[#f5f7f9] py-20 lg:py-28">
        <div className="relative mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]"
            >
              Hospital Partnership
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              className="font-bold leading-[1.1] text-black/[0.87]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              {segment.nameKo}을 위한
              <br />
              <span className="text-[#ce0e2d]">전환의료 파트너십</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              className="mt-5 max-w-xl text-base leading-relaxed text-black/60"
            >
              {segment.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="mt-8"
            >
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-7 py-[13px] text-sm font-medium text-white transition-colors hover:bg-[#980019]"
              >
                <Phone className="h-4 w-4" />
                파트너십 문의
              </Link>
            </motion.div>
          </div>

          {/* 인라인 통계 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease }}
            className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white p-4 ring-1 ring-black/5 shadow-sm"
              >
                <p className="text-2xl font-bold text-[#ce0e2d]">
                  {stat.value}
                  {stat.suffix ?? ""}
                </p>
                <p className="mt-1 text-xs text-black/50">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. ContentImageSplit */}
      <ContentImageSplit
        title={segment.contentHeadline ?? ""}
        description={segment.contentDescription ?? ""}
        imageUrl={segment.image}
        imageAlt={segment.nameKo}
      />

      {/* 3. 파트너십 효과 대시보드 */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24" ref={metricRef}>
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
              파트너십 효과
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
              BAYADA 파트너 병원의 실제 개선 데이터입니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: TrendingDown,
                label: "30일 재입원율",
                before: 18,
                after: 12,
                suffix: "%",
                delay: 0,
              },
              {
                icon: Star,
                label: "환자 만족도",
                before: 72,
                after: 91,
                suffix: "점",
                delay: 0.1,
              },
              {
                icon: BarChart3,
                label: "전환의료 성공률",
                before: 65,
                after: 92,
                suffix: "%",
                delay: 0.2,
              },
              {
                icon: Users,
                label: "케어 연속성 유지",
                before: 58,
                after: 96,
                suffix: "%",
                delay: 0.3,
              },
            ].map((m) => (
              <MetricCard key={m.label} {...m} trigger={metricInView} />

            ))}
          </div>
        </div>
      </section>

      {/* 4. 파트너십 프로세스 수평 타임라인 */}
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
              {segment.processTitle ?? "파트너십 프로세스"}
            </h2>
          </motion.div>

          <div className="relative">
            {/* 연결선 (데스크탑) */}
            <div
              className="absolute left-0 right-0 top-[2.25rem] hidden h-px bg-[#ce0e2d]/20 lg:block"
              aria-hidden
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {(segment.processSteps ?? []).map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* 스텝 번호 원 */}
                  <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-[#ce0e2d] shadow-sm">
                    <span className="text-lg font-bold text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-black/[0.87]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/55">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. 케이스 스터디 testimonial */}
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
              파트너 병원 사례
            </h2>
          </motion.div>

          {(segment.testimonials ?? []).map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center ring-1 ring-black/5 shadow-sm md:p-12"
            >
              <MessageSquare className="mx-auto mb-6 h-8 w-8 text-[#ce0e2d]" />
              <blockquote className="text-lg leading-relaxed text-black/60 md:text-xl">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-8 border-t border-black/5 pt-6">
                <p className="text-base font-bold text-black/[0.87]">{t.author}</p>
                <p className="mt-1 text-sm text-[#ce0e2d]">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. 자주 묻는 질문 (TabPanels) */}
      {tabs.length > 0 && (
        <TabPanels title="자주 묻는 질문" tabs={tabs} variant="pill" />
      )}

      {/* 7. 파트너 병원 문의 폼 */}
      <section id="contact" className="bg-[#f5f7f9] py-16 lg:py-24">
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
              파트너 병원 문의
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-black/60">
              파트너십에 관심이 있으신 병원 담당자분께서는 아래 양식을 작성해
              주시면 담당자가 연락드립니다.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10"
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-black/70">
                    담당자 성함
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-[#f5f7f9] px-4 py-3">
                    <Users className="h-4 w-4 text-black/30" />
                    <span className="text-sm text-black/30">홍길동</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-black/70">
                    병원명
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-[#f5f7f9] px-4 py-3">
                    <Building2 className="h-4 w-4 text-black/30" />
                    <span className="text-sm text-black/30">○○ 병원</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-black/70">
                  연락처
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-[#f5f7f9] px-4 py-3">
                  <Phone className="h-4 w-4 text-black/30" />
                  <span className="text-sm text-black/30">010-0000-0000</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-black/70">
                  문의 내용
                </label>
                <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-[#f5f7f9] px-4 py-3">
                  <ClipboardList className="mt-0.5 h-4 w-4 text-black/30" />
                  <span className="text-sm text-black/30">
                    파트너십 관련 문의 사항을 입력해 주세요.
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-lg bg-[#ce0e2d] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#980019]"
              >
                문의 보내기
              </button>
              <p className="text-center text-xs text-black/40">
                또는{" "}
                <a
                  href="tel:16701379"
                  className="font-semibold text-[#ce0e2d] hover:underline"
                >
                  1670-1379
                </a>
                로 전화 주세요.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. DualActionCards */}
      <DualActionCards
        locale={locale}
        cards={[
          {
            icon: FileText,
            title: "파트너십 상세 자료 받기",
            description:
              "전환의료 파트너십 효과 리포트와 도입 가이드를 이메일로 받아보세요.",
            ctaLabel: "자료 요청하기",
            ctaHref: "/contact",
          },
          {
            icon: Phone,
            title: "전문 상담사와 직접 상담",
            description:
              "병원 규모와 니즈에 맞는 맞춤 파트너십 방안을 상담해 드립니다.",
            ctaLabel: "전화 상담 예약",
            ctaHref: "tel:16701379",
          },
        ]}
      />
    </main>
  );
}
