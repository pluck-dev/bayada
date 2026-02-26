"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Award,
  PlayCircle,
  MessageSquare,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getPlatformBySlug } from "@/data/platforms";
import { ContentImageSplit } from "@/components/sections";
import { AccordionSection } from "@/components/sections";

const ease = [0.16, 1, 0.3, 1] as const;

const ICON_MAP: Record<string, React.ReactNode> = {
  PlayCircle: <PlayCircle className="h-6 w-6" />,
  Award: <Award className="h-6 w-6" />,
  GraduationCap: <GraduationCap className="h-6 w-6" />,
  MessageSquare: <MessageSquare className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
};

const PATHWAY_ACCENTS = [
  { border: "border-emerald-200", dot: "bg-emerald-500" },
  { border: "border-blue-200", dot: "bg-blue-500" },
  { border: "border-amber-200", dot: "bg-amber-500" },
];

const SAMPLE_COURSES = [
  { title: "치매 케어 전문 과정", tag: "인기", lessons: 24, hours: "18시간", level: "중급" },
  { title: "낙상 예방 & 안전 이동 보조", tag: "추천", lessons: 16, hours: "12시간", level: "초급" },
  { title: "복약 관리 실무", tag: "NEW", lessons: 12, hours: "8시간", level: "초중급" },
];

export function DeiEduClient() {
  const platform = getPlatformBySlug("deiedu");
  if (!platform) return null;

  const faqItems =
    platform.faqs?.map((f) => ({ title: f.question, content: f.answer })) ?? [];

  const stats = platform.stats ?? [];
  const useCases = platform.useCases ?? [];
  const keyFeatures = platform.keyFeatures ?? [];

  return (
    <main className="overflow-x-hidden">
      {/* 1. HERO --------------------------------------------------- */}
      <section className="bg-[#f5f7f9] py-20 lg:py-28">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="max-w-3xl"
          >
            {/* 태그라인 */}
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d]/10 px-4 py-1.5 text-sm font-semibold text-[#ce0e2d]">
              <GraduationCap className="h-4 w-4" />
              {platform.tagline}
            </span>

            {/* 제목 */}
            <h1
              className="mt-6 font-extrabold leading-[1.1] text-black/[0.87]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              DeiEdu —{" "}
              <span className="text-[#ce0e2d]">교육 플랫폼</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-black/60">
              50년 BAYADA 케어 노하우를 체계적으로 배우는 헬스케어 전문 교육 플랫폼
            </p>
          </motion.div>

          {/* 통계 3개 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
            className="mt-12 grid grid-cols-3 gap-4 max-w-xl"
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white px-5 py-5 ring-1 ring-black/5 shadow-sm text-center"
              >
                <p className="text-3xl font-extrabold text-[#ce0e2d]">
                  {s.value}
                  <span className="text-xl">{s.suffix}</span>
                </p>
                <p className="mt-1 text-xs font-medium text-black/60">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. ContentImageSplit ---------------------------------------- */}
      <ContentImageSplit
        title={platform.contentHeadline?.replace(/\n/g, " ") ?? ""}
        description={platform.contentDescription ?? ""}
        imageUrl={platform.contentImageUrl ?? platform.image}
        imageAlt="DeiEdu 교육 플랫폼"
      />

      {/* 3. 학습 경로 ------------------------------------------------- */}
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
              나에게 맞는 학습 경로
            </h2>
            <p className="mt-3 text-base text-black/60">
              학습 목적과 배경에 따라 최적화된 커리큘럼을 제공합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {useCases.map((uc, i) => {
              const accent = PATHWAY_ACCENTS[i % PATHWAY_ACCENTS.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease }}
                  className={`rounded-2xl border ${accent.border} bg-white p-7 flex flex-col ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${accent.dot}`} />
                    <h3 className="text-lg font-bold text-black/[0.87] leading-snug">
                      {uc.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-black/60 flex-1">
                    {uc.description}
                  </p>
                  <Link
                    href="#"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#ce0e2d] hover:gap-2.5 transition-all"
                  >
                    과정 보기 <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. 핵심 기능 ----------------------------------- */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-10 text-center"
          >
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              주요 기능
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {keyFeatures.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease }}
                className="rounded-2xl bg-white p-6 ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce0e2d]/10 text-[#ce0e2d]">
                  {ICON_MAP[feat.icon] ?? <GraduationCap className="h-6 w-6" />}
                </div>
                <h3 className="mb-2 text-base font-bold text-black/[0.87]">{feat.title}</h3>
                <p className="text-sm leading-relaxed text-black/60">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 인기 과정 미리보기 --------------------------------------- */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-10 flex items-end justify-between flex-wrap gap-4"
          >
            <div>
              <h2
                className="font-bold text-black/[0.87]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
              >
                인기 과정 미리보기
              </h2>
              <p className="mt-2 text-base text-black/60">
                현직 케어 전문가가 만든 검증된 커리큘럼
              </p>
            </div>
            <Link
              href="#"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#dfe6eb] py-[13px] px-5 text-sm font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
            >
              전체 과정 보기 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {SAMPLE_COURSES.map((course, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease }}
                className="group cursor-pointer rounded-2xl bg-white ring-1 ring-black/5 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* 썸네일 영역 */}
                <div className="relative flex h-40 items-center justify-center bg-[#f5f7f9]">
                  <PlayCircle className="h-14 w-14 text-black/10 group-hover:text-[#ce0e2d]/30 transition-colors" strokeWidth={1} />
                  <span className="absolute left-4 top-4 rounded-full bg-[#ce0e2d] px-3 py-1 text-xs font-bold text-white">
                    {course.tag}
                  </span>
                </div>
                {/* 카드 본문 */}
                <div className="p-5">
                  <h3 className="mb-3 font-bold text-black/[0.87]">{course.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#f5f7f9] px-3 py-1 text-xs text-black/60">
                      {course.lessons}강의
                    </span>
                    <span className="rounded-full bg-[#f5f7f9] px-3 py-1 text-xs text-black/60">
                      {course.hours}
                    </span>
                    <span className="rounded-full bg-[#ce0e2d]/10 px-3 py-1 text-xs font-medium text-[#ce0e2d]">
                      {course.level}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 수료 인증 ------------------------------------------------ */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
            >
              <h2
                className="font-bold text-black/[0.87]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
              >
                수료 인증 시스템
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/60">
                DeiEdu 수료증은 BAYADA Korea 공식 발급 수료증으로, 국내 케어 기관 및 파트너 기관에서 인정받습니다.
                국가 자격증 연계 과정은 해당 기관의 교육 이수 시간으로 인정됩니다.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "디지털 수료증 즉시 발급",
                  "역량 배지 (Skill Badge) 시스템",
                  "BAYADA 글로벌 네트워크 공인",
                  "취업 연계 우대 혜택",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-black/[0.87]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15, ease }}
              className="flex flex-col items-center justify-center gap-6"
            >
              {/* 인증 배지 */}
              <div className="flex h-52 w-52 items-center justify-center rounded-2xl bg-[#f5f7f9] ring-1 ring-black/5">
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                    <GraduationCap className="h-8 w-8 text-[#ce0e2d]" />
                  </div>
                  <span className="mt-4 text-sm font-bold text-black/[0.87]">BAYADA 공식 인증</span>
                  <span className="mt-1 text-xs text-black/50">수료 시 즉시 발급</span>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-[#f5f7f9] px-6 py-4 ring-1 ring-black/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                  <Award className="h-6 w-6 text-[#ce0e2d]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black/[0.87]">역량 배지</p>
                  <p className="text-xs text-black/50">과정별 전문 인증</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ---------------------------------------------------- */}
      <AccordionSection
        title="자주 묻는 질문"
        subtitle="DeiEdu에 대한 궁금증을 해소하세요"
        items={faqItems}
        layout="full"
        variant="bordered"
      />

      {/* 8. Bottom CTA -------------------------------------------- */}
      <section className="bg-[#f5f7f9] py-16 lg:py-20">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
              <GraduationCap className="h-6 w-6 text-[#ce0e2d]" />
            </div>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              지금 바로 학습을 시작하세요
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-black/60">
              50년 BAYADA 케어 노하우로 당신의 전문성을 높이세요. 무료 강좌로 먼저 체험해보세요.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="#"
                className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                학습 시작하기 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
              >
                기관 교육 문의
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
