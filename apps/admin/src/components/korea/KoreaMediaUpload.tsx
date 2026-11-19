"use client";
import { useState } from 'react';
import { Button, FileDrop, inputClass } from '@/components/ui';
import { uploadKoreaFile } from './KoreaEditorTools';
export function KoreaMediaUpload(){
 const [url,setUrl]=useState(''),[message,setMessage]=useState(''),[pending,setPending]=useState(false);
 return <div className="my-3 space-y-3"><FileDrop title="첨부할 이미지·PDF 선택" hint="PNG·JPG·GIF·WebP·PDF, 최대 10MB" accept="image/png,image/jpeg,image/gif,image/webp,application/pdf" maxBytes={10*1024*1024} busy={pending} onFile={async file=>{setPending(true);setMessage('');try{setUrl(await uploadKoreaFile(file));setMessage('첨부 주소를 복사해 아래 항목에 넣으세요.');}catch(e){setMessage(e instanceof Error?e.message:'업로드하지 못했습니다.');}finally{setPending(false);}}}/><p role="status" className="text-xs text-muted">{message}</p>{url&&<div className="flex gap-2"><input className={inputClass} aria-label="업로드된 파일 주소" value={url} readOnly onFocus={e=>e.target.select()}/><Button size="sm" onClick={async()=>{try{await navigator.clipboard.writeText(url);setMessage('주소를 복사했습니다.');}catch{setMessage('주소를 선택해 복사해 주세요.');}}}>주소 복사</Button></div>}</div>;
}
