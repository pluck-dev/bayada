"use client";

import Link from "next/link";
import { type ElementType } from "react";
import type { Dictionary } from "@bayada/shared/i18n";
import type { AudienceSegment } from "@/types";
import {
  HeroWithImage,
  ContentImageSplit,
  StatsRow,
  FeatureIconGrid,
  ProcessTimeline,
  ChecklistSection,
  AccordionSection,
  TestimonialBlock,
  RedBannerCTA,
  DualActionCards,
} from "@/components/sections";
import { ContactSidebar } from "@/components/sections";
import {
  ShieldCheck,
  HeartPulse,
  Users,
  Star,
  Clock,
  BookOpen,
  Building2,
  Target,
  BarChart3,
  Phone,
  Globe,
  GraduationCap,
  ClipboardCheck,
  Brain,
  Activity,
  Award,
  Home,
  Stethoscope,
  Briefcase,
  Settings,
  TrendingUp,
  CheckCircle2,
  Zap,
  Eye,
  Layers,
  SmilePlus,
  Truck,
  FileText,
  HeadphonesIcon,
  CalendarCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// 아이콘 매핑 헬퍼
// ---------------------------------------------------------------------------
const iconMap: Record<string, ElementType> = {
  shield: ShieldCheck,
  heart: HeartPulse,
  users: Users,
  star: Star,
  clock: Clock,
  book: BookOpen,
  building: Building2,
  target: Target,
  chart: BarChart3,
  phone: Phone,
  globe: Globe,
  graduation: GraduationCap,
  clipboard: ClipboardCheck,
  brain: Brain,
  activity: Activity,
  award: Award,
  home: Home,
  stethoscope: Stethoscope,
  briefcase: Briefcase,
  settings: Settings,
  trending: TrendingUp,
  check: CheckCircle2,
  zap: Zap,
  eye: Eye,
  layers: Layers,
  smile: SmilePlus,
  truck: Truck,
  file: FileText,
  headphones: HeadphonesIcon,
  calendar: CalendarCheck,
};

/**
 * 이모지 기반 아이콘 문자열을 lucide-react 컴포넌트로 변환한다.
 * iconMap 키와 일치하면 해당 컴포넌트를, 아니면 기본 CheckCircle2를 반환한다.
 */
function resolveIcon(raw: string): ElementType {
  const key = raw.toLowerCase().trim();
  if (iconMap[key]) return iconMap[key];

  // 이모지인 경우 키워드 기반 매칭 시도
  const emojiKeywordMap: [RegExp, string][] = [
    [/💰|🪙|💵/, "trending"],
    [/🗓️|📅|🗓/, "calendar"],
    [/📚|📖/, "book"],
    [/🌐|🌍/, "globe"],
    [/🤝|🫱/, "users"],
    [/📈|📊/, "chart"],
    [/💉|🩺/, "stethoscope"],
    [/🍱|🍽/, "home"],
    [/❤️|❤|💙/, "heart"],
    [/😊|🙂/, "smile"],
    [/🔒|🛡/, "shield"],
    [/👨‍👩‍👧|👪/, "users"],
    [/💊/, "activity"],
    [/📡/, "zap"],
    [/🏥/, "building"],
    [/🧘/, "brain"],
    [/🔄/, "trending"],
    [/📋/, "clipboard"],
    [/🏠|🏡/, "home"],
    [/👨‍⚕️|👩‍⚕️/, "stethoscope"],
    [/📱|💻/, "settings"],
    [/✅/, "check"],
    [/⭐|🏆/, "star"],
    [/👩‍🏫|🎓/, "graduation"],
    [/🔗/, "layers"],
    [/🎯/, "target"],
    [/🔍/, "eye"],
    [/📜/, "file"],
    [/🏋️/, "activity"],
    [/🎁/, "award"],
  ];

  for (const [regex, mapKey] of emojiKeywordMap) {
    if (regex.test(raw)) {
      return iconMap[mapKey] ?? CheckCircle2;
    }
  }

  return CheckCircle2;
}

// ---------------------------------------------------------------------------
// 템플릿 Props
// ---------------------------------------------------------------------------
interface AudienceTemplateProps {
  segment: AudienceSegment;
  dict: Dictionary;
  locale: string;
}

// ---------------------------------------------------------------------------
// AudienceTemplate
// ---------------------------------------------------------------------------
export function AudienceTemplate({ segment, dict, locale }: AudienceTemplateProps) {
  const isProvider = segment.type === "provider";
  const isUser = segment.type === "user";

  // 피처 아이콘 매핑
  const mappedFeatures = segment.features?.map((f) => ({
    icon: resolveIcon(f.icon),
    title: f.title,
    description: f.description,
  }));

  // ProcessTimeline variant 결정
  const timelineVariant: "vertical" | "horizontal" | "alternating" = (() => {
    if (isProvider) return "vertical";
    if (segment.processSteps && segment.processSteps.length <= 3) return "horizontal";
    return "alternating";
  })();

  // 섹션 인덱스 카운터 (배경 교대용)
  let sectionIndex = 0;
  const nextBg = () => {
    const idx = sectionIndex++;
    return idx % 2 === 0 ? "white" : "#f5f7f9";
  };

  // ContentImageSplit용 이미지
  const contentImage = segment.contentImageUrl ?? segment.image;

  return (
    <>
      {/* ================================================================
          1. HeroWithImage - 항상 렌더
          ================================================================ */}
      <HeroWithImage
        title={segment.nameKo}
        subtitle={segment.description}
        imageUrl={segment.heroImageUrl ?? segment.image}
        locale={locale}
        variant={isProvider ? "dark" : isUser ? "gradient" : "dark"}
        ctaLabel={segment.ctaLabel}
        ctaHref={
          segment.ctaHref.startsWith("/")
            ? `/${locale}${segment.ctaHref}`
            : segment.ctaHref
        }
      />

      {/* ================================================================
          2. ContentImageSplit - contentHeadline + contentDescription
          ================================================================ */}
      {segment.contentHeadline && segment.contentDescription && (
        <div style={{ backgroundColor: nextBg() }}>
          <ContentImageSplit
            title={segment.contentHeadline}
            description={segment.contentDescription}
            imageUrl={contentImage}
            imageAlt={segment.nameKo}
            reversed={isProvider}
          />
        </div>
      )}

      {/* ================================================================
          3. StatsRow - stats 존재 시
          ================================================================ */}
      {segment.stats && segment.stats.length > 0 && (() => {
        nextBg(); // 배경 인덱스 진행
        return (
          <StatsRow
            title={isProvider ? "파트너십 성과" : "서비스 실적"}
            stats={segment.stats}
            variant={isUser ? "brand" : "dark"}
          />
        );
      })()}

      {/* ================================================================
          4. FeatureIconGrid - features 존재 시
          ================================================================ */}
      {mappedFeatures && mappedFeatures.length > 0 && (
        <div style={{ backgroundColor: nextBg() }}>
          <FeatureIconGrid
            title={isProvider ? "파트너십 혜택" : "서비스 특징"}
            features={mappedFeatures}
            columns={mappedFeatures.length <= 4 ? 2 : 3}
            variant={isProvider ? "bordered" : "card"}
          />
        </div>
      )}

      {/* ================================================================
          5. ProcessTimeline - processSteps 존재 시
          ================================================================ */}
      {segment.processSteps && segment.processSteps.length > 0 && (
        <div style={{ backgroundColor: nextBg() }}>
          <ProcessTimeline
            title={segment.processTitle ?? (isProvider ? "협력 프로세스" : "이용 절차")}
            steps={segment.processSteps}
            variant={timelineVariant}
          />
        </div>
      )}

      {/* ================================================================
          6. ChecklistSection - highlights (항상 렌더)
          ================================================================ */}
      <div style={{ backgroundColor: nextBg() }}>
        <ChecklistSection
          title={isProvider ? "파트너십 혜택" : "서비스 하이라이트"}
          items={segment.highlights}
          variant="check"
          columns={2}
        />
      </div>

      {/* ================================================================
          7. AccordionSection (더 알아보기) - learnMoreItems 존재 시
          ================================================================ */}
      {segment.learnMoreItems && segment.learnMoreItems.length > 0 && (
        <div style={{ backgroundColor: nextBg() }}>
          <AccordionSection
            title="더 알아보기"
            items={segment.learnMoreItems.map((item) => ({
              title: item.title,
              content: item.content,
            }))}
            layout={isProvider ? "split" : "full"}
            variant={isProvider ? "bordered" : "default"}
          />
        </div>
      )}

      {/* ================================================================
          8. TestimonialBlock - testimonials 존재 시
          ================================================================ */}
      {segment.testimonials && segment.testimonials.length > 0 && (
        <TestimonialBlock
          title="이용 후기"
          testimonials={segment.testimonials}
          variant={segment.testimonials.length === 1 ? "single" : "grid"}
        />
      )}

      {/* ================================================================
          9. Children segments grid - children 존재 시
          ================================================================ */}
      {segment.children && segment.children.length > 0 && (
        <section style={{ backgroundColor: nextBg() }} className="py-16 lg:py-24">
          <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
            <h2
              className="mb-10 text-center font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              세부 대상
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {segment.children.map((child) => (
                <Link
                  key={child.slug}
                  href={`/${locale}${child.href}`}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="text-3xl">{child.icon}</span>
                  <h3 className="mt-3 text-lg font-bold text-black/[0.87] group-hover:text-[#ce0e2d]">
                    {child.nameKo}
                  </h3>
                  <p className="mt-1 text-sm text-black/50">{child.nameEn}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-black/60">
                    {child.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          10. AccordionSection (FAQ) - faqs 존재 시
          ================================================================ */}
      {segment.faqs && segment.faqs.length > 0 && (
        <div style={{ backgroundColor: nextBg() }}>
          <AccordionSection
            title="자주 묻는 질문"
            items={segment.faqs.map((faq) => ({
              title: faq.question,
              content: faq.answer,
            }))}
            layout="full"
            variant="bordered"
          />
        </div>
      )}

      {/* ================================================================
          11. RedBannerCTA - careerTitle 존재 시
          ================================================================ */}
      {segment.careerTitle && (
        <RedBannerCTA
          title={segment.careerTitle}
          description={segment.careerDescription}
          ctaLabel="채용 정보 보기"
          ctaHref={`/${locale}/careers`}
        />
      )}

      {/* ================================================================
          12. DualActionCards - 항상 렌더
          ================================================================ */}
      <div style={{ backgroundColor: nextBg() }}>
        <DualActionCards
          locale={locale}
          cards={[
            {
              icon: Phone,
              title: "무료 상담 신청",
              description:
                "전문 상담사가 맞춤형 서비스를 안내해 드립니다.",
              ctaLabel: "상담 신청하기",
              ctaHref: `/${locale}/consultation`,
            },
            {
              icon: isProvider ? Briefcase : BookOpen,
              title: isProvider ? "파트너십 문의" : "서비스 알아보기",
              description: isProvider
                ? "BAYADA와의 파트너십에 대해 자세히 알아보세요."
                : "BAYADA의 다양한 서비스를 확인해 보세요.",
              ctaLabel: isProvider ? "파트너십 문의" : "서비스 보기",
              ctaHref: isProvider
                ? `/${locale}/contact`
                : `/${locale}/what-we-do`,
            },
          ]}
        />
      </div>

      {/* ================================================================
          13. ContactSidebar - 하단 연락처 섹션 (full-width)
          ================================================================ */}
      <section className="bg-[#f0f4f7] py-16 lg:py-20">
        <div className="mx-auto max-w-[600px] px-4 sm:px-6 lg:px-12">
          <ContactSidebar
            phone="1670-1379"
            hours="평일 09:00 - 18:00"
            locale={locale}
            extra={[
              {
                title: "BAYADA Membership",
                description:
                  "멤버십에 가입하고 더 많은 혜택을 누리세요.",
                ctaLabel: "멤버십 알아보기",
                ctaHref: `/${locale}/membership`,
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
