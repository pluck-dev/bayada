"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  HeartPulse,
  FileText,
  Phone,
  ClipboardList,
  Home,
  HeartHandshake,
  Star,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { Container } from "@/components/layout/Container";

/* ─────────────────────────────────────────
   데이터
───────────────────────────────────────── */

const paymentOptions = [
  {
    icon: Shield,
    color: "#ce0e2d",
    bg: "#fae6ea",
    title: "노인장기요양보험",
    description:
      "65세 이상 또는 노인성 질환을 가진 분이 장기요양등급 판정을 받으면 이용 가능합니다.",
    details: [
      { label: "본인부담금", value: "재가급여 15%, 시설급여 20%" },
      { label: "감면혜택", value: "기초생활수급자, 차상위계층 감면" },
    ],
  },
  {
    icon: HeartPulse,
    color: "#2563eb",
    bg: "#dbeafe",
    title: "국민건강보험",
    description:
      "의사 처방에 따른 가정간호 서비스는 국민건강보험이 적용됩니다.",
    details: [
      { label: "적용범위", value: "방문간호, 방문재활 등 의료 서비스" },
      { label: "본인부담금", value: "총 비용의 10~20%" },
    ],
  },
  {
    icon: FileText,
    color: "#16a34a",
    bg: "#dcfce7",
    title: "실비보험 / 민간보험",
    description:
      "가입하신 실비보험 및 민간 의료보험으로 일부 비용을 보장받으실 수 있습니다.",
    details: [
      { label: "확인사항", value: "보험사에 가정간호 보장 여부 확인 필요" },
      { label: "제출서류", value: "진단서, 처방전, 영수증" },
    ],
  },
];

const steps = [
  {
    icon: Phone,
    color: "#ce0e2d",
    title: "상담 신청",
    description: "전화 또는 온라인으로 무료 상담을 신청하세요",
  },
  {
    icon: ClipboardList,
    color: "#2563eb",
    title: "자격 확인",
    description: "보험 자격 및 지원 제도 해당 여부를 확인합니다",
  },
  {
    icon: Home,
    color: "#16a34a",
    title: "방문 평가",
    description: "전문 간호사가 가정을 방문하여 필요한 서비스를 평가합니다",
  },
  {
    icon: HeartHandshake,
    color: "#d97706",
    title: "케어 플랜 수립",
    description: "맞춤형 케어 플랜을 수립하고 비용을 안내합니다",
  },
  {
    icon: Star,
    color: "#7c3aed",
    title: "서비스 시작",
    description: "담당 전문가가 배정되어 서비스가 시작됩니다",
  },
];

const supportPrograms = [
  {
    icon: AlertCircle,
    color: "#ce0e2d",
    bg: "#fae6ea",
    title: "긴급 돌봄 지원",
    description: "갑작스러운 상황에서 긴급하게 돌봄이 필요한 경우 지원",
  },
  {
    icon: Shield,
    color: "#2563eb",
    bg: "#dbeafe",
    title: "저소득 가구 지원",
    description: "소득 기준에 따른 본인부담금 감면 프로그램",
  },
  {
    icon: HeartPulse,
    color: "#16a34a",
    bg: "#dcfce7",
    title: "제약사 협력 프로그램",
    description: "특정 질환 환자를 위한 무상 지원 프로그램",
  },
];

const faqs = [
  {
    q: "장기요양등급은 어떻게 신청하나요?",
    a: "국민건강보험공단(1577-1000)에 신청하거나 가까운 공단 지사를 방문하시면 됩니다. 신청 후 공단 직원이 가정을 방문하여 기능 상태를 조사하고, 등급판정위원회에서 최종 등급을 결정합니다. 바야다 상담팀에서도 신청 절차를 안내해 드립니다.",
  },
  {
    q: "서비스 비용은 대략 얼마인가요?",
    a: "서비스 종류, 이용 시간, 적용 보험에 따라 비용이 다릅니다. 노인장기요양보험 적용 시 본인부담금은 재가급여의 경우 15% 수준이며, 월 이용 한도 내에서 이용하실 수 있습니다. 정확한 비용은 무료 상담을 통해 안내해 드립니다.",
  },
  {
    q: "보험 적용이 안 되는 서비스도 있나요?",
    a: "네, 일부 서비스는 보험 적용이 되지 않아 전액 본인 부담으로 이용하셔야 합니다. 가사 지원, 동행 서비스, 정서 지원 등 일부 항목이 해당될 수 있습니다. 상담 시 보험 적용 여부와 비급여 항목에 대해 상세히 안내해 드립니다.",
  },
  {
    q: "분할 납부가 가능한가요?",
    a: "서비스 유형과 계약 조건에 따라 분할 납부 방식을 협의할 수 있습니다. 경제적 어려움이 있으신 경우 상담 시 말씀해 주시면 가능한 지원 방법을 함께 찾아드립니다.",
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
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-2xl font-bold text-[color:var(--fg)] sm:text-3xl">
        {children}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm text-[color:var(--muted)] sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function FAQAccordionLocal({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-white"
        >
          <button
            className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[color:var(--surface)]"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="flex items-start gap-3 pr-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fae6ea] text-xs font-bold text-[#ce0e2d]">
                Q
              </span>
              <span className="text-sm font-semibold text-[color:var(--fg)] sm:text-base">
                {item.q}
              </span>
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-[color:var(--muted)] transition-transform ${
                openIndex === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {openIndex === i && (
            <div className="border-t border-[color:var(--border)] px-6 py-5">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-bold text-[#2563eb]">
                  A
                </span>
                <p className="text-sm leading-relaxed text-[color:var(--muted)]">
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
   메인 클라이언트 컴포넌트
───────────────────────────────────────── */

export function HowToPayClient({ locale }: { locale: string }) {
  return (
    <>
      {/* 2. 결제 옵션 그리드 */}
      <section className="py-[var(--section-gap)]">
        <Container>
          <AnimatedSection>
            <SectionTitle subtitle="가입하신 보험 및 해당 지원 제도에 따라 비용 부담을 크게 줄일 수 있습니다">
              비용 지원 제도
            </SectionTitle>
          </AnimatedSection>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paymentOptions.map((opt, i) => {
              const Icon = opt.icon;
              return (
                <AnimatedSection key={opt.title} delay={i * 0.1}>
                  <div className="flex h-full flex-col rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    {/* 아이콘 */}
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: opt.bg }}
                    >
                      <Icon className="h-6 w-6" style={{ color: opt.color }} />
                    </div>

                    <h3 className="text-lg font-bold text-[color:var(--fg)]">
                      {opt.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[color:var(--muted)]">
                      {opt.description}
                    </p>

                    {/* 상세 항목 */}
                    <div className="mt-5 space-y-2 rounded-xl bg-[color:var(--surface)] p-4">
                      {opt.details.map((d) => (
                        <div key={d.label} className="flex flex-col gap-0.5">
                          <span
                            className="text-xs font-semibold"
                            style={{ color: opt.color }}
                          >
                            {d.label}
                          </span>
                          <span className="text-sm text-[color:var(--fg)]">
                            {d.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. 서비스 이용 절차 */}
      <section className="bg-[color:var(--surface)] py-[var(--section-gap)]">
        <Container narrow>
          <AnimatedSection>
            <SectionTitle subtitle="간단한 5단계로 서비스를 시작하실 수 있습니다">
              서비스 이용 절차
            </SectionTitle>
          </AnimatedSection>

          <div className="space-y-0">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <AnimatedSection key={step.title} delay={i * 0.08}>
                  <div className="relative flex gap-6 pb-10 last:pb-0">
                    {/* 타임라인 라인 */}
                    {i < steps.length - 1 && (
                      <div className="absolute left-7 top-14 h-[calc(100%-3.5rem)] w-0.5 bg-[color:var(--border)]" />
                    )}

                    {/* 아이콘 */}
                    <div
                      className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${step.color}18` }}
                    >
                      <Icon className="h-7 w-7" style={{ color: step.color }} />
                    </div>

                    {/* 내용 */}
                    <div className="pt-1">
                      <span
                        className="text-xs font-bold"
                        style={{ color: step.color }}
                      >
                        STEP {i + 1}
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-[color:var(--fg)]">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--muted)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 4. 비용 지원 프로그램 */}
      <section className="py-[var(--section-gap)]">
        <Container>
          <AnimatedSection>
            <SectionTitle subtitle="BAYADA는 경제적 부담 없이 필요한 케어를 받으실 수 있도록 다양한 지원 프로그램을 운영합니다">
              비용 지원 프로그램
            </SectionTitle>
          </AnimatedSection>

          <div className="grid gap-5 sm:grid-cols-3">
            {supportPrograms.map((prog, i) => {
              const Icon = prog.icon;
              return (
                <AnimatedSection key={prog.title} delay={i * 0.1}>
                  <div className="flex items-start gap-4 rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: prog.bg }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: prog.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-[color:var(--fg)]">
                        {prog.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">
                        {prog.description}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 5. 비용 관련 FAQ */}
      <section className="bg-[color:var(--surface)] py-[var(--section-gap)]">
        <Container narrow>
          <AnimatedSection>
            <SectionTitle subtitle="비용과 관련하여 자주 묻는 질문들을 모았습니다">
              자주 묻는 질문
            </SectionTitle>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <FAQAccordionLocal items={faqs} />
          </AnimatedSection>
        </Container>
      </section>

      {/* 6. 하단 CTA */}
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          <AnimatedSection>
            <div className="rounded-2xl bg-[#ce0e2d] p-10 text-center text-white">
              <h2 className="text-2xl font-bold sm:text-3xl">
                비용에 대해 더 궁금하신 점이 있으신가요?
              </h2>
              <p className="mt-3 text-sm text-white/80 sm:text-base">
                전문 상담원이 무료로 자세히 안내해 드립니다
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={`/${locale}/contact`}
                  className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#ce0e2d] transition-colors hover:bg-white/90"
                >
                  무료 상담 신청
                </Link>
                <a
                  href="tel:16701379"
                  className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  <Phone className="h-4 w-4" />
                  1670-1379
                </a>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </>
  );
}
