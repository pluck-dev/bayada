"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Field, buttonClass, cx, inputClass } from "@/components/ui";
import { AuthError, AuthShell, AuthTitle } from "../AuthShell";

export default function AdminForgotPasswordPage() {
  const { locale = "ko" } = useParams<{ locale: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "요청을 처리하지 못했습니다.");
      } else setSentTo(email);
    } catch {
      setError("요청을 처리하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      {sentTo ? (
        <div>
          <AuthTitle title="메일을 확인하세요" />
          {/* 가입 여부와 상관없이 같은 안내 (계정 존재 노출 방지) */}
          <p className="mt-2 text-[13.5px] leading-[1.65] text-muted">
            <span className="font-medium text-ink">{sentTo}</span> 로 등록된 계정이 있다면 비밀번호 재설정 링크를 보냈습니다.
            링크는 30분 동안 유효합니다.
          </p>
          <Link href={`/${locale}/auth/login`} className={cx(buttonClass("primary", "lg"), "mt-6 w-full")}>
            로그인으로
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <AuthTitle title="비밀번호 재설정" description={<>어드민 계정 이메일로 재설정 링크를 보내 드립니다.</>} />
          {error && (
            <AuthError>{error}</AuthError>
          )}
          <div className="mt-7 flex flex-col gap-4">
            <Field label="이메일" htmlFor="email">
              <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
            </Field>
            <button type="submit" disabled={loading} className={cx(buttonClass("primary", "lg"), "mt-1 w-full")}>
              {loading ? "보내는 중…" : "재설정 링크 받기"}
            </button>
            <Link href={`/${locale}/auth/login`} className="text-center text-[13px] font-semibold text-muted transition-colors hover:text-ink">
              로그인으로 돌아가기
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
