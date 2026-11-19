"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Badge, inputClass } from '@/components/ui';
export function KoreaPostList({posts,base,selected}:{posts:{id:string;title:string;date:string;published:boolean}[];base:string;selected?:string}){
 const [q,setQ]=useState('');const filtered=posts.filter(p=>p.title.toLowerCase().includes(q.toLowerCase()));
 return <nav aria-label="게시글 목록" className="min-w-0 rounded-2xl bg-canvas p-3"><input aria-label="게시글 검색" placeholder={`게시글 검색 · ${posts.length}건`} className={inputClass} value={q} onChange={e=>setQ(e.target.value)}/><div className="mt-3 max-h-[30vh] overflow-y-auto xl:max-h-[65vh]">{filtered.map(p=><Link key={p.id} aria-current={selected===p.id?'page':undefined} className={`mb-1 block rounded-xl p-3 ${selected===p.id?'bg-brand-soft ring-1 ring-inset ring-brand/15':'hover:bg-wash'}`} href={`${base}&id=${encodeURIComponent(p.id)}`}><div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted"><span>{p.date}</span><Badge tone={p.published?'green':'zinc'}>{p.published?'공개':'비공개'}</Badge></div><p className="break-words text-sm font-semibold">{p.title}</p></Link>)}{!filtered.length&&<p className="px-3 py-8 text-center text-sm text-muted">검색 결과가 없습니다.</p>}</div></nav>;
}
