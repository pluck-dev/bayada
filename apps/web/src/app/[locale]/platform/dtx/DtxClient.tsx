"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Activity,
  BookOpen,
  Brain,
  Dumbbell,
  Pill,
  Monitor,
  ArrowRight,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { getPlatformBySlug } from "@/data/platforms";
import { ContentImageSplit } from "@/components/sections";
import { AccordionSection } from "@/components/sections";

const ease = [0.16, 1, 0.3, 1] as const;

const ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain className="h-7 w-7" />,
  Dumbbell: <Dumbbell className="h-7 w-7" />,
  Pill: <Pill className="h-7 w-7" />,
  Monitor: <Monitor className="h-7 w-7" />,
  ShieldCheck: <ShieldCheck className="h-7 w-7" />,
  Activity: <Activity className="h-7 w-7" />,
  BookOpen: <BookOpen className="h-7 w-7" />,
};

const EVIDENCE_CARDS = [
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    badge: "규제 기관",
    title: "식약처 허가",
    description: "의료기기 소프트웨어(SaMD) 등급으로 식품의약품안전처 정식 허가를 취득한 솔루션만 파트너로 연계합니다.",
  },
  {
    icon: <Activity className="h-8 w-8" />,
    badge: "임상 연구",
    title: "RCT 임상시험",
    description: "무작위 배정 대조시험(RCT)을 통해 치료 효과가 과학적으로 입증된 디지털 치료제를 선별합니다.",
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    badge: "학술 게재",
    title: "SCI 논문 게재",
    description: "파트너사별 임상 결과가 SCI급 국제 학술지에 게재되어 독립적인 동료 심사를 통과한 근거를 보유합니다.",
  },
];

const PARTNER_CARDS = [
  { name: "파트너 A", indication: "인지훈련", description: "경도인지장애 및 치매 예방을 위한 AI 기반 디지털 인지 훈련 솔루션" },
  { name: "파트너 B", indication: "만성통증", description: "비약물적 접근의 근거 기반 디지털 만성통증 관리 치료제" },
  { name: "파트너 C", indication: "수면장애", description: "불면증 인지행동치료(CBT-I) 기반 디지털 수면 치료 프로그램" },
];

const SECURITY_ITEMS = [
  { icon: <ShieldCheck className="h-6 w-6" />, title: "의료법 준거", description: "국내 의료법 및 개인정보보호법 기준을 완전 준수하는 AES-256 암호화 데이터 관리" },
  { icon: <Activity className="h-6 w-6" />, title: "IRB 승인", description: "모든 임상 데이터 수집은 기관생명윤리위원회(IRB) 심의 및 승인 하에 진행됩니다" },
  { icon: <ShieldCheck className="h-6 w-6" />, title: "익명화 처리", description: "수집된 임상 데이터는 완전 익명화 처리 후 분석에 활용되어 환자 프라이버시를 보호합니다" },
];

export function DtxClient() {
  const platform = getPlatformBySlug("dtx");
  if (!platform) return null;

  const faqItems =
    platform.faqs?.map((f) => ({ title: f.question, content: f.answer })) ?? [];

  const stats = platform.stats ?? [];
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
            {/* 파트너십 배지 */}
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d]/10 px-4 py-1.5 text-sm font-semibold text-[#ce0e2d]">
              파트너십 서비스
            </span>

            {/* 제목 */}
            <h1
              className="mt-6 font-extrabold leading-[1.1] text-black/[0.87]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              Dtx —{" "}
              <span className="text-[#ce0e2d]">디지털 치료제</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-black/60">
              {platform.tagline} — 임상 근거에 기반한 소프트웨어 치료 솔루션
            </p>
            <p className="mt-3 text-base leading-relaxed text-black/50 max-w-2xl">
              {platform.description}
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

      {/* 2. ContentImageSplit - reversed --------------------------- */}
      <ContentImageSplit
        title={platform.contentHeadline?.replace(/\n/g, " ") ?? ""}
        description={platform.contentDescription ?? ""}
        imageUrl={platform.contentImageUrl ?? platform.image}
        imageAlt="Dtx 디지털 치료제 플랫폼"
        reversed
      />

      {/* 3. 임상 근거 -------------------------------------------- */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-12 text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d] mb-3">
              Evidence-Based
            </p>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              3중 임상 근거 검증 체계
            </h2>
            <p className="mt-3 text-base text-black/60">
              BAYADA Dtx는 과학적으로 검증된 파트너사와만 협력합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {EVIDENCE_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease }}
                className="rounded-2xl bg-white p-7 ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* 상단 배지 + 아이콘 */}
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce0e2d]/10 text-[#ce0e2d]">
                    {card.icon}
                  </div>
                  <span className="rounded-full bg-[#f5f7f9] px-3 py-1 text-xs font-semibold text-black/60 uppercase tracking-wide">
                    {card.badge}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-black/[0.87]">{card.title}</h3>
                <p className="text-sm leading-relaxed text-black/60">{card.description}</p>
                {/* 하단 라인 장식 */}
                <div className="mt-5 h-0.5 w-12 rounded-full bg-[#ce0e2d]" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 치료 모듈 -------------------------------------------- */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-16 text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d] mb-3">
              Treatment Modules
            </p>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              치료 모듈
            </h2>
          </motion.div>

          <div className="space-y-20">
            {keyFeatures.map((feat, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, ease }}
                  className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                    !isEven ? "lg:[direction:rtl] lg:[&>*]:[direction:ltr]" : ""
                  }`}
                >
                  {/* 텍스트 */}
                  <div>
                    <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce0e2d]/10 text-[#ce0e2d]">
                      {ICON_MAP[feat.icon] ?? <Brain className="h-7 w-7" />}
                    </div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#ce0e2d]">
                      Module {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3
                      className="font-bold leading-snug text-black/[0.87]"
                      style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
                    >
                      {feat.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-black/60">
                      {feat.description}
                    </p>
                  </div>
                  {/* 시각적 블록 */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#f5f7f9] ring-1 ring-black/5 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#ce0e2d]/10 text-[#ce0e2d]">
                        <span className="scale-[1.4]">
                          {ICON_MAP[feat.icon] ?? <Brain className="h-7 w-7" />}
                        </span>
                      </div>
                      <span className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-black/[0.87] ring-1 ring-black/5">
                        {feat.title}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. 파트너 기업 ------------------------------------------- */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-12 text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d] mb-3">
              Partnership Network
            </p>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              파트너 기업
            </h2>
            <p className="mt-3 text-base text-black/60">
              검증된 DTx 파트너사와 함께하는 치료 네트워크
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PARTNER_CARDS.map((partner, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease }}
                className="rounded-2xl bg-white p-7 ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black/[0.87]">{partner.name}</h3>
                  <span className="rounded-full bg-[#f5f7f9] px-3 py-1 text-xs font-semibold text-black/60">
                    {partner.indication}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-black/60">{partner.description}</p>
                <div className="mt-5 h-px w-full bg-black/5" />
                <p className="mt-4 text-xs font-medium text-[#ce0e2d]">임상 근거 보유 · 식약처 허가 완료</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 데이터 보안 ------------------------------------------ */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-12 text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d] mb-3">
              Data Security
            </p>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              데이터 보안 보증
            </h2>
            <p className="mt-3 text-base text-black/60">
              임상 데이터의 안전한 수집과 관리를 보장합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {SECURITY_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease }}
                className="rounded-2xl bg-white p-7 ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce0e2d]/10 text-[#ce0e2d]">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-black/[0.87]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-black/60">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ --------------------------------------------------- */}
      <AccordionSection
        title="자주 묻는 질문"
        subtitle="Dtx 파트너십에 대해 궁금하신 점을 확인하세요"
        items={faqItems}
        layout="split"
        variant="bordered"
      />

      {/* 8. Bottom CTA -------------------------------------------- */}
      <section className="bg-[#f5f7f9] py-16 lg:py-20">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="rounded-2xl bg-white p-10 lg:p-14 ring-1 ring-black/5 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="max-w-xl"
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d] mb-3">
                Partnership Inquiry
              </p>
              <h2
                className="font-bold text-black/[0.87]"
                style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}
              >
                파트너십 문의
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/60">
                임상 근거를 갖춘 디지털 치료제 기업이라면 BAYADA와 함께하세요.
                케어 네트워크와 데이터 인프라를 활용한 협력 방안을 논의합니다.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              className="flex flex-col gap-4 shrink-0"
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                파트너십 문의하기 <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:1600-0000"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
              >
                <Phone className="h-4 w-4" />
                전화 상담
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
