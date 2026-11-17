"use client";

import { useState } from "react";

export function ProjectWorkspace({ locale, canInvite }: { locale: string; canInvite: boolean }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function invite(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage(""); setLink("");
    try {
      const response = await fetch("/api/project-workspace/invitations", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setLink(`${location.origin}/${locale}/auth/project-invite/${data.token}`);
      setMessage("7일간 유효한 1회 초대 링크입니다. 해당 고객 담당자에게 전달하세요.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "초대 생성에 실패했습니다."); }
    finally { setBusy(false); }
  }

  return (
    <section className="bg-white">
      {canInvite && (
        <div className="border-b border-line px-4 py-2 text-xs">
          <div className="flex items-center gap-3">
            <strong>프로젝트 협의</strong>
            <button className="ml-auto rounded border border-line px-3 py-1.5" onClick={() => setInviteOpen(!inviteOpen)}>고객 담당자 초대</button>
          </div>
          {inviteOpen && (
            <form onSubmit={invite} className="mt-3 flex flex-wrap items-center gap-2 pb-2">
              <input className="min-w-56 rounded border border-line p-2" type="email" required aria-label="고객 이메일" placeholder="고객 담당자 이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="rounded bg-ink px-3 py-2 text-white" disabled={busy}>{busy ? "생성 중" : "초대 링크 생성"}</button>
              {link && <input className="w-full rounded border border-line p-2" readOnly value={link} aria-label="고객 초대 링크" onFocus={(e) => e.target.select()} />}
              {message && <p className="w-full text-muted" role="status">{message}</p>}
            </form>
          )}
        </div>
      )}
      <iframe
        title="프로젝트 협의 공동 편집"
        src="/api/project-workspace/document"
        className="block w-full border-0"
        style={{ height: "calc(100dvh - 52px)", minHeight: 640 }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals allow-top-navigation-by-user-activation"
        referrerPolicy="same-origin"
      />
    </section>
  );
}
