"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Search, ChevronDown, ChevronRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { NeedsReview } from "@/components/shared/NeedsReview";

// ── 타입 ──────────────────────────────────────────────────────────────────────

type AgeGroup = "senior" | "adult" | "pediatric";

interface ServiceItem {
  label: string;
  slug: string;
  description: string;
}

// ── 서비스 데이터 ─────────────────────────────────────────────────────────────

const SERVICE_GROUPS: Record<
  AgeGroup,
  { title: string; range: string; color: string; services: ServiceItem[] }
> = {
  senior: {
    title: "노인 케어",
    range: "+65세",
    color: "#ce0e2d",
    services: [
      {
        label: "동행 돌봄 서비스",
        slug: "private-assistive-care",
        description:
          "재가 동행 돌봄 서비스는 소중한 가족의 하루를 더욱 밝게 만들어 드립니다. 친밀한 교류와 대화, 그리고 정서적 지지를 통해 가정에서 편안함과 안정감을 느낄 수 있도록 돕습니다.",
      },
      {
        label: "방문 건강관리 서비스",
        slug: "skilled-nursing",
        description:
          "전문 간호 및 재활 치료를 가정으로 직접 제공하여 회복을 돕고, 건강 상태를 체계적으로 관리하며 불필요한 병원 방문이나 입원을 최소화할 수 있도록 지원합니다.",
      },
      {
        label: "호스피스 돌봄 서비스",
        slug: "hospice",
        description:
          "호스피스 서비스를 재가 케어에 통합함으로써 환자와 가족에게 편안함과 존엄성, 그리고 개인 맞춤형 지원을 제공합니다. 이를 통해 가정에서 함께하는 매 순간을 더욱 의미 있고 소중하게 보내실 수 있도록 돕습니다.",
      },
      {
        label: "일상생활 지원 서비스",
        slug: "ltci-beneficiary-care",
        description:
          "소중한 가족이 일상생활 지원, 안전 관리, 편안함을 위한 도움을 받으며 자립적인 삶을 유지할 수 있도록 합니다. 동시에 가족은 안심하고 일상을 이어갈 수 있습니다.",
      },
      {
        label: "전담 방문간호 서비스",
        slug: "skilled-nursing",
        description:
          "성인을 위한 전문 전담 방문간호 서비스는 고도의 전문성을 갖춘 재가 간호를 제공하여 독립적인 생활을 지속하고, 가장 소중한 것에 집중하며, 매 순간 안심하고 삶을 이어가실 수 있도록 지원합니다.",
      },
    ],
  },
  adult: {
    title: "성인 케어",
    range: "19-64세",
    color: "#1a56db",
    services: [
      {
        label: "기능향상 훈련 서비스",
        slug: "physical-trainer",
        description:
          "바야다 기능향상 훈련 서비스는 지적 장애나 발달 장애를 가진 성인들에게 자신감을 주고, 새로운 스킬을 배우게 하여 집에서, 직장에서, 커뮤니티 내에서 삶을 더 즐길 수 있도록 하는 방문 건강관리 서비스 중 하나입니다.",
      },
      {
        label: "방문 건강관리 서비스",
        slug: "skilled-nursing",
        description:
          "전문 간호 및 재활 치료를 가정으로 직접 제공하여 회복을 돕고, 건강 상태를 체계적으로 관리하며 불필요한 병원 방문이나 입원을 최소화할 수 있도록 지원합니다.",
      },
      {
        label: "호스피스 돌봄 서비스",
        slug: "hospice",
        description:
          "호스피스 서비스를 재가 케어에 통합함으로써 환자와 가족에게 편안함과 존엄성, 그리고 개인 맞춤형 지원을 제공합니다. 이를 통해 가정에서 함께하는 매 순간을 더욱 의미 있고 소중하게 보내실 수 있도록 돕습니다.",
      },
      {
        label: "전담 방문간호 서비스",
        slug: "skilled-nursing",
        description:
          "성인을 위한 전문 전담 방문간호 서비스는 고도의 전문성을 갖춘 재가 간호를 제공하여 독립적인 생활을 지속하고, 가장 소중한 것에 집중하며, 매 순간 안심하고 삶을 이어가실 수 있도록 지원합니다.",
      },
    ],
  },
  pediatric: {
    title: "소아 케어",
    range: "신생아-18세",
    color: "#057a55",
    services: [
      {
        label: "자폐 스펙트럼 및 응용행동분석 치료 서비스",
        slug: "patient-support",
        description:
          "ABA 치료 서비스는 자폐 스펙트럼 아동의 가능성을 확장합니다. 1:1 맞춤 지원을 통해 아동이 성장하고, 의사소통 능력을 향상시키며, 독립성을 기를 수 있도록 설계된 케어를 필요한 장소 어디에서나 제공합니다.",
      },
      {
        label: "소아 방문간호 관리 서비스",
        slug: "skilled-nursing",
        description:
          "전문 소아 재가 방문간호 서비스는 일상적인 돌봄부터 중환자실 수준의 고도 간호까지 제공하여 아동이 안전하게 생활하고 건강하게 성장할 수 있도록 돕습니다. 동시에 가족이 매 순간 안심하고 자신감을 가질 수 있도록 지속적인 지원을 제공합니다.",
      },
    ],
  },
};

// 서비스 타입 필터 목록 (검색 영역용)
const FILTER_OPTIONS: { group: string; items: string[] }[] = [
  {
    group: "노인 케어 (+65세)",
    items: SERVICE_GROUPS.senior.services.map((s) => s.label),
  },
  {
    group: "성인 케어 (19-64세)",
    items: SERVICE_GROUPS.adult.services.map((s) => s.label),
  },
  {
    group: "소아 케어 (신생아-18세)",
    items: SERVICE_GROUPS.pediatric.services.map((s) => s.label),
  },
];

const AGE_TABS: { key: AgeGroup; label: string; range: string }[] = [
  { key: "senior", label: "노인 케어", range: "+65세" },
  { key: "adult", label: "성인 케어", range: "19-64세" },
  { key: "pediatric", label: "소아 케어", range: "신생아-18세" },
];

// ── 서비스 카드 ───────────────────────────────────────────────────────────────

function ServiceCard({
  service,
  locale,
  accentColor,
}: {
  service: ServiceItem;
  locale: string;
  accentColor: string;
}) {
  return (
    <Link
      href={`/${locale}/what-we-do/${service.slug}`}
      className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <h4
        className="text-base font-bold text-black/[0.87] transition-colors group-hover:text-[color:var(--accent)]"
        style={{ "--accent": accentColor } as React.CSSProperties}
      >
        {service.label}
      </h4>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-black/60">
        {service.description}
      </p>
      <div
        className="mt-4 flex items-center gap-1 text-sm font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ color: accentColor }}
      >
        자세히 보기
        <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

// ── 서비스 타입 필터 드롭다운 ─────────────────────────────────────────────────

function ServiceTypeFilter({
  selectedFilter,
  onSelect,
}: {
  selectedFilter: string;
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-sm font-medium text-black/60 transition-colors hover:border-[#ce0e2d] hover:text-black/[0.87] focus:outline-none"
      >
        <span>{selectedFilter || "서비스 타입으로 찾기"}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              onSelect("");
              setOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-black/40 hover:bg-black/[0.03]"
          >
            전체 보기
          </button>
          {FILTER_OPTIONS.map((group) => (
            <div key={group.group}>
              <p className="bg-black/[0.03] px-4 py-2 text-xs font-semibold text-black/50">
                {group.group}
              </p>
              {group.items.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-red-50/50 ${
                    selectedFilter === item
                      ? "font-semibold text-[#ce0e2d]"
                      : "text-black/60"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────

export default function FindCarePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = React.use(params);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [activeTab, setActiveTab] = useState<AgeGroup>("senior");

  const group = SERVICE_GROUPS[activeTab];

  return (
    <>
      <PageHero
        title="Find Care"
        subtitle="가까운 오피스 찾기 — 지역과 서비스 타입으로 나에게 맞는 케어를 찾아보세요."
      />

      {/* ── 1. 오피스 검색 섹션 ───────────────────────────────────────────────── */}
      <section className="bg-[#f5f7f9] py-14 lg:py-20">
        <Container>
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              Office Locator
            </p>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}
            >
              가까운 오피스 찾기
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-black/60">
              도시, 도로명, 우편번호로 가장 가까운 바야다 오피스를 찾아보세요.
            </p>
          </div>

          {/* 검색 + 필터 */}
          <div className="mx-auto max-w-2xl space-y-3">
            {/* 위치 검색 */}
            <NeedsReview
              label="수정필요"
              note="지도 API 연동 필요 / 바야다 공홈 참고"
            >
              <div className="flex items-center gap-3 rounded-xl border border-black/[0.12] bg-white px-4 py-3 shadow-sm">
                <MapPin className="h-5 w-5 shrink-0 text-[#ce0e2d]" />
                <input
                  type="text"
                  placeholder="내 위치 (도시, 도로명, 우편번호로 찾기)"
                  className="flex-1 bg-transparent text-sm text-black/[0.87] placeholder:text-black/30 focus:outline-none"
                />
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-[#ce0e2d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b00c27]"
                >
                  <Search className="h-4 w-4" />
                  검색
                </button>
              </div>
            </NeedsReview>

            {/* 서비스 타입 필터 */}
            <ServiceTypeFilter
              selectedFilter={selectedFilter}
              onSelect={setSelectedFilter}
            />
          </div>

          {/* 지도 placeholder */}
          <NeedsReview
            label="수정필요"
            note="지도 API 연동 필요 / 바야다 공홈 참고"
          >
            <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm">
              <div className="flex h-[340px] items-center justify-center bg-[#e8edf1]">
                <div className="text-center">
                  <MapPin className="mx-auto mb-3 h-10 w-10 text-black/20" />
                  <p className="text-sm font-medium text-black/40">
                    지도가 표시되는 영역
                  </p>
                  <p className="mt-1 text-xs text-black/30">
                    Google Maps 또는 카카오맵 API 연동 예정
                  </p>
                </div>
              </div>
            </div>
          </NeedsReview>
        </Container>
      </section>

      {/* ── 2. 연령대 맞춤 서비스 찾기 ───────────────────────────────────────── */}
      <section className="bg-white py-14 lg:py-20">
        <Container>
          {/* 섹션 헤더 */}
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              Services by Age
            </p>
            <h2
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}
            >
              연령대 맞춤 서비스 찾기
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-black/60">
              연령대를 선택하면 해당하는 서비스를 확인하실 수 있습니다.
            </p>
          </div>

          {/* 연령대 탭 */}
          <div className="mb-10 flex justify-center">
            <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-black/[0.08] bg-[#f5f7f9] p-1.5">
              {AGE_TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const tabColor = SERVICE_GROUPS[tab.key].color;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-white shadow-sm"
                        : "text-black/50 hover:text-black/[0.87]"
                    }`}
                    style={isActive ? { backgroundColor: tabColor } : {}}
                  >
                    <span className="block">{tab.label}</span>
                    <span
                      className={`block text-xs font-normal ${isActive ? "text-white/80" : "text-black/30"}`}
                    >
                      {tab.range}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 서비스 카드 그리드 */}
          <div>
            {/* 탭 헤더 */}
            <div className="mb-6 flex items-center gap-3">
              <div
                className="h-1 w-8 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              <h3 className="text-lg font-bold text-black/[0.87]">
                {group.title}
                <span className="ml-2 text-sm font-normal text-black/40">
                  {group.range}
                </span>
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.services.map((svc, i) => (
                <ServiceCard
                  key={`${svc.slug}-${i}`}
                  service={svc}
                  locale={locale}
                  accentColor={group.color}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── 3. 하단 CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-[#f5f7f9] py-14 lg:py-20">
        <Container>
          <div className="mx-auto max-w-2xl rounded-2xl bg-[#ce0e2d] px-8 py-12 text-center text-white shadow-md">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/70">
              Get Started
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              적합한 서비스를 찾으셨나요?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
              전문 상담사가 고객님의 상황에 맞는 최적의 케어를 안내해 드립니다.
              첫 상담은 무료입니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#ce0e2d] transition-colors hover:bg-white/90"
              >
                무료 상담 신청
              </Link>
              <Link
                href={`/${locale}/what-we-do`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                전체 서비스 보기
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
