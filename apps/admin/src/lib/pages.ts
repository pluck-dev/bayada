// 정적 문서 종류 — 클라이언트·서버 공용 (prisma import 금지)
// slug 는 아카데미 라우트와 약속된 값이라 임의로 만들지 못하게 고정한다.
export const PAGE_DOCS = [
  { slug: "terms", title: "이용약관" },
  { slug: "privacy", title: "개인정보처리방침" },
  { slug: "refund", title: "환불 규정" },
] as const;

export type PageSlug = (typeof PAGE_DOCS)[number]["slug"];

export function pageDoc(slug: string) {
  return PAGE_DOCS.find((d) => d.slug === slug);
}
