"use client";
import { useState } from "react";
import { processKoreaInquiry } from "@/lib/actions/korea";
import { Button, inputClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";
export function KoreaInquiryEditor({ slug, status, updatedAt }: { slug: string; status: string; updatedAt: string }) {
  const [state, setState] = useState(status), [note, setNote] = useState(""); const { run, isPending } = useAction();
  return <form className="mt-4 grid gap-3" onSubmit={e => { e.preventDefault(); run(() => processKoreaInquiry(slug, state, note, updatedAt)); }}><select aria-label="상담 처리 상태" className={inputClass} value={state} onChange={e => setState(e.target.value)}><option value="NEW">신규</option><option value="IN_PROGRESS">처리 중</option><option value="DONE">완료</option></select><textarea className={textareaClass} value={note} onChange={e => setNote(e.target.value)} placeholder="처리 메모" aria-label="처리 메모" /><div className="flex gap-2"><Button type="submit" variant="primary" disabled={isPending}>처리 저장</Button><Button type="button" disabled={isPending} onClick={() => run(() => processKoreaInquiry(slug, state, "", updatedAt, true), { confirm: { title: "상담을 삭제할까요?", body: "개인정보와 상담 내용이 삭제됩니다. 삭제 행위에 대한 이력만 남습니다." } })}>개인정보·상담 삭제</Button></div></form>;
}
