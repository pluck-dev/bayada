"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  // 같은 사이트 경로만 허용 (오픈 리다이렉트 방지)
  const raw = searchParams.get("callbackUrl") ?? "";
  const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : `/${locale}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false,
      });
      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않거나, 가입 승인 대기 중인 계정이에요.");
        setIsLoading(false);
      } else {
        // 헤더(서버 렌더)까지 로그인 상태로 다시 그리기 위해 전체 이동
        window.location.href = callbackUrl;
      }
    } catch {
      setError("로그인 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
      setIsLoading(false);
    }
  };

  const inputCls =
    "h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink placeholder:text-subtle focus:border-ink focus:outline-none";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-[400px]">
        <h1 className="text-[28px] font-bold tracking-tight text-ink">로그인</h1>
        <p className="mt-2 text-[15px] text-muted">바야다 아카데미 계정으로 학습을 이어가세요.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
              이메일
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required placeholder="name@example.com" className={inputCls} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink">
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="비밀번호"
                className={`${inputCls} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-70"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            로그인
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          아직 계정이 없나요?{" "}
          <Link
            href={`/${locale}/auth/register${raw === callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-semibold text-ink hover:text-brand">
            무료 가입
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
