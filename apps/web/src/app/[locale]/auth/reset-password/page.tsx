import Link from "next/link";
import { isTokenUsable } from "@bayada/services/account";
import { btnClass, Notice } from "@/components/member/ui";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "새 비밀번호 | 바야다홈헬스케어", robots: { index: false } };

// 화면을 여는 것만으로는 토큰을 쓰지 않는다(메일 보안 스캐너가 먼저 열어도 링크가 살아 있게)
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
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-10">
      <h1 className="text-[26px] font-bold tracking-tight text-[color:var(--fg)]">새 비밀번호 설정</h1>
      {usable ? (
        <ResetForm locale={locale} token={token} />
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <Notice tone="red">만료됐거나 이미 사용한 링크예요. 재설정 메일을 다시 요청해 주세요.</Notice>
          <Link href={`/${locale}/auth/forgot-password`} className={btnClass("primary")}>
            재설정 메일 다시 받기
          </Link>
        </div>
      )}
    </div>
  );
}
