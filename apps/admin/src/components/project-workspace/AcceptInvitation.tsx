"use client";

import { useState } from "react";
import Link from "next/link";

export function AcceptInvitation({ token, locale }: { token: string; locale: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/project-workspace/invitations/${token}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), name: form.get("name"), password: form.get("password") }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setComplete(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : "초대 수락에 실패했습니다."); }
    finally { setBusy(false); }
  }

  if (complete) return <div className="space-y-5"><p>프로젝트 협의 권한이 연결됐습니다.</p><Link className="block rounded bg-ink p-3 text-center text-white" href={`/${locale}/auth/login`}>로그인하고 협의 참여</Link></div>;
  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted">초대받은 이메일로 참여합니다. 기존 계정은 기존 비밀번호를 입력하세요.</p>
      <label className="block text-sm">이름<input className="mt-1 block w-full rounded border border-line p-3" name="name" required maxLength={100} autoComplete="name" /></label>
      <label className="block text-sm">초대 이메일<input className="mt-1 block w-full rounded border border-line p-3" name="email" type="email" required autoComplete="email" /></label>
      <label className="block text-sm">비밀번호<input className="mt-1 block w-full rounded border border-line p-3" name="password" type="password" required maxLength={200} autoComplete="current-password" /></label>
      <p className="text-xs text-muted">새 계정은 영문과 숫자를 포함해 8자 이상 입력하세요.</p>
      {message && <p className="text-sm text-red-700" role="alert">{message}</p>}
      <button className="w-full rounded bg-ink p-3 text-white" disabled={busy}>{busy ? "연결 중" : "초대 수락"}</button>
    </form>
  );
}
