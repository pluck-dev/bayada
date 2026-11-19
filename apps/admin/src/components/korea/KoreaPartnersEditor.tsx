"use client";
import { useState } from 'react';
import type { Partner } from '@bayada/korea';
import { saveKoreaPartners } from '@/lib/actions/korea';
import { Button, Card, inputClass } from '@/components/ui';
import { useAction } from '@/components/ui/feedback';
import { KoreaMediaUpload } from './KoreaMediaUpload';
export function KoreaPartnersEditor({ initial, updatedAt }: { initial: Partner[]; updatedAt: string | null }) {
  const [items, setItems] = useState(initial); const { run, isPending } = useAction();
  const replace = (index: number, patch: Partial<Partner>) => setItems(items.map((x, i) => i === index ? { ...x, ...patch } : x));
  return <Card title="협력기관 로고 슬라이더"><KoreaMediaUpload /><form className="space-y-4" onSubmit={e => { e.preventDefault(); run(() => saveKoreaPartners(items, updatedAt)); }}><div className="flex gap-3"><Button type="submit" variant="primary" disabled={isPending}>협력기관 저장</Button><Button type="button" onClick={() => setItems([...items, { id: crypto.randomUUID(), label: '새 협력기관', image: '', href: '/', newTab: true }])}>기관 추가</Button></div>{items.map((item, i) => <div key={item.id} className="rounded-xl border border-line p-4"><div className="grid gap-3 sm:grid-cols-3"><input className={inputClass} aria-label="협력기관 이름" value={item.label} onChange={e => replace(i, { label: e.target.value })} /><input className={inputClass} aria-label="협력기관 이미지" value={item.image} onChange={e => replace(i, { image: e.target.value })} /><input className={inputClass} aria-label="협력기관 링크" value={item.href} onChange={e => replace(i, { href: e.target.value })} /></div><div className="mt-3 flex items-center gap-3"><label className="text-sm"><input type="checkbox" checked={item.newTab} onChange={e => replace(i, { newTab: e.target.checked })} /> 새 창</label>{i > 0 && <Button type="button" size="sm" onClick={() => { const next = [...items]; [next[i - 1], next[i]] = [next[i]!, next[i - 1]!]; setItems(next); }}>위로</Button>}<Button type="button" size="sm" onClick={() => setItems(items.filter((_, n) => n !== i))}>기관 삭제</Button></div></div>)}</form></Card>;
}
