import type { MembershipPlan, MembershipFeature } from "@/types";

// 멤버십 비교 기능 목록 (FR-W-008)
export const membershipFeatures: MembershipFeature[] = [
  { name: "서비스 정보 열람", paid: true, free: true, nonMember: true },
  { name: "AI 상담 (DeiBud)", paid: "맞춤 상담", free: "기본 상담", nonMember: "자동 응대" },
  { name: "라이프스타일 설문", paid: true, free: false, nonMember: false },
  { name: "건강검진 결과 분석", paid: true, free: false, nonMember: false },
  { name: "맞춤 서비스 디자인", paid: true, free: false, nonMember: false },
  { name: "견적 확인", paid: true, free: false, nonMember: false },
  { name: "건강기록 관리", paid: "전체 기능", free: "기본 기능", nonMember: false },
  { name: "교육 플랫폼 할인", paid: "10% 할인", free: false, nonMember: false },
  { name: "전문 상담사 매칭", paid: true, free: false, nonMember: false },
  { name: "가족 연결 서비스", paid: true, free: false, nonMember: false },
];

// 이용자 멤버십 플랜
export const userMembershipPlans: MembershipPlan[] = [
  {
    type: "paid",
    nameKo: "유료 멤버십",
    nameEn: "Premium Membership",
    price: "월 29,000원",
    features: membershipFeatures,
    ctaLabel: "시작하기",
    ctaHref: "/onboarding/paid",
  },
  {
    type: "free",
    nameKo: "무료 멤버십",
    nameEn: "Basic Membership",
    features: membershipFeatures,
    ctaLabel: "무료로 시작",
    ctaHref: "/onboarding/free",
  },
];

// 제공자 멤버십 플랜
export const providerMembershipPlans: MembershipPlan[] = [
  {
    type: "paid",
    nameKo: "유료 멤버십 (기관)",
    nameEn: "Provider Premium",
    price: "문의",
    features: [],
    ctaLabel: "멤버십 시작",
    ctaHref: "/who-we-serve/providers",
  },
  {
    type: "free",
    nameKo: "무료 멤버십 (기관)",
    nameEn: "Provider Basic",
    features: [],
    ctaLabel: "무료로 시작",
    ctaHref: "/who-we-serve/providers",
  },
];

// 멤버십 혜택
export const membershipBenefits = [
  "50년 BAYADA 글로벌 네트워크 접근",
  "검증된 서비스 제공자 매칭",
  "AI 기반 맞춤 케어 가이드 (DeiBud)",
  "교육 플랫폼(DeiEdu) 할인",
  "건강 데이터 축적 및 관리",
  "가족 연결 서비스",
];
