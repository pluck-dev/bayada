"use client";
import { useState } from "react";
import type { Field, PageEdits } from "@bayada/korea";
import { resetKoreaPage, saveKoreaPage } from "@/lib/actions/korea";
import { Button, Card, Field as FormField, inputClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";
import { KoreaMediaUpload } from "./KoreaMediaUpload";
export function KoreaPageEditor({ documentKey, fields, initial, updatedAt }: { documentKey: string; fields: Field[]; initial: PageEdits; updatedAt: string | null }) {
  const [data, setData] = useState(initial), [search, setSearch] = useState("");
  const { run, isPending } = useAction();
  const filtered = fields.filter(f => (f.label + (data.values[f.key] ?? f.value)).toLowerCase().includes(search.toLowerCase()));
  const [limit, setLimit] = useState(30);
  return <Card title="원본 화면 콘텐츠"><KoreaMediaUpload /><form className="space-y-4" onSubmit={e => { e.preventDefault(); run(() => saveKoreaPage(documentKey, data, updatedAt)); }}>
    <div className="flex flex-wrap items-end gap-4"><FormField label="페이지 제목"><input className={inputClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></FormField><label className="flex gap-2 p-2 text-sm"><input type="checkbox" checked={data.published} onChange={e => setData({ ...data, published: e.target.checked })} />공개</label><Button type="submit" variant="primary" disabled={isPending}>변경 저장</Button>{updatedAt && <Button type="button" disabled={isPending} onClick={() => run(() => resetKoreaPage(documentKey, updatedAt), { confirm: { title: "원본으로 복원할까요?", body: "현재 변경 내용은 감사 이력에 남습니다." } })}>원본 복원</Button>}</div>
    <input className={inputClass} aria-label="문구·이미지·링크 검색" placeholder="문구·이미지·링크 검색" value={search} onChange={e => { setSearch(e.target.value); setLimit(30); }} />
    <p className="text-xs text-muted">{filtered.length}개 항목 · 배치와 디자인은 보존됩니다. 이미지와 링크는 주소로 수정합니다.</p>
    <div className="grid gap-4 lg:grid-cols-2">{filtered.slice(0, limit).map(f => <FormField key={f.key} label={`${f.kind === "text" ? "문구" : f.kind === "image" || f.kind === "background" ? "이미지·영상" : "링크"} · ${f.label.slice(0, 55)}`}>
      <textarea className={textareaClass} rows={(data.values[f.key] ?? f.value).length > 100 ? 4 : 2} value={data.values[f.key] ?? f.value} onChange={e => setData({ ...data, values: { ...data.values, [f.key]: e.target.value } })} />
    </FormField>)}</div>{filtered.length > limit && <Button type="button" onClick={() => setLimit(limit + 30)}>30개 더 보기</Button>}
  </form></Card>;
}
