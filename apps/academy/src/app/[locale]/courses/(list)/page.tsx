import Link from "next/link";
import { ChevronLeft, ChevronRight, Lock, SearchX, SlidersHorizontal, X } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { getFacetCounts, getTaxonomy, listCatalog, parseCatalogFilters } from "@/lib/queries/courses";
import { LIST_KEYS, catalogHref, type CatalogQuery, type ListKey } from "@/lib/catalog-url";
import {
  CERT_KINDS,
  CERT_KIND_LABEL,
  LEARNING_MODES,
  LEARNING_MODE_LABEL,
  PRICE_KINDS,
  PRICE_KIND_LABEL,
  JOB_ROLES,
  JOB_ROLE_LABEL,
  LEVELS,
  LEVEL_LABEL,
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABEL,
} from "@/lib/labels";
import { CourseCard } from "@/components/course/CourseCard";
import { FilterPanel, type FilterGroup } from "@/components/catalog/FilterPanel";
import { SortSelect } from "@/components/catalog/SortSelect";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const filters = parseCatalogFilters(await searchParams);
  const viewer = await getViewer();
  const [result, taxonomy, facets] = await Promise.all([
    listCatalog(viewer, filters),
    getTaxonomy(viewer),
    getFacetCounts(viewer),
  ]);

  const query: CatalogQuery = {
    q: filters.q,
    audience: filters.audience,
    type: filters.type,
    level: filters.level,
    category: filters.category,
    provider: filters.provider,
    mode: filters.mode,
    price: filters.price,
    cert: filters.cert,
    sort: filters.sort,
  };

  const groups: FilterGroup[] = [
    { key: "audience", title: "대상 직군", options: JOB_ROLES.map((r) => ({ value: r, label: JOB_ROLE_LABEL[r] })) },
    { key: "type", title: "상품 유형", options: PRODUCT_TYPES.map((t) => ({ value: t, label: PRODUCT_TYPE_LABEL[t] })) },
    { key: "level", title: "난이도", options: LEVELS.map((l) => ({ value: l, label: LEVEL_LABEL[l] })) },
    {
      key: "category",
      title: "주제",
      options: taxonomy.categories.map((c) => ({ value: c.slug, label: c.name, count: c.count })),
    },
  ];
  groups.push(
    {
      key: "mode",
      title: "학습 방식",
      options: LEARNING_MODES.map((m) => ({ value: m, label: LEARNING_MODE_LABEL[m], count: facets.mode[m] ?? 0 })),
    },
    {
      key: "cert",
      title: "인증 유형",
      options: CERT_KINDS.map((c) => ({ value: c, label: CERT_KIND_LABEL[c], count: facets.cert[c] })),
    },
    {
      key: "price",
      title: "가격",
      options: PRICE_KINDS.map((p) => ({ value: p, label: PRICE_KIND_LABEL[p], count: facets.price[p] })),
    }
  );
  // 노출 가능한 강의가 있는 기관만 (선택돼 있던 기관은 0개여도 해제할 수 있게 남긴다)
  const providerOptions = taxonomy.providers.filter((p) => p.count > 0 || filters.provider.includes(p.slug));
  if (providerOptions.length > 0) {
    groups.push({
      key: "provider",
      title: "제공기관",
      options: providerOptions.map((p) => ({ value: p.slug, label: p.name, count: p.count })),
    });
  }

  // 선택된 조건 칩
  const labelOf = (key: ListKey, value: string) => {
    if (key === "audience") return JOB_ROLE_LABEL[value as keyof typeof JOB_ROLE_LABEL];
    if (key === "type") return PRODUCT_TYPE_LABEL[value as keyof typeof PRODUCT_TYPE_LABEL];
    if (key === "level") return LEVEL_LABEL[value as keyof typeof LEVEL_LABEL];
    if (key === "category") return taxonomy.categories.find((c) => c.slug === value)?.name ?? value;
    if (key === "mode") return LEARNING_MODE_LABEL[value as keyof typeof LEARNING_MODE_LABEL];
    if (key === "price") return PRICE_KIND_LABEL[value as keyof typeof PRICE_KIND_LABEL];
    if (key === "cert") return CERT_KIND_LABEL[value as keyof typeof CERT_KIND_LABEL];
    return taxonomy.providers.find((p) => p.slug === value)?.name ?? value;
  };
  const chips = LIST_KEYS.flatMap((key) =>
    (query[key] ?? []).map((value) => ({
      label: labelOf(key, value),
      href: catalogHref(locale, { ...query, [key]: (query[key] ?? []).filter((v) => v !== value) }),
    }))
  );
  if (filters.q) chips.unshift({ label: `“${filters.q}”`, href: catalogHref(locale, { ...query, q: "" }) });

  const isFiltered = chips.length > 0;
  const title = filters.type.length === 1 && filters.type[0] === "CERTIFICATION" ? "인증·커리어" : "전체 프로그램";

  return (
    <div className="container-page pb-8 pt-8 md:pt-10">
      <nav aria-label="현재 위치" className="text-xs text-muted">
        <Link href={`/${locale}`} className="hover:text-ink">
          홈
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-soft">{title}</span>
      </nav>
      <h1 className="mt-3 text-[32px] font-bold tracking-[-0.02em] text-ink md:text-[40px]">{title}</h1>

      <form action={`/${locale}/courses`} role="search" className="mt-6 max-w-xl">
        {Object.entries(query).flatMap(([k, v]) =>
          k !== "q" && Array.isArray(v) && v.length ? [<input key={k} type="hidden" name={k} value={v.join(",")} />] : []
        )}
        {filters.sort !== "recommended" && <input type="hidden" name="sort" value={filters.sort} />}
        <label className="relative block">
          <span className="sr-only">프로그램 검색</span>
          <input
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="프로그램, 주제, 기관 이름으로 검색"
            className="h-12 w-full rounded-2xl border border-line bg-white pl-4 pr-24 text-[15px] text-ink placeholder:text-subtle focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 h-9 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft"
          >
            검색
          </button>
        </label>
      </form>

      <div className="mt-10 grid gap-8 lg:grid-cols-[232px_1fr]">
        {/* 필터: 데스크톱 사이드바 / 모바일 접이식 */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 rounded-2xl border border-line bg-white p-5">
            <FilterPanel locale={locale} query={query} groups={groups} />
          </div>
        </aside>
        <details className="rounded-2xl border border-line bg-white lg:hidden">
          <summary className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-ink">
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> 필터
            {isFiltered && <span className="rounded-full bg-brand px-1.5 text-[11px] text-white">{chips.length}</span>}
          </summary>
          <div className="border-t border-line-soft p-5">
            <FilterPanel locale={locale} query={query} groups={groups} />
          </div>
        </details>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] font-semibold text-ink">
              <span className="text-brand">{result.total}</span>개 프로그램
            </p>
            <SortSelect locale={locale} query={query} />
          </div>

          {isFiltered && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <Link
                  key={c.href + c.label}
                  href={c.href}
                  scroll={false}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface py-1 pl-3 pr-2 text-xs font-medium text-ink-soft hover:border-ink-soft hover:text-ink"
                  aria-label={`${c.label} 조건 해제`}
                >
                  {c.label} <X className="h-3.5 w-3.5" aria-hidden />
                </Link>
              ))}
              <Link
                href={catalogHref(locale, { sort: query.sort })}
                scroll={false}
                className="ml-1 text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
              >
                전체 해제
              </Link>
            </div>
          )}

          <div className="mt-6">
            {result.items.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((c) => (
                  <CourseCard key={c.id} course={c} locale={locale} />
                ))}
              </div>
            ) : isFiltered ? (
              <EmptyState
                icon={<SearchX className="h-5 w-5" />}
                title="조건에 맞는 프로그램이 없어요"
                description="검색어를 바꾸거나 필터를 줄여 보세요."
                action={{ label: "전체 보기", href: `/${locale}/courses` }}
              />
            ) : (
              <EmptyState
                icon={<Lock className="h-5 w-5" />}
                title={viewer ? "아직 공개된 프로그램이 없어요" : "지금은 임직원 전용 프로그램을 운영하고 있어요"}
                description={
                  viewer
                    ? "새 프로그램이 공개되면 이곳에서 바로 확인할 수 있어요."
                    : "바야다홈헬스케어 임직원이라면 로그인 후 사내 교육 프로그램을 볼 수 있어요."
                }
                action={viewer ? undefined : { label: "로그인", href: `/${locale}/auth/login` }}
              />
            )}
          </div>

          {result.totalPages > 1 && (
            <nav aria-label="페이지" className="mt-10 flex items-center justify-center gap-1">
              {result.page > 1 ? (
                <Link
                  href={catalogHref(locale, { ...query, page: result.page - 1 })}
                  aria-label="이전 페이지"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-line-soft"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center text-line" aria-hidden>
                  <ChevronLeft className="h-4 w-4" />
                </span>
              )}
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={catalogHref(locale, { ...query, page: p })}
                  aria-current={p === result.page ? "page" : undefined}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-semibold ${
                    p === result.page ? "bg-ink text-white" : "text-ink-soft hover:bg-line-soft"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {result.page < result.totalPages ? (
                <Link
                  href={catalogHref(locale, { ...query, page: result.page + 1 })}
                  aria-label="다음 페이지"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-line-soft"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center text-line" aria-hidden>
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
