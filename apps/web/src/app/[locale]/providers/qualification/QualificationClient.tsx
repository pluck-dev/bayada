"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  FileCheck,
  Award,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Phone,
  Shield,
  Star,
  Clock,
  Clipboard,
  GraduationCap,
  BadgeCheck,
  ChevronDown,
} from "lucide-react";
import { Container } from "@/components/layout/Container";

/* ─────────────────────────────────────────
   데이터
───────────────────────────────────────── */

const stats = [
  { value: "200+", label: "파트너 기관" },
  { value: "95%", label: "갱신율" },
  { value: "전국", label: "서비스 지역" },
];

const applicantTypes = [
  {
    icon: Building2,
    color: "#ce0e2d",
    bg: "#fae6ea",
    title: "의료기관",
    subtitle: "병원, 의원, 요양기관",
    items: ["종합병원 · 병원 · 의원", "노인요양시설 · 요양원", "방문간호센터 · 재활센터"],
  },
  {
    icon: Users,
    color: "#2563eb",
    bg: "#dbeafe",
    title: "전문 인력",
    subtitle: "간호사, 요양보호사, 치료사",
    items: ["등록 간호사 · 간호조무사", "요양보호사 1급 자격자", "물리치료사 · 작업치료사"],
  },
  {
    icon: GraduationCap,
    color: "#16a34a",
    bg: "#dcfce7",
    title: "교육기관",
    subtitle: "간호학원, 요양보호사 교육원",
    items: ["국가 인가 간호 교육기관", "요양보호사 교육원", "헬스케어 직업훈련기관"],
  },
];

const criteriaCategories = [
  {
    title: "기본 요건",
    color: "#ce0e2d",
    bg: "#fae6ea",
    icon: FileCheck,
    items: ["사업자등록증 보유", "관련 면허 및 자격증 보유", "최소 1년 이상 운영 경력", "결격사유 없음"],
  },
  {
    title: "품질 요건",
    color: "#2563eb",
    bg: "#dbeafe",
    icon: Award,
    items: [
      "BAYADA 품질 기준 동의",
      "정기 교육 프로그램 참여",
      "서비스 모니터링 수용",
      "이용자 만족도 관리",
    ],
  },
  {
    title: "운영 요건",
    color: "#16a34a",
    bg: "#dcfce7",
    icon: Clipboard,
    items: [
      "DeiCloud 시스템 사용",
      "보고 체계 준수",
      "배상책임보험 가입",
      "개인정보보호 정책 준수",
    ],
  },
];

const timelineSteps = [
  {
    icon: FileCheck,
    color: "#ce0e2d",
    title: "온라인 지원서 제출",
    description: "아래 양식을 작성하여 온라인으로 지원서를 제출하세요",
    duration: "1일",
  },
  {
    icon: Clipboard,
    color: "#2563eb",
    title: "서류 심사",
    description: "제출된 서류를 바탕으로 기본 자격 요건을 검토합니다",
    duration: "3~5 영업일",
  },
  {
    icon: Shield,
    color: "#d97706",
    title: "현장 방문 심사",
    description: "담당 심사관이 직접 방문하여 운영 현황을 확인합니다",
    duration: "1~2주",
  },
  {
    icon: GraduationCap,
    color: "#7c3aed",
    title: "교육 이수",
    description: "BAYADA 파트너 필수 교육 프로그램을 이수합니다",
    duration: "1주",
  },
  {
    icon: BadgeCheck,
    color: "#16a34a",
    title: "파트너 계약 체결",
    description: "최종 승인 후 파트너십 계약을 체결하고 공식 파트너가 됩니다",
    duration: "1일",
  },
];

const benefits = [
  {
    icon: Award,
    color: "#ce0e2d",
    bg: "#fae6ea",
    title: "BAYADA 브랜드 사용",
    description: "공신력 있는 BAYADA 브랜드와 인증 마크를 파트너 기관에서 활용할 수 있습니다.",
  },
  {
    icon: GraduationCap,
    color: "#2563eb",
    bg: "#dbeafe",
    title: "전문 교육 프로그램",
    description: "최신 홈헬스케어 트렌드와 임상 지식을 습득할 수 있는 전문 교육을 제공합니다.",
  },
  {
    icon: Shield,
    color: "#16a34a",
    bg: "#dcfce7",
    title: "DeiCloud 시스템",
    description: "케어 기록, 스케줄 관리, 청구 처리를 통합 관리하는 디지털 플랫폼을 지원합니다.",
  },
  {
    icon: Star,
    color: "#d97706",
    bg: "#fef3c7",
    title: "마케팅 지원",
    description: "BAYADA 공식 채널을 통한 파트너 소개 및 서비스 홍보 기회를 제공합니다.",
  },
];

const faqs = [
  {
    q: "자격 심사는 얼마나 걸리나요?",
    a: "서류 심사(3~5 영업일)와 현장 방문 심사(1~2주), 교육 이수(1주)를 포함하여 평균 4~6주 소요됩니다. 서류가 완비되고 일정이 원활하게 조율될수록 빠르게 진행됩니다.",
  },
  {
    q: "개인(프리랜서 간호사 등)도 지원할 수 있나요?",
    a: "네, 개인 전문 인력도 지원 가능합니다. 간호사, 요양보호사, 치료사 등 관련 면허 및 자격증을 보유하고 최소 1년 이상 경력이 있는 분이라면 지원하실 수 있습니다.",
  },
  {
    q: "파트너 계약 기간은 얼마인가요?",
    a: "기본 계약 기간은 1년이며, 서비스 품질 기준 충족 시 자동 갱신됩니다. 현재 파트너 갱신율은 95%로 장기적인 협력 관계를 지향합니다.",
  },
  {
    q: "지방 지역도 파트너 신청이 가능한가요?",
    a: "네, 전국 어디서나 파트너 신청이 가능합니다. BAYADA는 전국 네트워크를 통해 지역별 담당자를 배정하여 원활한 파트너십을 지원합니다.",
  },
];

/* ─────────────────────────────────────────
   서브 컴포넌트
───────────────────────────────────────── */

function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({
  children,
  label,
  subtitle,
}: {
  children: React.ReactNode;
  label?: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 text-center">
      {label && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
          {label}
        </p>
      )}
      <h2
        className="font-bold text-black/[0.87]"
        style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
      >
        {children}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm text-black/60 sm:text-base">{subtitle}</p>
      )}
    </div>
  );
}

function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm"
        >
          <button
            className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[#f5f7f9]"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="flex items-start gap-3 pr-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10 text-xs font-bold text-[#ce0e2d]">
                Q
              </span>
              <span className="text-sm font-semibold text-black/[0.87] sm:text-base">
                {item.q}
              </span>
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-black/50 transition-transform ${
                openIndex === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {openIndex === i && (
            <div className="border-t border-black/5 px-6 py-5">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-bold text-[#2563eb]">
                  A
                </span>
                <p className="text-sm leading-relaxed text-black/60">
                  {item.a}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   신청 폼
───────────────────────────────────────── */

function ApplicationForm() {
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#f5f7f9] py-16 text-center ring-1 ring-black/5">
        <CheckCircle2 className="h-14 w-14 text-[#16a34a]" />
        <h3 className="text-xl font-bold text-black/[0.87]">지원서가 제출되었습니다</h3>
        <p className="max-w-sm text-sm text-black/60">
          담당자가 3~5 영업일 내로 연락드리겠습니다. 감사합니다.
        </p>
      </div>
    );
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-black/10 px-4 py-3 text-sm text-black/[0.87] placeholder:text-black/30 focus:border-[#ce0e2d] focus:ring-1 focus:ring-[#ce0e2d] focus:outline-none transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-black/[0.87]">
            기관명 / 성명 <span className="text-[#ce0e2d]">*</span>
          </label>
          <input
            type="text"
            required
            className={inputClass}
            placeholder="기관명 또는 성명을 입력하세요"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black/[0.87]">
            기관 유형 <span className="text-[#ce0e2d]">*</span>
          </label>
          <select
            required
            className={inputClass}
          >
            <option value="">선택하세요</option>
            <option value="medical">의료기관</option>
            <option value="individual">개인 (전문 인력)</option>
            <option value="education">교육기관</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-black/[0.87]">
            대표자명 <span className="text-[#ce0e2d]">*</span>
          </label>
          <input
            type="text"
            required
            className={inputClass}
            placeholder="대표자 성명"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black/[0.87]">
            연락처 <span className="text-[#ce0e2d]">*</span>
          </label>
          <input
            type="tel"
            required
            className={inputClass}
            placeholder="010-0000-0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black/[0.87]">
            이메일 <span className="text-[#ce0e2d]">*</span>
          </label>
          <input
            type="email"
            required
            className={inputClass}
            placeholder="example@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black/[0.87]">주소</label>
          <input
            type="text"
            className={inputClass}
            placeholder="기관 또는 거주 주소"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black/[0.87]">보유 자격 / 면허</label>
        <textarea
          rows={3}
          className={inputClass}
          placeholder="보유하신 자격증, 면허, 인증 등을 기재해 주세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black/[0.87]">지원 동기</label>
        <textarea
          rows={4}
          className={inputClass}
          placeholder="BAYADA 파트너에 지원하시는 동기를 알려주세요"
        />
      </div>

      <label className="flex items-start gap-2.5 text-sm text-black/60">
        <input
          type="checkbox"
          className="mt-0.5 accent-[#ce0e2d]"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>
          개인정보 수집 및 이용에 동의합니다.{" "}
          <span className="text-[#ce0e2d]">*</span>
          <span className="ml-1 text-xs text-black/50">
            (수집 항목: 기관명, 연락처, 이메일 / 이용 목적: 파트너 심사 / 보유 기간: 심사 완료 후 1년)
          </span>
        </span>
      </label>

      <button
        type="submit"
        disabled={!agreed}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019] disabled:cursor-not-allowed disabled:opacity-50"
      >
        제출하기
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────
   메인 클라이언트 컴포넌트
───────────────────────────────────────── */

export function QualificationClient({ locale }: { locale: string }) {
  return (
    <>
      {/* 1. 히어로 */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            {/* 배지 */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ce0e2d]/20 bg-[#ce0e2d]/10 px-4 py-1.5 text-xs font-semibold text-[#ce0e2d]">
              <BadgeCheck className="h-3.5 w-3.5" />
              BAYADA 공식 파트너십 프로그램
            </div>

            <h1
              className="font-bold leading-tight text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              BAYADA 파트너{" "}
              <span className="text-[#ce0e2d]">자격 심사</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-black/60 sm:text-lg">
              함께 최고의 홈헬스케어를 만들어 갑니다
            </p>

            {/* 통계 */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold text-[#ce0e2d]">{s.value}</div>
                  <div className="mt-0.5 text-xs text-black/60">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA 버튼 */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#apply"
                className="flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                지금 신청하기
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#process"
                className="rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
              >
                심사 절차 보기
              </a>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* 2. 지원 대상 */}
      <section className="bg-white py-16 lg:py-24">
        <Container>
          <AnimatedSection>
            <SectionTitle
              label="지원 대상"
              subtitle="BAYADA 파트너가 될 수 있는 기관 및 개인을 안내합니다"
            >
              지원 대상
            </SectionTitle>
          </AnimatedSection>

          <div className="grid gap-6 sm:grid-cols-3">
            {applicantTypes.map((type, i) => {
              const Icon = type.icon;
              return (
                <AnimatedSection key={type.title} delay={i * 0.1}>
                  <div className="flex h-full flex-col rounded-2xl bg-white p-7 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
                    <div
                      className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: type.bg }}
                    >
                      <Icon className="h-7 w-7" style={{ color: type.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-black/[0.87]">{type.title}</h3>
                    <p className="mt-1 text-sm font-medium" style={{ color: type.color }}>
                      {type.subtitle}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {type.items.map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-sm text-black/60">
                          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: type.color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. 자격 기준 */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <Container>
          <AnimatedSection>
            <SectionTitle
              label="자격 기준"
              subtitle="BAYADA 파트너가 되기 위한 핵심 요건을 확인하세요"
            >
              자격 기준
            </SectionTitle>
          </AnimatedSection>

          <div className="grid gap-6 sm:grid-cols-3">
            {criteriaCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <AnimatedSection key={cat.title} delay={i * 0.1}>
                  <div className="h-full rounded-2xl bg-white p-7 shadow-sm ring-1 ring-black/5">
                    <div className="mb-5 flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: cat.bg }}
                      >
                        <Icon className="h-5 w-5" style={{ color: cat.color }} />
                      </div>
                      <h3 className="text-lg font-bold text-black/[0.87]">{cat.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {cat.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-black/60">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0"
                            style={{ color: cat.color }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 4. 심사 절차 타임라인 */}
      <section id="process" className="bg-white py-16 lg:py-24">
        <Container narrow>
          <AnimatedSection>
            <SectionTitle
              label="심사 절차"
              subtitle="온라인 지원부터 계약 체결까지 5단계로 진행됩니다"
            >
              심사 절차
            </SectionTitle>
          </AnimatedSection>

          <div className="space-y-0">
            {timelineSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <AnimatedSection key={step.title} delay={i * 0.08}>
                  <div className="relative flex gap-6 pb-10 last:pb-0">
                    {/* 타임라인 라인 */}
                    {i < timelineSteps.length - 1 && (
                      <div className="absolute left-7 top-14 h-[calc(100%-3.5rem)] w-0.5 bg-black/10" />
                    )}

                    {/* 아이콘 */}
                    <div
                      className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${step.color}18` }}
                    >
                      <Icon className="h-7 w-7" style={{ color: step.color }} />
                    </div>

                    {/* 내용 */}
                    <div className="flex flex-1 items-start justify-between gap-4 pt-2">
                      <div>
                        <span className="text-xs font-bold" style={{ color: step.color }}>
                          STEP {i + 1}
                        </span>
                        <h3 className="mt-0.5 text-lg font-bold text-black/[0.87]">
                          {step.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-black/60">
                          {step.description}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black/60">
                        <Clock className="h-3.5 w-3.5" />
                        {step.duration}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 5. 지원 양식 */}
      <section id="apply" className="bg-[#f5f7f9] py-16 lg:py-24">
        <Container narrow>
          <AnimatedSection>
            <SectionTitle
              label="파트너 신청"
              subtitle="아래 양식을 작성하여 BAYADA 파트너십을 신청하세요"
            >
              파트너 신청
            </SectionTitle>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
              <ApplicationForm />
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* 6. 파트너 혜택 */}
      <section className="bg-white py-16 lg:py-24">
        <Container>
          <AnimatedSection>
            <SectionTitle
              label="파트너 혜택"
              subtitle="BAYADA 공식 파트너가 되어 다양한 혜택을 누리세요"
            >
              파트너 혜택
            </SectionTitle>
          </AnimatedSection>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <AnimatedSection key={b.title} delay={i * 0.1}>
                  <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: b.bg }}
                    >
                      <Icon className="h-6 w-6" style={{ color: b.color }} />
                    </div>
                    <h3 className="font-bold text-black/[0.87]">{b.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-black/60">
                      {b.description}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 7. FAQ */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <Container narrow>
          <AnimatedSection>
            <SectionTitle
              label="FAQ"
              subtitle="자격 심사 절차에 대해 자주 묻는 질문들을 모았습니다"
            >
              자주 묻는 질문
            </SectionTitle>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <FAQAccordion items={faqs} />
          </AnimatedSection>
        </Container>
      </section>

      {/* 8. 문의 CTA */}
      <section className="bg-white py-16 lg:py-24">
        <Container narrow>
          <AnimatedSection>
            <div className="rounded-2xl bg-[#f5f7f9] p-10 text-center ring-1 ring-black/5">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
                문의하기
              </p>
              <h2
                className="mt-3 font-bold text-black/[0.87]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
              >
                궁금한 점이 있으신가요?
              </h2>
              <p className="mt-3 text-sm text-black/60 sm:text-base">
                담당 파트너십 팀이 신속하게 안내해 드리겠습니다
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="tel:16701379"
                  className="flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
                >
                  <Phone className="h-4 w-4" />
                  1670-1379
                </a>
                <a
                  href="mailto:partner@bayada.co.kr"
                  className="rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
                >
                  partner@bayada.co.kr
                </a>
                <Link
                  href={`/${locale}/contact`}
                  className="flex items-center gap-2 rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
                >
                  온라인 문의
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </>
  );
}
