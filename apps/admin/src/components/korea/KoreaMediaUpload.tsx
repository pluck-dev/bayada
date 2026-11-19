"use client";
import { useState } from "react";
export function KoreaMediaUpload() {
  const [url, setUrl] = useState(""), [message, setMessage] = useState(""), [pending, setPending] = useState(false);
  return <details className="my-4 rounded-xl border border-line bg-white p-4"><summary className="cursor-pointer text-sm font-bold">이미지·PDF 업로드</summary><div className="mt-3 space-y-3"><input type="file" aria-label="업로드할 이미지·PDF" accept="image/png,image/jpeg,image/gif,image/webp,application/pdf" disabled={pending} onChange={async event => {
    const file = event.target.files?.[0]; if (!file) return;
    setPending(true); setMessage("업로드 중입니다.");
    try { const data = new FormData(); data.append("file", file); const response = await fetch("/api/korea/media", { method: "POST", body: data }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setUrl(result.url); setMessage("업로드했습니다. 주소를 이미지·첨부 항목에 넣어 주세요."); } catch (error) { setMessage(error instanceof Error ? error.message : "업로드하지 못했습니다."); } finally { setPending(false); }
  }} /><p role="status" className="text-sm">{message}</p>{url && <input className="w-full rounded border border-line px-3 py-2 text-sm" aria-label="업로드된 파일 주소" value={url} readOnly onFocus={e => e.target.select()} />}</div></details>;
}
