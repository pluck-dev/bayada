"use client";
import { useState } from "react";
import type { MenuItem } from "@bayada/korea";
import { saveKoreaMenu } from "@/lib/actions/korea";
import { useAction } from "@/components/ui/feedback";
import { Button, Card, inputClass } from "@/components/ui";
const blank = (): MenuItem => ({ id: crypto.randomUUID(), label: "새 메뉴", href: "/", children: [] });
function MenuTree({ items, change, depth = 0 }: { items: MenuItem[]; change: (next: MenuItem[]) => void; depth?: number }) {
  const replace = (index: number, value: MenuItem) => change(items.map((item, i) => i === index ? value : item));
  return <div className="space-y-3">{items.map((item, i) => <div key={item.id} className="rounded-xl border border-line p-3"><div className="grid gap-2 sm:grid-cols-2"><input className={inputClass} aria-label="메뉴 이름" value={item.label} onChange={e => replace(i, { ...item, label: e.target.value })} /><input className={inputClass} aria-label="메뉴 주소" value={item.href} onChange={e => replace(i, { ...item, href: e.target.value })} /></div><label className="my-2 flex gap-2 text-sm"><input type="checkbox" checked={!!item.newTab} onChange={e => replace(i, { ...item, newTab: e.target.checked })} />새 창으로 열기</label><div className="my-3 flex gap-2">{i > 0 && <Button type="button" size="sm" onClick={() => { const next = [...items]; [next[i - 1], next[i]] = [next[i]!, next[i - 1]!]; change(next); }}>위로</Button>}<Button type="button" size="sm" onClick={() => change(items.filter((_, n) => i !== n))}>삭제</Button>{depth < 3 && <Button type="button" size="sm" onClick={() => replace(i, { ...item, children: [...item.children, blank()] })}>하위 메뉴 추가</Button>}</div>{item.children.length > 0 && <div className="border-l-2 border-line pl-4"><MenuTree items={item.children} depth={depth + 1} change={children => replace(i, { ...item, children })} /></div>}</div>)}</div>;
}
export function KoreaMenuEditor({ initial, updatedAt }: { initial: MenuItem[]; updatedAt: string | null }) {
  const [items, setItems] = useState(initial); const { run, isPending } = useAction();
  return <Card title="공통 메뉴"><form className="space-y-4" onSubmit={e => { e.preventDefault(); run(() => saveKoreaMenu(items, updatedAt)); }}><div className="flex gap-3"><Button type="submit" variant="primary" disabled={isPending}>메뉴 저장</Button><Button type="button" onClick={() => setItems([...items, blank()])}>메뉴 추가</Button></div><MenuTree items={items} change={setItems} /></form></Card>;
}
