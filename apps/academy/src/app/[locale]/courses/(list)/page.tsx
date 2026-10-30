import Link from "next/link";
import { Lock, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { Badge, Breadcrumb, EmptyState, PageHeader, Pagination, buttonVariants, controlClass, tagClass } from "@bayada/ui";
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
    <div className="container-page page-y">
      <PageHeader
        breadcrumb={<Breadcrumb LinkComponent={Link} items={[{ label: "홈", href: `/${locale}` }, { label: title }]} />}
        title={title}
        description="직군·주제·난이도로 필요한 교육을 찾아보세요."
      />

      <form action={`/${locale}/courses`} role="search" className="max-w-xl">
        {Object.entries(query).flatMap(([k, v]) =>
          k !== "q" && Array.isArray(v) && v.length ? [<input key={k} type="hidden" name={k} value={v.join(",")} />] : []
        )}
        {filters.sort !== "recommended" && <input type="hidden" name="sort" value={filters.sort} />}
        <label className="relative block">
          <span className="sr-only">프로그램 검색</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" aria-hidden />
          <input
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="프로그램, 주제, 기관 이름으로 검색"
            className={controlClass("md", "pl-12 pr-24")}
          />
          <button type="submit" className={`${buttonVariants({ variant: "secondary", size: "sm" })} absolute right-2 top-2`}>
            검색
          </button>
        </label>
      </form>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* 필터: 데스크톱 사이드바 / 모바일 접이식 */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel locale={locale} query={query} groups={groups} />
          </div>
        </aside>
        <details className="rounded-xl border border-line bg-canvas lg:hidden">
          <summary className="flex items-center gap-2 px-5 py-3.5 text-body-sm font-semibold text-ink">
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> 필터
            {isFiltered && <Badge tone="neutral">{chips.length}</Badge>}
          </summary>
          <div className="border-t border-line p-5">
            <FilterPanel locale={locale} query={query} groups={groups} />
          </div>
        </details>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-body text-muted">
              <span className="tabular font-semibold text-ink">{result.total}</span>개 프로그램
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
                  className={`${tagClass({ size: "sm" })} pr-2`}
                  aria-label={`${c.label} 조건 해제`}
                >
                  {c.label} <X className="h-3.5 w-3.5" aria-hidden />
                </Link>
              ))}
              <Link
                href={catalogHref(locale, { sort: query.sort })}
                scroll={false}
                className="ml-1 text-caption font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
              >
                전체 해제
              </Link>
            </div>
          )}

          <div className="mt-6">
            {result.items.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((c) => (
                  <CourseCard key={c.id} course={c} locale={locale} />
                ))}
              </div>
            ) : isFiltered ? (
              <EmptyState
                framed
                icon={<SearchX />}
                title="조건에 맞는 프로그램이 없어요"
                description="검색어를 바꾸거나 필터를 줄여 보세요."
                action={
                  <Link href={`/${locale}/courses`} className={buttonVariants({ variant: "secondary" })}>
                    전체 보기
                  </Link>
                }
              />
            ) : (
              <EmptyState
                framed
                icon={<Lock />}
                title={viewer ? "아직 공개된 프로그램이 없어요" : "지금은 임직원 전용 프로그램을 운영하고 있어요"}
                description={
                  viewer
                    ? "새 프로그램이 공개되면 이곳에서 바로 확인할 수 있어요."
                    : "바야다홈헬스케어 임직원이라면 로그인 후 사내 교육 프로그램을 볼 수 있어요."
                }
                action={
                  viewer ? undefined : (
                    <Link href={`/${locale}/auth/login`} className={buttonVariants({ variant: "secondary" })}>
                      로그인
                    </Link>
                  )
                }
              />
            )}
          </div>

          <Pagination
            className="mt-12"
            page={result.page}
            totalPages={result.totalPages}
            hrefFor={(p) => catalogHref(locale, { ...query, page: p })}
            LinkComponent={Link}
          />
        </div>
      </div>
    </div>
  );
}
