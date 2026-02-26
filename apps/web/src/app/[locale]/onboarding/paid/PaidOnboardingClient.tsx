"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Crown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Home,
  Activity,
  Brain,
  Utensils,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Clipboard,
  Stethoscope,
  Heart,
  Users,
  Building2,
  HandHelping,
  Bike,
} from "lucide-react";

// ─── 타입 ───────────────────────────────────────────────────────────────────

interface FormData {
  living: string;
  activityLevel: string;
  interests: string[];
  careFrequency: string;
}

// ─── 상수 ───────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "라이프스타일", icon: Home },
  { label: "건강정보", icon: Stethoscope },
  { label: "맞춤결과", icon: Clipboard },
  { label: "서비스디자인", icon: Sparkles },
  { label: "신청완료", icon: CheckCircle2 },
];

const LIVING_OPTIONS = [
  { value: "혼자", label: "독거", desc: "혼자 거주", icon: Home },
  { value: "가족", label: "가족동거", desc: "가족과 함께", icon: Users },
  { value: "시설", label: "시설거주", desc: "요양원/시설", icon: Building2 },
];

const ACTIVITY_OPTIONS = [
  {
    value: "독립",
    label: "독립 생활",
    desc: "대부분의 일상을 혼자 처리",
    icon: Bike,
  },
  {
    value: "부분",
    label: "부분 도움",
    desc: "일부 활동에 보조 필요",
    icon: HandHelping,
  },
  {
    value: "전적",
    label: "전적 도움",
    desc: "전반적인 일상 보조 필요",
    icon: Heart,
  },
];

const INTEREST_OPTIONS = [
  { value: "만성질환", label: "만성질환 관리", icon: Activity },
  { value: "인지훈련", label: "인지 훈련", icon: Brain },
  { value: "영양식단", label: "영양/식단", icon: Utensils },
  { value: "정서지원", label: "정서적 지원", icon: Heart },
  { value: "재활운동", label: "재활/운동", icon: Bike },
  { value: "가사지원", label: "가사 지원", icon: Home },
  { value: "응급관리", label: "응급 관리", icon: Shield },
  { value: "건강모니터링", label: "건강 모니터링", icon: Stethoscope },
];

const FREQUENCY_OPTIONS = [
  {
    value: "매일",
    label: "매일",
    desc: "365일 상시 케어",
    badge: "집중 케어",
  },
  {
    value: "주2-3회",
    label: "주 2–3회",
    desc: "정기적 방문 케어",
    badge: "표준 케어",
  },
  {
    value: "주1회",
    label: "주 1회",
    desc: "주간 방문 케어",
    badge: "경량 케어",
  },
];

const PREMIUM_POINTS = [
  {
    icon: Users,
    title: "전문 상담사 1:1 매칭",
    desc: "전담 상담사가 처음부터 끝까지 함께합니다",
  },
  {
    icon: Clipboard,
    title: "맞춤 케어 플랜 설계",
    desc: "설문 결과를 바탕으로 개인화된 계획을 수립합니다",
  },
  {
    icon: Crown,
    title: "전담 코디네이터 배정",
    desc: "언제든 연락 가능한 전담 코디네이터를 배정합니다",
  },
];

const PROCESS_STEPS = [
  { step: 1, label: "라이프스타일 설문", time: "3분", icon: Home },
  { step: 2, label: "건강 정보 입력", time: "5분", icon: Stethoscope },
  { step: 3, label: "맞춤 결과 확인", time: "2분", icon: Clipboard },
  { step: 4, label: "서비스 디자인 제안", time: "5분", icon: Sparkles },
  { step: 5, label: "서비스 신청 완료", time: "3분", icon: CheckCircle2 },
];

const GUARANTEES = [
  { icon: Shield, label: "100% 만족 보장" },
  { icon: Star, label: "첫 방문 무료 체험" },
  { icon: Clock, label: "언제든 변경 가능" },
];

// ─── 서브 컴포넌트 ──────────────────────────────────────────────────────────

function SelectionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full cursor-pointer rounded-2xl p-4 text-left transition-all duration-200 ring-1 ${
        selected
          ? "ring-[#ce0e2d] bg-[#ce0e2d]/5"
          : "ring-black/5 bg-white hover:ring-black/10"
      }`}
    >
      {selected && (
        <div className="absolute right-3 top-3">
          <CheckCircle2 className="h-5 w-5 text-[#ce0e2d]" />
        </div>
      )}
      {children}
    </button>
  );
}

// ─── 메인 컴포넌트 ──────────────────────────────────────────────────────────

export default function PaidOnboardingClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormData>({
    living: "",
    activityLevel: "",
    interests: [],
    careFrequency: "",
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  function setSingle(field: keyof Omit<FormData, "interests">, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleInterest(value: string) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter((v) => v !== value)
        : [...prev.interests, value],
    }));
  }

  function goNext() {
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goPrev() {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  const canProceed =
    form.living !== "" &&
    form.activityLevel !== "" &&
    form.interests.length > 0 &&
    form.careFrequency !== "";

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-[#f5f7f9]">
      {/* ── 프리미엄 히어로 ── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            {/* 배지 */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ce0e2d]/20 bg-[#ce0e2d]/10 px-4 py-1.5">
              <Crown className="h-4 w-4 text-[#ce0e2d]" />
              <span className="text-sm font-semibold text-[#ce0e2d]">
                BAYADA 프리미엄 멤버십
              </span>
            </div>

            {/* 제목 */}
            <h1
              className="font-bold leading-tight text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              나만의 케어 플랜 설계
            </h1>

            <p className="mt-4 text-lg text-black/60">
              5단계로 완성하는 맞춤형 홈헬스케어
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              {["개인 맞춤 설계", "전문가 1:1 상담", "즉시 시작 가능"].map(
                (text) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#ce0e2d]" />
                    <span className="text-sm text-black/60">{text}</span>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 진행 표시줄 ── */}
      <div className="sticky top-0 z-20 border-b border-black/5 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-6 py-4">
          {/* 스텝 라벨 */}
          <div className="mb-3 flex items-center justify-between">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === currentStep;
              const isComplete = i < currentStep;
              return (
                <div key={step.label} className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                      isComplete
                        ? "bg-[#ce0e2d] text-white"
                        : isActive
                          ? "bg-[#ce0e2d]/10 text-[#ce0e2d] ring-2 ring-[#ce0e2d]"
                          : "bg-black/5 text-black/30"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`mt-1 hidden text-xs font-medium sm:block ${
                      isActive
                        ? "text-[#ce0e2d]"
                        : isComplete
                          ? "text-black/[0.87]"
                          : "text-black/30"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 프로그레스 바 */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
            <motion.div
              className="h-full rounded-full bg-[#ce0e2d]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <p className="mt-1.5 text-right text-xs text-black/50">
            {currentStep + 1} / {STEPS.length} 단계
          </p>
        </div>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* 왼쪽: 폼 영역 */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {currentStep === 0 && (
                <motion.div
                  key="step-0"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
                    {/* 폼 헤더 */}
                    <div className="mb-8 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ce0e2d]/10">
                        <Home className="h-5 w-5 text-[#ce0e2d]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
                          Step 1
                        </p>
                        <h2 className="text-xl font-bold text-black/[0.87]">
                          라이프스타일 설문
                        </h2>
                      </div>
                    </div>

                    {/* 거주 형태 */}
                    <div className="mb-8">
                      <p className="mb-3 text-sm font-medium text-black/[0.87]">
                        거주 형태{" "}
                        <span className="text-[#ce0e2d]">*</span>
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {LIVING_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <SelectionCard
                              key={opt.value}
                              selected={form.living === opt.value}
                              onClick={() => setSingle("living", opt.value)}
                            >
                              <Icon
                                className={`mb-2 h-6 w-6 ${form.living === opt.value ? "text-[#ce0e2d]" : "text-black/30"}`}
                              />
                              <p
                                className={`text-sm font-semibold ${form.living === opt.value ? "text-[#ce0e2d]" : "text-black/[0.87]"}`}
                              >
                                {opt.label}
                              </p>
                              <p className="mt-0.5 text-xs text-black/50">
                                {opt.desc}
                              </p>
                            </SelectionCard>
                          );
                        })}
                      </div>
                    </div>

                    {/* 활동 수준 */}
                    <div className="mb-8">
                      <p className="mb-3 text-sm font-medium text-black/[0.87]">
                        일상 활동 수준{" "}
                        <span className="text-[#ce0e2d]">*</span>
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {ACTIVITY_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <SelectionCard
                              key={opt.value}
                              selected={form.activityLevel === opt.value}
                              onClick={() =>
                                setSingle("activityLevel", opt.value)
                              }
                            >
                              <Icon
                                className={`mb-2 h-6 w-6 ${form.activityLevel === opt.value ? "text-[#ce0e2d]" : "text-black/30"}`}
                              />
                              <p
                                className={`text-sm font-semibold ${form.activityLevel === opt.value ? "text-[#ce0e2d]" : "text-black/[0.87]"}`}
                              >
                                {opt.label}
                              </p>
                              <p className="mt-0.5 text-xs text-black/50">
                                {opt.desc}
                              </p>
                            </SelectionCard>
                          );
                        })}
                      </div>
                    </div>

                    {/* 주요 관심사 */}
                    <div className="mb-8">
                      <p className="mb-1 text-sm font-medium text-black/[0.87]">
                        주요 관심사{" "}
                        <span className="text-[#ce0e2d]">*</span>
                      </p>
                      <p className="mb-3 text-xs text-black/50">
                        해당하는 항목을 모두 선택하세요
                      </p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {INTEREST_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          const selected = form.interests.includes(opt.value);
                          return (
                            <SelectionCard
                              key={opt.value}
                              selected={selected}
                              onClick={() => toggleInterest(opt.value)}
                            >
                              <Icon
                                className={`mb-1.5 h-5 w-5 ${selected ? "text-[#ce0e2d]" : "text-black/30"}`}
                              />
                              <p
                                className={`text-xs font-semibold leading-tight ${selected ? "text-[#ce0e2d]" : "text-black/[0.87]"}`}
                              >
                                {opt.label}
                              </p>
                            </SelectionCard>
                          );
                        })}
                      </div>
                    </div>

                    {/* 케어 빈도 */}
                    <div className="mb-8">
                      <p className="mb-3 text-sm font-medium text-black/[0.87]">
                        케어 필요 빈도{" "}
                        <span className="text-[#ce0e2d]">*</span>
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {FREQUENCY_OPTIONS.map((opt) => {
                          const selected = form.careFrequency === opt.value;
                          return (
                            <SelectionCard
                              key={opt.value}
                              selected={selected}
                              onClick={() =>
                                setSingle("careFrequency", opt.value)
                              }
                            >
                              <span
                                className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  selected
                                    ? "bg-[#ce0e2d] text-white"
                                    : "bg-black/5 text-black/50"
                                }`}
                              >
                                {opt.badge}
                              </span>
                              <p
                                className={`text-sm font-bold ${selected ? "text-[#ce0e2d]" : "text-black/[0.87]"}`}
                              >
                                {opt.label}
                              </p>
                              <p className="mt-0.5 text-xs text-black/50">
                                {opt.desc}
                              </p>
                            </SelectionCard>
                          );
                        })}
                      </div>
                    </div>

                    {/* 네비게이션 */}
                    <div className="flex items-center justify-between border-t border-black/5 pt-6">
                      <Link
                        href="/"
                        className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black/[0.87]"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        처음으로
                      </Link>
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={!canProceed}
                        className={`flex items-center gap-2 rounded-lg px-6 py-[13px] text-base font-medium transition-colors ${
                          canProceed
                            ? "bg-[#ce0e2d] text-white hover:bg-[#980019]"
                            : "cursor-not-allowed bg-black/5 text-black/30"
                        }`}
                      >
                        다음 단계
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* 프리미엄 차별점 */}
                  <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-black/5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <Crown className="h-5 w-5 text-[#ce0e2d]" />
                      <p className="text-sm font-bold text-black/[0.87]">
                        프리미엄 멤버십 혜택
                      </p>
                    </div>
                    <div className="space-y-3">
                      {PREMIUM_POINTS.map((pt) => {
                        const Icon = pt.icon;
                        return (
                          <div key={pt.title} className="flex gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                              <Icon className="h-4 w-4 text-[#ce0e2d]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-black/[0.87]">
                                {pt.title}
                              </p>
                              <p className="text-xs text-black/50">{pt.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep > 0 && currentStep < STEPS.length - 1 && (
                <motion.div
                  key={`step-${currentStep}`}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ce0e2d]/10">
                        {(() => {
                          const Icon = STEPS[currentStep].icon;
                          return <Icon className="h-5 w-5 text-[#ce0e2d]" />;
                        })()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
                          Step {currentStep + 1}
                        </p>
                        <h2 className="text-xl font-bold text-black/[0.87]">
                          {STEPS[currentStep].label}
                        </h2>
                      </div>
                    </div>
                    <div className="flex min-h-40 items-center justify-center rounded-2xl bg-[#f5f7f9]">
                      <p className="text-sm text-black/50">
                        이 단계의 콘텐츠가 여기에 표시됩니다
                      </p>
                    </div>
                    <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-6">
                      <button
                        type="button"
                        onClick={goPrev}
                        className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black/[0.87]"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        이전
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-[13px] text-base font-medium text-white transition-colors hover:bg-[#980019]"
                      >
                        다음 단계
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === STEPS.length - 1 && (
                <motion.div
                  key="step-complete"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-black/5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#ce0e2d]/10"
                    >
                      <CheckCircle2 className="h-10 w-10 text-[#ce0e2d]" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-black/[0.87]">
                      신청이 완료되었습니다
                    </h2>
                    <p className="mt-3 text-black/60">
                      전담 상담사가 24시간 이내에 연락드립니다
                    </p>
                    <Link
                      href="/"
                      className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-[13px] text-base font-medium text-white transition-colors hover:bg-[#980019]"
                    >
                      홈으로 돌아가기
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div className="space-y-6">
            {/* 프로세스 타임라인 */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#ce0e2d]" />
                <p className="text-sm font-bold text-black/[0.87]">
                  전체 과정 안내
                </p>
              </div>
              <div className="space-y-1">
                {PROCESS_STEPS.map((ps, i) => {
                  const isActive = i === currentStep;
                  const isDone = i < currentStep;
                  return (
                    <div key={ps.step} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            isDone
                              ? "bg-[#ce0e2d] text-white"
                              : isActive
                                ? "bg-[#ce0e2d]/10 text-[#ce0e2d] ring-2 ring-[#ce0e2d]"
                                : "bg-black/5 text-black/30"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            ps.step
                          )}
                        </div>
                        {i < PROCESS_STEPS.length - 1 && (
                          <div
                            className={`mt-1 h-6 w-0.5 ${isDone ? "bg-[#ce0e2d]" : "bg-black/10"}`}
                          />
                        )}
                      </div>
                      <div className="pb-2 pt-0.5">
                        <p
                          className={`text-xs font-semibold ${isActive ? "text-[#ce0e2d]" : isDone ? "text-black/[0.87]" : "text-black/30"}`}
                        >
                          {ps.label}
                        </p>
                        <p className="text-[10px] text-black/50">
                          약 {ps.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 후기 카드 */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="mb-3 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-black/60">
                "맞춤 케어 플랜 덕분에 어머니의 생활이 크게 개선되었습니다.
                전담 코디네이터가 세심하게 관리해주셔서 정말 감사합니다."
              </p>
              <div className="mt-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ce0e2d]/10 text-xs font-bold text-[#ce0e2d]">
                  김
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/[0.87]">
                    김○○ 보호자
                  </p>
                  <p className="text-[10px] text-black/50">
                    프리미엄 멤버 · 6개월 이용
                  </p>
                </div>
              </div>
            </div>

            {/* 신뢰 보장 */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
                BAYADA 보장
              </p>
              <div className="space-y-3">
                {GUARANTEES.map((g) => {
                  const Icon = g.icon;
                  return (
                    <div key={g.label} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                        <Icon className="h-4 w-4 text-[#ce0e2d]" />
                      </div>
                      <p className="text-sm font-semibold text-black/[0.87]">
                        {g.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
