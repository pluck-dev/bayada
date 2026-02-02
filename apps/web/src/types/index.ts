// =============================================
// 바야다 웹 플랫폼 타입 정의
// =============================================

// --- 서비스 (What We Do) ---
export interface ServiceData {
  slug: string;
  nameEn: string;
  nameKo: string;
  description: string;
  icon: string;
  image: string;
  href: string;
  highlights: string[];
  targetAudience: string[];
  process: { step: number; title: string; description: string }[];
  relatedServices: string[]; // slug 참조
  badge?: string; // "인기", "NEW" 등
  subServices?: { name: string; description: string }[]; // 노인장기요양 하위 4개 등
}

// --- 플랫폼 (Platform) ---
export interface PlatformProduct {
  slug: string;
  nameEn: string;
  nameKo: string;
  tagline: string;
  description: string;
  icon: string;
  image: string;
  href: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  status: "active" | "coming-soon" | "partnership";
}

// --- 대상 세그먼트 (Who We Serve) ---
export interface AudienceSegment {
  slug: string;
  type: "provider" | "user";
  nameEn: string;
  nameKo: string;
  description: string;
  icon: string;
  image: string;
  href: string;
  highlights: string[];
  ctaLabel: string;
  ctaHref: string;
  children?: AudienceSegment[];
}

// --- 블로그 ---
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  image: string;
  author: string;
  publishedAt: string; // ISO date
  readTime: number; // 분
  isPublished: boolean;
  tags: string[];
  content: string; // placeholder 마크다운
}

export type BlogCategory =
  | "bayada-story"
  | "policy"
  | "disease-info"
  | "care-guide"
  | "news";

// --- 리뷰 ---
export interface Review {
  id: string;
  rating: number; // 1-5
  content: string;
  author: string; // 익명화: "70대 남성 보호자"
  serviceType: string; // 서비스 slug 참조
  createdAt: string;
}

// --- 멤버십 ---
export interface MembershipPlan {
  type: "paid" | "free" | "non-member";
  nameKo: string;
  nameEn: string;
  price?: string;
  features: MembershipFeature[];
  ctaLabel: string;
  ctaHref: string;
}

export interface MembershipFeature {
  name: string;
  paid: string | boolean;
  free: string | boolean;
  nonMember?: string | boolean;
}

// --- 타임라인 ---
export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  icon?: string;
  highlight?: boolean;
}

// --- FAQ ---
export interface FAQCategory {
  slug: string;
  name: string;
  items: FAQItem[];
}

export interface FAQItem {
  q: string;
  a: string;
}

// --- 네비게이션 ---
export interface MegaMenuItem {
  label: string;
  labelKo?: string;
  href: string;
  children?: MegaMenuGroup[];
}

export interface MegaMenuGroup {
  title: string;
  items: { label: string; href: string; description?: string }[];
}

// --- 파트너십 ---
export interface PartnershipType {
  nameKo: string;
  nameEn: string;
  description: string;
  icon: string;
  benefits: string[];
}

// --- 채용 ---
export interface CareerPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  deadline: string;
  isActive: boolean;
  description: string;
  requirements: string[];
  preferred: string[];
}

// --- 핵심 수치 ---
export interface KeyNumber {
  value: number;
  suffix: string;
  labelEn: string;
  labelKo: string;
}

// --- 세계 서비스 영역 ---
export interface ServiceRegion {
  country: string;
  countryEn: string;
  status: "active" | "expanding" | "planned";
  description: string;
  coordinates: { lat: number; lng: number };
}

// --- 폼 관련 ---
export interface FormSubmitResult {
  success: boolean;
  referenceNumber: string;
  message: string;
}

// --- Why BAYADA ---
export interface WhyBayadaPillar {
  titleEn: string;
  titleKo: string;
  description: string;
  icon: string;
}
