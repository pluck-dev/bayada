"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Calendar,
  BookOpen,
  Globe,
  Users,
  TrendingUp,
  Quote,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { providerSegments } from "@/data/audiences";
import {
  ContentImageSplit,
  RedBannerCTA,
} from "@/components/sections";

const ease = [0.16, 1, 0.3, 1] as const;

const featureIconMap = [
  DollarSign,
  Calendar,
  BookOpen,
  Globe,
  Users,
  TrendingUp,
];

export function HealthcareProfessionalsClient() {
  const segment = providerSegments.find(
    (s) => s.slug === "healthcare-professionals"
  )!;

  const stats = segment.stats ?? [];
  const features = segment.features ?? [];
  const processSteps = segment.processSteps ?? [];
  const testimonials = segment.testimonials ?? [];
  const faqs = segment.faqs ?? [];

  return (
    <main>
      {/* 1. Custom Hero - light + stats row */}
      <section className="relative overflow-hidden bg-[#f5f7f9] py-24 lg:py-32">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          {/* Top content */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-[#ce0e2d]/10"
            >
              <Stethoscope className="h-10 w-10 text-[#ce0e2d]" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="mb-3 text-sm font-semibold uppercase tracking-widest text-black/50"
            >
              For Healthcare Professionals
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease }}
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 1.05 }}
            >
              의료인
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease }}
              className="mt-5 max-w-xl text-lg leading-relaxed text-black/60"
            >
              BAYADA 네트워크에 합류하세요
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease }}
              className="mt-3 max-w-2xl text-base leading-relaxed text-black/50"
            >
              {segment.description}
            </motion.p>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease }}
            className="mt-16 grid grid-cols-2 gap-6 lg:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 + i * 0.08, ease }}
                className="rounded-2xl bg-white px-6 py-6 text-center ring-1 ring-black/5 shadow-sm"
              >
                <div className="text-3xl font-bold text-[#ce0e2d] lg:text-4xl">
                  {stat.value}
                  {stat.suffix}
                </div>
                <p className="mt-1.5 text-sm text-black/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. ContentImageSplit */}
      <ContentImageSplit
        title={segment.contentHeadline?.replace(/\n/g, " ") ?? ""}
        description={segment.contentDescription ?? ""}
        imageUrl={segment.image}
        imageAlt={segment.nameKo}
        ctaLabel="채용 공고 보기"
        ctaHref="/careers"
      />

      {/* 3. "Why Join BAYADA" - 3x2 animated card grid */}
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
              Why Join BAYADA
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-black/60">
              의료 전문인으로서의 성장과 안정, 두 가지를 모두 경험하세요.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = featureIconMap[i] ?? BookOpen;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease }}
                  className="group relative overflow-hidden rounded-2xl bg-white p-7 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#ce0e2d]/10 transition-colors group-hover:bg-[#ce0e2d]/20">
                    <Icon className="h-6 w-6 text-[#ce0e2d]" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-black/[0.87]">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-black/60">
                    {feature.description}
                  </p>
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#ce0e2d] transition-all duration-300 group-hover:w-full" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. "합류 프로세스" - Horizontal 4-step timeline */}
      <section className="bg-white py-16 lg:py-24">
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
              {segment.processTitle ?? "합류 프로세스"}
            </h2>
          </motion.div>

          {/* Horizontal steps */}
          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gray-200 lg:block" />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {processSteps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: i * 0.1, ease }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step number circle */}
                  <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ce0e2d] text-xl font-bold text-white shadow-lg">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-black/[0.87]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-black/55">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Two testimonial cards side by side */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-12 text-center font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            현직자의 이야기
          </motion.h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease }}
                className="relative rounded-2xl bg-white p-8 ring-1 ring-black/5 shadow-sm"
              >
                {/* Large Quote decoration */}
                <Quote className="mb-4 h-10 w-10 text-[#ce0e2d]/60" />
                <p className="mb-6 text-base leading-relaxed text-black/60">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ce0e2d] text-sm font-bold text-white">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black/[0.87]">
                      {t.author}
                    </p>
                    {t.role && (
                      <p className="text-xs text-black/50">{t.role}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion - SPLIT layout (question left, answer right) */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-12"
          >
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              자주 묻는 질문
            </h2>
            <p className="mt-3 text-base text-black/60">
              지원 전 궁금한 점을 확인해 보세요.
            </p>
          </motion.div>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease }}
                className="grid grid-cols-1 gap-4 border-b border-gray-200 py-7 lg:grid-cols-[1fr_1.5fr] lg:gap-12"
              >
                {/* Question left */}
                <h3 className="text-base font-semibold text-black/[0.87]">
                  {faq.question}
                </h3>
                {/* Answer right */}
                <p className="text-sm leading-relaxed text-black/60">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. RedBannerCTA */}
      <RedBannerCTA
        title={segment.careerTitle ?? "의료 전문인으로서의 커리어를 시작하세요"}
        description={segment.careerDescription}
        ctaLabel={segment.ctaLabel}
        ctaHref="/careers"
        features={segment.highlights}
      />

      {/* 8. Custom bottom - "지금 지원하세요" section */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-black/50">
                Join Our Team
              </p>
              <h2
                className="mt-2 font-bold text-black/[0.87]"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
              >
                지금 지원하세요
              </h2>
              <p className="mt-2 text-base text-black/60">
                간호사, 물리치료사, 작업치료사 — 모든 의료 전문인을 환영합니다.
              </p>
            </div>
            <Link
              href="/careers"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#ce0e2d] px-10 py-[13px] text-base font-medium text-white transition-colors hover:bg-[#980019]"
            >
              채용 공고 보기
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
