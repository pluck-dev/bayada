"use client";
import { useState } from "react";
import { FileText, ImageIcon, Link2, Search, RotateCcw } from "lucide-react";
import type { Field, PageEdits } from "@bayada/korea";
import { resetKoreaPage, saveKoreaPage } from "@/lib/actions/korea";
import { Button, Card, Disclosure, Switch, inputClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";
import { KoreaAssetInput, KoreaSaveBar, useKoreaDraft } from './KoreaEditorTools';
export function KoreaPageEditor({ documentKey, fields, initial, updatedAt, publicOrigin, title, previewPath }: { documentKey: string; fields: Field[]; initial: PageEdits; updatedAt: string | null; publicOrigin: string; title: string; previewPath: string }) {
  const [data, setData] = useState(initial), [search, setSearch] = useState(''), [kind, setKind] = useState('text'), [limit, setLimit] = useState(12);
  const { run, isPending } = useAction();
  const category = (f: Field) => f.kind === 'text' ? 'text' : f.kind === 'link' ? 'link' : 'media';
  const value = (f: Field) => data.values[f.key] ?? f.value;
  const original = (f: Field) => initial.values[f.key] ?? f.value;
  const changed = fields.filter(f => value(f) !== original(f));
  const dirty = changed.length + Number(data.title !== initial.title) + Number(data.published !== initial.published);
  useKoreaDraft(dirty > 0);
  const tabs = [{key:'text',label:'문구',Icon:FileText},{key:'media',label:'이미지·영상',Icon:ImageIcon},{key:'link',label:'링크',Icon:Link2}];
  const filtered = fields.filter(f => category(f) === kind && (f.label + value(f)).toLowerCase().includes(search.toLowerCase()));
  const change = (f: Field, v: string) => setData(d => ({...d,values:{...d.values,[f.key]:v}}));
  return <form onSubmit={e => {e.preventDefault();run(() => saveKoreaPage(documentKey,data,updatedAt));}} className="min-w-0">
    <Card title={title} description="수정할 항목을 찾고 변경 내용을 저장하세요." actions={<a className="text-sm font-bold text-ink underline decoration-line underline-offset-4" href={publicOrigin+previewPath} target="_blank" rel="noreferrer">사이트에서 보기</a>}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4"><nav className="flex flex-wrap gap-1" aria-label="콘텐츠 종류">{tabs.map(({key,label,Icon})=><button key={key} type="button" aria-pressed={kind===key} onClick={()=>{setKind(key);setLimit(12);setSearch('');}} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold ${kind===key?'bg-ink text-white':'text-muted hover:bg-wash'}`}><Icon className="size-4" aria-hidden/>{label}<span className="text-xs opacity-65">{fields.filter(f=>category(f)===key).length}</span></button>)}</nav><Switch checked={data.published} onChange={published=>setData({...data,published})} label={data.published?'공개 중':'비공개'} aria-label="페이지 공개 여부" size="sm" /></div>
      <div className="relative mb-5"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted"/><input className={`${inputClass} pl-9`} aria-label="편집 항목 검색" placeholder={kind==='text'?'사이트에 보이는 문구로 찾기':'파일명이나 주소로 찾기'} value={search} onChange={e=>{setSearch(e.target.value);setLimit(12);}} /></div>
      <div className={kind==='text'?"grid gap-3 sm:grid-cols-2":"space-y-4"}>{filtered.slice(0,limit).map(f=>{const isChanged=value(f)!==original(f);const label=`${kind==='text'?'문구':kind==='media'?'이미지·영상':'링크'} ${fields.filter(x=>category(x)===kind).findIndex(x=>x.key===f.key)+1}`;return <section key={f.key} className={`rounded-xl border p-3 ${isChanged?'border-amber-200 bg-amber-50/30':'border-line'}`}><div className="mb-3 flex items-center justify-between gap-3"><label htmlFor={`field-${f.key}`} className="text-[13px] font-bold">{label}{isChanged&&<span className="ml-2 text-xs font-medium text-warning">변경됨</span>}</label>{isChanged&&<Button size="sm" variant="ghost" onClick={()=>change(f,original(f))}><RotateCcw aria-hidden/>되돌리기</Button>}</div>{kind==='media'?<KoreaAssetInput label={label} value={value(f)} onChange={v=>change(f,v)} publicOrigin={publicOrigin}/>:kind==='link'?<><p className="mb-2 truncate text-xs text-muted">{f.label.startsWith('/')||f.label.startsWith('http')?'이동할 페이지 주소':f.label}</p><input id={`field-${f.key}`} className={inputClass} aria-label={label} value={value(f)} onChange={e=>change(f,e.target.value)}/></>:value(f).length<90&&!value(f).includes("\n")?<input id={`field-${f.key}`} className={inputClass} aria-label={label} value={value(f)} onChange={e=>change(f,e.target.value)}/>:<textarea id={`field-${f.key}`} className={textareaClass} aria-label={label} rows={value(f).length>140?4:2} value={value(f)} onChange={e=>change(f,e.target.value)}/>}</section>;})}{!filtered.length&&<div className="py-12 text-center text-sm text-muted">{search?'검색 결과가 없습니다.':'이 페이지에는 해당 종류의 편집 항목이 없습니다.'}</div>}</div>
      {filtered.length>limit&&<div className="mt-5 text-center"><Button onClick={()=>setLimit(limit+12)}>12개 더 보기 <span className="text-muted">({Math.min(limit,filtered.length)}/{filtered.length})</span></Button></div>}
      <Disclosure summary="페이지 설정·초기 내용 복원" className="mt-6 border-t border-line pt-3"><label className="mb-2 block text-sm font-bold" htmlFor="page-title">검색 결과에 표시할 페이지 제목</label><input id="page-title" className={inputClass} value={data.title} onChange={e=>setData({...data,title:e.target.value})}/>{updatedAt&&<Button className="mt-4" variant="danger" disabled={isPending} onClick={()=>run(()=>resetKoreaPage(documentKey,updatedAt),{confirm:{title:'초기 내용으로 복원할까요?',body:'저장된 편집 내용을 초기 내용으로 바꿉니다. 변경 이력은 보존됩니다.'}})}>초기 내용으로 복원</Button>}</Disclosure>
    </Card><KoreaSaveBar dirty={dirty} pending={isPending} updatedAt={updatedAt}/>
  </form>;
}
