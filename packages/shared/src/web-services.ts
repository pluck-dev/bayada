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
  ageGroups?: string[];
  relatedServices: string[]; // slug 참조
  badge?: string; // "인기", "NEW" 등
  subServices?: { name: string; description: string }[]; // 노인장기요양 하위 4개 등
}

export interface ServiceLearnMoreItem {
  title: string;
  content: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServicePageDetail {
  slug: string;
  heroImage: string;
  headline: string;
  longDescription: string;
  learnMoreItems: ServiceLearnMoreItem[];
  faqs: ServiceFAQ[];
  leadMagnet?: {
    title: string;
    description: string;
  };
  careTeamTitle: string;
  careTeamDescription: string;
  careTeamFeatures: string[];
  joinTeamTitle: string;
  joinTeamDescription: string;
}

export const WEB_SERVICE_PREFIX = "web-service/";
export interface WebServiceDocument {
  service: ServiceData;
  detail: ServicePageDetail;
  published: boolean;
  order: number;
}

const string = (v: unknown, key: string, required = false): string => {
  if (typeof v !== "string" || v.length > 8000 || (required && !v.trim())) throw new Error(`${key}: 올바른 내용을 입력하세요.`);
  return v.trim();
};
const object = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("콘텐츠 형식을 확인하세요.");
  return v as Record<string, unknown>;
};
const list = <T>(v: unknown, parse: (entry: unknown) => T): T[] => {
  if (!Array.isArray(v) || v.length > 50) throw new Error("목록은 최대 50개까지 입력하세요.");
  return v.map(parse);
};
const strings = (v: unknown) => list(v, (entry) => string(entry, "목록"));
const image = (v: unknown) => {
  const value = string(v, "이미지");
  if (value && !/^(https?:\/\/|\/(?!\/))/i.test(value)) throw new Error("이미지는 사이트 경로 또는 http(s) 주소를 입력하세요.");
  return value;
};
export function parseWebServiceDocument(input: unknown): WebServiceDocument {
  const doc = object(input), s = object(doc.service), d = object(doc.detail);
  const slug = string(s.slug, "주소", true);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) throw new Error("주소는 영문 소문자·숫자·하이픈을 사용하세요.");
  if (typeof doc.published !== "boolean" || !Number.isSafeInteger(doc.order) || Number(doc.order) < 0 || Number(doc.order) > 10000) throw new Error("공개 상태와 정렬 순서를 확인하세요.");
  const pair = (v: unknown) => { const row = object(v); return { title: string(row.title, "제목", true), content: string(row.content, "내용", true) }; };
  const service: ServiceData = {
    slug, href: `/what-we-do/${slug}`, nameKo: string(s.nameKo, "국문명", true), nameEn: string(s.nameEn, "영문명", true),
    description: string(s.description, "요약", true), icon: string(s.icon, "아이콘"), image: image(s.image),
    ageGroups: s.ageGroups === undefined ? ["seniors", "adults", "children"] : strings(s.ageGroups).filter((v) => ["seniors", "adults", "children"].includes(v)),
    highlights: strings(s.highlights), targetAudience: strings(s.targetAudience), relatedServices: strings(s.relatedServices),
    process: list(s.process, (v) => { const row = object(v); return { step: 0, title: string(row.title, "절차 제목", true), description: string(row.description, "절차 설명", true) }; }).map((row, i) => ({ ...row, step: i + 1 })),
    ...(s.badge === undefined ? {} : { badge: string(s.badge, "배지") }),
    ...(s.subServices === undefined ? {} : { subServices: list(s.subServices, (v) => { const row = object(v); return { name: string(row.name, "하위 서비스명", true), description: string(row.description, "하위 서비스 설명", true) }; }) }),
  };
  const detail: ServicePageDetail = {
    slug, heroImage: image(d.heroImage), headline: string(d.headline, "상세 제목", true), longDescription: string(d.longDescription, "상세 설명", true),
    learnMoreItems: list(d.learnMoreItems, pair), faqs: list(d.faqs, (v) => { const row = object(v); return { question: string(row.question, "질문", true), answer: string(row.answer, "답변", true) }; }),
    careTeamTitle: string(d.careTeamTitle, "케어팀 제목"), careTeamDescription: string(d.careTeamDescription, "케어팀 설명"), careTeamFeatures: strings(d.careTeamFeatures),
    joinTeamTitle: string(d.joinTeamTitle, "채용 제목"), joinTeamDescription: string(d.joinTeamDescription, "채용 설명"),
    ...(d.leadMagnet === undefined ? {} : { leadMagnet: (() => { const row = object(d.leadMagnet); return { title: string(row.title, "자료 제목"), description: string(row.description, "자료 설명") }; })() }),
  };
  return { service, detail, published: doc.published, order: Number(doc.order) };
}
