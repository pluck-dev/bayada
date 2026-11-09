"use client";

import { buttonVariants, cn, controlClass } from "@bayada/ui";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";

export default function ForgotPasswordForm() {
  const { locale } = useParams<{ locale: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.");
      } else {
        setSentTo(email);
      }
    } catch {
      setError("요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-6 lg:min-h-[560px] lg:py-10">
      <div className="w-full max-w-[400px]">
        {sentTo ? (
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
              <MailCheck className="h-6 w-6" aria-hidden />
            </span>
            <h1 className="mt-5 text-[32px] font-extrabold tracking-[-0.03em] text-ink">메일을 확인해 주세요</h1>
            {/* 가입 여부와 상관없이 같은 안내 (계정 존재 노출 방지) */}
            <p className="mt-3 text-body leading-relaxed text-muted">
              <span className="font-semibold text-ink">{sentTo}</span> 로 가입된 계정이 있다면 비밀번호 재설정 링크를
              보냈어요. 링크는 30분 동안, 한 번만 쓸 수 있어요.
            </p>
            <p className="mt-3 text-body-sm text-subtle">메일이 보이지 않으면 스팸함을 확인하거나 잠시 후 다시 요청해 주세요.</p>
            <div className="mt-8 flex gap-2">
              <Link
                href={`/${locale}/auth/login`}
                className={cn(buttonVariants({ variant: "primary", size: "lg" }), "flex-1")}
              >
                로그인으로
              </Link>
              <button
                type="button"
                onClick={() => setSentTo(null)}
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-line text-body font-semibold text-ink transition-colors hover:bg-surface"
              >
                다시 요청
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-ink">비밀번호 찾기</h1>
            <p className="mt-2 text-body text-muted">가입한 이메일을 입력하면 재설정 링크를 보내 드려요.</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && (
                <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-body-sm text-danger">
                  {error}
                </p>
              )}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-body-sm font-semibold text-ink">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  className={controlClass("md")}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={buttonVariants({ variant: "primary", size: "lg", fullWidth: true })}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                재설정 링크 받기
              </button>
            </form>
            <p className="mt-8 text-center text-body-sm text-muted">
              비밀번호가 기억났나요?{" "}
              <Link href={`/${locale}/auth/login`} className="font-semibold text-ink underline-offset-4 hover:underline">
                로그인
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
