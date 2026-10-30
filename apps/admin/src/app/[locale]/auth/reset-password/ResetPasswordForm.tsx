"use client";

import { useState } from "react";
import Link from "next/link";
import { PASSWORD_RULE, passwordError } from "@bayada/shared/password-policy";
import { buttonClass, inputClass, Field, cx } from "@/components/ui";

export function ResetPasswordForm({ token, locale }: { token: string; locale: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirmPassword") ?? "")) return setError("비밀번호가 일치하지 않습니다.");
    const pwError = passwordError(password);
    if (pwError) return setError(pwError);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error ?? "비밀번호를 변경하지 못했습니다.");
      else setDone(true);
    } catch {
      setError("비밀번호를 변경하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div>
        <h1 className="text-[20px] font-semibold tracking-[-0.02em]">비밀번호를 변경했습니다</h1>
        <p className="mt-2 text-caption leading-relaxed text-muted">
          기존에 로그인된 모든 세션은 로그아웃됐습니다. 새 비밀번호로 다시 로그인하세요.
        </p>
        <Link href={`/${locale}/auth/login`} className={cx(buttonClass("primary"), "mt-5 h-9 w-full")}>
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-[20px] font-semibold tracking-[-0.02em]">새 비밀번호 설정</h1>
      <p className="mt-1 text-caption text-muted">{PASSWORD_RULE}</p>
      {error && (
        <div role="alert" className="mt-5 rounded-md border border-danger-line bg-danger-soft px-3 py-2 text-caption text-danger">
          {error}
        </div>
      )}
      <div className="mt-5 flex flex-col gap-4">
        <Field label="새 비밀번호" htmlFor="password">
          <input id="password" name="password" type="password" required autoComplete="new-password" className={cx(inputClass, "h-9!")} />
        </Field>
        <Field label="새 비밀번호 확인" htmlFor="confirmPassword">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className={cx(inputClass, "h-9!")}
          />
        </Field>
        <button type="submit" disabled={loading} className={cx(buttonClass("primary"), "h-9 w-full")}>
          {loading ? "변경 중…" : "비밀번호 변경"}
        </button>
      </div>
    </form>
  );
}
