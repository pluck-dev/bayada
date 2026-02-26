"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  PersonStanding,
  Palette,
  HeartPulse,
  Sun,
  Users,
  ChevronDown,
  Camera,
  MessageCircle,
  FileText,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { providerSegments } from "@/data/audiences";
import {
  StatsRow,
  RedBannerCTA,
  DualActionCards,
} from "@/components/sections";

const ease = [0.16, 1, 0.3, 1] as const;

const PROGRAM_COLORS = [
  { bg: "bg-[#ce0e2d]/10", icon: "text-[#ce0e2d]", border: "border-black/5" },
  { bg: "bg-[#ce0e2d]/10", icon: "text-[#ce0e2d]", border: "border-black/5" },
  { bg: "bg-[#ce0e2d]/10", icon: "text-[#ce0e2d]", border: "border-black/5" },
  { bg: "bg-[#ce0e2d]/10", icon: "text-[#ce0e2d]", border: "border-black/5" },
];

const PROGRAM_ICONS = [Brain, PersonStanding, Palette, HeartPulse];

const DAILY_SCHEDULE = [
  { time: "09:00", activity: "건강체크", icon: "💊", color: "bg-[#f5f7f9] border-black/10 text-black/[0.87]" },
  { time: "10:00", activity: "인지훈련", icon: "🧠", color: "bg-[#f5f7f9] border-black/10 text-black/[0.87]" },
  { time: "11:00", activity: "낙상예방 운동", icon: "🏃", color: "bg-[#f5f7f9] border-black/10 text-black/[0.87]" },
  { time: "12:00", activity: "점심식사", icon: "🍱", color: "bg-[#f5f7f9] border-black/10 text-black/[0.87]" },
  { time: "14:00", activity: "미술·음악 활동", icon: "🎨", color: "bg-[#f5f7f9] border-black/10 text-black/[0.87]" },
  { time: "15:00", activity: "간식 및 휴식", icon: "☕", color: "bg-[#f5f7f9] border-black/10 text-black/[0.87]" },
  { time: "16:00", activity: "귀가 준비", icon: "🚌", color: "bg-[#ce0e2d]/5 border-[#ce0e2d]/20 text-black/[0.87]" },
];

const FAMILY_FEATURES = [
  {
    icon: FileText,
    title: "주간 케어 리포트",
    desc: "이용자 건강 상태, 활동 참여도, 특이 사항을 매주 가족에게 전달합니다.",
    color: "text-[#ce0e2d]",
    bg: "bg-[#ce0e2d]/10",
  },
  {
    icon: Camera,
    title: "활동 사진 공유",
    desc: "프로그램 중 촬영한 사진을 보호자 앱으로 실시간 전송합니다.",
    color: "text-[#ce0e2d]",
    bg: "bg-[#ce0e2d]/10",
  },
  {
    icon: MessageCircle,
    title: "보호자 상담 지원",
    desc: "전담 케어 매니저가 보호자 고민을 즉시 접수하고 상담합니다.",
    color: "text-[#ce0e2d]",
    bg: "bg-[#ce0e2d]/10",
  },
];

const LEARN_MORE_BORDER_COLORS = [
  "border-amber-400",
  "border-emerald-400",
  "border-purple-400",
  "border-rose-400",
];

export default function DaycareClient() {
  const segment = providerSegments.find((s) => s.slug === "daycare")!;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="overflow-hidden">
      {/* ─── 1. HERO ─────────────────────────────────────────────── */}
      <section className="bg-[#f5f7f9] py-20 lg:py-28">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-center text-center">
            {/* 아이콘 장식 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#ce0e2d]/10"
            >
              <Sun className="h-8 w-8 text-[#ce0e2d]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
            >
              <span className="inline-block rounded-full bg-[#ce0e2d]/10 px-4 py-1.5 text-sm font-semibold text-[#ce0e2d]">
                서비스 제공기관 파트너십
              </span>
              <h1
                className="mt-5 font-bold leading-[1.15] text-black/[0.87]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
              >
                데이케어센터
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-black/60">
                {segment.description}
              </p>
            </motion.div>

            {/* 하이라이트 배지 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="mt-8 flex flex-wrap justify-center gap-2"
            >
              {segment.highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium text-black/60 shadow-sm"
                >
                  {h}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 2. 프로그램 쇼케이스 (카드 캐러셀 스타일) ─────────────────── */}
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
              프로그램 쇼케이스
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
              이용자 중심으로 설계된 데이케어 특화 프로그램을 소개합니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(segment.features ?? []).map((feat, i) => {
              const Icon = PROGRAM_ICONS[i % PROGRAM_ICONS.length];
              const color = PROGRAM_COLORS[i % PROGRAM_COLORS.length];
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease }}
                  className={`flex flex-col rounded-2xl border ${color.border} bg-white p-6 shadow-sm transition-shadow hover:shadow-md`}
                >
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${color.bg}`}
                  >
                    <Icon className={`h-7 w-7 ${color.icon}`} />
                  </div>
                  <h3 className="text-lg font-bold text-black/[0.87]">
                    {feat.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-black/60">
                    {feat.description}
                  </p>
                  <div className="mt-4">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-[#ce0e2d]/10 text-[#ce0e2d]"
                    >
                      프로그램 {i + 1}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 3. 통계 ─────────────────────────────────────────────────── */}
      <StatsRow stats={segment.stats ?? []} variant="brand" />

      {/* ─── 4. 하루 일과 예시 타임라인 ──────────────────────────────── */}
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
              하루 일과 예시
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
              이용자의 하루를 체계적이고 따뜻하게 설계합니다.
            </p>
          </motion.div>

          <div className="mx-auto max-w-2xl">
            <div className="relative">
              {/* 세로 라인 */}
              <div className="absolute left-16 top-0 h-full w-0.5 bg-[#ce0e2d]/20" />

              <div className="space-y-4">
                {DAILY_SCHEDULE.map((item, i) => (
                  <motion.div
                    key={item.time}
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease }}
                    className="flex items-center gap-5"
                  >
                    {/* 시간 */}
                    <div className="w-14 shrink-0 text-right text-sm font-bold text-[#ce0e2d]">
                      {item.time}
                    </div>
                    {/* 원형 마커 */}
                    <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-lg border border-black/10">
                      {item.icon}
                    </div>
                    {/* 카드 */}
                    <div
                      className={`flex-1 rounded-xl border px-5 py-3 ${item.color}`}
                    >
                      <span className="text-sm font-semibold">{item.activity}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. 더 알아보기 (확장 카드, 컬러 왼쪽 보더) ─────────────── */}
      {segment.learnMoreItems && segment.learnMoreItems.length > 0 && (
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
                더 알아보기
              </h2>
            </motion.div>

            <div className="mx-auto max-w-3xl space-y-4">
              {segment.learnMoreItems.map((item, i) => {
                const isOpen = openIndex === i;
                const borderColor = LEARN_MORE_BORDER_COLORS[i % LEARN_MORE_BORDER_COLORS.length];
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.07, ease }}
                    className={`rounded-xl border-l-4 ${borderColor} border border-gray-100 bg-white shadow-sm overflow-hidden`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="text-base font-semibold text-black/[0.87]">
                        {item.title}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown className="h-5 w-5 text-black/40" />
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1 text-sm leading-relaxed text-black/60">
                        {item.content}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── 6. 가족 소통 섹션 ───────────────────────────────────────── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* 텍스트 */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
            >
              <span className="inline-block rounded-full bg-[#ce0e2d]/10 px-4 py-1.5 text-sm font-semibold text-[#ce0e2d]">
                가족과 함께하는 케어
              </span>
              <h2
                className="mt-4 font-bold leading-[1.2] text-black/[0.87]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
              >
                가족 소통 서비스
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/60">
                이용자와 가족이 서로 연결되어 있다는 안심감을 드립니다. 센터에서
                있었던 하루를 보호자가 실시간으로 확인하고, 언제든 상담할 수
                있는 소통 창구를 운영합니다.
              </p>

              <div className="mt-8 space-y-5">
                {FAMILY_FEATURES.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: i * 0.1, ease }}
                      className="flex items-start gap-4"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${f.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${f.color}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-black/[0.87]">
                          {f.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-black/60">{f.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* 일러스트레이션 영역 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15, ease }}
              className="flex items-center justify-center"
            >
              <div className="relative flex h-72 w-72 items-center justify-center rounded-2xl bg-[#ce0e2d]/10 lg:h-80 lg:w-80">
                <div className="text-center">
                  <div className="text-7xl">👨‍👩‍👧</div>
                  <p className="mt-3 text-sm font-semibold text-[#ce0e2d]">
                    가족과 함께하는 케어
                  </p>
                </div>
                {/* 부유하는 뱃지 */}
                <div className="absolute -right-4 top-8 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
                  <p className="text-xs font-bold text-black/[0.87]">✓ 주간 리포트</p>
                </div>
                <div className="absolute -left-6 bottom-12 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
                  <p className="text-xs font-bold text-black/[0.87]">📸 사진 공유</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 7. 채용 RedBannerCTA ───────────────────────────────────── */}
      <RedBannerCTA
        title={segment.careerTitle ?? "데이케어 전문 인력을 채용하고 싶으신가요?"}
        description={segment.careerDescription}
        ctaLabel="채용 정보 보기"
        ctaHref="/careers"
        features={["요양보호사", "사회복지사", "프로그램 강사"]}
      />

      {/* ─── 8. DualActionCards ─────────────────────────────────────── */}
      <DualActionCards
        locale="ko"
        cards={[
          {
            icon: Users,
            title: "파트너십 문의",
            description: "데이케어센터 역량 강화를 위한 BAYADA 파트너십을 시작하세요.",
            ctaLabel: "파트너십 상담 신청",
            ctaHref: "/contact",
          },
          {
            icon: Briefcase,
            title: "채용 공고 보기",
            description: "데이케어 분야 전문 인력 채용 정보를 확인하세요.",
            ctaLabel: "채용 공고 확인",
            ctaHref: "/careers",
          },
        ]}
      />
    </main>
  );
}
