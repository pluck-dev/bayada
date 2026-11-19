import Link from "next/link";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { pages, templates, getEdits } from "@bayada/korea/server";
import { KoreaPageEditor } from "@/components/korea/KoreaPageEditor";
export default async function KoreaPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string; q?: string }> }) {
  const { locale } = await params; await requirePage("korea.content", locale);
  const query = await searchParams;
  const page = pages.find(p => p.key === query.page) ?? pages.find(p => p.path === "/")!;
  const fragment = query.page && templates.fragments[query.page];
  const key = fragment ? query.page! : page.key;
  const source = fragment || page;
  const { edits, updatedAt } = await getEdits(key);
  const title = fragment ? key === "header" ? "공통 헤더·메뉴" : "공통 푸터" : page.title;
  return <><PageHeader title="바야다코리아" description="기존 www.bayadakorea.com의 Next.js 복제 사이트입니다. 리뉴얼 브랜드·아카데미 콘텐츠와 별도로 관리합니다." />
    <div className="mb-5 flex flex-wrap gap-2"><Link href={`/${locale}/korea/boards`} className="rounded border border-line px-4 py-2">게시판 관리</Link><Link href={`/${locale}/korea/inquiries`} className="rounded border border-line px-4 py-2">서비스 상담</Link><a href={process.env.KOREA_PUBLIC_URL || "http://localhost:3300"} target="_blank" rel="noreferrer" className="rounded border border-line px-4 py-2">홈페이지 보기</a></div>
    <form className="mb-4 flex gap-2" method="get"><select name="page" defaultValue={key} aria-label="편집할 페이지" className="max-w-full rounded border border-line px-3 py-2"><option value="header">공통 헤더</option><option value="footer">공통 푸터</option>{pages.map(p => <option key={p.key} value={p.key}>{p.kind === 'post' ? '자료 · ' : ''}{p.title}</option>)}</select><button className="rounded border border-line px-3">편집</button></form>

    <KoreaPageEditor key={`${key}:${updatedAt}`} documentKey={key} fields={source.fields} initial={edits ?? { title, published: true, values: {} }} updatedAt={updatedAt} />
  </>;
}
