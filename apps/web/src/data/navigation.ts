import type { MegaMenuItem } from "@/types";

// GNB 메가 메뉴 구조 — 미국 사이트(bayada.com) 기준 + 엑셀 추가 항목
export const mainNavigation: MegaMenuItem[] = [
  {
    label: "Our Services",
    labelKo: "서비스",
    href: "/what-we-do",
    children: [
      {
        title: "Our Services",
        items: [
          { label: "Home Health", href: "/what-we-do/home-health", description: "방문 건강관리 서비스" },
          { label: "Companion Care", href: "/what-we-do/companion-care", description: "동행 돌봄 서비스" },
          { label: "Personal Care", href: "/what-we-do/personal-care", description: "일상생활 지원 서비스" },
          { label: "Private Duty Nursing", href: "/what-we-do/private-duty-nursing", description: "전담 간호 서비스" },
          { label: "Habilitation", href: "/what-we-do/habilitation", description: "기능향상 훈련 서비스" },
          { label: "Hospice Care", href: "/what-we-do/hospice", description: "호스피스 돌봄 서비스" },
          { label: "Autism & ABA Therapy", href: "/what-we-do/aba-therapy", description: "자폐 스펙트럼 및 ABA 치료" },
          { label: "Pediatric Home Health", href: "/what-we-do/pediatric-home-health", description: "소아 방문 건강관리 서비스" },
          { label: "Veterans", href: "/what-we-do/veterans", description: "국가유공자 지원" },
        ],
      },
    ],
  },
  {
    label: "Find Care",
    labelKo: "센터 찾기",
    href: "/find-care",
  },
  {
    label: "Careers",
    labelKo: "채용",
    href: "/careers",
  },
  {
    label: "Employees",
    labelKo: "임직원",
    href: "/employees",
  },
  {
    label: "Work with Us",
    labelKo: "파트너십",
    href: "/partnership",
    children: [
      {
        title: "Work with Us",
        items: [
          { label: "Senior Living Solutions", href: "/senior-living", description: "시니어 주거시설 파트너십" },
          { label: "Partner with BAYADA", href: "/partnership", description: "파트너십 신청" },
        ],
      },
    ],
  },
  {
    label: "About BAYADA",
    labelKo: "회사소개",
    href: "/about",
    children: [
      {
        title: "About",
        items: [
          { label: "About BAYADA", href: "/about", description: "바야다홈헬스케어 소개" },
          { label: "The BAYADA Way", href: "/bayada-way", description: "열정, 탁월함, 신뢰 — 우리의 핵심 가치" },
          { label: "BAYADA 50 Years", href: "/about#history", description: "50년간 이어온 우리의 사명" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    labelKo: "리소스",
    href: "/guide",
    children: [
      {
        title: "Resources",
        items: [
          { label: "이용안내", href: "/guide", description: "서비스 이용 절차 안내" },
          { label: "홈케어 비용 안내", href: "/how-to-pay", description: "비용 지원 제도 및 결제 안내" },
          { label: "FAQ", href: "/faq", description: "자주 묻는 질문" },
          { label: "Blog", href: "/blog", description: "블로그" },
          { label: "고객 후기", href: "/reviews", description: "고객 후기" },
        ],
      },
    ],
  },
  {
    label: "Platform",
    labelKo: "플랫폼",
    href: "/platform",
    children: [
      {
        title: "BAYADA Platform",
        items: [
          { label: "DeiBud", href: "/platform/deibud", description: "AI 케어 가이드" },
          { label: "DeiCloud", href: "/platform/deicloud", description: "운영 SaaS" },
          { label: "DeiEdu", href: "/platform/deiedu", description: "교육 플랫폼" },
          { label: "Dtx", href: "/platform/dtx", description: "디지털 치료제" },
        ],
      },
    ],
  },
  {
    label: "Shop",
    labelKo: "쇼핑",
    href: "/shop",
  },
  {
    label: "Membership",
    labelKo: "멤버십",
    href: "/membership",
  },
  {
    label: "Notice of Privacy",
    labelKo: "개인정보보호",
    href: "/privacy",
  },
  {
    label: "My Page",
    labelKo: "마이페이지",
    href: "/my-page",
  },
];

// Footer 네비게이션 구조
export const footerNavigation = {
  services: {
    title: "Our Services",
    links: [
      { label: "Home Health", href: "/what-we-do/home-health" },
      { label: "Companion Care", href: "/what-we-do/companion-care" },
      { label: "Personal Care", href: "/what-we-do/personal-care" },
      { label: "Private Duty Nursing", href: "/what-we-do/private-duty-nursing" },
      { label: "Habilitation", href: "/what-we-do/habilitation" },
      { label: "Hospice Care", href: "/what-we-do/hospice" },
      { label: "Autism & ABA Therapy", href: "/what-we-do/aba-therapy" },
      { label: "Pediatric Home Health", href: "/what-we-do/pediatric-home-health" },
      { label: "Veterans", href: "/what-we-do/veterans" },
    ],
  },
  company: {
    title: "About BAYADA",
    links: [
      { label: "About BAYADA", href: "/about" },
      { label: "The BAYADA Way", href: "/bayada-way" },
      { label: "Senior Living Solutions", href: "/senior-living" },
      { label: "Careers", href: "/careers" },
      { label: "Employees", href: "/employees" },
      { label: "Work with Us", href: "/partnership" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "이용안내", href: "/guide" },
      { label: "홈케어 비용 안내", href: "/how-to-pay" },
      { label: "FAQ", href: "/faq" },
      { label: "Find Care", href: "/find-care" },
      { label: "Blog", href: "/blog" },
      { label: "고객 후기", href: "/reviews" },
    ],
  },
  platform: {
    title: "Platform & Shop",
    links: [
      { label: "DeiBud", href: "/platform/deibud" },
      { label: "DeiCloud", href: "/platform/deicloud" },
      { label: "DeiEdu", href: "/platform/deiedu" },
      { label: "Dtx", href: "/platform/dtx" },
      { label: "Shop", href: "/shop" },
      { label: "Membership", href: "/membership" },
    ],
  },
  legal: [
    { label: "회사소개", href: "/about" },
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
    { label: "Policy & Procedure", href: "/policy" },
  ],
};
