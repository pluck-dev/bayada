"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button, Checkbox, Field, Input, Notice, Select, controlClass } from "@bayada/ui";
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
        body: JSON.stringify({ name, email, password, phone, jobRole, locale }),
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
    <div className="flex items-center justify-center py-6 lg:min-h-[560px] lg:py-10">
      <div className="w-full max-w-auth">
        <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-ink">{dict.auth.registerTitle}</h1>
        <p className="mt-2 text-body text-muted">{dict.auth.registerDescription}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <Notice tone="danger" role="alert">
              {error}
            </Notice>
          )}
          <Input id="name" name="name" type="text" required autoComplete="name" placeholder="홍길동" label={dict.auth.name} />
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@example.com"
            label={dict.auth.email}
          />
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="010-0000-0000" label={dict.auth.phone} />
          {/* 직군 — 맞춤 추천에 사용 */}
          <Select
            id="jobRole"
            name="jobRole"
            required
            defaultValue=""
            label="직군"
            help="직군에 맞는 프로그램을 추천해 드려요."
          >
            <option value="" disabled>
              하시는 일을 선택해 주세요
            </option>
            {JOB_ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Field label={dict.auth.password} required htmlFor="password" help={PASSWORD_RULE}>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                aria-describedby="password-help"
                className={controlClass("md", "pr-12")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label={dict.auth.passwordConfirm} required htmlFor="confirmPassword">
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="비밀번호를 다시 입력하세요"
                className={controlClass("md", "pr-12")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          {/* 약관 동의 */}
          <div className="space-y-3 border-t border-line pt-5">
            <Checkbox
              required
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              label={
                <>
                  <span className="font-semibold text-ink">[필수]</span>{" "}
                  <a href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    이용약관
                  </a>
                  에 동의합니다
                </>
              }
            />
            <Checkbox
              required
              checked={agreedPrivacy}
              onChange={(e) => setAgreedPrivacy(e.target.checked)}
              label={
                <>
                  <span className="font-semibold text-ink">[필수]</span>{" "}
                  <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    개인정보 수집 및 이용
                  </a>
                  에 동의합니다
                </>
              }
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={!agreedTerms || !agreedPrivacy}
          >
            {isLoading ? dict.common.loading : dict.auth.registerButton}
          </Button>
        </form>

        {/* 로그인 안내 */}
        <p className="mt-8 text-center text-body-sm text-muted">
          {dict.auth.hasAccount}{" "}
          <Link
            href={`/${locale}/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-semibold text-ink underline-offset-4 hover:underline"
          >
            {dict.common.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
