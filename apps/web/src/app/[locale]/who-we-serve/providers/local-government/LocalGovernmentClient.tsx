"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ScrollText,
  GraduationCap,
  Search,
  BarChart3,
  Globe,
  Building2,
  PhoneCall,
  ArrowRight,
} from "lucide-react";
import { providerSegments } from "@/data/audiences";
import {
  ContentImageSplit,
  ProcessTimeline,
  TabPanels,
} from "@/components/sections";

const ease = [0.16, 1, 0.3, 1] as const;

const FEATURE_ICONS = [ScrollText, GraduationCap, Search, BarChart3];

const GLOBAL_CASES = [
  {
    country: "미국",
    flag: "🇺🇸",
    color: "border-blue-400",
    bg: "bg-blue-50",
    title: "Medicare 홈헬스케어 프로그램",
    desc: "연방 정부 주도의 메디케어 홈헬스케어 제도로 65세 이상 노인에게 방문간호·재활 서비스를 제공합니다. BAYADA는 미국 내 500개 이상 지역에서 해당 프로그램을 직접 운영합니다.",
  },
  {
    country: "캐나다",
    flag: "🇨🇦",
    color: "border-red-400",
    bg: "bg-red-50",
    title: "Community Care Access",
    desc: "각 주(Province) 정부가 운영하는 지역사회 케어 접근 센터를 통해 홈헬스케어 서비스를 무상 제공합니다. 캐나다의 사례는 공공-민간 협력 모델의 우수 사례로 평가받습니다.",
  },
  {
    country: "독일",
    flag: "🇩🇪",
    color: "border-yellow-400",
    bg: "bg-yellow-50",
    title: "Pflegeversicherung 시스템",
    desc: "법정 장기요양보험(Pflegeversicherung)을 통해 재가 돌봄 서비스를 전국민에게 보장합니다. 서비스 품질 관리 및 평가 시스템이 정교하게 운영됩니다.",
  },
];

const CONSULTING_FIELDS = [
  "정책 컨설팅",
  "인력 양성 프로그램",
  "품질 관리 시스템 구축",
  "데이터 기반 정책 지원",
  "해외 우수 사례 분석",
];

export default function LocalGovernmentClient() {
  const segment = providerSegments.find((s) => s.slug === "local-government")!;
  const [formData, setFormData] = useState({
    organization: "",
    manager: "",
    contact: "",
    field: "",
  });

  const tabs = (segment.learnMoreItems ?? []).map((item, i) => ({
    id: `tab-${i}`,
    label: item.title,
    content: (
      <div className="rounded-xl border border-gray-100 bg-[#f5f7f9] p-6 lg:p-8">
        <p className="text-base leading-relaxed text-black/70">{item.content}</p>
      </div>
    ),
  }));

  return (
    <main className="overflow-hidden">
      {/* ─── 1. HERO ───────────────────────────────────────────────── */}
      <section className="bg-[#f5f7f9] py-20 lg:py-28">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-start lg:flex-row lg:items-center lg:gap-16">
            {/* 텍스트 */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ce0e2d]/10 px-4 py-1.5 text-sm font-semibold text-[#ce0e2d]">
                  <Building2 className="h-4 w-4" />
                  공공기관 파트너십
                </span>
                <h1
                  className="mt-5 font-bold leading-[1.15] text-black/[0.87]"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
                >
                  지자체
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-black/60">
                  {segment.description}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease }}
                className="mt-8 flex flex-wrap gap-3"
              >
                {segment.highlights.map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium text-black/60"
                  >
                    {h}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* 통계 4개 */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              className="mt-12 grid grid-cols-2 gap-4 lg:mt-0 lg:w-80 lg:shrink-0"
            >
              {(segment.stats ?? []).map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex flex-col rounded-xl bg-white p-5 ring-1 ring-black/5 shadow-sm"
                >
                  <span className="text-2xl font-bold text-[#ce0e2d]">
                    {stat.value}
                    {stat.suffix ?? ""}
                  </span>
                  <span className="mt-1 text-xs font-medium text-black/50">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 2. ContentImageSplit ─────────────────────────────────── */}
      <ContentImageSplit
        title={segment.contentHeadline ?? "지역사회 돌봄 체계 구축"}
        description={
          "BAYADA는 미국·캐나다·유럽 등에서 50년 이상 쌓아온 공공 홈헬스케어 운영 경험을 바탕으로 지자체의 지역사회 돌봄 체계 구축을 전문적으로 지원합니다."
        }
        imageUrl={segment.image}
        imageAlt="지자체 파트너십"
        ctaLabel="컨설팅 상담 신청"
        ctaHref="/contact"
      />

      {/* ─── 3. 정책 프레임워크 2x2 그리드 ───────────────────────── */}
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
              정책 프레임워크
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
              지역사회 돌봄 체계 고도화를 위한 4가지 핵심 영역을 지원합니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {(segment.features ?? []).map((feat, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              const num = String(i + 1).padStart(2, "0");
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease }}
                  className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md overflow-hidden"
                >
                  {/* 큰 번호 */}
                  <span
                    aria-hidden
                    className="absolute right-6 top-4 select-none text-7xl font-black text-black/[0.87]/5 leading-none"
                  >
                    {num}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ce0e2d]/10">
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#ce0e2d]">
                      {num}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-black/[0.87]">
                      {feat.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-black/60">
                      {feat.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 4. 5단계 수직 프로세스 타임라인 ─────────────────────── */}
      <ProcessTimeline
        title={segment.processTitle ?? "협력 프로세스"}
        subtitle="지자체와 BAYADA의 파트너십은 5단계로 진행됩니다."
        steps={segment.processSteps ?? []}
        variant="vertical"
      />

      {/* ─── 5. 해외 사례 참고 ────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-12 text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ce0e2d]/10 px-4 py-1.5 text-sm font-semibold text-[#ce0e2d]">
              <Globe className="h-4 w-4" />
              글로벌 사례
            </span>
            <h2
              className="mt-4 font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              해외 사례 참고
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-black/60">
              BAYADA가 직접 운영하거나 분석한 해외 공공 홈헬스케어 우수 사례를
              제공합니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {GLOBAL_CASES.map((c, i) => (
              <motion.div
                key={c.country}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease }}
                className="flex flex-col rounded-2xl border-t-4 border-[#ce0e2d] bg-white p-7 ring-1 ring-black/5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{c.flag}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-black/40">
                      {c.country}
                    </p>
                    <h3 className="text-base font-bold text-black/[0.87]">
                      {c.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-black/60">
                  {c.desc}
                </p>
                <button
                  type="button"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#ce0e2d] transition-colors hover:text-[#980019]"
                >
                  사례 자료 요청
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. 더 알아보기 TabPanels ─────────────────────────────── */}
      {tabs.length > 0 && (
        <TabPanels title="더 알아보기" tabs={tabs} variant="underline" />
      )}

      {/* ─── 7. 컨설팅 문의 폼 (시각적 전용) ─────────────────────── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="mb-10 text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#ce0e2d]/10 px-4 py-1.5 text-sm font-semibold text-[#ce0e2d]">
                <PhoneCall className="h-4 w-4" />
                공공 파트너십 문의
              </span>
              <h2
                className="mt-4 font-bold text-black/[0.87]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
              >
                컨설팅 문의
              </h2>
              <p className="mt-3 text-base text-black/60">
                지자체 담당자라면 아래 양식을 통해 BAYADA 공공 파트너십팀에
                연락주세요.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-black/[0.87]">
                    기관명 <span className="text-[#ce0e2d]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: ○○시청 복지과"
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, organization: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#ce0e2d] focus:ring-2 focus:ring-[#ce0e2d]/10"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-black/[0.87]">
                    담당자 성함 <span className="text-[#ce0e2d]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: 홍길동 주무관"
                    value={formData.manager}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, manager: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#ce0e2d] focus:ring-2 focus:ring-[#ce0e2d]/10"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-black/[0.87]">
                    연락처 <span className="text-[#ce0e2d]">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="예: 010-1234-5678"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, contact: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#ce0e2d] focus:ring-2 focus:ring-[#ce0e2d]/10"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-black/[0.87]">
                    관심 분야
                  </label>
                  <select
                    value={formData.field}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, field: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#ce0e2d] focus:ring-2 focus:ring-[#ce0e2d]/10"
                  >
                    <option value="">선택해주세요</option>
                    {CONSULTING_FIELDS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#ce0e2d] px-8 py-[13px] text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                컨설팅 문의 신청
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 8. Bottom CTA section ─────────────────────────────────── */}
      <section className="bg-[#f5f7f9] py-20 lg:py-28">
        <div className="mx-auto max-w-[1512px] px-4 text-center sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
              <Building2 className="h-8 w-8 text-[#ce0e2d]" />
            </div>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              지역사회 돌봄 혁신,
              <br />
              BAYADA와 함께 시작하세요
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-black/60">
              50년 이상의 글로벌 공공 홈헬스케어 경험을 지자체 정책에 접목합니다.
              지역 돌봄 접근성 향상과 서비스 품질 고도화를 위한 전문 파트너가
              되겠습니다.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-8 py-[13px] text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                컨설팅 상담 신청
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/who-we-serve/providers"
                className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] px-8 py-[13px] text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
              >
                다른 파트너 보기
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
