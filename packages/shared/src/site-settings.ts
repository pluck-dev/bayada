// 학습자 사이트(아카데미) 문구·설정 — 어드민 '사이트 설정'에서 바꾸고 아카데미가 서버에서 읽는다.
// 순수 모듈(타입·기본값·정규화). DB 읽기/쓰기는 각 앱에서 한다.
//
// 저장 형태: SiteSetting 테이블에 섹션별 key 한 행(value Json). 단일 행(전체 JSON 하나) 대신 섹션별로 둔 이유
//  - 섹션마다 따로 저장해서 두 사람이 다른 섹션을 동시에 고쳐도 서로 덮어쓰지 않는다.
//  - 감사 로그 before/after 가 섹션 단위라 읽기 쉽다.
//  - '기본값으로 되돌리기' = 그 행 삭제. 행이 없으면 아래 DEFAULTS(옛 하드코딩 문구)를 쓰므로 설정 전에는 화면이 그대로다.
//  - 필드를 추가해도 마이그레이션 없이 normalize 가 기본값으로 채운다.

export const HOME_SECTION_KEYS = [
  "roles",
  "popular",
  "pathways",
  "partners",
  "topics",
  "upsell",
  "stats",
  "reviews",
  "faq",
] as const;
export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export const HOME_SECTION_LABEL: Record<HomeSectionKey, string> = {
  roles: "직군 탭",
  popular: "인기·신규 프로그램",
  pathways: "커리어 패스웨이",
  partners: "파트너 기관",
  topics: "주제별 찾아보기",
  upsell: "업셀 (아카데미 패스·기관 도입)",
  stats: "성과 지표",
  reviews: "수강생 후기",
  faq: "자주 묻는 질문",
};

export interface LinkSetting {
  label: string;
  /** "/courses" 처럼 / 로 시작하면 언어 경로(/ko) 아래, "#faq" 는 홈 안 위치, 그 외 https:·mailto:·tel: 그대로 */
  href: string;
}

export interface SiteSettings {
  "home.hero": {
    eyebrow: string;
    /** 줄바꿈(\n)은 화면에서도 줄바꿈 */
    title: string;
    subtitle: string;
    primaryCta: LinkSetting;
    secondaryCta: LinkSetting;
  };
  "home.sections": { order: HomeSectionKey[]; hidden: HomeSectionKey[] };
  faq: { title: string; subtitle: string; items: { q: string; a: string }[] };
  footer: {
    tagline: string;
    /** © 연도 뒤에 붙는 문구 */
    copyright: string;
    /** 상호·대표·주소 등 (줄마다 표시) */
    companyInfo: string;
    /** 사업자등록번호·통신판매업 신고 등 한 줄 */
    businessLine: string;
    contactEmail: string;
    contactPhone: string;
    sns: { label: string; url: string }[];
  };
  inquiry: {
    /** 기관 도입 문의 메일 (url 이 비어 있으면 mailto 로 연결) */
    email: string;
    subject: string;
    /** 문의 폼 등 별도 링크 — 있으면 메일 대신 이 주소 */
    url: string;
  };
  seo: { siteName: string; title: string; description: string; ogImageUrl: string };
}

export type SiteSettingKey = keyof SiteSettings;
export const SITE_SETTING_KEYS: SiteSettingKey[] = ["home.hero", "home.sections", "faq", "footer", "inquiry", "seo"];

export const SITE_SETTING_DEFAULTS: SiteSettings = {
  "home.hero": {
    eyebrow: "BAYADA Home Health Care Academy",
    title: "돌봄의 전문성,\n커리어가 되다",
    subtitle: "직군별 실무 스킬 학습부터 수료증 발급까지. 현장에서 바로 쓰는 돌봄 교육을 바야다 아카데미에서 시작하세요.",
    primaryCta: { label: "프로그램 둘러보기", href: "/courses" },
    secondaryCta: { label: "기관 도입 문의", href: "#org" },
  },
  "home.sections": { order: [...HOME_SECTION_KEYS], hidden: [] },
  faq: {
    title: "자주 묻는 질문",
    subtitle: "궁금한 점이 더 있다면 언제든 문의해 주세요.",
    items: [
      {
        q: "수강은 어떻게 하나요?",
        a: "회원 가입 후 원하는 프로그램 상세 페이지에서 ‘수강신청’을 누르면 바로 학습을 시작할 수 있어요. 수강 중인 프로그램은 마이 러닝에서 이어서 볼 수 있습니다.",
      },
      {
        q: "수료증은 어떻게 받나요?",
        a: "프로그램의 모든 영상·읽기 강의를 마치고 퀴즈를 통과하면 수료증이 자동으로 발급돼요. 마이 러닝 > 인증서에서 출력(PDF 저장)하거나 검증 링크를 공유할 수 있습니다.",
      },
      {
        q: "기관(센터) 단위로 수강할 수 있나요?",
        a: "네. 센터 직원 단체 수강을 원하시면 ‘기관 도입 문의’로 연락 주세요. 담당자가 도입 절차를 안내해 드립니다.",
      },
      {
        q: "사내 전용 프로그램은 누가 볼 수 있나요?",
        a: "바야다홈헬스케어 임직원 계정으로 로그인하면 사내 의무교육 등 사내 전용 프로그램을 함께 볼 수 있어요.",
      },
      {
        q: "수료증이 진짜인지 확인할 수 있나요?",
        a: "모든 수료증에는 고유 번호가 있어요. 수료증의 검증 링크나 ‘수료증 검증’ 페이지에서 번호를 입력하면 발급 사실을 누구나 확인할 수 있습니다.",
      },
    ],
  },
  footer: {
    tagline: "돌봄 현장의 전문성을 키우는 바야다홈헬스케어의 온라인 아카데미",
    copyright: "BAYADA Home Health Care Korea. All rights reserved.",
    companyInfo: "",
    businessLine: "",
    // 운영 주체·대표 연락처는 아직 미확정(피그마 W1 ⑫). 기존 B-Academy 운영 메일을 임시 창구로 쓴다.
    contactEmail: "b-academy@bayadakorea.com",
    contactPhone: "",
    sns: [],
  },
  inquiry: {
    email: "b-academy@bayadakorea.com",
    subject: "[BAYADA Academy] 기관 도입 문의",
    url: "",
  },
  seo: {
    siteName: "BAYADA Academy",
    title: "BAYADA Academy - 헬스케어 교육 플랫폼",
    description: "BAYADA의 온라인 교육 플랫폼입니다. 전문 헬스케어 교육과 자격증 과정을 수강하고 역량을 키워보세요.",
    ogImageUrl: "",
  },
};

// ─── 정규화: DB 값(모양을 믿지 않음) → 완전한 설정. 빠진 필드는 기본값 ───

const str = (v: unknown, fallback: string, max = 500): string => (typeof v === "string" ? v.slice(0, max) : fallback);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** 허용 링크: 사이트 안 경로(/…, #…), http(s), mailto, tel. 그 외(javascript: 등)는 빈 값 */
export function safeHref(v: string): string {
  const s = v.trim();
  if (!s) return "";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  if (s.startsWith("#")) return s;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(s)) return s;
  return "";
}

function link(v: unknown, d: LinkSetting): LinkSetting {
  const o = obj(v);
  return { label: str(o.label, d.label, 40), href: typeof o.href === "string" ? safeHref(o.href) : d.href };
}

const isSectionKey = (v: unknown): v is HomeSectionKey => typeof v === "string" && (HOME_SECTION_KEYS as readonly string[]).includes(v);

export function normalizeSetting<K extends SiteSettingKey>(key: K, raw: unknown): SiteSettings[K] {
  const o = obj(raw);
  switch (key) {
    case "home.hero": {
      const d = SITE_SETTING_DEFAULTS["home.hero"];
      return {
        eyebrow: str(o.eyebrow, d.eyebrow, 80),
        title: str(o.title, d.title, 120),
        subtitle: str(o.subtitle, d.subtitle, 300),
        primaryCta: link(o.primaryCta, d.primaryCta),
        secondaryCta: link(o.secondaryCta, d.secondaryCta),
      } as SiteSettings[K];
    }
    case "home.sections": {
      const order = Array.isArray(o.order) ? [...new Set(o.order.filter(isSectionKey))] : [];
      // 저장 뒤에 새 섹션이 추가돼도 빠지지 않게 기본 순서로 뒤에 붙인다
      for (const k of HOME_SECTION_KEYS) if (!order.includes(k)) order.push(k);
      const hidden = Array.isArray(o.hidden) ? [...new Set(o.hidden.filter(isSectionKey))] : [];
      return { order, hidden } as SiteSettings[K];
    }
    case "faq": {
      const d = SITE_SETTING_DEFAULTS.faq;
      const items = Array.isArray(o.items)
        ? o.items
            .map((it) => obj(it))
            .map((it) => ({ q: str(it.q, "", 200).trim(), a: str(it.a, "", 2000).trim() }))
            .filter((it) => it.q && it.a)
            .slice(0, 50)
        : d.items;
      return { title: str(o.title, d.title, 60), subtitle: str(o.subtitle, d.subtitle, 200), items } as SiteSettings[K];
    }
    case "footer": {
      const d = SITE_SETTING_DEFAULTS.footer;
      const sns = Array.isArray(o.sns)
        ? o.sns
            .map((it) => obj(it))
            .map((it) => ({ label: str(it.label, "", 30).trim(), url: safeHref(str(it.url, "", 300)) }))
            .filter((it) => it.label && it.url)
            .slice(0, 10)
        : d.sns;
      return {
        tagline: str(o.tagline, d.tagline, 200),
        copyright: str(o.copyright, d.copyright, 120),
        companyInfo: str(o.companyInfo, d.companyInfo, 500),
        businessLine: str(o.businessLine, d.businessLine, 300),
        contactEmail: str(o.contactEmail, d.contactEmail, 120).trim(),
        contactPhone: str(o.contactPhone, d.contactPhone, 40).trim(),
        sns,
      } as SiteSettings[K];
    }
    case "inquiry": {
      const d = SITE_SETTING_DEFAULTS.inquiry;
      return {
        email: str(o.email, d.email, 120).trim(),
        subject: str(o.subject, d.subject, 120),
        url: typeof o.url === "string" ? safeHref(o.url.slice(0, 300)) : d.url,
      } as SiteSettings[K];
    }
    case "seo": {
      const d = SITE_SETTING_DEFAULTS.seo;
      const og = typeof o.ogImageUrl === "string" ? o.ogImageUrl.trim().slice(0, 500) : d.ogImageUrl;
      return {
        siteName: str(o.siteName, d.siteName, 60).trim() || d.siteName,
        title: str(o.title, d.title, 120).trim() || d.title,
        description: str(o.description, d.description, 300).trim() || d.description,
        ogImageUrl: /^https?:\/\//i.test(og) ? og : "",
      } as SiteSettings[K];
    }
  }
  throw new Error(`알 수 없는 설정 키: ${String(key)}`);
}

/** key → 저장된 값 목록을 완전한 설정으로 */
export function resolveSiteSettings(rows: { key: string; value: unknown }[]): SiteSettings {
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  const out = {} as Record<SiteSettingKey, unknown>;
  for (const k of SITE_SETTING_KEYS) out[k] = byKey.has(k) ? normalizeSetting(k, byKey.get(k)) : SITE_SETTING_DEFAULTS[k];
  return out as SiteSettings;
}

/** 설정 링크 → 실제 href (locale 경로 붙이기) */
export function resolveHref(href: string, locale: string): string {
  if (href.startsWith("/")) return `/${locale}${href === "/" ? "" : href}`;
  if (href.startsWith("#")) return `/${locale}${href}`;
  return href;
}

/** 기관 도입 문의 링크 — 별도 URL 우선, 없으면 mailto */
export function inquiryHref(s: SiteSettings["inquiry"]): string {
  if (s.url) return s.url;
  return `mailto:${s.email}?subject=${encodeURIComponent(s.subject)}`;
}
