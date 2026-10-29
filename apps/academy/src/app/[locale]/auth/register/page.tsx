"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  CheckCircle,
} from "lucide-react";
import { Button, Input, Card, CardContent } from "@bayada/ui";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams, useRouter } from "next/navigation";
import { JOB_ROLE_OPTIONS, PASSWORD_RULE, passwordError } from "@/lib/signup-policy";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const { status } = useSession();
  // 초대 수락 등에서 넘어온 경우 가입 후 돌아갈 곳 (같은 사이트 경로만 허용)
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("callbackUrl") ?? "";
    setCallbackUrl(raw.startsWith("/") && !raw.startsWith("//") ? raw : null);
  }, []);
  const afterSignup = callbackUrl ?? `/${locale}`;

  // 이미 로그인한 사람은 가입 화면 대신 홈(또는 돌아갈 곳)으로
  useEffect(() => {
    if (status === "authenticated") router.replace(afterSignup);
  }, [status, afterSignup, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || undefined;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const jobRole = formData.get("jobRole") as string;

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    const pwError = passwordError(password);
    if (pwError) {
      setError(pwError);
      setIsLoading(false);
      return;
    }
    if (!jobRole) {
      setError("직군을 선택해 주세요.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. 회원가입 API 호출
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, jobRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "회원가입에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      // 2. 가입 성공 → 자동 로그인
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // 가입은 됐지만 자동 로그인 실패 → 로그인 페이지로
        window.location.href = `/${locale}/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`;
      } else {
        window.location.href = afterSignup;
      }
    } catch {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-[color:var(--brand)]">BAYADA</span>
            <span className="text-xl font-semibold text-[color:var(--fg)]">Academy</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[color:var(--fg)]">
            {dict.auth.registerTitle}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {dict.auth.registerDescription}
          </p>
        </div>

        {/* 회원가입 폼 */}
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {/* 이름 */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]"
                >
                  {dict.auth.name} <span className="text-[color:var(--error)]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="홍길동"
                    className="flex h-10 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] pl-10 pr-3 py-2 text-sm text-[color:var(--fg)] placeholder:text-[color:var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                  />
                </div>
              </div>

              {/* 이메일 */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]"
                >
                  {dict.auth.email} <span className="text-[color:var(--error)]">*</span>
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

              {/* 연락처 */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]"
                >
                  {dict.auth.phone}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="010-0000-0000"
                    className="flex h-10 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] pl-10 pr-3 py-2 text-sm text-[color:var(--fg)] placeholder:text-[color:var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                  />
                </div>
              </div>

              {/* 직군 — 맞춤 추천에 사용 */}
              <div>
                <label
                  htmlFor="jobRole"
                  className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]"
                >
                  직군 <span className="text-[color:var(--error)]">*</span>
                </label>
                <select
                  id="jobRole"
                  name="jobRole"
                  required
                  defaultValue=""
                  className="flex h-10 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 text-sm text-[color:var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                >
                  <option value="" disabled>
                    하시는 일을 선택해 주세요
                  </option>
                  {JOB_ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 비밀번호 */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]"
                >
                  {dict.auth.password} <span className="text-[color:var(--error)]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={PASSWORD_RULE}
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

              {/* 비밀번호 확인 */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]"
                >
                  {dict.auth.passwordConfirm}{" "}
                  <span className="text-[color:var(--error)]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="비밀번호를 다시 입력하세요"
                    className="flex h-10 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] pl-10 pr-10 py-2 text-sm text-[color:var(--fg)] placeholder:text-[color:var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 약관 동의 */}
              <div className="space-y-2 rounded-lg bg-[color:var(--surface)] p-4">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    required
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--brand)] focus:ring-[color:var(--ring)]"
                  />
                  <span className="text-sm text-[color:var(--fg)]">
                    <span className="text-[color:var(--error)]">[필수]</span>{" "}
                    <a
                      href={`/${locale}/terms`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline underline-offset-2 hover:text-[color:var(--brand)]"
                    >
                      이용약관
                    </a>
                    에 동의합니다
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    required
                    checked={agreedPrivacy}
                    onChange={(e) => setAgreedPrivacy(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--brand)] focus:ring-[color:var(--ring)]"
                  />
                  <span className="text-sm text-[color:var(--fg)]">
                    <span className="text-[color:var(--error)]">[필수]</span>{" "}
                    <a
                      href={`/${locale}/privacy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline underline-offset-2 hover:text-[color:var(--brand)]"
                    >
                      개인정보 수집 및 이용
                    </a>
                    에 동의합니다
                  </span>
                </label>
              </div>

              {/* 회원가입 버튼 */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || !agreedTerms || !agreedPrivacy}
              >
                {isLoading ? dict.common.loading : dict.auth.registerButton}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 로그인 안내 */}
        <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
          {dict.auth.hasAccount}{" "}
          <Link
            href={`/${locale}/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-medium text-[color:var(--brand)] hover:underline"
          >
            {dict.common.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
