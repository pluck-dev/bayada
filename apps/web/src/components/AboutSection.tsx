"use client";

import { CheckCircle, Users, Award, Globe } from "lucide-react";
import { useDictionary } from "./DictionaryProvider";

export function AboutSection() {
  const dict = useDictionary();

  return (
    <section id="about" className="bg-[color:var(--surface)] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* 왼쪽: 텍스트 콘텐츠 */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#ce0e2d]">
              About BAYADA
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[color:var(--fg)] sm:text-4xl">
              {dict.web.aboutTitle}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[color:var(--muted)]">
              {dict.web.aboutDescription}
            </p>

            {/* 핵심 수치 */}
            <div className="mt-8 grid grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#ce0e2d]" />
                  <span className="text-2xl font-bold text-[color:var(--fg)]">
                    23
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#ce0e2d]" />
                  <span className="text-2xl font-bold text-[color:var(--fg)]">
                    30,000+
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#ce0e2d]" />
                  <span className="text-2xl font-bold text-[color:var(--fg)]">
                    50+
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 미션 카드 */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-[#ce0e2d] to-[#a80b24] p-8 text-white">
              <h3 className="text-lg font-bold">BAYADA Mission</h3>
              <p className="mt-3 text-base leading-relaxed text-white/90">
                {dict.web.ctaDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
