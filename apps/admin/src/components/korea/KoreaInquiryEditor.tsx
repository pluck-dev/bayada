"use client";
import { useEffect, useState } from "react";
import { processKoreaInquiry } from "@/lib/actions/korea";
import { Button, Disclosure, Select, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";
import { KoreaSaveBar, useKoreaDraft } from './KoreaEditorTools';
export function KoreaInquiryEditor({ slug, status, updatedAt, onDirtyChange }: { slug: string; status: string; updatedAt: string; onDirtyChange?: (dirty:boolean)=>void }) {
 const[state,setState]=useState(status),[note,setNote]=useState('');const{run,isPending}=useAction();const dirty=Number(state!==status)+Number(!!note.trim());useKoreaDraft(dirty>0);
 useEffect(()=>onDirtyChange?.(dirty>0),[dirty,onDirtyChange]);
 return <form onSubmit={e=>{e.preventDefault();run(()=>processKoreaInquiry(slug,state,note,updatedAt));}}><div className="mb-4 max-w-56"><label className="mb-2 block text-sm font-bold">처리 상태</label><Select aria-label="상담 처리 상태" value={state} onChange={setState} options={[{value:'NEW',label:'신규'},{value:'IN_PROGRESS',label:'처리 중'},{value:'DONE',label:'완료'}]}/></div><label htmlFor="inquiry-note" className="mb-2 block text-sm font-bold">처리 메모</label><textarea id="inquiry-note" rows={3} className={textareaClass} value={note} onChange={e=>setNote(e.target.value)} placeholder="연락한 내용이나 다음 조치를 남겨 주세요." aria-label="처리 메모"/><KoreaSaveBar dirty={dirty} pending={isPending} updatedAt={updatedAt} label="처리 저장"/><Disclosure summary="개인정보 관리" className="mt-5 border-t border-line pt-3"><p className="mb-3 text-xs text-muted">삭제하면 개인정보와 상담 내용이 제거됩니다. 삭제 행위에 대한 이력은 보존됩니다.</p><Button variant="danger" size="sm" disabled={isPending} onClick={()=>run(()=>processKoreaInquiry(slug,state,'',updatedAt,true),{confirm:{title:'상담을 삭제할까요?',body:'개인정보와 상담 내용이 삭제됩니다. 삭제 행위의 이력만 남습니다.',danger:true}})}>개인정보·상담 삭제</Button></Disclosure></form>;
}
