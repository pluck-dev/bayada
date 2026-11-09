import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@bayada/db";
import { WEB_BLOG_CATEGORIES } from "@bayada/shared/web-content";
import { requirePage } from "@/lib/session";
import { formatDate, formatDateTime } from "@/lib/labels";
import {
  Badge,
  EmptyState,
  FilterChip,
  LinkButton,
  PageHeader,
  cx,
  qs,
  tableClass,
  tableWrap,
  tdClass,
  thClass,
  trClass,
} from "@/components/ui";

export default async function WebBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  await requirePage("web.content", locale);
  const sp = await searchParams;
  const category = WEB_BLOG_CATEGORIES.some((c) => c.slug === sp.category) ? sp.category : undefined;
  const [posts, grouped] = await Promise.all([
    prisma.webBlogPost.findMany({
      where: category ? { category } : {},
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, category: true, isPublished: true, publishedAt: true, updatedAt: true, author: true },
    }),
    prisma.webBlogPost.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);
  const count = (c: string) => grouped.find((g) => g.category === c)?._count._all ?? 0;
  const total = grouped.reduce((n, g) => n + g._count._all, 0);
  const base = `/${locale}/web/blog`;
  const catName = (slug: string) => WEB_BLOG_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      <PageHeader
        title="블로그"
        description="홈페이지 블로그 글입니다. 게시한 글만 홈페이지에 보이며, 저장하면 홈페이지가 바로 다시 만들어집니다."
        actions={
          <LinkButton href={`${base}/new`} variant="primary">
            <Plus className="h-3.5 w-3.5" aria-hidden />새 글
          </LinkButton>
        }
      />
      <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="카테고리">
        <FilterChip href={base} active={!category} count={total}>
          전체
        </FilterChip>
        {WEB_BLOG_CATEGORIES.map((c) => (
          <FilterChip key={c.slug} href={qs(base, { category: c.slug })} active={category === c.slug} count={count(c.slug)}>
            {c.name}
          </FilterChip>
        ))}
      </div>
      <div className={tableWrap}>
        {posts.length === 0 ? (
          <EmptyState
            title="글이 없습니다"
            description={total === 0 ? "글이 하나도 없으면 홈페이지는 기존 기본 글을 보여 줍니다. pnpm --filter @bayada/db import:web 으로 옮길 수 있습니다." : undefined}
          />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>제목</th>
                <th className={thClass}>카테고리</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>게시일</th>
                <th className={thClass}>마지막 수정</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className={trClass}>
                  <td className={cx(tdClass, "min-w-[320px] whitespace-normal!")}>
                    <Link href={`${base}/${p.id}`} className="font-bold text-ink transition-colors hover:text-brand">
                      {p.title}
                    </Link>
                    <p className="mt-0.5 text-micro text-subtle">
                      /blog/{p.slug}
                      {p.author && ` · ${p.author}`}
                    </p>
                  </td>
                  <td className={cx(tdClass, "text-muted")}>{catName(p.category)}</td>
                  <td className={tdClass}>
                    {p.isPublished ? (
                      <Badge tone="green" dot>
                        게시
                      </Badge>
                    ) : (
                      <Badge tone="zinc">초안</Badge>
                    )}
                  </td>
                  <td className={cx(tdClass, "tabular text-muted")}>{formatDate(p.publishedAt)}</td>
                  <td className={cx(tdClass, "tabular text-subtle")}>{formatDateTime(p.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
