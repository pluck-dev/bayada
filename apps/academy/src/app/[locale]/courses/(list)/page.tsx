import Link from "next/link";
import { Search, SearchX, X } from "lucide-react";
import { Breadcrumb, EmptyState, Pagination, buttonVariants, cn, tagClass } from "@bayada/ui";
import { COVER_PALETTES, categoryTone } from "@bayada/ui/cover";
import { getSiteSettings } from "@/lib/site-settings";
import { inquiryHref } from "@bayada/shared/site-settings";
import { NoProgramsNotice } from "@/components/course/NoProgramsNotice";
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
import { FilterPanel, FilterSheetButton, type FilterGroup } from "@/components/catalog/FilterPanel";
import { SortSelect } from "@/components/catalog/SortSelect";

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
  const [result, taxonomy, facets, settings] = await Promise.all([
    listCatalog(viewer, filters),
    getTaxonomy(viewer),
    getFacetCounts(viewer),
    getSiteSettings(),
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
  // 보는 사람에게 열린 프로그램이 하나도 없음(필터와 무관) — 외부 회원·비로그인의 현재 상태
  const nothingVisible = facets.total === 0;
  // 분야 칩: 프로그램이 있는 분야 + 지금 선택된 분야
  const categoryChips = taxonomy.categories.filter((c) => c.count > 0 || filters.category.includes(c.slug));
  const onlyCategory = filters.category.length === 1 ? filters.category[0] : null;

  return (
    <div className="container-page page-y">
      <Breadcrumb LinkComponent={Link} items={[{ label: "홈", href: `/${locale}` }, { label: title }]} />
      <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[34px] font-extrabold leading-[1.15] tracking-[-0.035em] text-ink md:text-[48px]">{title}</h1>
          <p className="mt-3 text-body-lg text-muted">직군·분야·난이도로 지금 필요한 교육을 찾아보세요.</p>
        </div>
        <form action={`/${locale}/courses`} role="search" className="w-full md:max-w-[400px]">
          {Object.entries(query).flatMap(([k, v]) =>
            k !== "q" && Array.isArray(v) && v.length ? [<input key={k} type="hidden" name={k} value={v.join(",")} />] : []
          )}
          {filters.sort !== "recommended" && <input type="hidden" name="sort" value={filters.sort} />}
          <label className="relative block">
            <span className="sr-only">프로그램 검색</span>
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              name="q"
              type="search"
              defaultValue={filters.q}
              placeholder="프로그램·분야·기관 검색"
              className="h-13 w-full rounded-full border border-transparent bg-surface-sunken pl-13 pr-24 text-body text-ink outline-none transition-colors placeholder:text-subtle hover:bg-neutral-200 focus:border-ink focus:bg-canvas"
            />
            <button type="submit" className={cn(buttonVariants({ variant: "primary", size: "sm" }), "absolute right-2 top-1/2 -translate-y-1/2")}>
              검색
            </button>
          </label>
        </form>
      </div>

      {nothingVisible && !isFiltered ? (
        <NoProgramsNotice
          className="mt-10"
          locale={locale}
          loggedIn={!!viewer}
          name={viewer?.name}
          inquiryHref={inquiryHref(settings.inquiry)}
          contactEmail={settings.footer.contactEmail}
          callbackPath={`/${locale}/courses`}
        />
      ) : (
        <>
          {categoryChips.length > 0 && (
            <nav aria-label="분야" className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
              <Link
                href={catalogHref(locale, { ...query, category: [], page: 1 })}
                scroll={false}
                aria-current={filters.category.length === 0 ? "true" : undefined}
                className={tagClass({ active: filters.category.length === 0 })}
              >
                전체 <span className="tabular opacity-70">{facets.total}</span>
              </Link>
              {categoryChips.map((c) => {
                const active = onlyCategory === c.slug;
                return (
                  <Link
                    key={c.slug}
                    href={catalogHref(locale, { ...query, category: active ? [] : [c.slug], page: 1 })}
                    scroll={false}
                    aria-current={active ? "true" : undefined}
                    className={tagClass({ active })}
                  >
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full ring-1 ring-black/10"
                      style={{ background: COVER_PALETTES[categoryTone(c.slug)].bg }}
                    />
                    {c.name} <span className="tabular opacity-70">{c.count}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="mt-8 grid gap-10 lg:grid-cols-[232px_1fr]">
            {/* 필터: 데스크톱 사이드바 / 모바일 바텀시트 */}
            <aside className="hidden lg:block">
              <div className="no-scrollbar sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-6">
                <FilterPanel locale={locale} query={query} groups={groups} />
              </div>
            </aside>

            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-body text-muted" aria-live="polite">
                  <span className="tabular font-bold text-ink">{result.total}</span>개 프로그램
                </p>
                <div className="flex items-center gap-2">
                  <span className="lg:hidden">
                    <FilterSheetButton locale={locale} query={query} groups={groups} total={result.total} />
                  </span>
                  <SortSelect locale={locale} query={query} />
                </div>
              </div>

              {isFiltered && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {chips.map((c) => (
                    <Link
                      key={c.href + c.label}
                      href={c.href}
                      scroll={false}
                      className={cn(tagClass({ size: "sm", active: true }), "pr-2.5")}
                      aria-label={`${c.label} 조건 해제`}
                    >
                      {c.label} <X className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  ))}
                  <Link
                    href={catalogHref(locale, { sort: query.sort })}
                    scroll={false}
                    className="ml-1 rounded-full px-2 py-1 text-caption font-semibold text-muted hover:bg-surface-sunken hover:text-ink"
                  >
                    전체 해제
                  </Link>
                </div>
              )}

              <div className="mt-6">
                {result.items.length > 0 ? (
                  <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                    {result.items.map((c) => (
                      <CourseCard key={c.id} course={c} locale={locale} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    framed
                    icon={<SearchX />}
                    title="조건에 맞는 프로그램이 없어요"
                    description="검색어를 바꾸거나 필터를 줄여 보세요."
                    action={
                      <Link href={`/${locale}/courses`} className={buttonVariants({ variant: "secondary" })}>
                        조건 모두 해제
                      </Link>
                    }
                  />
                )}
              </div>

              <Pagination
                className="mt-14"
                page={result.page}
                totalPages={result.totalPages}
                hrefFor={(p) => catalogHref(locale, { ...query, page: p })}
                LinkComponent={Link}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
