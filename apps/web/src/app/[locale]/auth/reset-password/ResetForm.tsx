"use client";

import { useState } from "react";
import { PASSWORD_RULE, passwordError } from "@bayada/shared/password-policy";
import { btnClass, Field, inputClass } from "@/components/member/ui";

export function ResetForm({ locale, token }: { locale: string; token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const err = passwordError(password);
    if (err) return setError(err);
    if (password !== fd.get("password2")) return setError("비밀번호 확인이 일치하지 않아요.");
    setPending(true);
    setError(null);
    const res = await fetch("/api/auth/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setPending(false);
      setError(j.error ?? "바꾸지 못했어요. 다시 시도해 주세요.");
      return;
    }
    window.location.assign(`/${locale}/auth/login?reset=1`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <Field label="새 비밀번호" htmlFor="password" help={PASSWORD_RULE}>
        <input id="password" name="password" type="password" required autoComplete="new-password" className={inputClass} />
      </Field>
      <Field label="새 비밀번호 확인" htmlFor="password2">
        <input id="password2" name="password2" type="password" required autoComplete="new-password" className={inputClass} />
      </Field>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={btnClass("primary")}>
        {pending ? "바꾸는 중…" : "비밀번호 바꾸기"}
      </button>
      <p className="text-xs leading-relaxed text-[color:var(--muted)]">바꾸면 홈페이지·아카데미의 다른 기기 로그인도 모두 끊겨요.</p>
    </form>
  );
}
