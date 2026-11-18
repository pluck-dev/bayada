/**
 * 프로그램 자동 표지 규칙 (Course.coverMode = AUTO). 아카데미 화면·OG 이미지·어드민 미리보기가 같이 쓴다.
 * 이관된 WordPress 배너는 작은 로고·글씨라 카드에서 읽히지 않는다 → 제목·분야·유형으로 표지를 그린다.
 * - 색은 분야(카테고리)로 정한다: 같은 분야는 같은 색 → 목록에서 분야가 한눈에 묶인다.
 * - 무늬는 slug 해시로 고른다: 같은 분야 카드가 나란히 있어도 똑같아 보이지 않게.
 * - 같은 입력이면 항상 같은 표지(결정적). 라벨 문자열은 앱이 넘긴다(라벨표가 앱마다 있다).
 */

export type CoverTone = "red" | "ink" | "rose" | "sand" | "wine";
export type CoverPatternKind = "rings" | "cross" | "dots" | "arc" | "stripes";

export interface CoverPalette {
  bg: string;
  fg: string;
  sub: string;
  accent: string;
  pattern: string;
  chipBg: string;
}

export const COVER_PALETTES: Record<CoverTone, CoverPalette> = {
  red: { bg: "#e31b34", fg: "#ffffff", sub: "rgba(255,255,255,0.82)", accent: "#ffffff", pattern: "rgba(255,255,255,0.16)", chipBg: "rgba(255,255,255,0.18)" },
  ink: { bg: "#1c1b1b", fg: "#ffffff", sub: "rgba(255,255,255,0.72)", accent: "#e31b34", pattern: "rgba(255,255,255,0.09)", chipBg: "rgba(255,255,255,0.12)" },
  rose: { bg: "#fde3e6", fg: "#6e1020", sub: "#a50d24", accent: "#e31b34", pattern: "rgba(227,27,52,0.13)", chipBg: "rgba(255,255,255,0.7)" },
  sand: { bg: "#efe7da", fg: "#18181b", sub: "#52525b", accent: "#e31b34", pattern: "rgba(24,24,27,0.075)", chipBg: "rgba(255,255,255,0.7)" },
  wine: { bg: "#870f22", fg: "#ffffff", sub: "rgba(255,255,255,0.78)", accent: "#fbc9cf", pattern: "rgba(255,255,255,0.11)", chipBg: "rgba(255,255,255,0.14)" },
};

/** 분야 slug → 색. 표에 없는 새 분야는 slug 해시로 정해진다(그래도 항상 같은 색) */
const CATEGORY_TONE: Record<string, CoverTone> = {
  방문간호: "red",
  "psp-class": "ink",
  "common-education": "sand",
  방문요양: "rose",
  체험코스: "wine",
};
const TONES: CoverTone[] = ["red", "ink", "sand", "rose", "wine"];
const PATTERNS: CoverPatternKind[] = ["rings", "cross", "dots", "arc", "stripes"];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 표지 입력 — 라벨은 이미 사람이 읽는 문자열로 */
export interface CoverInput {
  slug: string;
  title: string;
  category?: { name: string; slug: string } | null;
  typeLabel: string;
  levelLabel?: string | null;
  audienceLabel?: string | null;
}

export interface CoverSpec {
  tone: CoverTone;
  palette: CoverPalette;
  pattern: CoverPatternKind;
  title: string;
  /** 위 작은 줄: 분야 · 유형 */
  eyebrow: string;
  /** 아래 칩: 난이도, 대상 직군 */
  chips: string[];
  /** 제목 길이 단계 — 글자 크기를 정한다 */
  length: "short" | "medium" | "long";
}

/** 분야(카테고리) slug → 표지 색. 분야 칩의 색 점 등 표지 밖에서도 같은 색을 쓰려고 따로 둔다 */
export function categoryTone(slug: string | null | undefined): CoverTone {
  if (!slug) return "rose";
  return CATEGORY_TONE[slug] ?? (TONES[hash(slug) % TONES.length] ?? "rose");
}

export function coverSpec(c: CoverInput): CoverSpec {
  const tone = categoryTone(c.category?.slug);
  const title = c.title.replace(/\s+/g, " ").trim() || "제목 없음";
  const len = title.length;
  return {
    tone,
    palette: COVER_PALETTES[tone],
    pattern: PATTERNS[hash(c.slug || title) % PATTERNS.length] ?? "rings",
    title,
    eyebrow: [c.category?.name ?? "바야다 아카데미", c.typeLabel].join(" · "),
    chips: [c.levelLabel, c.audienceLabel].filter((v): v is string => !!v),
    length: len <= 18 ? "short" : len <= 42 ? "medium" : "long",
  };
}
