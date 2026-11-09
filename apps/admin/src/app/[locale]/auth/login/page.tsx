"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Field, inputClass } from "@/components/ui";
import { AuthError, AuthShell, AuthTitle } from "../AuthShell";

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
    <AuthShell>
      <form onSubmit={handleSubmit}>
        <AuthTitle title="관리자 로그인" description="어드민 계정 이메일과 비밀번호를 입력하세요." />

        {error && <AuthError>{error}</AuthError>}

        <div className="mt-7 flex flex-col gap-4">
          <Field label="이메일" htmlFor="email">
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="name@bayadakorea.com" className={inputClass} />
          </Field>
          <Field label="비밀번호" htmlFor="password">
            <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
          </Field>
          <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-1 w-full">
            {loading ? "로그인 중…" : "로그인"}
          </Button>
          <Link
            href={`/${locale ?? "ko"}/auth/forgot-password`}
            className="text-center text-[13px] font-semibold text-muted transition-colors hover:text-ink"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
