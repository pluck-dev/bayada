import Link from "next/link";
import { randomUUID } from "node:crypto";
import { requirePage } from "@/lib/session";
import { Card, PageHeader } from "@/components/ui";
import { BOARDS } from "@bayada/korea";
import { cleanRichText, listPosts } from "@bayada/korea/server";
import { KoreaPostEditor } from "@/components/korea/KoreaPostEditor";
import { KoreaPostList } from "@/components/korea/KoreaPostList";
export default async function BoardsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ board?: string; id?: string }> }) {
  const { locale } = await params; await requirePage("korea.content", locale); const query = await searchParams;
  const board = query.board && Object.hasOwn(BOARDS, query.board) ? query.board : "bayadab_01";
  const posts = await listPosts(board); const selected = posts.find(p => p.id === query.id);
  return <><PageHeader title="바야다코리아 게시판" description="공지·뉴스룸·영상자료·FAQ의 게시·수정·삭제와 첨부를 관리합니다." /><nav className="mb-4 flex flex-wrap gap-3">{Object.entries(BOARDS).map(([key, value]) => <Link className={`rounded-xl px-4 py-2 text-sm font-bold ${key===board?"bg-ink text-white":"bg-canvas text-muted"}`} aria-current={key === board ? "page" : undefined} key={key} href={`/${locale}/korea/boards?board=${key}`}>{value.title}</Link>)}<Link className="rounded bg-brand px-3 py-2 text-white" href={`/${locale}/korea/boards?board=${board}&id=new`}>게시글 추가</Link></nav><div className="grid gap-5 xl:grid-cols-[320px_1fr]"><KoreaPostList posts={posts.map(({id,title,date,published})=>({id,title,date,published}))} selected={query.id} base={`/${locale}/korea/boards?board=${board}`} />{selected || query.id === "new" ? <KoreaPostEditor key={`${board}:${selected?.id ?? "new"}:${selected?.updatedAt}`} publicOrigin={process.env.KOREA_PUBLIC_URL || "http://localhost:3300"} initial={selected ? {...selected, content: cleanRichText(selected.content)} : { id: randomUUID(), board, title: "", content: "", author: "관리자", date: new Date().toISOString().slice(0, 10), image: "", published: true, notice: false, attachments: [] }} updatedAt={selected?.updatedAt ?? null} /> : <Card><div className="py-16 text-center"><h2 className="font-bold">편집할 게시글을 선택하세요</h2><p className="mt-2 text-sm text-muted">목록에서 찾거나 새 게시글을 추가할 수 있습니다.</p></div></Card>}</div></>;
}
