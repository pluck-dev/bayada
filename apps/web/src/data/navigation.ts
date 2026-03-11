import type { MegaMenuItem, NavLabels } from "@/types";

// locale에 따라 라벨을 반환하는 헬퍼
export function getLabel(item: { label: string; labels?: NavLabels; labelKo?: string }, locale: string): string {
  if (item.labels && locale !== "en") return item.labels[locale as keyof NavLabels] ?? item.label;
  if (item.labelKo && locale === "ko") return item.labelKo;
  return item.label;
}

export function getTitle(item: { title: string; titles?: NavLabels; titleKo?: string }, locale: string): string {
  if (item.titles && locale !== "en") return item.titles[locale as keyof NavLabels] ?? item.title;
  if (item.titleKo && locale === "ko") return item.titleKo;
  return item.title;
}

export function getDescription(
  item: { description?: string; descriptions?: NavLabels },
  locale: string,
): string | undefined {
  if (item.descriptions && locale !== "en") return item.descriptions[locale as keyof NavLabels] ?? item.description;
  return item.description;
}

// GNB 메가 메뉴 구조
export const mainNavigation: MegaMenuItem[] = [
  {
    label: "Our Services",
    labels: { ko: "서비스", ja: "サービス", zh: "服务" },
    href: "/what-we-do",
    children: [
      {
        title: "Our Services",
        titles: { ko: "서비스", ja: "サービス", zh: "服务" },
        items: [
          {
            label: "Home Health", labels: { ko: "방문 건강관리", ja: "訪問ヘルスケア", zh: "上门健康管理" },
            href: "/what-we-do/home-health",
            description: "Home health care service",
            descriptions: { ko: "방문 건강관리 서비스", ja: "訪問ヘルスケアサービス", zh: "上门健康管理服务" },
          },
          {
            label: "Companion Care", labels: { ko: "동행 돌봄", ja: "同行ケア", zh: "陪伴护理" },
            href: "/what-we-do/companion-care",
            description: "Companion care service",
            descriptions: { ko: "동행 돌봄 서비스", ja: "同行ケアサービス", zh: "陪伴护理服务" },
          },
          {
            label: "Personal Care", labels: { ko: "일상생활 지원", ja: "生活支援", zh: "日常生活支援" },
            href: "/what-we-do/personal-care",
            description: "Personal care service",
            descriptions: { ko: "일상생활 지원 서비스", ja: "日常生活支援サービス", zh: "日常生活支援服务" },
          },
          {
            label: "Private Duty Nursing", labels: { ko: "전담 간호", ja: "専任看護", zh: "专属护理" },
            href: "/what-we-do/private-duty-nursing",
            description: "Private duty nursing service",
            descriptions: { ko: "전담 간호 서비스", ja: "専任看護サービス", zh: "专属护理服务" },
          },
          {
            label: "Habilitation", labels: { ko: "기능향상 훈련", ja: "機能向上訓練", zh: "功能提升训练" },
            href: "/what-we-do/habilitation",
            description: "Habilitation service",
            descriptions: { ko: "기능향상 훈련 서비스", ja: "機能向上訓練サービス", zh: "功能提升训练服务" },
          },
          {
            label: "Hospice Care", labels: { ko: "호스피스 돌봄", ja: "ホスピスケア", zh: "临终关怀" },
            href: "/what-we-do/hospice",
            description: "Hospice care service",
            descriptions: { ko: "호스피스 돌봄 서비스", ja: "ホスピスケアサービス", zh: "临终关怀服务" },
          },
          {
            label: "Autism & ABA Therapy", labels: { ko: "자폐 스펙트럼 및 ABA 치료", ja: "自閉症・ABA療法", zh: "自闭症及ABA治疗" },
            href: "/what-we-do/aba-therapy",
            description: "Autism spectrum & ABA therapy",
            descriptions: { ko: "자폐 스펙트럼 및 ABA 치료", ja: "自閉症スペクトラムおよびABA療法", zh: "自闭症谱系及ABA治疗" },
          },
          {
            label: "Pediatric Home Health", labels: { ko: "소아 방문 건강관리", ja: "小児訪問ヘルスケア", zh: "儿童上门健康管理" },
            href: "/what-we-do/pediatric-home-health",
            description: "Pediatric home health service",
            descriptions: { ko: "소아 방문 건강관리 서비스", ja: "小児訪問ヘルスケアサービス", zh: "儿童上门健康管理服务" },
          },
          {
            label: "Veterans", labels: { ko: "국가유공자 지원", ja: "退役軍人支援", zh: "退伍军人支援" },
            href: "/what-we-do/veterans",
            description: "Veterans support",
            descriptions: { ko: "국가유공자 지원", ja: "退役軍人支援", zh: "退伍军人支援" },
          },
        ],
      },
    ],
  },
  {
    label: "Find Care",
    labels: { ko: "센터 찾기", ja: "センター検索", zh: "查找中心" },
    href: "/find-care",
  },
  {
    label: "About BAYADA",
    labels: { ko: "회사소개", ja: "会社紹介", zh: "公司介绍" },
    href: "/about",
    children: [
      {
        title: "About",
        titles: { ko: "회사소개", ja: "会社紹介", zh: "公司介绍" },
        items: [
          {
            label: "About BAYADA", labels: { ko: "바야다홈헬스케어 소개", ja: "BAYADA紹介", zh: "关于BAYADA" },
            href: "/about",
            description: "About BAYADA Home Health Care",
            descriptions: { ko: "바야다홈헬스케어 소개", ja: "BAYADAホームヘルスケアについて", zh: "关于BAYADA家庭医疗" },
          },
          {
            label: "The BAYADA Way", labels: { ko: "The BAYADA Way", ja: "The BAYADA Way", zh: "The BAYADA Way" },
            href: "/bayada-way",
            description: "Compassion, Excellence, Reliability — Our core values",
            descriptions: { ko: "열정, 탁월함, 신뢰 — 우리의 핵심 가치", ja: "思いやり、卓越性、信頼性 — 私たちの核心的価値", zh: "同理心、卓越、可靠 — 我们的核心价值" },
          },
          {
            label: "BAYADA 50 Years", labels: { ko: "BAYADA 50년", ja: "BAYADA 50年", zh: "BAYADA 50年" },
            href: "/about#history",
            description: "50 years of our mission",
            descriptions: { ko: "50년간 이어온 우리의 사명", ja: "50年間続く私たちの使命", zh: "延续50年的使命" },
          },
        ],
      },
      {
        title: "Work with Us",
        titles: { ko: "함께하기", ja: "一緒に働く", zh: "携手合作" },
        items: [
          {
            label: "Senior Living Solutions", labels: { ko: "시니어 주거시설 파트너십", ja: "シニア住居施設パートナーシップ", zh: "高龄住宅合作" },
            href: "/senior-living",
            description: "Senior living facility partnerships",
            descriptions: { ko: "시니어 주거시설 파트너십", ja: "シニア住居施設パートナーシップ", zh: "高龄住宅设施合作" },
          },
          {
            label: "Partner with BAYADA", labels: { ko: "파트너십 신청", ja: "パートナーシップ申請", zh: "合作申请" },
            href: "/partnership",
            description: "Apply for partnership",
            descriptions: { ko: "파트너십 신청", ja: "パートナーシップのお申込み", zh: "申请合作" },
          },
        ],
      },
    ],
  },
  {
    label: "Resources",
    labels: { ko: "리소스", ja: "リソース", zh: "资源" },
    href: "/guide",
    children: [
      {
        title: "Resources",
        titles: { ko: "리소스", ja: "リソース", zh: "资源" },
        items: [
          {
            label: "Usage Guide", labels: { ko: "이용안내", ja: "ご利用案内", zh: "使用指南" },
            href: "/guide",
            description: "Service usage guide",
            descriptions: { ko: "서비스 이용 절차 안내", ja: "サービスご利用案内", zh: "服务使用流程指南" },
          },
          {
            label: "How to Pay", labels: { ko: "홈케어 비용 안내", ja: "費用のご案内", zh: "费用指南" },
            href: "/how-to-pay",
            description: "Cost support & payment guide",
            descriptions: { ko: "비용 지원 제도 및 결제 안내", ja: "費用支援制度とお支払い案内", zh: "费用支持制度及付款指南" },
          },
          {
            label: "FAQ", labels: { ko: "FAQ", ja: "FAQ", zh: "FAQ" },
            href: "/faq",
            description: "Frequently asked questions",
            descriptions: { ko: "자주 묻는 질문", ja: "よくある質問", zh: "常见问题" },
          },
          {
            label: "Blog", labels: { ko: "블로그", ja: "ブログ", zh: "博客" },
            href: "/blog",
            description: "Blog",
            descriptions: { ko: "블로그", ja: "ブログ", zh: "博客" },
          },
          {
            label: "Reviews", labels: { ko: "고객 후기", ja: "お客様の声", zh: "客户评价" },
            href: "/reviews",
            description: "Customer reviews",
            descriptions: { ko: "고객 후기", ja: "お客様の声", zh: "客户评价" },
          },
        ],
      },
    ],
  },
  {
    label: "Platform",
    labels: { ko: "플랫폼", ja: "プラットフォーム", zh: "平台" },
    href: "/platform",
    children: [
      {
        title: "BAYADA Platform",
        titles: { ko: "BAYADA 플랫폼", ja: "BAYADAプラットフォーム", zh: "BAYADA平台" },
        items: [
          {
            label: "DeiBud", href: "/platform/deibud",
            description: "AI Care Guide",
            descriptions: { ko: "AI 케어 가이드", ja: "AIケアガイド", zh: "AI护理指南" },
          },
          {
            label: "DeiCloud", href: "/platform/deicloud",
            description: "Operations SaaS",
            descriptions: { ko: "운영 SaaS", ja: "運営SaaS", zh: "运营SaaS" },
          },
          {
            label: "DeiEdu", href: "/platform/deiedu",
            description: "Education Platform",
            descriptions: { ko: "교육 플랫폼", ja: "教育プラットフォーム", zh: "教育平台" },
          },
          {
            label: "Dtx", href: "/platform/dtx",
            description: "Digital Therapeutics",
            descriptions: { ko: "디지털 치료제", ja: "デジタル治療", zh: "数字疗法" },
          },
        ],
      },
    ],
  },
  {
    label: "Careers",
    labels: { ko: "채용", ja: "採用情報", zh: "招聘" },
    href: "/careers",
  },
  {
    label: "Employees",
    labels: { ko: "임직원", ja: "社員", zh: "员工" },
    href: "/employees",
  },
];

// 우측 유틸리티 메뉴
export const utilityNavigation = [
  { label: "Shop", labels: { ko: "쇼핑", ja: "ショップ", zh: "商店" } as NavLabels, href: "/shop", icon: "shopping-bag" },
  { label: "Membership", labels: { ko: "멤버십", ja: "メンバーシップ", zh: "会员" } as NavLabels, href: "/membership", icon: "award" },
  { label: "My Page", labels: { ko: "마이페이지", ja: "マイページ", zh: "我的页面" } as NavLabels, href: "/my-page", icon: "user" },
] as const;

// Footer 네비게이션 구조
export const footerNavigation = {
  services: {
    title: "Our Services",
    titles: { ko: "서비스", ja: "サービス", zh: "服务" } as NavLabels,
    links: [
      { label: "Home Health", labels: { ko: "방문 건강관리", ja: "訪問ヘルスケア", zh: "上门健康管理" } as NavLabels, href: "/what-we-do/home-health" },
      { label: "Companion Care", labels: { ko: "동행 돌봄", ja: "同行ケア", zh: "陪伴护理" } as NavLabels, href: "/what-we-do/companion-care" },
      { label: "Personal Care", labels: { ko: "일상생활 지원", ja: "生活支援", zh: "日常生活支援" } as NavLabels, href: "/what-we-do/personal-care" },
      { label: "Private Duty Nursing", labels: { ko: "전담 간호", ja: "専任看護", zh: "专属护理" } as NavLabels, href: "/what-we-do/private-duty-nursing" },
      { label: "Habilitation", labels: { ko: "기능향상 훈련", ja: "機能向上訓練", zh: "功能提升训练" } as NavLabels, href: "/what-we-do/habilitation" },
      { label: "Hospice Care", labels: { ko: "호스피스 돌봄", ja: "ホスピスケア", zh: "临终关怀" } as NavLabels, href: "/what-we-do/hospice" },
      { label: "Autism & ABA Therapy", labels: { ko: "자폐 스펙트럼 및 ABA 치료", ja: "自閉症・ABA療法", zh: "自闭症及ABA治疗" } as NavLabels, href: "/what-we-do/aba-therapy" },
      { label: "Pediatric Home Health", labels: { ko: "소아 방문 건강관리", ja: "小児訪問ヘルスケア", zh: "儿童上门健康管理" } as NavLabels, href: "/what-we-do/pediatric-home-health" },
      { label: "Veterans", labels: { ko: "국가유공자 지원", ja: "退役軍人支援", zh: "退伍军人支援" } as NavLabels, href: "/what-we-do/veterans" },
    ],
  },
  company: {
    title: "About BAYADA",
    titles: { ko: "회사소개", ja: "会社紹介", zh: "公司介绍" } as NavLabels,
    links: [
      { label: "About BAYADA", labels: { ko: "바야다홈헬스케어 소개", ja: "BAYADA紹介", zh: "关于BAYADA" } as NavLabels, href: "/about" },
      { label: "The BAYADA Way", labels: { ko: "The BAYADA Way", ja: "The BAYADA Way", zh: "The BAYADA Way" } as NavLabels, href: "/bayada-way" },
      { label: "Senior Living Solutions", labels: { ko: "시니어 주거시설 파트너십", ja: "シニア住居施設", zh: "高龄住宅合作" } as NavLabels, href: "/senior-living" },
      { label: "Careers", labels: { ko: "채용", ja: "採用情報", zh: "招聘" } as NavLabels, href: "/careers" },
      { label: "Employees", labels: { ko: "임직원", ja: "社員", zh: "员工" } as NavLabels, href: "/employees" },
      { label: "Work with Us", labels: { ko: "파트너십", ja: "パートナーシップ", zh: "合作" } as NavLabels, href: "/partnership" },
    ],
  },
  resources: {
    title: "Resources",
    titles: { ko: "리소스", ja: "リソース", zh: "资源" } as NavLabels,
    links: [
      { label: "Usage Guide", labels: { ko: "이용안내", ja: "ご利用案内", zh: "使用指南" } as NavLabels, href: "/guide" },
      { label: "How to Pay", labels: { ko: "홈케어 비용 안내", ja: "費用のご案内", zh: "费用指南" } as NavLabels, href: "/how-to-pay" },
      { label: "FAQ", href: "/faq" },
      { label: "Find Care", labels: { ko: "센터 찾기", ja: "センター検索", zh: "查找中心" } as NavLabels, href: "/find-care" },
      { label: "Blog", labels: { ko: "블로그", ja: "ブログ", zh: "博客" } as NavLabels, href: "/blog" },
      { label: "Reviews", labels: { ko: "고객 후기", ja: "お客様の声", zh: "客户评价" } as NavLabels, href: "/reviews" },
    ],
  },
  platform: {
    title: "Platform & Shop",
    titles: { ko: "플랫폼 & 쇼핑", ja: "プラットフォーム & ショップ", zh: "平台 & 商店" } as NavLabels,
    links: [
      { label: "DeiBud", href: "/platform/deibud" },
      { label: "DeiCloud", href: "/platform/deicloud" },
      { label: "DeiEdu", href: "/platform/deiedu" },
      { label: "Dtx", href: "/platform/dtx" },
      { label: "Shop", labels: { ko: "쇼핑", ja: "ショップ", zh: "商店" } as NavLabels, href: "/shop" },
      { label: "Membership", labels: { ko: "멤버십", ja: "メンバーシップ", zh: "会员" } as NavLabels, href: "/membership" },
    ],
  },
  legal: [
    { label: "About", labels: { ko: "회사소개", ja: "会社紹介", zh: "公司介绍" } as NavLabels, href: "/about" },
    { label: "Terms of Service", labels: { ko: "이용약관", ja: "利用規約", zh: "服务条款" } as NavLabels, href: "/terms" },
    { label: "Privacy Policy", labels: { ko: "개인정보처리방침", ja: "プライバシーポリシー", zh: "隐私政策" } as NavLabels, href: "/privacy" },
    { label: "Policy & Procedure", href: "/policy" },
  ],
};
