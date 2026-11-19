"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BOARDS, type BoardPost } from "@bayada/korea";
import { saveKoreaPost, deleteKoreaPost } from "@/lib/actions/korea";
import { Button, Card, Disclosure, Field, Select, Switch, inputClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";
import { KoreaAssetInput, KoreaSaveBar, useKoreaDraft } from "./KoreaEditorTools";
import { KoreaMediaUpload } from "./KoreaMediaUpload";
export function KoreaPostEditor({ initial, updatedAt, publicOrigin }: { initial: BoardPost; updatedAt: string | null; publicOrigin: string }) {
  const router = useRouter(); const pathname = usePathname();
  const [data, setData] = useState(initial); const { run, isPending } = useAction();
  const dirty=Number(JSON.stringify(data)!==JSON.stringify(initial)); useKoreaDraft(!!dirty);
  const change = (key: keyof BoardPost, value: unknown) => setData({ ...data, [key]: value });
  return <Card title={updatedAt ? "게시글 편집" : "새 게시글"}><form className="space-y-4" onSubmit={e => { e.preventDefault(); run(() => saveKoreaPost(data, updatedAt), updatedAt ? undefined : { refresh: false, onSuccess: () => router.replace(`${pathname}?board=${data.board}&id=${data.id}`) }); }}>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="게시판"><Select aria-label="게시판" disabled={!!updatedAt} value={data.board} onChange={value=>change("board",value)} options={Object.entries(BOARDS).map(([value,b])=>({value,label:b.title}))}/></Field><Field label="제목"><input className={inputClass} aria-label="제목" value={data.title} onChange={e => change("title", e.target.value)} /></Field><Field label="작성자"><input className={inputClass} aria-label="작성자" value={data.author} onChange={e => change("author", e.target.value)} /></Field><Field label="날짜"><input type="date" className={inputClass} aria-label="날짜" value={data.date} onChange={e => change("date", e.target.value)} /></Field></div>
    {data.board === "bayadab_05" && <Field label="FAQ 노출 순서"><input type="number" min={0} max={1000} aria-label="FAQ 노출 순서" className={inputClass} value={data.sortOrder ?? 1000} onChange={e => change("sortOrder", Number(e.target.value))} /></Field>}
    <Field label="본문"><KoreaRichText value={data.content} onChange={value=>change("content",value)} /></Field>
    <Field label="대표 이미지"><KoreaAssetInput value={data.image} onChange={value=>change("image",value)} label="대표 이미지" publicOrigin={publicOrigin}/></Field>
    <div className="flex flex-wrap gap-5"><Switch label="공개" checked={data.published} onChange={value=>change("published",value)}/><Switch label="공지 고정" checked={data.notice} onChange={value=>change("notice",value)}/></div>
    <Disclosure summary={`첨부 파일 ${data.attachments.length}개`}><KoreaMediaUpload />{data.attachments.map((a, i) => <div key={i} className="my-3 grid gap-2"><input aria-label="첨부 이름" className={inputClass} value={a.label} onChange={e => change("attachments", data.attachments.map((b, n) => n === i ? { ...b, label: e.target.value } : b))} /><input aria-label="첨부 주소" className={inputClass} value={a.url} onChange={e => change("attachments", data.attachments.map((b, n) => n === i ? { ...b, url: e.target.value } : b))} /><Button type="button" onClick={() => change("attachments", data.attachments.filter((_, n) => n !== i))}>첨부 제거</Button></div>)}<Button type="button" onClick={() => change("attachments", [...data.attachments, { label: "", url: "" }])}>첨부 추가</Button></Disclosure>
    <KoreaSaveBar dirty={dirty} pending={isPending} updatedAt={updatedAt} label="게시글 저장">{updatedAt && <Button type="button" disabled={isPending} onClick={() => run(() => deleteKoreaPost(data.board, data.id, updatedAt), { refresh: false, onSuccess: () => router.replace(`${pathname}?board=${data.board}`), confirm: { title: "게시글을 삭제할까요?", body: "삭제 이력은 남고 홈페이지에서 제거됩니다." } })}>삭제</Button>}</KoreaSaveBar>
  </form></Card>;
}

function KoreaRichText({value,onChange}:{value:string;onChange:(value:string)=>void}){
 const editor=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(editor.current&&editor.current.innerHTML!==value)editor.current.innerHTML=value;},[value]);
 return <div className="overflow-hidden rounded-xl border border-line"><div className="flex flex-wrap gap-1 border-b border-line bg-wash p-2" role="toolbar" aria-label="본문 서식">{[['bold','굵게'],['italic','기울임'],['insertUnorderedList','목록'],['removeFormat','서식 지우기']].map(([command,label])=><Button key={command} size="sm" variant="ghost" onMouseDown={e=>e.preventDefault()} onClick={()=>{editor.current?.focus();document.execCommand(command);onChange(editor.current?.innerHTML||'');}}>{label}</Button>)}</div><div ref={editor} role="textbox" aria-label="본문" aria-multiline="true" contentEditable suppressContentEditableWarning className="min-h-64 max-h-[60vh] overflow-auto break-words p-4 text-sm leading-7 outline-none focus:ring-2 focus:ring-inset focus:ring-brand/30 [&_img]:max-w-full [&_iframe]:max-w-full [&_iframe]:pointer-events-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6" style={{contain:'layout paint'}} onClick={e=>{if(e.target instanceof Element && e.target.closest("a"))e.preventDefault();}} onInput={e=>onChange(e.currentTarget.innerHTML)} onDrop={e=>e.preventDefault()} onPaste={e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));onChange(e.currentTarget.innerHTML);}}/>
 </div>;
}
