"use client";

import { Zap, ShieldCheck, Heart, TrendingUp } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/animations/FadeIn";

const pillars = [
  {
    icon: Zap,
    title: "Efficiency",
    titleKo: "효율성",
    description: "디지털 기술과 50년 운영 노하우를 결합하여 최적화된 케어 전달 시스템을 구축합니다.",
    color: "#f59e0b",
    bg: "#fef3c7",
  },
  {
    icon: ShieldCheck,
    title: "Quality",
    titleKo: "품질",
    description: "표준화된 교육과 품질 관리 시스템으로 어디서나 일관된 최고 수준의 서비스를 보장합니다.",
    color: "#2563eb",
    bg: "#dbeafe",
  },
  {
    icon: Heart,
    title: "Trust",
    titleKo: "신뢰",
    description: "투명한 운영, 전문 인력 검증, 실시간 모니터링으로 환자와 가족의 신뢰를 지킵니다.",
    color: "#ce0e2d",
    bg: "#fae6ea",
  },
  {
    icon: TrendingUp,
    title: "Scalability",
    titleKo: "확장성",
    description: "글로벌 네트워크와 기술 플랫폼을 기반으로 다양한 지역과 서비스로 확장 가능합니다.",
    color: "#16a34a",
    bg: "#dcfce7",
  },
];

export function WhyBayada() {
  return (
    <section className="py-[var(--section-gap)] bg-[color:var(--surface)]">
      <Container>
        <FadeIn>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
              Why BAYADA
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[color:var(--fg)] sm:text-4xl">
              BAYADA를 선택해야 하는 이유
            </h2>
            <p className="mt-4 text-[color:var(--muted)]">
              4가지 핵심 역량으로 차별화된 홈헬스케어를 제공합니다
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => (
            <FadeIn key={pillar.title} delay={i * 0.1}>
              <div className="group rounded-2xl bg-white p-8 transition-all hover:shadow-[var(--shadow-medium)]">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: pillar.bg }}
                >
                  <pillar.icon className="h-7 w-7" style={{ color: pillar.color }} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-[color:var(--fg)]">
                  {pillar.title}
                </h3>
                <p className="text-sm font-medium text-[color:var(--muted)]">
                  {pillar.titleKo}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)]">
                  {pillar.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
