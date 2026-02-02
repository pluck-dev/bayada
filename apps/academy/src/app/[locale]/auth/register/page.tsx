"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
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
import { useParams } from "next/navigation";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: 실제 회원가입 로직 구현
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
                    placeholder="8자 이상, 영문+숫자 조합"
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
                    이용약관에 동의합니다
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
                    개인정보 수집 및 이용에 동의합니다
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
            href={`/${locale}/auth/login`}
            className="font-medium text-[color:var(--brand)] hover:underline"
          >
            {dict.common.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
