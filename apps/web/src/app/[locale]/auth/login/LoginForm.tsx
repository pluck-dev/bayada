"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { inputClass, btnClass, Field, Notice } from "@/components/member/ui";

type Social = "kakao" | "google";

export function LoginForm({
  locale,
  callbackUrl,
  social,
  initialError,
  notice,
}: {
  locale: string;
  callbackUrl: string;
  social: Social[];
  initialError: string | null;
  notice: string | null;
}) {
  const [error, setError] = useState<string | null>(initialError);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const res = await signIn("credentials", {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      redirect: false,
    });
    if (!res || res.error) {
      setPending(false);
      setError(
        res?.code === "rate_limited"
          ? "로그인 시도가 너무 많아요. 15분 뒤 다시 시도하거나 비밀번호를 재설정해 주세요."
          : "이메일 또는 비밀번호가 맞지 않아요.",
      );
      return;
    }
    // 헤더 등 클라이언트 세션까지 새로 읽도록 전체 이동
    window.location.assign(callbackUrl);
  }

  const reg = `/${locale}/auth/register${callbackUrl !== `/${locale}/my-page` ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-10">
      <p className="text-sm font-semibold text-[#ce0e2d]">BAYADA 회원</p>
      <h1 className="mt-1 text-[26px] font-bold tracking-tight text-[color:var(--fg)]">로그인</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--muted)]">
        바야다 아카데미 계정으로도 그대로 로그인할 수 있어요.
      </p>

      {notice && (
        <div className="mt-6">
          <Notice tone="green">{notice}</Notice>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <Field label="이메일" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} placeholder="name@example.com" />
        </Field>
        <Field label="비밀번호" htmlFor="password">
          <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className={btnClass("primary")}>
          {pending ? "로그인 중…" : "로그인"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link href={`/${locale}/auth/forgot-password`} className="text-[color:var(--muted)] hover:text-[color:var(--fg)]">
          비밀번호를 잊으셨나요?
        </Link>
        <Link href={reg} className="font-semibold text-[#ce0e2d] hover:underline">
          회원가입
        </Link>
      </div>

      {social.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            간편 로그인
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="flex flex-col gap-2">
            {social.includes("kakao") && (
              <button
                type="button"
                onClick={() => signIn("kakao", { callbackUrl })}
                className="h-12 rounded-xl bg-[#FEE500] text-[15px] font-semibold text-[#191919] transition-opacity hover:opacity-90"
              >
                카카오로 계속하기
              </button>
            )}
            {social.includes("google") && (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl })}
                className="h-12 rounded-xl border border-[color:var(--border)] bg-white text-[15px] font-semibold text-[color:var(--fg)] transition-colors hover:bg-gray-50"
              >
                Google로 계속하기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
