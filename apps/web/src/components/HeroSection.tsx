"use client";

import { Button } from "@bayada/ui";
import { ArrowRight, Heart, Shield, Clock } from "lucide-react";
import { useDictionary } from "./DictionaryProvider";

export function HeroSection() {
  const dict = useDictionary();

  return (
    <section className="relative overflow-hidden">
      {/* 그라데이션 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ce0e2d] via-[#a80b24] to-[#7a0819]" />

      {/* 장식 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/20" />
        <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-white/10" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-white/5" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="max-w-3xl">
          {/* 서브 타이틀 */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Heart className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white/90">
              {dict.web.heroDescription}
            </span>
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {dict.web.heroTitle}
          </h1>

          {/* 설명 */}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
            {dict.web.aboutDescription}
          </p>

          {/* CTA 버튼 */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="#contact">
              <Button
                size="lg"
                className="bg-white text-[#ce0e2d] hover:bg-white/90"
              >
                {dict.web.ctaButton}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="#services">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                {dict.web.learnMore}
              </Button>
            </a>
          </div>

          {/* 핵심 가치 지표 */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-sm text-white/70">Years of Experience</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">10,000+</p>
                <p className="text-sm text-white/70">Caregivers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24h</p>
                <p className="text-sm text-white/70">Care Service</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
