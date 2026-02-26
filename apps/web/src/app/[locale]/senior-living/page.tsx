"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  GraduationCap,
  SmilePlus,
  AlertTriangle,
  UserCheck,
  Trophy,
  ClipboardCheck,
  Phone,
  ChevronRight,
  Building2,
  Stethoscope,
  BarChart3,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { CTABanner } from "@/components/shared/CTABanner";

/* ─────────────────────────────────────────────
   데이터
───────────────────────────────────────────── */
const valueProps = [
  {
    icon: Users,
    title: "전문 인력 파견",
    desc: "간호사, 요양보호사 등 검증된 전문 인력을 시설에 파견합니다",
  },
  {
    icon: ShieldCheck,
    title: "품질 관리 시스템",
    desc: "BAYADA 글로벌 품질 기준에 따른 체계적 관리 체계를 구축합니다",
  },
  {
    icon: GraduationCap,
    title: "교육 및 훈련",
    desc: "시설 직원 대상 전문 교육 프로그램을 제공합니다",
  },
];

const partnershipModels = [
  {
    id: "resident",
    label: "상주형",
    icon: Building2,
    title: "상주형 파트너십",
    desc: "BAYADA 전문 인력이 시설에 상주하며 24시간 케어를 제공합니다. 입주자의 일상적 건강 관리부터 응급 상황 대응까지 전 영역을 커버합니다.",
    tags: ["24시간 케어", "응급 대응", "상시 모니터링"],
  },
  {
    id: "visit",
    label: "방문형",
    icon: Stethoscope,
    title: "방문형 파트너십",
    desc: "정기적 방문을 통해 전문 간호 및 재활 서비스를 제공합니다. 시설의 필요에 맞게 방문 빈도와 서비스를 유연하게 조정합니다.",
    tags: ["정기 방문", "재활 서비스", "유연한 스케줄"],
  },
  {
    id: "consulting",
    label: "컨설팅형",
    icon: BarChart3,
    title: "컨설팅형 파트너십",
    desc: "시설 운영 개선, 인력 교육, 품질 관리 컨설팅을 제공합니다. BAYADA의 50년 글로벌 노하우를 바탕으로 시설 경쟁력을 높입니다.",
    tags: ["운영 개선", "인력 교육", "품질 인증"],
  },
];

const benefits = [
  { icon: SmilePlus, text: "입주자 만족도 향상" },
  { icon: AlertTriangle, text: "의료 사고 위험 감소" },
  { icon: UserCheck, text: "전문 인력 채용 부담 경감" },
  { icon: Trophy, text: "시설 경쟁력 강화" },
  { icon: ClipboardCheck, text: "규정 준수 및 인증 지원" },
];

const testimonials = [
  {
    quote:
      "BAYADA와 파트너십을 맺은 이후 입주자 만족도가 30% 이상 향상되었습니다. 전문 인력의 체계적인 케어 덕분에 가족들의 신뢰도 크게 높아졌습니다.",
    author: "OO 실버타운 시설장",
    role: "시설 운영 3년차 파트너",
  },
  {
    quote:
      "전문 간호 인력 파견으로 응급 상황 대응 능력이 크게 향상되었습니다. BAYADA의 교육 프로그램은 우리 직원들의 역량도 함께 키워주었습니다.",
    author: "OO 요양원 대표",
    role: "시설 운영 5년차 파트너",
  },
];

/* ─────────────────────────────────────────────
   서브 컴포넌트: 스크롤 애니메이션 래퍼
───────────────────────────────────────────── */
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   메인 페이지
───────────────────────────────────────────── */
export default function SeniorLivingPage() {
  const [activeTab, setActiveTab] = useState("resident");
  const activeModel = partnershipModels.find((m) => m.id === activeTab)!;

  return (
    <>
      {/* ── 히어로 ── */}
      <PageHero
        title="시니어 리빙 파트너십"
        subtitle="시니어 주거시설과 BAYADA의 전문 케어가 만나 더 나은 돌봄을 실현합니다"
      />

      {/* ── 가치 제안 ── */}
      <section className="py-[var(--section-gap)] bg-[#f5f7f9]">
        <Container>
          <FadeIn>
            <h2 className="text-2xl font-bold text-[color:var(--fg)]">
              시니어 주거시설을 위한 맞춤 솔루션
            </h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              BAYADA는 50년 글로벌 경험을 바탕으로 시니어 주거시설에 특화된
              파트너십 모델을 제공합니다
            </p>
          </FadeIn>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {valueProps.map((vp, i) => {
              const Icon = vp.icon;
              return (
                <FadeIn key={vp.title} delay={i * 0.1}>
                  <div className="h-full rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                      <Icon className="h-6 w-6 text-[#ce0e2d]" />
                    </div>
                    <h3 className="mt-4 font-bold text-[color:var(--fg)]">
                      {vp.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                      {vp.desc}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── 파트너십 모델 ── */}
      <section className="py-[var(--section-gap)]">
        <Container>
          <FadeIn>
            <h2 className="text-2xl font-bold text-[color:var(--fg)]">
              파트너십 모델
            </h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              시설의 규모와 필요에 따라 최적의 파트너십 유형을 선택할 수
              있습니다
            </p>
          </FadeIn>

          {/* 탭 */}
          <FadeIn delay={0.1}>
            <div className="mt-8 flex gap-2 flex-wrap">
              {partnershipModels.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    activeTab === m.id
                      ? "bg-[#ce0e2d] text-white"
                      : "bg-[color:var(--surface)] text-[color:var(--muted)] hover:bg-[#ce0e2d]/10 hover:text-[#ce0e2d]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* 탭 콘텐츠 */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[#f5f7f9] p-8"
          >
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                <activeModel.icon className="h-7 w-7 text-[#ce0e2d]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[color:var(--fg)]">
                  {activeModel.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                  {activeModel.desc}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeModel.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#ce0e2d]/10 px-3 py-1 text-xs font-medium text-[#ce0e2d]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ── 시설 혜택 ── */}
      <section className="py-[var(--section-gap)] bg-[#f5f7f9]">
        <Container>
          <FadeIn>
            <h2 className="text-2xl font-bold text-[color:var(--fg)]">
              파트너 시설의 혜택
            </h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              BAYADA와 함께하면 시설과 입주자 모두가 더 나은 케어 환경을
              경험합니다
            </p>
          </FadeIn>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <FadeIn key={b.text} delay={i * 0.08}>
                  <div className="flex items-center gap-4 rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                      <Icon className="h-5 w-5 text-[#ce0e2d]" />
                    </div>
                    <span className="text-sm font-medium text-[color:var(--fg)]">
                      {b.text}
                    </span>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── 파트너 후기 ── */}
      <section className="py-[var(--section-gap)]">
        <Container>
          <FadeIn>
            <h2 className="text-2xl font-bold text-[color:var(--fg)]">
              파트너 후기
            </h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              BAYADA와 함께하는 시설 파트너들의 실제 경험을 들어보세요
            </p>
          </FadeIn>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-[color:var(--border)] bg-white p-8 shadow-sm">
                  {/* 따옴표 장식 */}
                  <div>
                    <span className="text-5xl font-bold leading-none text-[#ce0e2d]/20">
                      "
                    </span>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                      {t.quote}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 border-t border-[color:var(--border)] pt-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                      <Users className="h-5 w-5 text-[#ce0e2d]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--fg)]">
                        {t.author}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="py-[var(--section-gap)] bg-[#f5f7f9]">
        <Container narrow>
          <FadeIn>
            <div className="rounded-2xl bg-[#ce0e2d] px-8 py-12 text-center">
              <h2 className="text-2xl font-bold text-white">파트너십 문의</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-white/80">
                시니어 주거시설 운영에 BAYADA의 전문성을 더해보세요
              </p>

              {/* 전화번호 */}
              <div className="mt-6 flex items-center justify-center gap-2 text-white">
                <Phone className="h-5 w-5" />
                <a
                  href="tel:16701379"
                  className="text-xl font-bold tracking-wide hover:underline"
                >
                  1670-1379
                </a>
              </div>

              {/* 버튼 */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/ko/contact"
                  className="inline-flex items-center gap-1 rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#ce0e2d] transition-colors hover:bg-white/90"
                >
                  제휴 문의하기
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/ko/partnership"
                  className="rounded-full border border-white/30 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  파트너십 전체 보기
                </Link>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
