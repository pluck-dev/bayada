"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button, Input, Card, CardContent } from "@bayada/ui";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: 실제 로그인 로직 구현
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--brand)]">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[color:var(--fg)]">
              BAYADA <span className="text-[color:var(--brand)]">Academy</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[color:var(--fg)]">
            {dict.auth.loginTitle}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {dict.auth.loginDescription}
          </p>
        </div>

        {/* 로그인 폼 */}
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이메일 */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]"
                >
                  {dict.auth.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="flex h-10 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] pl-10 pr-3 py-2 text-sm text-[color:var(--fg)] placeholder:text-[color:var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]"
                >
                  {dict.auth.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="비밀번호를 입력하세요"
                    className="flex h-10 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] pl-10 pr-10 py-2 text-sm text-[color:var(--fg)] placeholder:text-[color:var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 옵션 */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--brand)] focus:ring-[color:var(--ring)]"
                  />
                  <span className="text-sm text-[color:var(--muted)]">
                    로그인 상태 유지
                  </span>
                </label>
                <Link
                  href="#"
                  className="text-sm text-[color:var(--brand)] hover:underline"
                >
                  {dict.auth.forgotPassword}
                </Link>
              </div>

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? dict.common.loading : dict.auth.loginButton}
              </Button>
            </form>

            {/* 구분선 */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[color:var(--border)]" />
              <span className="text-xs text-[color:var(--muted)]">또는</span>
              <div className="h-px flex-1 bg-[color:var(--border)]" />
            </div>

            {/* 기관 로그인 */}
            <Button variant="outline" className="w-full" size="lg">
              기관 계정으로 로그인
            </Button>
          </CardContent>
        </Card>

        {/* 회원가입 안내 */}
        <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
          {dict.auth.noAccount}{" "}
          <Link
            href={`/${locale}/auth/register`}
            className="font-medium text-[color:var(--brand)] hover:underline"
          >
            {dict.common.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
