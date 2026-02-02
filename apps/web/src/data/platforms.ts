import type { PlatformProduct } from "@/types";

// 4개 디지털 플랫폼 제품 (FR-W-006)
export const platforms: PlatformProduct[] = [
  {
    slug: "deibud",
    nameEn: "DeiBud",
    nameKo: "AI 케어 가이드",
    tagline: "AI-Powered Care Guide",
    description:
      "음성/텍스트 기반 AI 실시간 케어 가이드입니다. 질환 정보 안내, 맞춤 서비스 추천, 24시간 상담 지원, 케어 품질 데이터 자동 수집 기능을 제공합니다.",
    icon: "🤖",
    image: "/images/platform/deibud.jpg",
    href: "/platform/deibud",
    features: [
      "질환 정보 안내",
      "맞춤 서비스 추천",
      "24시간 상담 지원",
      "케어 품질 데이터 자동 수집",
      "음성/텍스트 모드 전환",
      "다국어 지원",
    ],
    ctaLabel: "DeiBud 체험하기",
    ctaHref: "/platform/deibud",
    status: "active",
  },
  {
    slug: "deicloud",
    nameEn: "DeiCloud",
    nameKo: "운영 SaaS",
    tagline: "Healthcare Operations SaaS",
    description:
      "서비스 제공 기관을 위한 운영 관리 SaaS 플랫폼입니다. 인력 관리, 일정 관리, 서비스 기록 관리, 품질 모니터링, 전자계약, 정산 관리 기능을 제공합니다.",
    icon: "☁️",
    image: "/images/platform/deicloud.jpg",
    href: "/platform/deicloud",
    features: [
      "인력 관리",
      "일정 관리",
      "서비스 기록 관리",
      "품질 모니터링",
      "전자계약",
      "정산 관리",
    ],
    ctaLabel: "DeiCloud 알아보기",
    ctaHref: "/platform/deicloud",
    status: "coming-soon",
  },
  {
    slug: "deiedu",
    nameEn: "DeiEdu",
    nameKo: "교육 플랫폼",
    tagline: "50-Year BAYADA Academy",
    description:
      "50년 BAYADA 노하우를 기반으로 한 교육 플랫폼입니다. 제공자 전문 교육, 이용자·보호자 교육, 인증 교육, 수료증 발급 등의 기능을 제공합니다.",
    icon: "🎓",
    image: "/images/platform/deiedu.jpg",
    href: "/platform/deiedu",
    features: [
      "제공자 전문 교육",
      "이용자·보호자 교육",
      "인증 교육 프로그램",
      "수료증 발급",
      "학습 진도 관리",
      "온라인·오프라인 혼합",
    ],
    ctaLabel: "DeiEdu 바로가기",
    ctaHref: "/platform/deiedu",
    status: "active",
  },
  {
    slug: "dtx",
    nameEn: "Dtx",
    nameKo: "디지털 치료제",
    tagline: "Digital Therapeutics",
    description:
      "디지털 치료제 파트너십 서비스입니다. 파트너사와 연계하여 디지털 치료제를 제공하고, 임상 데이터 수집 및 분석을 지원합니다.",
    icon: "💊",
    image: "/images/platform/dtx.jpg",
    href: "/platform/dtx",
    features: [
      "파트너사 연계 디지털 치료제",
      "임상 데이터 수집 및 분석",
      "환자 모니터링",
      "치료 효과 평가",
    ],
    ctaLabel: "파트너십 문의",
    ctaHref: "/contact",
    status: "partnership",
  },
];

export function getPlatformBySlug(slug: string): PlatformProduct | undefined {
  return platforms.find((p) => p.slug === slug);
}
