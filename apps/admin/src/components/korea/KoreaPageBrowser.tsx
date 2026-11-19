"use client";
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { ChevronDown, FileText, Search } from 'lucide-react';
import { Disclosure, inputClass } from '@/components/ui';
export type PageChoice = { key: string; title: string; path: string; kind: string };
export function KoreaPageBrowser({ choices, selected, locale }: { choices: PageChoice[]; selected: string; locale: string }) {
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false); const panelId = useId();
  useEffect(() => setMobileOpen(false), [selected]);
  const results = choices.filter(p => (p.title + p.path).toLowerCase().includes(search.toLowerCase()));
  const row = (p: PageChoice) => <Link key={p.key} href={`/${locale}/korea?page=${p.key}`} aria-current={selected === p.key ? 'page' : undefined} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${selected === p.key ? 'bg-brand-soft font-bold text-brand' : 'text-ink-soft hover:bg-wash'}`}><FileText className="size-4 shrink-0" aria-hidden /><span className="min-w-0 truncate">{p.title}</span></Link>;
  const main = results.filter(p => p.kind === 'page' || p.kind === 'fragment');
  const secondary = results.filter(p => p.kind !== 'page' && p.kind !== 'fragment');
  return <aside className="min-w-0 rounded-2xl bg-canvas p-4 lg:sticky lg:top-5 lg:self-start"><h2 className="mb-3 hidden text-sm font-extrabold lg:block">편집할 페이지</h2><button type="button" className="flex w-full items-center justify-between gap-3 text-left text-sm font-bold lg:hidden" aria-expanded={mobileOpen} aria-controls={panelId} onClick={() => setMobileOpen(!mobileOpen)}><span>페이지 선택 · {choices.find(p => p.key === selected)?.title}</span><ChevronDown className="size-4 shrink-0" /></button><div id={panelId} className={`${mobileOpen ? 'mt-4 block' : 'hidden'} lg:mt-0 lg:block`}><div className="relative mb-3"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted" /><input className={`${inputClass} pl-9`} aria-label="페이지 찾기" placeholder="페이지 찾기" value={search} onChange={e => setSearch(e.target.value)} /></div><nav aria-label="페이지 목록" className="max-h-[32vh] space-y-1 overflow-y-auto lg:max-h-[64vh]">{main.map(row)}{search && secondary.map(row)}{!results.length && <p className="px-3 py-5 text-sm text-muted">일치하는 페이지가 없습니다.</p>}</nav>{!search && <Disclosure summary={`이전 자료·목록 ${secondary.length}개`} defaultOpen={secondary.some(p => p.key === selected)} className="mt-3 border-t border-line pt-2"><nav className="max-h-64 space-y-1 overflow-y-auto" aria-label="이전 자료 목록">{secondary.map(row)}</nav></Disclosure>}</div></aside>;
}
