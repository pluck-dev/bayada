"use client";

import { use, useState } from "react";
import Link from "next/link";
import { btnClass, Field, inputClass, Notice } from "@/components/member/ui";

export default function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    const res = await fetch("/api/auth/password/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });
    setPending(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "잠시 후 다시 시도해 주세요.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-10">
      <h1 className="text-[26px] font-bold tracking-tight text-[color:var(--fg)]">비밀번호 재설정</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--muted)]">가입한 이메일로 재설정 링크를 보내 드려요. 링크는 30분 동안 쓸 수 있어요.</p>
      {sent ? (
        <div className="mt-6 flex flex-col gap-4">
          <Notice tone="green">가입된 이메일이면 재설정 메일을 보냈어요. 메일함(스팸함 포함)을 확인해 주세요.</Notice>
          <Link href={`/${locale}/auth/login`} className={btnClass("secondary")}>
            로그인으로
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Field label="이메일" htmlFor="email">
            <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
          </Field>
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={pending} className={btnClass("primary")}>
            {pending ? "보내는 중…" : "재설정 메일 받기"}
          </button>
          <Link href={`/${locale}/auth/login`} className="text-center text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)]">
            로그인으로 돌아가기
          </Link>
        </form>
      )}
    </div>
  );
}
