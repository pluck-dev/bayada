"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  GraduationCap,
  TrendingUp,
  MapPin,
  Briefcase,
  Clock,
  ChevronRight,
  Star,
  Shield,
  Award,
  Building2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const careers = [
  { id: "1", title: "전문 간호사 (Skilled Nursing)", dept: "케어서비스팀", location: "서울", type: "정규직", deadline: "2026-03-31", active: true },
  { id: "2", title: "요양보호사", dept: "케어서비스팀", location: "서울/경기", type: "정규직", deadline: "2026-03-31", active: true },
  { id: "3", title: "물리치료사", dept: "재활팀", location: "서울", type: "정규직", deadline: "2026-02-28", active: true },
  { id: "4", title: "케어 코디네이터", dept: "케어서비스팀", location: "서울", type: "정규직", deadline: "2026-03-15", active: true },
  { id: "5", title: "AI 엔지니어 (DeiBud)", dept: "플랫폼팀", location: "서울", type: "정규직", deadline: "2025-12-31", active: false },
];

const DEPTS = ["전체", "케어서비스팀", "재활팀", "플랫폼팀"];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

interface Props {
  locale: string;
}

export function CareersClient({ locale }: Props) {
  const [activeTab, setActiveTab] = useState("전체");
  const [closedOpen, setClosedOpen] = useState(false);

  const activeJobs = careers.filter((c) => c.active);
  const closedJobs = careers.filter((c) => !c.active);
  const filteredJobs =
    activeTab === "전체"
      ? activeJobs
      : activeJobs.filter((j) => j.dept === activeTab);

  return (
    <div className="overflow-hidden">
      {/* ── 1. 히어로 ─────────────────────────────────── */}
      <section className="bg-[#f5f7f9] py-24 lg:py-32">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-center text-center">
            {/* 배지 */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ce0e2d]/10 px-4 py-1.5"
            >
              <span className="h-2 w-2 rounded-full bg-[#ce0e2d]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#ce0e2d]">
                채용 진행 중 · {activeJobs.length}개 포지션
              </span>
            </motion.div>

            {/* 헤드라인 */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="font-bold leading-[1.08] text-black/[0.87]"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)", letterSpacing: "-0.02em" }}
            >
              당신의 열정이
              <br />
              <span className="text-[#ce0e2d]">누군가의 삶을 바꿉니다</span>
            </motion.h1>

            {/* 서브텍스트 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.22 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-black/60"
            >
              BAYADA와 함께 성장하세요.{" "}
              <br className="sm:hidden" />
              50년 경험이 만드는 홈헬스케어의 새로운 가능성.
            </motion.p>

            {/* CTA 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link
                href={`#jobs`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                채용 공고 보기
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
              >
                채용 문의
              </Link>
            </motion.div>

            {/* 핵심 통계 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-6"
            >
              {[
                { value: `${activeJobs.length}건`, label: "현재 채용" },
                { value: "전국", label: "서비스 지역" },
                { value: "50년+", label: "글로벌 경험" },
                { value: "33,000+", label: "전문 인력" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-[#ce0e2d]">{stat.value}</div>
                  <div className="mt-0.5 text-xs text-black/50">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. Why BAYADA - 가치 카드 2×2 ───────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <motion.span
              variants={fadeUp}
              className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]"
            >
              왜 BAYADA인가
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-4 font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              탁월함과 보살핌이 만나는 곳
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-base text-black/50 max-w-xl mx-auto">
              BAYADA에서 일한다는 것은 단순한 직업 그 이상입니다.
              매일 누군가의 삶에 직접적인 변화를 만들어냅니다.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {[
              {
                icon: GraduationCap,
                color: "#4f8ef7",
                bg: "rgba(79,142,247,0.08)",
                title: "성장의 기회",
                desc: "50년 교육 노하우를 바탕으로 한 체계적인 커리큘럼. 입사부터 시니어까지 전 과정 성장 지원.",
                tag: "경력 개발",
              },
              {
                icon: TrendingUp,
                color: "#10b981",
                bg: "rgba(16,185,129,0.08)",
                title: "최고의 보상",
                desc: "업계 최고 수준의 급여와 성과 인센티브. 당신의 헌신에 걸맞은 보상을 약속합니다.",
                tag: "급여 & 복지",
              },
              {
                icon: Heart,
                color: "#ce0e2d",
                bg: "rgba(206,14,45,0.08)",
                title: "의미 있는 일",
                desc: "매일 누군가의 삶을 직접 변화시키는 보람. 일이 아닌 사명감으로 하루를 시작하세요.",
                tag: "목적 있는 커리어",
              },
              {
                icon: Users,
                color: "#f59e0b",
                bg: "rgba(245,158,11,0.08)",
                title: "든든한 팀",
                desc: "전 세계 33,000+ 전문가와 함께하는 팀. 서로 배우고 성장하는 문화가 살아있습니다.",
                tag: "팀워크 & 문화",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  custom={i}
                  className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ background: item.bg }}
                  >
                    <Icon className="h-6 w-6" style={{ color: item.color }} />
                  </div>
                  <span
                    className="mt-4 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ background: item.bg, color: item.color }}
                  >
                    {item.tag}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-black/[0.87]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/50">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── 3. The BAYADA Way 문화 섹션 ────────────────── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* 이미지 플레이스홀더 */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm"
              style={{ minHeight: 480 }}
            >
              <div className="absolute inset-0 flex items-end bg-[#f5f7f9]">
                <div className="relative z-10 p-10">
                  <div className="mb-3 text-5xl font-black italic text-black/[0.06] leading-none select-none">
                    BAYADA WAY
                  </div>
                  <p className="text-2xl font-bold text-black/[0.87] leading-snug">
                    "사람 중심,<br />돌봄 최우선."
                  </p>
                  <p className="mt-3 text-sm text-black/50">
                    50년간 흔들리지 않은 단 하나의 원칙
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 텍스트 + 가치 카드 */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            >
              <span className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
                우리의 문화
              </span>
              <h2
                className="mt-4 font-bold text-black/[0.87] leading-[1.15]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
              >
                The BAYADA Way
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/50">
                우리의 모든 결정은 단 하나의 질문에서 시작합니다.
                <br />
                <em className="not-italic font-semibold text-black/70">"이것이 환자에게 최선인가?"</em>
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: Heart,
                    value: "열정",
                    desc: "일을 사랑하고, 돌봄을 사명으로 받아들이는 마음",
                    color: "#ce0e2d",
                  },
                  {
                    icon: Award,
                    value: "탁월함",
                    desc: "끊임없이 배우고, 최고의 케어를 제공하려는 의지",
                    color: "#f59e0b",
                  },
                  {
                    icon: Shield,
                    value: "신뢰",
                    desc: "환자와 가족, 동료 모두와 쌓아가는 진정한 신뢰",
                    color: "#10b981",
                  },
                ].map((val, i) => {
                  const Icon = val.icon;
                  return (
                    <motion.div
                      key={val.value}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      className="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-black/5 shadow-sm"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${val.color}15` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: val.color }} />
                      </div>
                      <div>
                        <div className="font-bold text-black/[0.87]">{val.value}</div>
                        <div className="mt-0.5 text-sm text-black/50">{val.desc}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. 복리후생 그리드 ──────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="show"
            variants={stagger}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <motion.span variants={fadeUp} className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              복리후생
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-4 font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              당신이 누릴 수 있는 것들
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { icon: TrendingUp, title: "경쟁력 있는 급여", desc: "업계 상위 수준의 기본급 + 수당 체계" },
              { icon: Star, title: "성과 인센티브", desc: "명확한 KPI 기반 반기별 성과급 지급" },
              { icon: GraduationCap, title: "전문 교육 지원", desc: "자격증 취득 비용 100% 지원, 해외 연수 기회" },
              { icon: Award, title: "경력 성장 경로", desc: "매니저 → 시니어 → 리더십 명확한 커리어 패스" },
              { icon: Clock, title: "유연한 근무", desc: "탄력 근무제, 재택 가능 포지션 운영" },
              { icon: Shield, title: "복리후생 패키지", desc: "건강보험, 퇴직연금, 명절 선물, 경조사 지원" },
            ].map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  variants={fadeUp}
                  custom={i}
                  className="group flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d]/10 transition-colors duration-300 group-hover:bg-[#ce0e2d]">
                    <Icon className="h-5 w-5 text-[#ce0e2d] transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-black/[0.87]">{benefit.title}</div>
                    <div className="mt-1 text-sm leading-relaxed text-black/50">{benefit.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── 5. 채용 절차 타임라인 ────────────────────────── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="show"
            variants={stagger}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <motion.span variants={fadeUp} className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              채용 절차
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-4 font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              함께하기까지 5단계
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-base text-black/50">
              투명하고 공정한 채용 프로세스로 최고의 인재를 모십니다.
            </motion.p>
          </motion.div>

          {/* 데스크탑: 수평 타임라인 */}
          <div className="mt-16 hidden lg:block">
            <div className="relative flex items-start justify-between">
              {/* 연결선 */}
              <div className="absolute left-[10%] right-[10%] top-7 h-0.5 bg-[#ce0e2d]/20" />

              {[
                { step: "01", label: "지원서 제출", desc: "온라인 지원서 작성 및 이력서 제출" },
                { step: "02", label: "서류 심사", desc: "영업일 5일 이내 결과 안내" },
                { step: "03", label: "면접", desc: "1차 화상 + 2차 대면 인터뷰" },
                { step: "04", label: "처우 협의", desc: "급여 및 근무조건 상호 협의" },
                { step: "05", label: "입사", desc: "환영합니다! BAYADA 가족이 되었습니다" },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative flex flex-col items-center text-center"
                  style={{ width: "18%" }}
                >
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#ce0e2d] text-sm font-bold text-white shadow-sm">
                    {s.step}
                  </div>
                  <div className="mt-4 font-semibold text-black/[0.87]">{s.label}</div>
                  <div className="mt-1.5 text-xs leading-relaxed text-black/40">{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 모바일: 수직 타임라인 */}
          <div className="mt-12 lg:hidden">
            <div className="relative pl-10">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#ce0e2d]/20" />
              {[
                { step: "01", label: "지원서 제출", desc: "온라인 지원서 작성 및 이력서 제출" },
                { step: "02", label: "서류 심사", desc: "영업일 5일 이내 결과 안내" },
                { step: "03", label: "면접", desc: "1차 화상 + 2차 대면 인터뷰" },
                { step: "04", label: "처우 협의", desc: "급여 및 근무조건 상호 협의" },
                { step: "05", label: "입사", desc: "환영합니다! BAYADA 가족이 되었습니다" },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative mb-8 last:mb-0"
                >
                  <div className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#ce0e2d] text-xs font-bold text-white">
                    {s.step}
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5 shadow-sm">
                    <div className="font-semibold text-black/[0.87]">{s.label}</div>
                    <div className="mt-1 text-sm text-black/50">{s.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. 채용 공고 (탭 필터) ─────────────────────── */}
      <section id="jobs" className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="show"
            variants={stagger}
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.span variants={fadeUp} className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              모집 중인 공고
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-4 font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              지금 바로 지원하세요
            </motion.h2>
          </motion.div>

          {/* 탭 */}
          <div className="mt-8 flex flex-wrap gap-2">
            {DEPTS.map((dept) => {
              const count =
                dept === "전체"
                  ? activeJobs.length
                  : activeJobs.filter((j) => j.dept === dept).length;
              return (
                <button
                  key={dept}
                  onClick={() => setActiveTab(dept)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    activeTab === dept
                      ? "bg-[#ce0e2d] text-white"
                      : "bg-[#f5f7f9] text-black/50 hover:text-black/[0.87] ring-1 ring-black/10"
                  }`}
                >
                  {dept}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                      activeTab === dept ? "bg-white/20 text-white" : "bg-black/5"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 공고 카드 */}
          <motion.div
            initial="hidden"
            whileInView="show"
            variants={stagger}
            viewport={{ once: true, margin: "-40px" }}
            className="mt-6 space-y-4"
          >
            {filteredJobs.length === 0 ? (
              <div className="rounded-2xl bg-[#f5f7f9] p-12 text-center text-black/40">
                해당 부서의 현재 채용 공고가 없습니다.
              </div>
            ) : (
              filteredJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  variants={fadeUp}
                  custom={i}
                  className="group flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    {/* 부서 배지 */}
                    <span className="inline-block rounded-full bg-[#ce0e2d]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#ce0e2d]">
                      {job.dept}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-black/[0.87] group-hover:text-[#ce0e2d] transition-colors">
                      {job.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-black/40">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        마감 {job.deadline}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/${locale}/contact`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-sm font-medium text-white transition-colors hover:bg-[#980019] shrink-0"
                  >
                    지원하기
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* ── 7. 마감 공고 ─────────────────────────────── */}
          {closedJobs.length > 0 && (
            <div className="mt-10">
              <button
                onClick={() => setClosedOpen(!closedOpen)}
                className="flex items-center gap-2 text-sm font-medium text-black/40 hover:text-black/60 transition-colors"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${closedOpen ? "rotate-180" : ""}`}
                />
                마감된 공고 {closedJobs.length}건
              </button>

              {closedOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-3"
                >
                  {closedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-col gap-3 rounded-2xl border border-dashed border-black/10 bg-[#f5f7f9]/60 p-5 opacity-60 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <span className="inline-block rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-semibold text-black/40">
                          {job.dept}
                        </span>
                        <h3 className="mt-1.5 font-medium text-black/50 line-through decoration-black/20">
                          {job.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-black/30">
                          <span>{job.location}</span>
                          <span>·</span>
                          <span>마감 {job.deadline}</span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-lg border border-black/10 px-4 py-1.5 text-xs font-medium text-black/30">
                        채용 마감
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── 8. 직원 추천사 ──────────────────────────────── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-2xl bg-white p-10 ring-1 ring-black/5 shadow-sm lg:p-16"
          >
            <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-16">
              {/* 아바타 */}
              <div className="shrink-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#ce0e2d]/10 text-3xl font-bold text-[#ce0e2d]">
                  김
                </div>
                <div className="mt-3 text-center">
                  <div className="font-semibold text-black/[0.87]">김미영</div>
                  <div className="text-xs text-black/50">전문 간호사 · 3년차</div>
                  <div className="mt-2 flex justify-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-[#f59e0b] text-[#f59e0b]" />
                    ))}
                  </div>
                </div>
              </div>

              {/* 인용문 */}
              <div className="flex-1">
                <div className="mb-4 text-5xl font-black leading-none text-[#ce0e2d]/20 select-none">
                  "
                </div>
                <blockquote className="text-lg font-medium leading-relaxed text-black/[0.87] lg:text-xl">
                  BAYADA에 합류하기 전까지는 '의미 있는 일'이 뭔지 몰랐어요.
                  여기서 처음으로, 퇴근 후에도 오늘 내가 좋은 일을 했다는 확신이 생겼습니다.
                  교육 지원도 훌륭하고, 동료들이 정말 든든한 팀이에요.
                  이 일을 선택한 것이 제 인생에서 가장 잘한 결정입니다.
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs text-black/50">
                    <Building2 className="h-3 w-3" />
                    서울 케어서비스팀
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs text-black/50">
                    <CheckCircle2 className="h-3 w-3 text-[#10b981]" />
                    인증된 리뷰
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 9. 하단 CTA ─────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ce0e2d]">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2
              className="mt-6 font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)", letterSpacing: "-0.02em" }}
            >
              우리 팀에 합류하세요
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-black/50">
              당신의 전문성과 열정이 누군가의 삶을 바꿀 수 있습니다.
              <br />
              BAYADA와 함께라면, 일이 사명이 됩니다.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                지금 지원하기
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
              >
                채용 문의
              </Link>
            </div>

            <p className="mt-6 text-xs text-black/30">
              채용 관련 문의: recruit@bayada.kr · 평일 09:00–18:00
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
