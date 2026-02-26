"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ChevronRight,
  CheckCircle2,
  Phone,
  FileText,
  TrendingUp,
  Award,
  BarChart3,
} from "lucide-react";
import {
  HeroWithImage,
  ContentImageSplit,
  ProcessTimeline,
  AccordionSection,
  DualActionCards,
} from "@/components/sections";
import { providerSegments } from "@/data/audiences";

const ease = [0.16, 1, 0.3, 1] as const;

// ---------- 유틸: 숫자 애니메이션 ----------
function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    const numericMatch = value.match(/^[\d,]+/);
    if (!numericMatch) { setDisplay(value); return; }
    const end = parseInt(numericMatch[0].replace(/,/g, ""), 10);
    const remaining = value.slice(numericMatch[0].length);
    const duration = 2000;
    const startTime = Date.now();
    function step() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(eased * end);
      setDisplay(current.toLocaleString() + remaining);
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(end.toLocaleString() + remaining);
    }
    requestAnimationFrame(step);
  }, [isInView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ---------- 섹션 1: 품질 인증 - 번호 스텝 ----------
function QualityCertSection() {
  const segment = providerSegments.find((s) => s.slug === "ltci-center")!;
  const features = segment.features ?? [];

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
          <span className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
            품질 인증
          </span>
          <h2
            className="mt-2 font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            BAYADA 품질 기준으로<br />기관 경쟁력을 높입니다
          </h2>
          <p className="mt-3 max-w-2xl text-base text-black/60">
            글로벌 홈헬스케어 노하우를 바탕으로, 장기요양기관 평가에서
            우수 등급을 달성할 수 있도록 단계별로 지원합니다.
          </p>
        </motion.div>

        {/* 번호 스텝 + 연결선 */}
        <div className="relative">
          {/* 세로 연결선 */}
          <div className="absolute left-[28px] top-10 h-[calc(100%-80px)] w-0.5 bg-[#ce0e2d]/20 lg:left-[36px]" />

          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease }}
                className="flex gap-6 lg:gap-8"
              >
                {/* 번호 배지 */}
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-lg font-bold text-white shadow-sm lg:h-[72px] lg:w-[72px] lg:text-xl">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* 콘텐츠 */}
                <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-black/[0.87]">
                        {feature.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-black/60">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 섹션 2: 통계 대시보드 ----------
function StatsDashboard() {
  const segment = providerSegments.find((s) => s.slug === "ltci-center")!;
  const stats = segment.stats ?? [];

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
            파트너 기관의 성장을 숫자로
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
            BAYADA와 함께한 장기요양기관들의 실제 성과입니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease }}
              className="rounded-2xl bg-white p-6 text-center ring-1 ring-black/5 shadow-sm"
            >
              <div className="text-4xl font-bold tracking-tight text-[#ce0e2d] lg:text-5xl">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-2 text-sm font-medium text-black/60">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- 섹션 3: 파트너 기관 성과 비교 ----------
function PartnerOutcomeSection() {
  const comparisons = [
    {
      label: "평가 등급",
      before: "3~4등급",
      after: "1~2등급",
      icon: Award,
      detail: "정기 평가 기준",
    },
    {
      label: "서비스 만족도",
      before: "74%",
      after: "92%+",
      icon: TrendingUp,
      detail: "이용자·가족 응답",
    },
    {
      label: "직원 역량",
      before: "기본 수준",
      after: "전문 인증 이수",
      icon: BarChart3,
      detail: "연간 교육 기준",
    },
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
          <span className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
            파트너 기관 성과
          </span>
          <h2
            className="mt-2 font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            파트너십 전·후 비교
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-black/60">
            BAYADA 파트너십 적용 기관의 평균 성과 변화입니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {comparisons.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.12, ease }}
                className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm"
              >
                {/* 헤더 */}
                <div className="flex items-center gap-3 bg-[#f5f7f9] px-6 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                    <Icon className="h-5 w-5 text-[#ce0e2d]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black/[0.87]">{item.label}</p>
                    <p className="text-xs text-black/40">{item.detail}</p>
                  </div>
                </div>

                {/* 비교 */}
                <div className="grid grid-cols-2 divide-x divide-gray-100 bg-white">
                  <div className="px-6 py-6 text-center">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-black/40">
                      파트너십 전
                    </p>
                    <p className="text-2xl font-bold text-black/40">{item.before}</p>
                  </div>
                  <div className="px-6 py-6 text-center">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#ce0e2d]">
                      파트너십 후
                    </p>
                    <p className="text-2xl font-bold text-[#ce0e2d]">{item.after}</p>
                  </div>
                </div>

                {/* 개선 화살표 */}
                <div className="flex items-center justify-center gap-2 border-t border-gray-100 bg-[#ce0e2d]/5 px-6 py-3">
                  <CheckCircle2 className="h-4 w-4 text-[#ce0e2d]" />
                  <span className="text-sm font-medium text-[#ce0e2d]">지속적 개선</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------- 메인 컴포넌트 ----------
interface LtciClientProps {
  locale: string;
}

export function LtciClient({ locale }: LtciClientProps) {
  const segment = providerSegments.find((s) => s.slug === "ltci-center")!;

  return (
    <>
      {/* 1. Hero - gradient variant */}
      <HeroWithImage
        title="노인장기요양센터"
        subtitle={segment.description}
        imageUrl={segment.image}
        variant="gradient"
        ctaLabel={segment.ctaLabel}
        ctaHref={`/${locale}${segment.ctaHref}`}
        locale={locale}
        breadcrumbs={[
          { label: "서비스 대상", href: `/${locale}/who-we-serve` },
          { label: "서비스 제공기관", href: `/${locale}/who-we-serve/providers` },
          { label: "서비스 제공센터", href: `/${locale}/who-we-serve/providers/service-provision-centers` },
          { label: "노인장기요양센터", href: `/${locale}/who-we-serve/providers/service-provision-centers/ltci` },
        ]}
      />

      {/* 2. ContentImageSplit */}
      <ContentImageSplit
        title={segment.contentHeadline ?? "노인장기요양센터 파트너십"}
        description={
          "BAYADA는 장기요양기관이 최고 수준의 서비스를 제공할 수 있도록 인력 교육, 운영 컨설팅, 품질 인증 프로그램을 통합 지원합니다. 기관 평가에서 우수 등급을 달성하고 지속적인 성장을 이뤄나갈 수 있도록 함께합니다."
        }
        imageUrl={segment.image ?? "/images/audiences/ltci-center.jpg"}
        imageAlt="노인장기요양센터 파트너십"
      />

      {/* 3. 품질 인증 - 번호 스텝 */}
      <QualityCertSection />

      {/* 4. 통계 대시보드 - 다크 배경 */}
      <StatsDashboard />

      {/* 5. 프로세스 타임라인 - alternating */}
      <ProcessTimeline
        title="파트너십 프로세스"
        subtitle="상담 신청부터 지속적인 파트너십까지, 단계별로 함께합니다."
        steps={segment.processSteps ?? []}
        variant="alternating"
      />

      {/* 6. 더 알아보기 아코디언 - split layout */}
      <AccordionSection
        title="더 알아보기"
        subtitle="파트너십에 대해 궁금한 내용을 확인하세요."
        items={(segment.learnMoreItems ?? []).map((item) => ({
          title: item.title,
          content: item.content,
        }))}
        layout="split"
      />

      {/* 7. 파트너 기관 성과 비교 */}
      <PartnerOutcomeSection />

      {/* 8. DualActionCards CTA */}
      <DualActionCards
        locale={locale}
        cards={[
          {
            icon: Phone,
            title: "파트너십 상담 신청",
            description: "BAYADA 파트너십 담당자에게 연락하여 기관 현황과 필요 사항을 공유해 주세요.",
            ctaLabel: "상담 신청하기",
            ctaHref: `/${locale}/contact`,
          },
          {
            icon: FileText,
            title: "파트너십 자료 다운로드",
            description: "장기요양기관 품질 인증 프로그램, 교육 커리큘럼 등 상세 자료를 확인하세요.",
            ctaLabel: "자료 보기",
            ctaHref: `/${locale}/resources`,
          },
        ]}
      />
    </>
  );
}
