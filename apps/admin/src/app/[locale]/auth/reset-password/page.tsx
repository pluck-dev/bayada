import Link from "next/link";
import { isTokenUsable } from "@bayada/services/account";
import { buttonClass, cx } from "@/components/ui";
import { AuthShell } from "../AuthShell";
import { ResetPasswordForm } from "./ResetPasswordForm";

// 토큰은 제출(POST) 때만 소비한다 — 메일 보안 스캐너가 링크를 먼저 열어도 무효가 되지 않게
export default async function AdminResetPasswordPage({
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
    <AuthShell>
      {usable ? (
        <ResetPasswordForm token={token} locale={locale} />
      ) : (
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em]">링크를 쓸 수 없습니다</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">재설정 링크가 만료됐거나(30분) 이미 사용됐습니다.</p>
          <Link href={`/${locale}/auth/forgot-password`} className={cx(buttonClass("primary"), "mt-5 h-9 w-full")}>
            재설정 메일 다시 받기
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
