import type { WEB_PAGE_DEFAULTS } from "@bayada/shared/web-page-content";
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

const icons: Record<string, typeof Shield> = { Shield, HeartPulse, FileText, Phone, ClipboardList, Home, HeartHandshake, Star, AlertCircle };

export function HowToPayClient({ locale, content }: { locale: string; content: typeof WEB_PAGE_DEFAULTS.payment }) {
  const { paymentOptions, steps, supportPrograms, faqs } = content;
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
              const Icon = icons[opt.icon] ?? Shield;
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
              const Icon = icons[step.icon] ?? Shield;
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
              const Icon = icons[prog.icon] ?? Shield;
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
