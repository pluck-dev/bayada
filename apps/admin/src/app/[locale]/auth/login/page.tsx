"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { buttonClass, inputClass, Field, cx } from "@/components/ui";

export default function AdminLoginPage() {
  const { locale } = useParams<{ locale: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        redirect: false,
      });
      if (result?.error) {
        // signIn 콜백 거부(AccessDenied) = 어드민 역할 아님
        setError(
          result.error === "AccessDenied"
            ? "어드민 콘솔 접근 권한이 없는 계정입니다."
            : result.code === "rate_limited"
              ? "로그인 실패가 반복되어 15분간 로그인을 막았습니다. 잠시 후 다시 시도하거나 비밀번호를 재설정하세요."
              : "이메일 또는 비밀번호가 올바르지 않거나 승인되지 않은 계정입니다.",
        );
        setLoading(false);
      } else {
        window.location.href = `/${locale ?? "ko"}`;
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden w-[420px] shrink-0 flex-col justify-between bg-side p-10 text-zinc-400 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-sm font-bold text-white">B</span>
          <span className="text-[14px] font-semibold text-white">Bayada Academy</span>
        </div>
        <div>
          <p className="text-[22px] font-semibold leading-snug tracking-[-0.02em] text-white">
            프로그램 등록부터 승인·게시까지,
            <br />
            아카데미 운영 콘솔
          </p>
          <p className="mt-3 text-[13px] leading-relaxed">
            Super Admin · 콘텐츠 운영자 · 임상 리뷰어 계정으로 로그인합니다.
          </p>
        </div>
        <p className="text-[12px] text-zinc-600">&copy; BAYADA Home Health Care</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-[340px]" noValidate={false}>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em]">로그인</h1>
          <p className="mt-1 text-[13px] text-muted">어드민 계정 이메일과 비밀번호를 입력하세요.</p>

          {error && (
            <div role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-800">
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-4">
            <Field label="이메일" htmlFor="email">
              <input id="email" name="email" type="email" required autoComplete="email" className={cx(inputClass, "h-9!")} />
            </Field>
            <Field label="비밀번호" htmlFor="password">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className={cx(inputClass, "h-9!")}
              />
            </Field>
            <button type="submit" disabled={loading} className={cx(buttonClass("primary"), "h-9 w-full")}>
              {loading ? "로그인 중…" : "로그인"}
            </button>
            <Link href={`/${locale ?? "ko"}/auth/forgot-password`} className="text-center text-[12.5px] text-muted hover:text-fg">
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
