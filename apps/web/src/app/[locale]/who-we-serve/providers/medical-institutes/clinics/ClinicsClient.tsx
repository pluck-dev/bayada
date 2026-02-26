"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope,
  ArrowRight,
  Link2,
  Home,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { providerSegments } from "@/data/audiences";
import {
  AccordionSection,
  ImageTextAlternating,
} from "@/components/sections";

const ease = [0.16, 1, 0.3, 1] as const;

// 워크플로우 스텝 아이콘
const workflowSteps = [
  {
    icon: Stethoscope,
    label: "의원 진료",
    description: "담당의가 재택 케어 필요 환자를 식별",
  },
  {
    icon: Link2,
    label: "BAYADA 연계",
    description: "24시간 내 케어 플랜 수립 및 코디네이터 배정",
  },
  {
    icon: Home,
    label: "가정 케어",
    description: "전문 방문간호사·요양보호사가 가정에서 서비스 제공",
  },
];

export default function ClinicsClient({ locale }: { locale: string }) {
  const segment = providerSegments.find((s) => s.slug === "clinics")!;

  const stats = segment.stats ?? [];
  const features = segment.features ?? [];
  const faqs = (segment.faqs ?? []).map((f) => ({
    title: f.question,
    content: f.answer,
  }));

  // ImageTextAlternating 블록 (learnMoreItems)
  const blocks = (segment.learnMoreItems ?? []).map((item) => ({
    title: item.title,
    description: item.content,
    imageUrl: segment.image,
  }));

  return (
    <main>
      {/* 1. 라이트 히어로 - 좌우 분할 */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* 좌: 타이틀 + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
                Clinic Partnership
              </p>
              <h1
                className="font-bold leading-[1.1] text-black/[0.87]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)" }}
              >
                {segment.nameKo}과 함께하는
                <br />
                <span className="text-[#ce0e2d]">재택의료 서비스</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-black/60">
                {segment.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#contact-clinic"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#980019]"
                >
                  파트너십 문의하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#workflow"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-black/70 transition-colors hover:border-[#ce0e2d] hover:text-[#ce0e2d]"
                >
                  연계 흐름 보기
                </Link>
              </div>
            </motion.div>

            {/* 우: 통계 카드 3장 세로 배열 */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease }}
              className="flex flex-col gap-4"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 + i * 0.1, ease }}
                  className="flex items-center gap-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                    <CheckCircle2 className="h-6 w-6 text-[#ce0e2d]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-black/[0.87]">
                      {stat.value}
                      {stat.suffix ?? ""}
                    </p>
                    <p className="text-sm text-black/55">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. 서비스 연계 흐름 - 커스텀 워크플로우 */}
      <section id="workflow" className="bg-white py-16 lg:py-24">
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
              서비스 연계 흐름
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
              의원 진료부터 가정 케어까지, 끊김 없이 연결됩니다.
            </p>
          </motion.div>

          <div className="relative flex flex-col items-stretch gap-0 lg:flex-row">
            {workflowSteps.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === workflowSteps.length - 1;

              return (
                <div
                  key={step.label}
                  className="flex flex-1 flex-col items-center lg:flex-row"
                >
                  {/* 카드 */}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: i * 0.15, ease }}
                    className="flex flex-1 flex-col items-center rounded-2xl border border-gray-100 bg-[#f5f7f9] p-7 text-center shadow-sm"
                  >
                    <div
                      className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-[#ce0e2d]/10"
                    >
                      <Icon className="h-8 w-8 text-[#ce0e2d]" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-black/40">
                      Step {i + 1}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-black/[0.87]">
                      {step.label}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/60">
                      {step.description}
                    </p>
                  </motion.div>

                  {/* 화살표 커넥터 */}
                  {!isLast && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.15 + 0.2 }}
                      className="flex items-center justify-center px-3 py-4 lg:py-0"
                      aria-hidden
                    >
                      <ArrowRight className="h-6 w-6 text-[#ce0e2d] lg:block hidden" />
                      {/* 모바일: 아래 화살표 */}
                      <svg
                        className="h-6 w-6 rotate-90 text-[#ce0e2d] lg:hidden"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. 3개 피처 카드 한 줄 */}
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
              {segment.contentHeadline ?? "의원·클리닉 파트너십 혜택"}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease }}
                className="flex flex-col rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ce0e2d]/10 text-2xl">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-black/[0.87]">
                  {f.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-black/60">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQ 아코디언 - bordered full-width */}
      {faqs.length > 0 && (
        <AccordionSection
          title="자주 묻는 질문"
          items={faqs}
          variant="bordered"
          layout="full"
        />
      )}

      {/* 5. 더 알아보기 - ImageTextAlternating */}
      {blocks.length > 0 && (
        <ImageTextAlternating title="더 알아보기" blocks={blocks} />
      )}

      {/* 6. 대형 신뢰 통계 */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="text-center"
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
              숫자로 증명하는 신뢰
            </p>
            <h2
              className="mb-14 font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              BAYADA 클리닉 파트너십 성과
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { value: "120+", label: "연계 클리닉", sub: "전국 120개 이상의 의원과 협력" },
              { value: "98%", label: "서비스 연속성", sub: "중단 없는 지속 케어 보장" },
              { value: "4.6/5.0", label: "만족도", sub: "파트너 클리닉 평균 만족도" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease }}
                className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm"
              >
                <p
                  className="font-bold text-[#ce0e2d]"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
                >
                  {s.value}
                </p>
                <p className="mt-2 text-lg font-bold text-black/[0.87]">
                  {s.label}
                </p>
                <p className="mt-1 text-sm text-black/50">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. 바텀 CTA */}
      <section
        id="contact-clinic"
        className="bg-white py-16 lg:py-24"
      >
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="flex flex-col items-center text-center"
          >
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              지금 바로 파트너십을 시작하세요
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-black/60">
              BAYADA의 전문 파트너십 팀이 클리닉의 니즈에 맞는 연계 방안을
              맞춤으로 제안드립니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-8 py-[13px] text-sm font-medium text-white transition-colors hover:bg-[#980019]"
              >
                파트너십 문의하기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:16701379"
                className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] px-8 py-[13px] text-sm font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
              >
                <Phone className="h-4 w-4" />
                1670-1379
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
