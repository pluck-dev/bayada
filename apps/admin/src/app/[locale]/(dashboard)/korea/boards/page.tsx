import Link from "next/link";
import { randomUUID } from "node:crypto";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { BOARDS } from "@bayada/korea";
import { listPosts } from "@bayada/korea/server";
import { KoreaPostEditor } from "@/components/korea/KoreaPostEditor";
export default async function BoardsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ board?: string; id?: string }> }) {
  const { locale } = await params; await requirePage("korea.content", locale); const query = await searchParams;
  const board = query.board && query.board in BOARDS ? query.board : "bayadab_01";
  const posts = await listPosts(board); const selected = posts.find(p => p.id === query.id);
  return <><PageHeader title="바야다코리아 게시판" description="공지·뉴스룸·영상자료·FAQ의 게시·수정·삭제와 첨부를 관리합니다." /><nav className="mb-4 flex flex-wrap gap-3">{Object.entries(BOARDS).map(([key, value]) => <Link className="rounded border border-line px-3 py-2" aria-current={key === board ? "page" : undefined} key={key} href={`/${locale}/korea/boards?board=${key}`}>{value.title}</Link>)}<Link className="rounded bg-brand px-3 py-2 text-white" href={`/${locale}/korea/boards?board=${board}&id=new`}>게시글 추가</Link></nav><div className="grid gap-5 xl:grid-cols-[320px_1fr]"><nav className="max-h-[70vh] overflow-y-auto rounded border border-line">{posts.map(p => <Link key={p.id} className="block border-b border-line p-3 text-sm" href={`/${locale}/korea/boards?board=${board}&id=${p.id}`}><span className="text-xs text-muted">{p.date} · {p.published ? "공개" : "비공개"}</span><p>{p.title}</p></Link>)}</nav><KoreaPostEditor key={`${board}:${selected?.id ?? "new"}:${selected?.updatedAt}`} initial={selected ?? { id: randomUUID(), board, title: "", content: "", author: "관리자", date: new Date().toISOString().slice(0, 10), image: "", published: true, notice: false, attachments: [] }} updatedAt={selected?.updatedAt ?? null} /></div></>;
}
