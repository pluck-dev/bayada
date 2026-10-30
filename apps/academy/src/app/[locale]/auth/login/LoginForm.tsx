"use client";

import { buttonVariants, controlClass } from "@bayada/ui";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { SocialProviderId } from "@/lib/social-auth";

// 소셜 로그인 실패 등으로 돌아왔을 때 (?error=)
const ERROR_MESSAGES: Record<string, string> = {
  SocialPending: "가입 승인 대기 중이거나 사용할 수 없는 계정이에요. 운영팀에 문의해 주세요.",
  SocialEmailInUse: "같은 이메일로 가입된 계정이 있어요. 이메일과 비밀번호로 로그인해 주세요.",
  OAuthAccountNotLinked: "같은 이메일로 가입된 계정이 있어요. 이메일과 비밀번호로 로그인해 주세요.",
  AccessDenied: "로그인할 수 없는 계정이에요.",
};

function Form({ social }: { social: SocialProviderId[] }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const queryError = searchParams.get("error");
  const [error, setError] = useState(
    queryError ? (ERROR_MESSAGES[queryError] ?? "로그인 중 문제가 생겼어요. 다시 시도해 주세요.") : ""
  );
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
        setError(
          result.code === "rate_limited"
            ? "로그인에 여러 번 실패해 잠시 막아 두었어요. 15분 뒤에 다시 시도하거나 비밀번호를 재설정해 주세요."
            : "이메일 또는 비밀번호가 올바르지 않거나, 가입 승인 대기 중인 계정이에요."
        );
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

  const inputCls = controlClass("md");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-[400px]">
        <h1 className="text-[28px] font-bold tracking-tight text-ink">로그인</h1>
        <p className="mt-2 text-body text-muted">바야다 아카데미 계정으로 학습을 이어가세요.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-body-sm text-danger">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="mb-2 block text-body-sm font-semibold text-ink-soft">
              이메일
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required placeholder="name@example.com" className={inputCls} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-body-sm font-semibold text-ink">
                비밀번호
              </label>
              <Link href={`/${locale}/auth/forgot-password`} className="text-caption text-muted hover:text-ink">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
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
            className={buttonVariants({ variant: "primary", size: "lg", fullWidth: true })}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            로그인
          </button>
        </form>

        {social.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-3 text-caption text-subtle">
              <span className="h-px flex-1 bg-line" />
              또는
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="mt-4 space-y-2.5">
              {social.map((id) => (
                <SocialButton key={id} id={id} callbackUrl={callbackUrl} locale={locale} />
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-body-sm text-muted">
          아직 계정이 없나요?{" "}
          <Link
            href={`/${locale}/auth/register${raw === callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-semibold text-ink underline-offset-4 hover:underline">
            무료 가입
          </Link>
        </p>
      </div>
    </div>
  );
}

function SocialButton({ id, callbackUrl, locale }: { id: SocialProviderId; callbackUrl: string; locale: string }) {
  const [busy, setBusy] = useState(false);
  const start = async () => {
    setBusy(true);
    const { signIn } = await import("next-auth/react");
    // 첫 소셜 로그인이면 직군을 한 번 묻고(이미 있으면 바로 통과) 원래 가려던 곳으로
    await signIn(id, { redirectTo: `/${locale}/auth/onboarding?callbackUrl=${encodeURIComponent(callbackUrl)}` });
  };
  const kakao = id === "kakao";
  return (
    <button
      type="button"
      onClick={start}
      disabled={busy}
      className={
        kakao
          ? "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-body font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:opacity-70"
          : "flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-canvas text-body font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-70"
      }
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : kakao ? <KakaoIcon /> : <GoogleIcon />}
      {kakao ? "카카오로 계속하기" : "Google로 계속하기"}
    </button>
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="currentColor"
        d="M12 3C6.48 3 2 6.48 2 10.77c0 2.77 1.86 5.2 4.66 6.57-.15.53-.98 3.4-1.01 3.62 0 0-.02.17.09.24.11.06.24.01.24.01.31-.04 3.64-2.38 4.21-2.79.59.08 1.19.13 1.81.13 5.52 0 10-3.48 10-7.78C22 6.48 17.52 3 12 3z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export default function LoginForm({ social }: { social: SocialProviderId[] }) {
  return (
    <Suspense>
      <Form social={social} />
    </Suspense>
  );
}
