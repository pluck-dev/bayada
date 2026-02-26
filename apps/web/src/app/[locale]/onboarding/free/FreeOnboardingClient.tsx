"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  Shield,
  Clock,
  Zap,
  Gift,
  ArrowRight,
  Phone,
  Mail,
  User,
  Heart,
  Star,
  ChevronRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const HERO_BENEFITS = [
  { icon: Check, text: "24시간 AI 건강 상담" },
  { icon: Check, text: "맞춤 서비스 추천" },
  { icon: Check, text: "건강 정보 콘텐츠 무제한" },
];

const BENEFIT_CARDS = [
  {
    icon: Zap,
    title: "DeiBud AI 상담",
    desc: "24시간 무료 AI 건강 상담으로 언제든 궁금증을 해결하세요.",
  },
  {
    icon: Heart,
    title: "맞춤 서비스 매칭",
    desc: "나의 상황에 꼭 맞는 홈헬스케어 서비스를 추천해드립니다.",
  },
  {
    icon: Gift,
    title: "건강 콘텐츠",
    desc: "맞춤형 건강 정보와 케어 팁을 정기적으로 제공합니다.",
  },
  {
    icon: Phone,
    title: "빠른 상담 연결",
    desc: "전문 상담사와의 우선 연결로 신속한 도움을 받으세요.",
  },
];

const TRUST_ITEMS = [
  { icon: Shield, label: "개인정보 안전 보호" },
  { icon: Clock, label: "2분 완료" },
  { icon: Check, label: "무료, 약정 없음" },
];

const FAQS = [
  {
    q: "무료 멤버십은 정말 무료인가요?",
    a: "네, 완전 무료입니다. 가입비·월정액·숨은 비용이 전혀 없습니다.",
  },
  {
    q: "언제든 해지할 수 있나요?",
    a: "네, 언제든지 제한 없이 해지 가능합니다. 위약금도 없습니다.",
  },
  {
    q: "어떤 정보를 제공받나요?",
    a: "AI 상담, 맞춤 서비스 추천, 건강 콘텐츠를 무료로 제공합니다.",
  },
];

const CONDITIONS = ["당뇨", "고혈압", "치매", "기타"];
const LTCI_OPTIONS = ["예", "아니오", "모름"];

export function FreeOnboardingClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [ltci, setLtci] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleCondition = (c: string) =>
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  return (
    <div className="bg-[#f5f7f9]">
      {/* ── 1. Split Hero ──────────────────────────────────────────── */}
      <section className="bg-[#f5f7f9]">
        <div className="mx-auto max-w-[1512px] px-4 py-16 sm:px-6 lg:px-12 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Value proposition */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
              className="max-w-xl"
            >
              {/* 라벨 배지 */}
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#ce0e2d]/10 px-3 py-1 text-xs font-semibold text-[#ce0e2d]">
                <Star className="h-3 w-3 fill-current" />
                완전 무료 · 약정 없음
              </span>

              <h1
                className="font-bold leading-tight tracking-tight text-black/[0.87]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
              >
                무료 멤버십
                <br />
                <span className="text-[#ce0e2d]">시작하기</span>
              </h1>

              <p className="mt-4 text-xl font-medium text-black/60">
                2분이면 충분합니다
              </p>

              <p className="mt-3 text-base text-black/50">
                BAYADA 무료 멤버십으로 AI 건강 상담부터 맞춤 서비스 추천까지,
                홈헬스케어의 첫걸음을 지금 바로 시작하세요.
              </p>

              <ul className="mt-8 space-y-3">
                {HERO_BENEFITS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-white">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium text-black/[0.87]">{text}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-sm text-black/50">
                이미{" "}
                <span className="font-semibold text-black/[0.87]">1,200명 이상</span>이
                BAYADA 멤버십을 이용 중입니다.
              </p>
            </motion.div>

            {/* Right: Form card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                {/* Card header */}
                <div className="rounded-t-2xl bg-[#ce0e2d] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-white">
                      기본 정보 입력
                    </h2>
                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#ce0e2d]">
                        1
                      </div>
                      <div className="h-0.5 w-5 bg-white/40" />
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-xs font-bold text-white">
                        2
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="space-y-4 p-6">
                  {/* 이름 */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-black/[0.87]">
                      이름 <span className="text-[#ce0e2d]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력하세요"
                        className="w-full rounded-lg border border-black/10 py-3 pl-9 pr-4 text-sm text-black/[0.87] placeholder:text-black/30 outline-none transition focus:border-[#ce0e2d] focus:ring-1 focus:ring-[#ce0e2d]"
                      />
                    </div>
                  </div>

                  {/* 연락처 */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-black/[0.87]">
                      연락처 <span className="text-[#ce0e2d]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010-0000-0000"
                        className="w-full rounded-lg border border-black/10 py-3 pl-9 pr-4 text-sm text-black/[0.87] placeholder:text-black/30 outline-none transition focus:border-[#ce0e2d] focus:ring-1 focus:ring-[#ce0e2d]"
                      />
                    </div>
                  </div>

                  {/* 이메일 */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-black/[0.87]">
                      이메일
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full rounded-lg border border-black/10 py-3 pl-9 pr-4 text-sm text-black/[0.87] placeholder:text-black/30 outline-none transition focus:border-[#ce0e2d] focus:ring-1 focus:ring-[#ce0e2d]"
                      />
                    </div>
                  </div>

                  {/* 기본 건강 정보 */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black/[0.87]">
                      기본 건강 정보{" "}
                      <span className="font-normal text-black/50">(선택)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CONDITIONS.map((c) => {
                        const checked = conditions.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleCondition(c)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                              checked
                                ? "border-[#ce0e2d] bg-[#ce0e2d]/10 text-[#ce0e2d]"
                                : "border-black/10 bg-white text-black/60 hover:border-black/20"
                            }`}
                          >
                            {checked && <Check className="h-3 w-3" />}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 장기요양등급 */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black/[0.87]">
                      장기요양등급 보유
                    </label>
                    <div className="flex gap-3">
                      {LTCI_OPTIONS.map((o) => (
                        <label
                          key={o}
                          className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border py-2 text-sm font-medium transition ${
                            ltci === o
                              ? "border-[#ce0e2d] bg-[#ce0e2d]/10 text-[#ce0e2d]"
                              : "border-black/10 bg-white text-black/60 hover:border-black/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name="ltci"
                            value={o}
                            checked={ltci === o}
                            onChange={() => setLtci(o)}
                            className="sr-only"
                          />
                          {o}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="button"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019] active:scale-[0.98]"
                  >
                    다음 단계로
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-center text-xs text-black/50">
                    가입 시{" "}
                    <Link href="/ko/privacy" className="underline hover:text-black/[0.87]">
                      개인정보 처리방침
                    </Link>
                    에 동의하는 것으로 간주됩니다.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. Trust indicators strip ───────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="border-y border-black/5 bg-white"
      >
        <div className="mx-auto max-w-[1512px] px-4 py-6 sm:px-6 lg:px-12">
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                  <Icon className="h-4 w-4 text-[#ce0e2d]" />
                </span>
                <span className="text-sm font-semibold text-black/[0.87]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 3. What you get ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              멤버십 혜택
            </p>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              무료 멤버십으로 받는 혜택
            </h2>
            <p className="mt-3 text-black/60">
              가입 즉시 아래 모든 혜택을 무료로 이용하실 수 있습니다.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {BENEFIT_CARDS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                  <Icon className="h-6 w-6 text-[#ce0e2d]" />
                </span>
                <div>
                  <h3 className="font-semibold text-black/[0.87]">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-black/60">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FAQ mini ─────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              FAQ
            </p>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              자주 묻는 질문
            </h2>
          </motion.div>

          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <motion.div
                key={q}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="overflow-hidden rounded-xl border border-black/10"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-black/[0.87]">{q}</span>
                  <ChevronRight
                    className={`h-4 w-4 flex-shrink-0 text-black/50 transition-transform ${
                      openFaq === i ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="border-t border-black/5 bg-[#f5f7f9] px-5 py-4">
                    <p className="text-sm leading-relaxed text-black/60">{a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Upgrade hint ─────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#f5f7f9] py-16 lg:py-24"
      >
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-white px-8 py-8 ring-1 ring-black/5 shadow-sm sm:flex-row">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
                프리미엄 케어
              </p>
              <h3 className="mt-1 text-xl font-bold text-black/[0.87]">
                더 전문적인 케어가 필요하신가요?
              </h3>
              <p className="mt-1 text-sm text-black/60">
                전담 케어 매니저, 방문 상담, 맞춤 케어 플랜을 경험해보세요.
              </p>
            </div>
            <Link
              href="/ko/onboarding/paid"
              className="flex flex-shrink-0 items-center gap-2 rounded-lg border border-[#ce0e2d] px-6 py-[13px] text-base font-medium text-[#ce0e2d] transition-colors hover:bg-[#ce0e2d] hover:text-white"
            >
              유료 멤버십 알아보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
