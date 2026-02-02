"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/animations/FadeIn";

interface AcademyCTAProps {
  locale: string;
}

export function AcademyCTA({ locale }: AcademyCTAProps) {
  return (
    <section className="py-[var(--section-gap)] bg-white">
      <Container>
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-16 sm:px-16">
            {/* 장식 */}
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#ce0e2d]/10 blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-500/10 blur-[80px]" />

            <div className="relative flex flex-col items-center gap-8 md:flex-row md:justify-between">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                  <GraduationCap className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white/80">DeiEdu Academy</span>
                </div>
                <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
                  BAYADA 교육 플랫폼
                </h2>
                <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/60">
                  50년 글로벌 홈헬스케어 노하우를 담은 전문 교육 프로그램.
                  요양보호사, 간호사, 의료 전문가를 위한 체계적인 온라인 교육을 만나보세요.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {["방문간호", "요양보호", "치매케어", "재활운동", "호스피스"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-3">
                <Link
                  href={`/${locale}/platform/deiedu`}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#ce0e2d] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[#b00c27]"
                >
                  교육 시작하기
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={`/${locale}/platform`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-medium text-white/70 transition-all hover:border-white/40 hover:text-white"
                >
                  플랫폼 더보기
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
