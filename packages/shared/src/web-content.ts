// 홈페이지(apps/web) 공용 정의 — 문의 폼 종류·필드 라벨·처리 상태, 블로그 카테고리, 서비스 목록, 사이트 정보 설정.
// 순수 모듈(타입·기본값·정규화). DB 읽기/쓰기는 web(읽기·문의 저장)과 admin(관리)에서 한다.
//
// 사이트 정보는 아카데미 설정과 같은 SiteSetting 테이블에 `web.` 접두어 key 로 한 행씩 둔다.
// 기본값 = 옛 하드코딩 값(Footer·contact 페이지·data/_enriched-content.json companyInfo)이라 행이 없으면 화면이 그대로다.
import { safeHref } from "./site-settings";

// ─── 문의 폼 ───

/** 폼 종류 → 접수번호 접두어·이름. 접두어는 옛 lib/mock.ts prefixMap 그대로 (+ DeiCloud 사전 신청) */
export const WEB_FORM_TYPES = {
  contact: { prefix: "CT", label: "서비스 상담 신청" },
  "vendor-qualification": { prefix: "VQ", label: "파트너(공급자) 자격 신청" },
  "deicloud-early-access": { prefix: "DC", label: "DeiCloud 사전 신청" },
  "provider-application": { prefix: "HP", label: "의료 전문인력 지원" },
  "other-provider-application": { prefix: "OP", label: "기타 전문인력 지원" },
  "government-consult": { prefix: "GV", label: "지자체 상담" },
  "paid-onboarding": { prefix: "CS", label: "유료 멤버십 온보딩" },
  "free-onboarding": { prefix: "CS", label: "무료 멤버십 온보딩" },
  general: { prefix: "GN", label: "일반 문의" },
} as const;

export type WebFormType = keyof typeof WEB_FORM_TYPES;
export const WEB_FORM_TYPE_KEYS = Object.keys(WEB_FORM_TYPES) as WebFormType[];

export function isWebFormType(v: unknown): v is WebFormType {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(WEB_FORM_TYPES, v);
}

export function webFormLabel(type: string): string {
  return isWebFormType(type) ? WEB_FORM_TYPES[type].label : type;
}

/**
 * 폼별 필수 필드. 서버 액션이 이 목록으로 검증한다(브라우저 required 는 믿지 않는다).
 * 연락처 필드(name/phone/email/organization)는 목록·검색용으로 WebInquiry 컬럼에도 따로 저장한다.
 */
export const WEB_FORM_REQUIRED: Record<WebFormType, string[]> = {
  contact: ["name", "relation", "phone", "email", "address", "services", "currentlyReceiving"],
  "vendor-qualification": ["organization", "orgType", "representative", "phone", "email"],
  "deicloud-early-access": ["email"],
  "provider-application": ["name", "phone", "email"],
  "other-provider-application": ["name", "phone", "email"],
  "government-consult": ["name", "phone", "email"],
  "paid-onboarding": ["name", "phone", "email"],
  "free-onboarding": ["name", "phone", "email"],
  general: ["name", "phone", "email"],
};

/** 개인정보 동의 체크가 있는 폼 — 동의 없으면 접수 거부 */
export const WEB_FORM_CONSENT_REQUIRED: WebFormType[] = ["contact", "vendor-qualification"];

/** 어드민 상세 화면에서 payload 키를 사람이 읽는 이름으로 */
export const WEB_FIELD_LABEL: Record<string, string> = {
  name: "이름",
  relation: "환자와의 관계",
  relationDetail: "구체적인 관계",
  phone: "전화번호",
  email: "이메일",
  address: "주소·거주지",
  services: "필요 서비스",
  hasGrade: "장기요양등급 판정",
  currentlyReceiving: "다른 재가 서비스 이용 중",
  startDate: "서비스 개시 요청일",
  hasFamily: "동거 가족",
  organization: "기관명 / 성명",
  orgType: "기관 유형",
  representative: "대표자명",
  qualifications: "보유 자격 / 면허",
  motivation: "지원 동기",
  serviceType: "서비스 유형",
  message: "문의 내용",
};

/** payload 값 표기 (yes/no·코드값 → 한국어) */
export const WEB_VALUE_LABEL: Record<string, Record<string, string>> = {
  hasGrade: { yes: "예", no: "아니오" },
  currentlyReceiving: { yes: "예", no: "아니오" },
  hasFamily: { yes: "예", no: "아니오" },
  orgType: { medical: "의료기관", individual: "개인 (전문 인력)", education: "교육기관" },
};

/** contact 폼 '필요 서비스' 선택지 (contact 페이지와 어드민 표시 공용) */
export const CONTACT_SERVICE_OPTIONS = [
  { id: "home-health", label: "Home Health (방문간호)" },
  { id: "companion-care", label: "Companion Care (동행 돌봄)" },
  { id: "personal-care", label: "Personal Care (일상생활 지원)" },
  { id: "private-duty-nursing", label: "Private Duty Nursing (전담 간호)" },
  { id: "habilitation", label: "Habilitation (기능향상)" },
  { id: "hospice-care", label: "Hospice Care (호스피스)" },
  { id: "autism-aba", label: "Autism & ABA Therapy (자폐 및 ABA 치료)" },
  { id: "pediatric", label: "Pediatric Home Health (소아 방문간호)" },
  { id: "veterans", label: "Veterans (국가유공자 지원)" },
] as const;

/** payload 값 하나를 화면·CSV 용 문자열로 */
export function formatWebFieldValue(key: string, v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) {
    if (key === "services") {
      return v.map((s) => CONTACT_SERVICE_OPTIONS.find((o) => o.id === s)?.label ?? String(s)).join(", ");
    }
    return v.map((x) => String(x)).join(", ");
  }
  if (typeof v === "boolean") return v ? "예" : "아니오";
  const s = String(v);
  return WEB_VALUE_LABEL[key]?.[s] ?? s;
}

export const WEB_INQUIRY_STATUSES = ["NEW", "CONTACTED", "IN_PROGRESS", "DONE", "SPAM"] as const;
export type WebInquiryStatusKey = (typeof WEB_INQUIRY_STATUSES)[number];
export const WEB_INQUIRY_STATUS_LABEL: Record<WebInquiryStatusKey, string> = {
  NEW: "신규",
  CONTACTED: "연락 완료",
  IN_PROGRESS: "진행 중",
  DONE: "처리 완료",
  SPAM: "스팸·무효",
};

// ─── 블로그·서비스 ───

/** 블로그 카테고리 (옛 data/blog.ts blogCategories) — 카테고리 추가는 코드에서 */
export const WEB_BLOG_CATEGORIES = [
  { slug: "bayada-story", name: "50년 BAYADA" },
  { slug: "policy", name: "제도·정책" },
  { slug: "disease-info", name: "질환정보" },
  { slug: "care-guide", name: "케어가이드" },
  { slug: "news", name: "소식" },
] as const;

/** 홈페이지 서비스 slug·이름 (data/services.ts 와 같은 값) — 후기의 서비스 유형 선택지 */
export const WEB_SERVICE_OPTIONS = [
  { slug: "skilled-nursing", name: "전문 방문 간호" },
  { slug: "private-assistive-care", name: "맞춤형 방문 요양" },
  { slug: "hospice", name: "암환자 케어 (호스피스)" },
  { slug: "ltci-beneficiary-care", name: "노인장기요양보험 수급자 케어" },
  { slug: "physical-trainer", name: "맞춤형 방문 운동" },
  { slug: "transitional-care", name: "전환의료" },
  { slug: "patient-support", name: "환자지원프로그램" },
  { slug: "dct", name: "분산형 임상시험" },
  { slug: "long-term-care", name: "노인장기요양서비스" },
  { slug: "senior-living", name: "시니어 리빙 솔루션" },
  { slug: "mobile-clinical", name: "모바일 클리니컬 서비스 컨설팅" },
  { slug: "education", name: "교육" },
  { slug: "home-health", name: "방문 건강관리" },
  { slug: "personal-care", name: "일상생활 지원" },
  { slug: "habilitation", name: "기능향상 훈련" },
  { slug: "pediatric-home-health", name: "소아 방문 건강관리" },
  { slug: "aba-therapy", name: "자폐 스펙트럼 & ABA 치료" },
  { slug: "companion-care", name: "동행 돌봄" },
  { slug: "private-duty-nursing", name: "전담 방문간호" },
  { slug: "veterans", name: "국가유공자 지원" },
] as const;

// ─── 사이트 정보 설정 (SiteSetting key = web.*) ───

export const WEB_SNS_KEYS = ["instagram", "facebook", "linkedin", "youtube"] as const;
export type WebSnsKey = (typeof WEB_SNS_KEYS)[number];
export const WEB_SNS_LABEL: Record<WebSnsKey, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export interface WebSettings {
  /** 푸터·문의 페이지에 보이는 회사·연락처 정보 (공개) */
  "web.site": {
    legalName: string;
    ceo: string;
    businessRegistrationNo: string;
    /** 푸터 주소 */
    headquarters: string;
    /** 대표 전화 (푸터·문의 페이지) */
    serviceHotline: string;
    /** 푸터 이메일 */
    email: string;
    /** 문의 페이지 '이메일 문의' 카드 */
    contactEmail: string;
    /** 문의 페이지 전화 운영 시간 */
    contactHours: string;
    /** 문의 페이지 '오시는 길' */
    officeName: string;
    officeAddress: string;
    /** 푸터 SNS 아이콘 링크 ("#" = 아직 없음) */
    sns: Record<WebSnsKey, string>;
    /** 푸터 SNS 아래 작은 글씨 */
    footerNote: string;
    /** © 연도 뒤 문구 */
    copyright: string;
  };
  /** 문의 알림 (비공개 — 홈페이지 화면에는 내려가지 않는다) */
  "web.inquiry": {
    /** 새 문의 알림 받을 주소 (쉼표로 여러 개, 비우면 알림 없음) */
    notifyEmails: string;
  };
}

export type WebSettingKey = keyof WebSettings;
export const WEB_SETTING_KEYS: WebSettingKey[] = ["web.site", "web.inquiry"];

export function isWebSettingKey(v: unknown): v is WebSettingKey {
  return typeof v === "string" && (WEB_SETTING_KEYS as string[]).includes(v);
}

export const WEB_SETTING_DEFAULTS: WebSettings = {
  "web.site": {
    legalName: "(주)바야다홈헬스케어",
    ceo: "김영민",
    businessRegistrationNo: "696-81-00440",
    headquarters: "서울시 강남구 테헤란로 431, 7층 7005호",
    serviceHotline: "1670-1379",
    email: "K-hhc@bayadakorea.com",
    contactEmail: "info@bayada.co.kr",
    contactHours: "평일 09:00 - 18:00",
    officeName: "바야다홈헬스케어 코리아",
    officeAddress: "서울특별시 강남구 테헤란로 (본사 주소 확인 필요)",
    sns: { instagram: "#", facebook: "#", linkedin: "#", youtube: "#" },
    footerNote: "DEILEA.AI",
    copyright: "BAYADA Home Health Care Korea. All rights reserved.",
  },
  "web.inquiry": { notifyEmails: "" },
};

const str = (v: unknown, fallback: string, max = 300): string => (typeof v === "string" ? v.trim().slice(0, max) : fallback);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
export const isEmail = (v: string) => EMAIL_RE.test(v);

/** "a@x.com, b@y.com" → 올바른 주소만 (최대 10개) */
export function parseEmailList(v: string): string[] {
  return [...new Set(v.split(/[,;\s]+/).map((s) => s.trim().toLowerCase()).filter(isEmail))].slice(0, 10);
}

export function normalizeWebSetting<K extends WebSettingKey>(key: K, raw: unknown): WebSettings[K] {
  const o = obj(raw);
  if (key === "web.site") {
    const d = WEB_SETTING_DEFAULTS["web.site"];
    const snsRaw = obj(o.sns);
    const sns = {} as Record<WebSnsKey, string>;
    for (const k of WEB_SNS_KEYS) {
      const v = typeof snsRaw[k] === "string" ? safeHref(String(snsRaw[k]).slice(0, 300)) : d.sns[k];
      sns[k] = v || "#";
    }
    return {
      legalName: str(o.legalName, d.legalName, 80),
      ceo: str(o.ceo, d.ceo, 40),
      businessRegistrationNo: str(o.businessRegistrationNo, d.businessRegistrationNo, 40),
      headquarters: str(o.headquarters, d.headquarters, 200),
      serviceHotline: str(o.serviceHotline, d.serviceHotline, 40),
      email: str(o.email, d.email, 120),
      contactEmail: str(o.contactEmail, d.contactEmail, 120),
      contactHours: str(o.contactHours, d.contactHours, 60),
      officeName: str(o.officeName, d.officeName, 80),
      officeAddress: str(o.officeAddress, d.officeAddress, 200),
      sns,
      footerNote: str(o.footerNote, d.footerNote, 80),
      copyright: str(o.copyright, d.copyright, 120),
    } as WebSettings[K];
  }
  if (key === "web.inquiry") {
    const d = WEB_SETTING_DEFAULTS["web.inquiry"];
    const list = typeof o.notifyEmails === "string" ? parseEmailList(o.notifyEmails).join(", ") : d.notifyEmails;
    return { notifyEmails: list } as WebSettings[K];
  }
  throw new Error(`알 수 없는 홈페이지 설정 키: ${String(key)}`);
}

export function resolveWebSettings(rows: { key: string; value: unknown }[]): WebSettings {
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  const out = {} as Record<WebSettingKey, unknown>;
  for (const k of WEB_SETTING_KEYS) out[k] = byKey.has(k) ? normalizeWebSetting(k, byKey.get(k)) : WEB_SETTING_DEFAULTS[k];
  return out as WebSettings;
}

/** 히어로 CTA·외부 링크 → 실제 href. #id 는 그대로(같은 페이지 스크롤), /경로 는 언어 경로 아래 */
export function resolveWebHref(href: string, locale: string): string {
  const s = safeHref(href);
  if (s.startsWith("/")) return `/${locale}${s === "/" ? "" : s}`;
  return s;
}

/** KST 기준 YYYY-MM-DD */
export function kstDate(d: Date): string {
  return new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}
