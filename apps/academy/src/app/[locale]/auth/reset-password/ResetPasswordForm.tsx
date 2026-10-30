"use client";

import { buttonVariants, cn, controlClass } from "@bayada/ui";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { PASSWORD_RULE, passwordError } from "@bayada/shared/password-policy";

const inputCls = controlClass("md");

export default function ResetPasswordForm({ token }: { token: string }) {
  const { locale } = useParams<{ locale: string }>();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirmPassword") ?? "")) return setError("비밀번호가 일치하지 않아요.");
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
      if (!res.ok) setError(data.error || "비밀번호를 바꾸지 못했어요.");
      else setDone(true);
    } catch {
      setError("비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-soft text-success">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-5 text-[28px] font-bold tracking-tight text-ink">비밀번호를 바꿨어요</h1>
        <p className="mt-3 text-body leading-relaxed text-muted">
          안전을 위해 다른 기기에서 로그인된 세션은 모두 로그아웃됐어요. 새 비밀번호로 다시 로그인해 주세요.
        </p>
        <Link
          href={`/${locale}/auth/login`}
          className={cn(buttonVariants({ variant: "primary", size: "lg", fullWidth: true }), "mt-8")}
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-[28px] font-bold tracking-tight text-ink">새 비밀번호 설정</h1>
      <p className="mt-2 text-body text-muted">{PASSWORD_RULE}으로 입력해 주세요.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-body-sm text-danger">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="password" className="mb-2 block text-body-sm font-semibold text-ink-soft">
            새 비밀번호
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder={PASSWORD_RULE}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-body-sm font-semibold text-ink-soft">
            새 비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="한 번 더 입력"
            className={inputCls}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={buttonVariants({ variant: "primary", size: "lg", fullWidth: true })}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          비밀번호 변경
        </button>
      </form>
    </>
  );
}
