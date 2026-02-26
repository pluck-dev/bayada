"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Activity,
  Sparkles,
  Users,
  ShieldCheck,
  Lock,
  Clock,
  ChevronDown,
} from "lucide-react";
import { ContentImageSplit } from "@/components/sections/ContentImageSplit";
import { getPlatformBySlug } from "@/data/platforms";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Activity,
  Sparkles,
  Users,
};

const ease = [0.16, 1, 0.3, 1] as const;

const CHAT_MESSAGES = [
  {
    role: "user" as const,
    text: "어머니가 당뇨가 있으신데, 어떤 케어 서비스가 맞을까요?",
  },
  {
    role: "ai" as const,
    text: "안녕하세요! 당뇨 환자분을 위한 맞춤 케어를 안내해 드릴게요.\n\n혈당 관리 케어, 식이요법 지원, 정기 모니터링을 포함한 당뇨 전문 케어 프로그램을 추천드립니다. 지역과 일정을 알려주시면 최적의 케어 매니저를 연결해 드릴 수 있어요. 😊",
  },
  { role: "user" as const, text: "감사합니다! 바로 상담 신청할게요." },
];

function ChatPreview() {
  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
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
            AI 대화 미리보기
          </h2>
          <p className="mt-3 text-base text-black/60">
            자연스러운 대화로 케어 가이드를 받아보세요
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="mx-auto max-w-xl"
        >
          {/* 채팅 창 */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            {/* 헤더 */}
            <div className="flex items-center gap-3 border-b border-black/5 bg-white px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                <Sparkles className="h-4 w-4 text-[#ce0e2d]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-black/[0.87]">DeiBud AI</p>
                <p className="text-xs text-black/50">온라인 · 24시간 응답</p>
              </div>
              <div className="ml-auto h-2 w-2 rounded-full bg-green-500" />
            </div>

            {/* 메시지 목록 */}
            <div className="space-y-4 p-5">
              {CHAT_MESSAGES.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 * i, ease }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                      <Sparkles className="h-4 w-4 text-[#ce0e2d]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-[#ce0e2d] text-white"
                        : "rounded-bl-sm bg-[#f5f7f9] text-black/80"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 입력 영역 */}
            <div className="border-t border-black/5 px-5 py-4">
              <div className="flex items-center gap-3 rounded-xl bg-[#f5f7f9] px-4 py-3">
                <span className="flex-1 text-sm text-black/30">
                  메시지를 입력하세요...
                </span>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ce0e2d]">
                  <svg
                    className="h-3.5 w-3.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCards({
  features,
}: {
  features: NonNullable<
    ReturnType<typeof getPlatformBySlug>
  >["keyFeatures"];
}) {
  if (!features) return null;

  return (
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
            핵심 기능
          </h2>
          <p className="mt-3 text-base text-black/60">
            DeiBud가 제공하는 4가지 AI 케어 기능
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feat, i) => {
            const Icon = ICON_MAP[feat.icon];
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.1 * i, ease }}
                className="rounded-2xl bg-white p-8 ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                  {Icon ? (
                    <Icon className="h-5 w-5 text-[#ce0e2d]" />
                  ) : (
                    <span className="text-base">{feat.icon}</span>
                  )}
                </div>
                <h3 className="mb-3 text-xl font-bold text-black/[0.87]">
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed text-black/60">
                  {feat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function UseCaseTabs({
  useCases,
}: {
  useCases: NonNullable<
    ReturnType<typeof getPlatformBySlug>
  >["useCases"];
}) {
  const [activeTab, setActiveTab] = useState(0);
  if (!useCases || useCases.length === 0) return null;

  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
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
            활용 사례
          </h2>
          <p className="mt-3 text-base text-black/60">
            다양한 상황에서 DeiBud를 활용하세요
          </p>
        </motion.div>

        {/* 탭 버튼 */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {useCases.map((uc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === i
                  ? "bg-[#ce0e2d] text-white"
                  : "bg-white text-black/60 ring-1 ring-black/10 hover:ring-[#ce0e2d]/40"
              }`}
            >
              {uc.title}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease }}
            className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5"
          >
            <h3 className="mb-4 text-xl font-bold text-black/[0.87]">
              {useCases[activeTab].title}
            </h3>
            <p className="text-base leading-relaxed text-black/60">
              {useCases[activeTab].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

const TRUST_BADGES = [
  {
    Icon: ShieldCheck,
    title: "개인정보 보호",
    desc: "AES-256 암호화 저장, 개인정보보호법 완전 준수",
  },
  {
    Icon: Lock,
    title: "의료법 준수",
    desc: "국내 의료법·약사법 기준에 따른 정보 제공 및 운영",
  },
  {
    Icon: Clock,
    title: "24시간 서비스",
    desc: "365일 중단 없는 AI 케어 가이드 서비스 운영",
  },
];

function TrustBadges() {
  return (
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
            기술 안정성
          </h2>
          <p className="mt-3 text-base text-black/60">
            안심하고 사용할 수 있는 신뢰 기반
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TRUST_BADGES.map((badge, i) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 * i, ease }}
              className="flex flex-col items-center rounded-2xl bg-white p-8 text-center ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                <badge.Icon className="h-5 w-5 text-[#ce0e2d]" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-black/[0.87]">
                {badge.title}
              </h3>
              <p className="text-sm leading-relaxed text-black/60">
                {badge.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({
  faqs,
}: {
  faqs: NonNullable<ReturnType<typeof getPlatformBySlug>>["faqs"];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="bg-[#f5f7f9] py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
          >
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              자주 묻는 질문
            </h2>
            <p className="mt-4 text-base text-black/60">
              DeiBud에 대해 궁금한 점을 확인하세요.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="space-y-0 divide-y divide-black/5"
          >
            {faqs.map((faq, i) => (
              <div key={i} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(openIndex === i ? null : i)
                  }
                  className="flex w-full items-center justify-between gap-4 py-5 text-left hover:bg-black/[0.02] transition-colors"
                >
                  <span className="text-base font-semibold text-black/[0.87]">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <ChevronDown className="h-5 w-5 shrink-0 text-black/40" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <p className="pb-5 text-sm leading-relaxed text-black/60">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function DeiBudClient() {
  const platform = getPlatformBySlug("deibud");
  if (!platform) return null;

  const stats = platform.stats ?? [];

  return (
    <main>
      {/* 1. 히어로 */}
      <section className="bg-[#f5f7f9] py-24 lg:py-36">
        <div className="mx-auto max-w-[1512px] px-4 text-center sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d]/10 px-4 py-2"
          >
            <Sparkles className="h-4 w-4 text-[#ce0e2d]" />
            <span className="text-sm font-medium text-[#ce0e2d]">
              AI-Powered Care Guide
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.1 }}
          >
            DeiBud —{" "}
            <span className="text-[#ce0e2d]">AI 케어 가이드</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/60"
          >
            50년 BAYADA 케어 노하우를 학습한 AI가 24시간 곁에서 맞춤형 케어
            가이드를 제공합니다. 음성과 텍스트 모두 지원합니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
            >
              <Sparkles className="h-4 w-4" />
              DeiBud 체험하기
            </a>
          </motion.div>

          {/* 인라인 스탯 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease }}
            className="mt-14 flex flex-wrap justify-center gap-10"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-black/[0.87]">
                  {stat.value}
                  <span className="text-[#ce0e2d]">{stat.suffix}</span>
                </p>
                <p className="mt-1 text-sm text-black/50">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. AI 대화 미리보기 */}
      <ChatPreview />

      {/* 3. 핵심 기능 4카드 */}
      <FeatureCards features={platform.keyFeatures} />

      {/* 4. ContentImageSplit */}
      {platform.contentHeadline && platform.contentDescription && platform.contentImageUrl && (
        <ContentImageSplit
          title={platform.contentHeadline}
          description={platform.contentDescription}
          imageUrl={platform.contentImageUrl}
          imageAlt="DeiBud 서비스 소개"
        />
      )}

      {/* 5. 활용 사례 탭 */}
      <UseCaseTabs useCases={platform.useCases} />

      {/* 6. 기술 안정성 */}
      <TrustBadges />

      {/* 7. FAQ */}
      <FaqSection faqs={platform.faqs} />

      {/* 8. 하단 CTA */}
      <section className="bg-[#f5f7f9] py-20">
        <div className="mx-auto max-w-[1512px] px-4 text-center sm:px-6 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            지금 바로 DeiBud를 경험해보세요
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="mt-4 text-base text-black/60"
          >
            AI 케어 가이드가 24시간 함께합니다
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <a
              href="/contact"
              className="rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
            >
              DeiBud 체험하기
            </a>
            <a
              href="/contact"
              className="rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
            >
              상담 신청
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
