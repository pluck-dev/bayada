"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BOARDS, type BoardPost } from "@bayada/korea";
import { saveKoreaPost, deleteKoreaPost } from "@/lib/actions/korea";
import { Button, Card, Field, inputClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";
import { KoreaMediaUpload } from "./KoreaMediaUpload";
export function KoreaPostEditor({ initial, updatedAt }: { initial: BoardPost; updatedAt: string | null }) {
  const router = useRouter(); const pathname = usePathname();
  const [data, setData] = useState(initial); const { run, isPending } = useAction();
  const change = (key: keyof BoardPost, value: unknown) => setData({ ...data, [key]: value });
  return <Card title={updatedAt ? "게시글 편집" : "새 게시글"}><KoreaMediaUpload /><form className="space-y-4" onSubmit={e => { e.preventDefault(); run(() => saveKoreaPost(data, updatedAt), updatedAt ? undefined : { refresh: false, onSuccess: () => router.replace(`${pathname}?board=${data.board}&id=${data.id}`) }); }}>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="게시판"><select className={inputClass} disabled={!!updatedAt} value={data.board} onChange={e => change("board", e.target.value)}>{Object.entries(BOARDS).map(([key, b]) => <option key={key} value={key}>{b.title}</option>)}</select></Field><Field label="제목"><input className={inputClass} aria-label="제목" value={data.title} onChange={e => change("title", e.target.value)} /></Field><Field label="작성자"><input className={inputClass} aria-label="작성자" value={data.author} onChange={e => change("author", e.target.value)} /></Field><Field label="날짜"><input type="date" className={inputClass} aria-label="날짜" value={data.date} onChange={e => change("date", e.target.value)} /></Field></div>
    {data.board === "bayadab_05" && <Field label="FAQ 노출 순서"><input type="number" min={0} max={1000} aria-label="FAQ 노출 순서" className={inputClass} value={data.sortOrder ?? 1000} onChange={e => change("sortOrder", Number(e.target.value))} /></Field>}
    <Field label="본문 (서식 HTML)"><textarea rows={14} className={textareaClass} aria-label="본문" value={data.content} onChange={e => change("content", e.target.value)} /></Field>
    <Field label="대표 이미지 URL"><input className={inputClass} aria-label="대표 이미지 URL" value={data.image} onChange={e => change("image", e.target.value)} /></Field>
    <div className="flex gap-5"><label><input type="checkbox" checked={data.published} onChange={e => change("published", e.target.checked)} /> 공개</label><label><input type="checkbox" checked={data.notice} onChange={e => change("notice", e.target.checked)} /> 공지 고정</label></div>
    <details><summary>첨부 파일 {data.attachments.length}개</summary>{data.attachments.map((a, i) => <div key={i} className="my-3 grid gap-2"><input aria-label="첨부 이름" className={inputClass} value={a.label} onChange={e => change("attachments", data.attachments.map((b, n) => n === i ? { ...b, label: e.target.value } : b))} /><input aria-label="첨부 주소" className={inputClass} value={a.url} onChange={e => change("attachments", data.attachments.map((b, n) => n === i ? { ...b, url: e.target.value } : b))} /><Button type="button" onClick={() => change("attachments", data.attachments.filter((_, n) => n !== i))}>첨부 제거</Button></div>)}<Button type="button" onClick={() => change("attachments", [...data.attachments, { label: "", url: "" }])}>첨부 추가</Button></details>
    <div className="flex gap-3"><Button type="submit" variant="primary" disabled={isPending}>저장</Button>{updatedAt && <Button type="button" disabled={isPending} onClick={() => run(() => deleteKoreaPost(data.board, data.id, updatedAt), { refresh: false, onSuccess: () => router.replace(`${pathname}?board=${data.board}`), confirm: { title: "게시글을 삭제할까요?", body: "삭제 이력은 남고 홈페이지에서 제거됩니다." } })}>삭제</Button>}</div>
  </form></Card>;
}
