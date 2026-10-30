import { buttonVariants, cn } from "@bayada/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { isTokenUsable } from "@bayada/services/account";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = { title: "비밀번호 재설정", robots: { index: false, follow: false } };

// 토큰은 여기서 소비하지 않는다(메일 스캐너가 링크를 먼저 열어도 무효가 되지 않게). 제출(POST) 때만 소비.
export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  const { token = "" } = await searchParams;
  const usable = await isTokenUsable(token, "PASSWORD_RESET");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-[400px]">
        {usable ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-ink">링크를 쓸 수 없어요</h1>
            <p className="mt-3 text-body leading-relaxed text-muted">
              재설정 링크가 만료됐거나(30분) 이미 사용됐어요. 재설정 메일을 다시 요청해 주세요.
            </p>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className={cn(buttonVariants({ variant: "primary", size: "lg", fullWidth: true }), "mt-8")}
            >
              재설정 메일 다시 받기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
