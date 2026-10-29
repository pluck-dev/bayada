// 카탈로그 URL 상태 (?q=&audience=&type=&level=&category=&provider=&mode=&price=&cert=&sort=&page=)
export interface CatalogQuery {
  q?: string;
  audience?: string[];
  type?: string[];
  level?: string[];
  category?: string[];
  provider?: string[];
  mode?: string[];
  price?: string[];
  cert?: string[];
  sort?: string;
  page?: number;
}

export const LIST_KEYS = ["audience", "type", "level", "category", "provider", "mode", "price", "cert"] as const;
export type ListKey = (typeof LIST_KEYS)[number];

export function catalogHref(locale: string, query: CatalogQuery): string {
  const sp = new URLSearchParams();
  if (query.q) sp.set("q", query.q);
  for (const key of LIST_KEYS) {
    const v = query[key];
    if (v && v.length) sp.set(key, v.join(","));
  }
  if (query.sort && query.sort !== "recommended") sp.set("sort", query.sort);
  if (query.page && query.page > 1) sp.set("page", String(query.page));
  const qs = sp.toString();
  return `/${locale}/courses${qs ? `?${qs}` : ""}`;
}
