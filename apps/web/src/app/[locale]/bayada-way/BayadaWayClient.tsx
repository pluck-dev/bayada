"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Heart, Star, Shield, Download, MapPin, ListChecks } from "lucide-react";
import { Container } from "@/components/layout/Container";

// ─── 타입 ────────────────────────────────────────────────────────────────────

interface Value {
  id: string;
  icon: React.ReactNode;
  titleKo: string;
  titleEn: string;
  body: string;
}

interface AccordionItemProps {
  value: Value;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

// ─── 데이터 ───────────────────────────────────────────────────────────────────

const VALUES: Value[] = [
  {
    id: "compassion",
    icon: <Heart className="h-6 w-6" />,
    titleKo: "열정",
    titleEn: "Compassion",
    body: "우리는 도움이 필요한 분들에게 진심 어린 관심과 따뜻한 돌봄을 제공합니다. 환자와 가족의 이야기를 경청하고, 그들의 필요를 깊이 이해하여 최선의 케어를 전달합니다.",
  },
  {
    id: "excellence",
    icon: <Star className="h-6 w-6" />,
    titleKo: "탁월함",
    titleEn: "Excellence",
    body: "50년의 경험과 끊임없는 혁신으로, 홈헬스케어 업계 최고 수준의 서비스를 제공합니다. 체계적인 교육과 품질 관리를 통해 모든 방문에서 탁월한 케어를 실현합니다.",
  },
  {
    id: "reliability",
    icon: <Shield className="h-6 w-6" />,
    titleKo: "신뢰",
    titleEn: "Reliability",
    body: "약속한 시간에, 약속한 서비스를, 약속한 품질로 제공합니다. 환자와 가족이 안심하고 의지할 수 있는 믿음직한 파트너가 되겠습니다.",
  },
];

const PHILOSOPHY =
  "우리의 고객이 최우선입니다. 우리 돌봄의 중심에는 고객과 돌봄 제공자 사이의 관계가 있습니다. 연민, 탁월함, 그리고 신뢰를 나침반 삼아 우리는 진정한 희망을 키우고, 건강한 삶의 기반을 만들어갑니다. 고객과 돌봄 제공자는 함께 도전을 헤쳐 나가고, 성취를 함께 기뻐하며, 신뢰와 편안함, 그리고 역량 강화의 여정을 함께 만들어갑니다.\n\nThe BAYADA Way는 우리를 하나로 묶으면서도 차별화합니다. The BAYADA Way는 재가·홈 헬스케어 전문가로서 우리의 일에 가장 중요한 가치가 무엇인지를 담고 있습니다. 이는 현재 세대의 BAYADA 홈 헬스케어 전문가들이 정립한 철학이자 지침이며, 앞으로 이 중요한 사명을 이어갈 동료들에게 전해질 신념의 체계입니다. 우리는 The BAYADA Way가 홈 케어 전문직의 가장 높은 이상과 기준에 뿌리를 둔, 지속 가능한 유산이 되기를 목표로 합니다.";

const HISTORY =
  "1975년 Mark Baiada가 설립한 BAYADA Home Health Care는 50년 가까이 홈헬스케어 업계를 선도해왔습니다. 미국에서 시작하여 현재 전 세계 23개국 380개 이상의 오피스를 운영하며, 매년 수십만 명에게 서비스를 제공합니다. 한국에서는 2023년 바야다홈헬스케어코리아로 새롭게 시작하여, 글로벌 노하우와 한국 의료 시스템의 장점을 결합한 최고 품질의 서비스를 제공하고 있습니다.";

// ─── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

function AccordionItem({ value, isOpen, onToggle, index }: AccordionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50"
        aria-expanded={isOpen}
      >
        {/* 아이콘 */}
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
            isOpen ? "bg-[#ce0e2d] text-white" : "bg-[#f5f7f9] text-[#ce0e2d]"
          }`}
        >
          {value.icon}
        </span>

        {/* 제목 */}
        <div className="flex-1">
          <span className="block text-lg font-bold text-black/[0.87]">
            {value.titleKo}
          </span>
          <span className="block text-sm text-black/50">{value.titleEn}</span>
        </div>

        {/* 토글 화살표 */}
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-black/40 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-t border-gray-100 px-6 pb-6 pt-4">
              <p className="leading-relaxed text-black/60">{value.body}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function BayadaWayClient({ locale }: { locale: string }) {
  const [activeTab, setActiveTab] = useState<"values" | "philosophy">("values");
  const [openValue, setOpenValue] = useState<string | null>("compassion");

  function toggleValue(id: string) {
    setOpenValue((prev) => (prev === id ? null : id));
  }

  return (
    <>
      {/* ── 1. 히어로 배너 ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1B2A4A]" style={{ minHeight: 420 }}>
        {/* 배경 이미지 */}
        <Image
          src="/images/about/50-years-desktop.webp"
          alt="The BAYADA Way"
          fill
          className="object-cover opacity-30"
          priority
        />
        {/* 그라디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A]/90 via-[#1B2A4A]/60 to-transparent" />

        <Container className="relative flex flex-col justify-center py-24 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
              Our Mission & Values
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              The BAYADA Way
              <sup className="ml-1 text-xl align-super">®</sup>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              열정, 탁월함, 신뢰 — 50년간 이어져 온 우리의 약속
            </p>
          </motion.div>
        </Container>
      </section>

      {/* ── 2. 탭 섹션 (핵심가치 / 철학) ─────────────────────────────────────── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <Container>
          {/* 탭 버튼 */}
          <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm w-fit mx-auto mb-12">
            {(["values", "philosophy"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative rounded-lg px-7 py-3 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "text-white"
                    : "text-black/50 hover:text-black/70"
                }`}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-lg bg-[#ce0e2d]"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative">
                  {tab === "values" ? "핵심 가치 (Our Values)" : "우리의 철학 (Our Philosophy)"}
                </span>
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <AnimatePresence mode="wait">
            {activeTab === "values" ? (
              <motion.div
                key="values"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="mx-auto max-w-2xl space-y-4"
              >
                {/* 상단 인트로 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8 text-center"
                >
                  <h2 className="text-2xl font-bold text-black/[0.87] sm:text-3xl">
                    Compassion. Excellence. Reliability.
                  </h2>
                  <p className="mt-3 text-black/50">
                    BAYADA의 모든 서비스는 세 가지 핵심 가치 위에 세워집니다.
                  </p>
                </motion.div>

                {VALUES.map((v, i) => (
                  <AccordionItem
                    key={v.id}
                    value={v}
                    isOpen={openValue === v.id}
                    onToggle={() => toggleValue(v.id)}
                    index={i}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="philosophy"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="mx-auto max-w-3xl"
              >
                <div className="rounded-2xl bg-white p-10 shadow-sm lg:p-14">
                  {/* 인용 아이콘 */}
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                    <span className="text-3xl font-serif font-bold leading-none text-[#ce0e2d]">"</span>
                  </div>

                  <h2 className="mb-6 text-2xl font-bold text-black/[0.87] sm:text-3xl">
                    우리의 철학
                  </h2>

                  <div className="space-y-4 text-lg leading-[1.85] text-black/70">
                    {PHILOSOPHY.split("\n\n").map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  {/* 핵심 가치 뱃지 */}
                  <div className="mt-10 flex flex-wrap gap-3">
                    {VALUES.map((v) => (
                      <span
                        key={v.id}
                        className="flex items-center gap-2 rounded-full bg-[#f5f7f9] px-4 py-2 text-sm font-semibold text-black/[0.87]"
                      >
                        <span className="text-[#ce0e2d]">{v.icon}</span>
                        {v.titleKo} · {v.titleEn}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </section>

      {/* ── 3. 우리의 역사 ──────────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* 좌측: 텍스트 */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
                Our History
              </p>
              <h2 className="text-3xl font-bold text-black/[0.87] sm:text-4xl">
                우리의 역사
              </h2>

              {/* 타임라인 마일스톤 */}
              <div className="mt-8 space-y-6">
                {[
                  { year: "1975", label: "Mark Baiada, 미국에서 BAYADA 설립" },
                  { year: "2000s", label: "글로벌 확장 — 23개국 380개 이상 오피스" },
                  { year: "2023", label: "바야다홈헬스케어코리아 설립, 한국 서비스 개시" },
                ].map((m, i) => (
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      {i < 2 && <div className="mt-1 h-10 w-0.5 bg-[#ce0e2d]/20" />}
                    </div>
                    <div className="pb-2">
                      <span className="block text-xs font-bold uppercase tracking-wide text-[#ce0e2d]">
                        {m.year}
                      </span>
                      <span className="mt-0.5 block text-sm text-black/70">{m.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="mt-8 leading-[1.85] text-black/60">{HISTORY}</p>
            </motion.div>

            {/* 우측: 이미지 */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src="/images/about/50-years-desktop.webp"
                  alt="BAYADA 50년의 역사"
                  width={680}
                  height={520}
                  className="h-auto w-full object-cover"
                />
              </div>
              {/* 통계 뱃지 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute -bottom-5 -left-5 rounded-xl bg-[#ce0e2d] p-5 text-white shadow-xl"
              >
                <span className="block text-3xl font-bold">50+</span>
                <span className="block text-xs font-medium opacity-90">년의 글로벌 경험</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -top-5 -right-5 rounded-xl bg-[#1B2A4A] p-5 text-white shadow-xl"
              >
                <span className="block text-3xl font-bold">23</span>
                <span className="block text-xs font-medium opacity-90">개국 운영</span>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ── 4. PDF 다운로드 CTA ─────────────────────────────────────────────── */}
      <section className="bg-[#1B2A4A] py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                The BAYADA Way 자료 다운로드
              </h2>
              <p className="mt-3 text-white/60">
                BAYADA의 핵심 가치와 철학이 담긴 자료를 무료로 받아보세요.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/downloads/bayada-way-ko.pdf"
                download
                className="flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#980019]"
              >
                <Download className="h-4 w-4" />
                한국어 PDF
              </a>
              <a
                href="/downloads/bayada-way-en.pdf"
                download
                className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Download className="h-4 w-4" />
                English PDF
              </a>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ── 5. 하단 듀얼 CTA ─────────────────────────────────────────────────── */}
      <section className="bg-white py-12 lg:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                icon: <MapPin className="h-6 w-6" />,
                title: "BAYADA가 내 근처에 있나요?",
                desc: "전국 주요 지역에서 BAYADA의 전문 홈헬스케어 서비스를 받으실 수 있습니다.",
                href: `/${locale}/find-care`,
                cta: "서비스 지역 확인하기",
              },
              {
                icon: <ListChecks className="h-6 w-6" />,
                title: "어떤 서비스를 제공하나요?",
                desc: "방문요양, 방문간호, 재활치료 등 다양한 홈헬스케어 서비스를 제공합니다.",
                href: `/${locale}/what-we-do`,
                cta: "서비스 전체 보기",
              },
            ].map((card, i) => (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ce0e2d]/10 text-[#ce0e2d]">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black/[0.87]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/60">{card.desc}</p>
                </div>
                <Link
                  href={card.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#ce0e2d] transition-colors hover:text-[#980019]"
                >
                  {card.cta}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
