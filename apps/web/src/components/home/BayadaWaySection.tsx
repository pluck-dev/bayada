"use client";

import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/animations/FadeIn";

export function BayadaWaySection() {
  return (
    <section className="py-[var(--section-gap)] bg-white">
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
              The BAYADA Way
            </p>
            <blockquote className="mt-8 text-2xl font-light leading-relaxed text-[color:var(--fg)] sm:text-3xl lg:text-4xl">
              &ldquo;BAYADA의 사명은 가정에서 최고 품질의 헬스케어를 제공하여
              모든 사람이 안전하고 편안하며 건강한 삶을 영위하도록 돕는 것입니다.&rdquo;
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-[#ce0e2d]/30" />
              <div>
                <p className="text-sm font-semibold text-[color:var(--fg)]">Mark Baiada</p>
                <p className="text-xs text-[color:var(--muted)]">Founder, BAYADA Home Health Care</p>
              </div>
              <div className="h-px w-12 bg-[#ce0e2d]/30" />
            </div>
          </div>
        </FadeIn>

        {/* 3가지 핵심 가치 */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: "Compassion",
              titleKo: "사랑과 연민",
              description:
                "우리가 돌보는 모든 분을 가족처럼 대하며, 진심 어린 마음으로 케어합니다.",
              color: "#ce0e2d",
            },
            {
              title: "Excellence",
              titleKo: "탁월함",
              description:
                "50년간 축적된 전문성을 바탕으로, 최고 수준의 홈헬스케어 서비스를 제공합니다.",
              color: "#2563eb",
            },
            {
              title: "Reliability",
              titleKo: "신뢰",
              description:
                "일관된 품질과 투명한 운영으로 환자, 가족, 파트너의 신뢰를 지켜갑니다.",
              color: "#16a34a",
            },
          ].map((value, i) => (
            <FadeIn key={value.title} delay={i * 0.15}>
              <div className="text-center">
                <div
                  className="mx-auto h-1 w-12 rounded-full"
                  style={{ backgroundColor: value.color }}
                />
                <h3 className="mt-6 text-xl font-bold text-[color:var(--fg)]">
                  {value.title}
                </h3>
                <p className="text-sm font-medium text-[color:var(--muted)]">
                  {value.titleKo}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)]">
                  {value.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
