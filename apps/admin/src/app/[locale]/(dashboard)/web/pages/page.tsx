import Link from "next/link";
import { prisma } from "@bayada/db";
import { WEB_PAGE_DEFAULTS, WEB_PAGE_PREFIX, WEB_PAGE_TITLES, isWebPageKey, parseWebPageContent } from "@bayada/shared/web-page-content";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { WebPageManager } from "@/components/web/WebPageManager";
export default async function WebPagesPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
  const { locale } = await params;
  await requirePage("web.content", locale);
  const query = await searchParams;
  const key = isWebPageKey(query.page) ? query.page : "about";
  const row = await prisma.page.findUnique({ where: { slug: WEB_PAGE_PREFIX + key } });
  const content = row ? parseWebPageContent(key, JSON.parse(row.content)) : WEB_PAGE_DEFAULTS[key];
  return <><PageHeader title="페이지 본문" description="기존 화면 구성을 유지하며 소개·안내·정책 본문을 수정합니다. 법률·인증 관련 문안의 최종 내용은 고객사에서 확인해 주세요." /><nav className="mb-5 flex flex-wrap gap-2" aria-label="편집할 페이지">{Object.entries(WEB_PAGE_TITLES).map(([slug, title]) => <Link key={slug} href={`/${locale}/web/pages?page=${slug}`} aria-current={slug === key ? "page" : undefined} className={`rounded-lg border px-3 py-2 text-sm ${slug === key ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>{title}</Link>)}</nav><WebPageManager key={`${key}:${row?.updatedAt.toISOString() ?? "default"}`} pageKey={key} initial={content} updatedAt={row?.updatedAt.toISOString() ?? null} /></>;
}
