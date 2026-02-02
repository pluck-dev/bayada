"use client";

import { useState } from "react";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@bayada/ui";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--surface)] p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ce0e2d]">
            <span className="text-xl font-bold text-white">B</span>
          </div>
          <h1 className="text-2xl font-bold text-[color:var(--fg)]">
            BAYADA Admin
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            관리자 계정으로 로그인해 주세요.
          </p>
        </div>

        {/* 로그인 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-[color:var(--error-bg)] px-4 py-3 text-sm text-[color:var(--error)]">
                  {error}
                </div>
              )}

              <Input
                id="email"
                name="email"
                type="email"
                label="이메일"
                placeholder="admin@bayada.co.kr"
                required
                autoComplete="email"
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="비밀번호"
                placeholder="비밀번호를 입력하세요"
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "로그인 중..." : "로그인"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-[color:var(--muted)]">
                관리자 권한이 있는 계정만 접근할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 푸터 */}
        <p className="mt-6 text-center text-xs text-[color:var(--muted)]">
          &copy; 2025 BAYADA. All rights reserved.
        </p>
      </div>
    </div>
  );
}
