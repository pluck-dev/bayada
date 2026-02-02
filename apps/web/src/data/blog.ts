import type { BlogPost, BlogCategory } from "@/types";

// 블로그 카테고리 (FR-W-011)
export const blogCategories: { slug: BlogCategory; name: string }[] = [
  { slug: "bayada-story", name: "50년 BAYADA" },
  { slug: "policy", name: "제도·정책" },
  { slug: "disease-info", name: "질환정보" },
  { slug: "care-guide", name: "케어가이드" },
  { slug: "news", name: "소식" },
];

// Placeholder 블로그 포스트
export const blogPosts: BlogPost[] = [
  {
    slug: "bayada-50-years-journey",
    title: "BAYADA 50년의 여정: 홈헬스케어의 새로운 기준을 세우다",
    excerpt:
      "1975년 설립 이래 50년간 홈헬스케어 산업을 이끌어온 BAYADA의 여정과 비전을 소개합니다.",
    category: "bayada-story",
    image: "/images/blog/bayada-50-years.jpg",
    author: "BAYADA 편집팀",
    publishedAt: "2026-01-15",
    readTime: 8,
    isPublished: true,
    tags: ["BAYADA", "홈헬스케어", "50주년"],
    content:
      "BAYADA Home Health Care는 1975년 Mark Baiada에 의해 설립되었습니다. 50년간의 여정을 통해 전 세계에서 가장 신뢰받는 홈헬스케어 기업으로 성장했습니다...",
  },
  {
    slug: "ltci-2026-policy-changes",
    title: "2026년 노인장기요양보험 제도 변경사항 총정리",
    excerpt:
      "2026년부터 적용되는 노인장기요양보험 주요 변경사항과 서비스 이용 시 알아야 할 사항을 정리합니다.",
    category: "policy",
    image: "/images/blog/ltci-policy.jpg",
    author: "BAYADA 정책팀",
    publishedAt: "2026-01-10",
    readTime: 6,
    isPublished: true,
    tags: ["장기요양보험", "제도", "2026"],
    content:
      "2026년 새해부터 노인장기요양보험에 중요한 변경사항이 적용됩니다. 수급자와 보호자가 알아야 할 핵심 내용을 정리했습니다...",
  },
  {
    slug: "diabetes-home-care-guide",
    title: "당뇨병 환자를 위한 가정 건강관리 가이드",
    excerpt:
      "당뇨병 환자가 가정에서 효과적으로 건강을 관리하는 방법과 전문 방문 간호의 역할을 안내합니다.",
    category: "disease-info",
    image: "/images/blog/diabetes-guide.jpg",
    author: "BAYADA 간호팀",
    publishedAt: "2026-01-05",
    readTime: 7,
    isPublished: true,
    tags: ["당뇨병", "건강관리", "방문간호"],
    content:
      "당뇨병은 꾸준한 관리가 중요한 만성질환입니다. 가정에서의 혈당 관리, 식이요법, 운동, 그리고 전문 방문 간호의 도움을 받는 방법을 안내합니다...",
  },
  {
    slug: "fall-prevention-seniors",
    title: "시니어 낙상 예방: 가정에서 시작하는 안전 관리",
    excerpt:
      "어르신 낙상 사고의 주요 원인과 가정에서 실천할 수 있는 효과적인 예방법을 소개합니다.",
    category: "care-guide",
    image: "/images/blog/fall-prevention.jpg",
    author: "BAYADA 재활팀",
    publishedAt: "2025-12-28",
    readTime: 5,
    isPublished: true,
    tags: ["낙상예방", "시니어", "안전"],
    content:
      "65세 이상 어르신의 3분의 1이 매년 낙상을 경험합니다. 가정 내 환경 개선과 운동을 통해 낙상 위험을 크게 줄일 수 있습니다...",
  },
  {
    slug: "bayada-korea-partnership-launch",
    title: "바야다홈헬스케어, 국내 주요 의료기관과 전환의료 파트너십 체결",
    excerpt:
      "BAYADA가 국내 주요 대학병원들과 전환의료 프로그램 파트너십을 체결하며 한국 시장 확대에 나섭니다.",
    category: "news",
    image: "/images/blog/partnership-launch.jpg",
    author: "BAYADA 홍보팀",
    publishedAt: "2025-12-20",
    readTime: 4,
    isPublished: true,
    tags: ["파트너십", "전환의료", "의료기관"],
    content:
      "바야다홈헬스케어가 서울 소재 3개 대학병원과 전환의료 프로그램 파트너십을 체결했습니다. 이를 통해 퇴원 환자의 가정 복귀를 체계적으로 지원합니다...",
  },
  {
    slug: "dementia-care-family-guide",
    title: "치매 환자 가족을 위한 돌봄 가이드",
    excerpt:
      "치매 환자를 돌보는 가족이 알아야 할 핵심 정보와 전문 케어 서비스 활용법을 안내합니다.",
    category: "care-guide",
    image: "/images/blog/dementia-care.jpg",
    author: "BAYADA 치매케어팀",
    publishedAt: "2025-12-15",
    readTime: 9,
    isPublished: true,
    tags: ["치매", "가족돌봄", "케어가이드"],
    content:
      "치매 환자를 돌보는 것은 가족에게도 큰 부담이 될 수 있습니다. 전문가의 도움을 받으면서 효과적으로 돌봄을 실천하는 방법을 안내합니다...",
  },
  {
    slug: "bayada-way-philosophy",
    title: "The BAYADA Way: 50년을 이끌어온 경영 철학",
    excerpt:
      "BAYADA의 핵심 경영 철학 'The BAYADA Way'가 어떻게 글로벌 홈헬스케어의 기준이 되었는지 살펴봅니다.",
    category: "bayada-story",
    image: "/images/blog/bayada-way.jpg",
    author: "BAYADA 편집팀",
    publishedAt: "2025-12-10",
    readTime: 6,
    isPublished: true,
    tags: ["BAYADA Way", "경영철학", "핵심가치"],
    content:
      "The BAYADA Way는 단순한 슬로건이 아닙니다. 50년간 33,000명 이상의 직원이 공유하는 경영 철학이자 서비스의 기준입니다...",
  },
  {
    slug: "hypertension-management-tips",
    title: "고혈압 환자의 가정 내 혈압 관리 10가지 팁",
    excerpt:
      "고혈압 환자가 일상에서 실천할 수 있는 혈압 관리 방법과 전문 간호 서비스의 도움을 소개합니다.",
    category: "disease-info",
    image: "/images/blog/hypertension.jpg",
    author: "BAYADA 간호팀",
    publishedAt: "2025-12-05",
    readTime: 5,
    isPublished: true,
    tags: ["고혈압", "혈압관리", "건강팁"],
    content:
      "고혈압은 '침묵의 살인자'로 불리는 만성질환입니다. 가정에서의 꾸준한 혈압 관리와 생활습관 개선이 중요합니다...",
  },
  {
    slug: "deibud-ai-care-guide-launch",
    title: "DeiBud AI 케어 가이드 서비스 오픈",
    excerpt:
      "BAYADA의 AI 기반 케어 가이드 DeiBud가 정식 출시되었습니다. 24시간 맞춤 건강 상담을 받아보세요.",
    category: "news",
    image: "/images/blog/deibud-launch.jpg",
    author: "BAYADA 플랫폼팀",
    publishedAt: "2025-11-28",
    readTime: 4,
    isPublished: true,
    tags: ["DeiBud", "AI", "플랫폼"],
    content:
      "BAYADA의 AI 기반 케어 가이드 DeiBud가 정식 서비스를 시작합니다. 질환 정보, 맞춤 서비스 추천, 24시간 상담 지원 등의 기능을 무료로 이용하실 수 있습니다...",
  },
];

export function getPublishedPosts(): BlogPost[] {
  return blogPosts
    .filter((p) => p.isPublished)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getLatestPosts(count = 3): BlogPost[] {
  return getPublishedPosts().slice(0, count);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getPublishedPosts().filter((p) => p.category === category);
}
