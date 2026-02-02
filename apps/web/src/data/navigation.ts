import type { MegaMenuItem } from "@/types";

// GNB 메가 메뉴 구조 (FR-W-001)
export const mainNavigation: MegaMenuItem[] = [
  {
    label: "Home",
    labelKo: "홈",
    href: "/",
  },
  {
    label: "Who We Serve",
    labelKo: "서비스 대상",
    href: "/who-we-serve/providers",
    children: [
      {
        title: "서비스 제공자",
        items: [
          {
            label: "Healthcare Professionals",
            href: "/who-we-serve/providers/healthcare-professionals",
            description: "간호사, 물리치료사, 작업치료사",
          },
          {
            label: "Other Professionals",
            href: "/who-we-serve/providers/other-professionals",
            description: "요양보호사, 사회복지사",
          },
          {
            label: "Hospitals",
            href: "/who-we-serve/providers/medical-institutes/hospitals",
            description: "전환의료 프로그램 연계",
          },
          {
            label: "Clinics",
            href: "/who-we-serve/providers/medical-institutes/clinics",
            description: "재택의료 서비스 연계",
          },
          {
            label: "LTCI Center",
            href: "/who-we-serve/providers/service-provision-centers/ltci",
            description: "노인장기요양센터",
          },
          {
            label: "Nursing Visit Center",
            href: "/who-we-serve/providers/service-provision-centers/nursing-visit",
            description: "방문간호센터",
          },
          {
            label: "Daycare Center",
            href: "/who-we-serve/providers/service-provision-centers/daycare",
            description: "데이케어센터",
          },
          {
            label: "Local Government",
            href: "/who-we-serve/providers/local-government",
            description: "지자체 컨설팅",
          },
        ],
      },
      {
        title: "서비스 이용자",
        items: [
          {
            label: "시니어",
            href: "/who-we-serve/users/senior",
            description: "65세 이상 어르신",
          },
          {
            label: "만성질환관리",
            href: "/who-we-serve/users/chronic-disease",
            description: "당뇨, 고혈압, 치매 등",
          },
          {
            label: "장애인생활관리",
            href: "/who-we-serve/users/disability",
            description: "장애인 생활 지원",
          },
          {
            label: "BAYADA Membership",
            href: "/membership",
            description: "멤버십 안내",
          },
        ],
      },
    ],
  },
  {
    label: "What We Do",
    labelKo: "서비스",
    href: "/what-we-do",
    children: [
      {
        title: "홈헬스케어 서비스",
        items: [
          { label: "Skilled Nursing", href: "/what-we-do/skilled-nursing", description: "전문 방문 간호" },
          { label: "Private Assistive Care", href: "/what-we-do/private-assistive-care", description: "맞춤형 방문 요양" },
          { label: "Hospice", href: "/what-we-do/hospice", description: "암환자 케어" },
          { label: "LTCI Beneficiary Care", href: "/what-we-do/ltci-beneficiary-care", description: "수급자 케어" },
          { label: "Physical Trainer", href: "/what-we-do/physical-trainer", description: "맞춤형 방문 운동" },
          { label: "Transitional Care", href: "/what-we-do/transitional-care", description: "전환의료" },
        ],
      },
      {
        title: "전문 서비스",
        items: [
          { label: "Patient Support Program", href: "/what-we-do/patient-support", description: "환자지원프로그램" },
          { label: "Decentralized Clinical Trials", href: "/what-we-do/dct", description: "분산형 임상시험" },
          { label: "Long-term Care Services", href: "/what-we-do/long-term-care", description: "장기요양서비스" },
          { label: "Senior Living Solutions", href: "/what-we-do/senior-living", description: "시니어 리빙 솔루션" },
          { label: "Mobile Clinical Consulting", href: "/what-we-do/mobile-clinical", description: "모바일 클리니컬 컨설팅" },
          { label: "Education", href: "/what-we-do/education", description: "교육" },
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
    label: "Partnership",
    labelKo: "파트너십",
    href: "/partnership",
  },
  {
    label: "Membership",
    labelKo: "멤버십",
    href: "/membership",
  },
  {
    label: "About Us",
    labelKo: "회사소개",
    href: "/about",
  },
  {
    label: "Contact",
    labelKo: "문의",
    href: "/contact",
  },
  {
    label: "Blog",
    labelKo: "블로그",
    href: "/blog",
  },
];

// Footer 네비게이션 구조
export const footerNavigation = {
  whoWeServe: {
    title: "Who We Serve",
    links: [
      { label: "서비스 제공자", href: "/who-we-serve/providers" },
      { label: "서비스 이용자", href: "/who-we-serve/users" },
    ],
  },
  whatWeDo: {
    title: "What We Do",
    links: [
      { label: "Skilled Nursing", href: "/what-we-do/skilled-nursing" },
      { label: "Private Assistive Care", href: "/what-we-do/private-assistive-care" },
      { label: "Hospice", href: "/what-we-do/hospice" },
      { label: "LTCI Beneficiary Care", href: "/what-we-do/ltci-beneficiary-care" },
      { label: "Physical Trainer", href: "/what-we-do/physical-trainer" },
      { label: "Transitional Care", href: "/what-we-do/transitional-care" },
      { label: "모든 서비스 보기", href: "/what-we-do" },
    ],
  },
  platform: {
    title: "Platform",
    links: [
      { label: "DeiBud", href: "/platform/deibud" },
      { label: "DeiCloud", href: "/platform/deicloud" },
      { label: "DeiEdu", href: "/platform/deiedu" },
      { label: "Dtx", href: "/platform/dtx" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Partnership", href: "/partnership" },
      { label: "Membership", href: "/membership" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  legal: [
    { label: "회사소개", href: "/about" },
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
    { label: "Policy & Procedure", href: "/policy" },
  ],
};
