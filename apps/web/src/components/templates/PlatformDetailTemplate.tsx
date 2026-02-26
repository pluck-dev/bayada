"use client";

import type { ElementType } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Activity,
  Sparkles,
  Users,
  Calendar,
  CreditCard,
  ShieldCheck,
  BarChart3,
  PlayCircle,
  Award,
  GraduationCap,
  Brain,
  Dumbbell,
  Pill,
  Monitor,
  Phone,
  BookOpen,
} from "lucide-react";
import type { Dictionary } from "@bayada/shared/i18n";
import type { PlatformProduct } from "@/types";
import {
  HeroWithImage,
  ContentImageSplit,
  StatsRow,
  FeatureIconGrid,
  TabPanels,
  AccordionSection,
  DualActionCards,
} from "@/components/sections";

interface PlatformDetailTemplateProps {
  platform: PlatformProduct;
  dict: Dictionary;
  locale: string;
}

// 아이콘 문자열 → Lucide 컴포넌트 매핑
const ICON_MAP: Record<string, ElementType> = {
  MessageSquare,
  Activity,
  Sparkles,
  Users,
  Calendar,
  CreditCard,
  ShieldCheck,
  BarChart3,
  PlayCircle,
  Award,
  GraduationCap,
  Brain,
  Dumbbell,
  Pill,
  Monitor,
  Phone,
  BookOpen,
};

function resolveIcon(name: string): ElementType {
  return ICON_MAP[name] ?? BookOpen;
}

// 플랫폼별 히어로 변형 설정
const HERO_VARIANTS: Record<
  string,
  "dark" | "light" | "gradient"
> = {
  deibud: "gradient",
  deicloud: "dark",
  deiedu: "gradient",
  dtx: "dark",
};

export function PlatformDetailTemplate({
  platform,
  dict,
  locale,
}: PlatformDetailTemplateProps) {
  const heroVariant = HERO_VARIANTS[platform.slug] ?? "dark";

  // 상태 뱃지 레이블
  const statusLabel =
    platform.status === "coming-soon"
      ? "출시 예정"
      : platform.status === "partnership"
        ? "파트너십 서비스"
        : null;

  // 히어로 서브타이틀: 상태 뱃지 + 태그라인
  const heroSubtitle = statusLabel
    ? `[${statusLabel}] ${platform.tagline}`
    : platform.tagline;

  // FeatureIconGrid용 features 변환
  const featureItems = platform.keyFeatures?.map((f) => ({
    icon: resolveIcon(f.icon),
    title: f.title,
    description: f.description,
  }));

  // FeatureIconGrid columns 결정
  const featureColumns: 2 | 3 | 4 =
    (platform.keyFeatures?.length ?? 0) >= 5
      ? 3
      : (platform.keyFeatures?.length ?? 0) === 4
        ? 4
        : 3;

  // TabPanels용 useCases 탭 변환
  const useCaseTabs = platform.useCases?.map((uc, i) => ({
    id: `usecase-${i}`,
    label: uc.title,
    content: (
      <div className="rounded-xl bg-[#f0f4f7] p-8">
        <p className="text-base leading-relaxed text-black/70">
          {uc.description}
        </p>
      </div>
    ),
  }));

  // AccordionSection용 faqs 변환
  const faqItems = platform.faqs?.map((f) => ({
    title: f.question,
    content: f.answer,
  }));

  // DualActionCards
  const ctaHref = platform.ctaHref.startsWith("/")
    ? `/${locale}${platform.ctaHref}`
    : platform.ctaHref;

  return (
    <>
      {/* 1. 히어로 */}
      <HeroWithImage
        title={`${platform.nameEn} — ${platform.nameKo}`}
        subtitle={heroSubtitle}
        imageUrl={platform.heroImageUrl ?? platform.image}
        breadcrumbs={[
          { label: "플랫폼", href: `/${locale}/platform` },
          { label: platform.nameEn, href: `/${locale}/platform/${platform.slug}` },
        ]}
        ctaLabel={platform.ctaLabel}
        ctaHref={ctaHref}
        locale={locale}
        variant={heroVariant}
      />

      {/* 2. 콘텐츠 + 이미지 분할 (contentHeadline 있을 때) */}
      {platform.contentHeadline && platform.contentDescription && (
        <ContentImageSplit
          title={platform.contentHeadline.replace(/\n/g, " ")}
          description={platform.contentDescription}
          imageUrl={
            platform.contentImageUrl ?? platform.image
          }
          imageAlt={`${platform.nameEn} 소개 이미지`}
          reversed={platform.slug === "deicloud" || platform.slug === "dtx"}
        />
      )}

      {/* 3. 통계 (stats 있을 때) */}
      {platform.stats && platform.stats.length > 0 && (
        <StatsRow
          stats={platform.stats}
          variant={
            platform.slug === "deibud" || platform.slug === "deiedu"
              ? "brand"
              : "dark"
          }
        />
      )}

      {/* 4. 핵심 기능 그리드 (keyFeatures 있을 때) */}
      {featureItems && featureItems.length > 0 && (
        <FeatureIconGrid
          title="핵심 기능"
          subtitle={`${platform.nameEn}가 제공하는 주요 기능들을 살펴보세요.`}
          features={featureItems}
          columns={featureColumns}
          variant="card"
        />
      )}

      {/* 5. 활용 사례 탭 (useCases 있을 때) */}
      {useCaseTabs && useCaseTabs.length > 0 && (
        <TabPanels
          title="활용 사례"
          tabs={useCaseTabs}
          variant="pill"
        />
      )}

      {/* 6. 기술 사양 테이블 (techSpecs 있을 때) */}
      {platform.techSpecs && platform.techSpecs.length > 0 && (
        <section className="bg-[#f0f4f7] py-16 lg:py-24">
          <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
            <h2
              className="mb-10 text-center font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              기술 사양
            </h2>
            <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white">
              {platform.techSpecs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`grid grid-cols-[180px_1fr] gap-4 px-6 py-4 ${
                    i !== platform.techSpecs!.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-black/[0.87]">
                    {spec.label}
                  </dt>
                  <dd className="text-sm leading-relaxed text-black/60">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. FAQ 아코디언 (faqs 있을 때) */}
      {faqItems && faqItems.length > 0 && (
        <AccordionSection
          title="자주 묻는 질문"
          subtitle={`${platform.nameEn}에 대해 궁금한 점을 확인하세요.`}
          items={faqItems}
          layout="split"
          variant="bordered"
        />
      )}

      {/* 8. 하단 CTA 카드 */}
      <DualActionCards
        locale={locale}
        cards={[
          {
            icon: Phone,
            title: "상담 신청",
            description:
              `${platform.nameEn}에 대해 더 자세히 알고 싶으신가요? 전문 상담사가 맞춤형 안내를 드립니다.`,
            ctaLabel: "무료 상담 신청",
            ctaHref: `/${locale}/contact`,
          },
          {
            icon: BookOpen,
            title: "다른 플랫폼 보기",
            description:
              "DeiBud, DeiCloud, DeiEdu, Dtx — BAYADA의 모든 디지털 플랫폼을 한눈에 확인하세요.",
            ctaLabel: "플랫폼 전체 보기",
            ctaHref: `/${locale}/platform`,
          },
        ]}
      />
    </>
  );
}
