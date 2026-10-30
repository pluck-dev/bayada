import { buttonVariants, cn } from "@bayada/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MailWarning } from "lucide-react";
import { verifyEmail } from "@bayada/services/account";

export const metadata: Metadata = { title: "이메일 인증", robots: { index: false, follow: false } };

// 링크를 여는 것 자체가 인증이다(메일 보안 스캐너가 먼저 열어도 결과가 같아 GET 에서 처리)
export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  const { token = "" } = await searchParams;
  const result = await verifyEmail(token);
  const ok = result !== "invalid";
  const title = result === "verified" ? "이메일 인증 완료" : result === "already" ? "이미 인증된 이메일이에요" : "링크를 쓸 수 없어요";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-[400px]">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full ${ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}
        >
          {ok ? <CheckCircle2 className="h-6 w-6" aria-hidden /> : <MailWarning className="h-6 w-6" aria-hidden />}
        </span>
        <h1 className="mt-5 text-[28px] font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-3 text-body leading-relaxed text-muted">
          {ok
            ? "이제 비밀번호 찾기·기관 초대·인증 갱신 안내 메일을 이 주소로 받을 수 있어요."
            : "인증 링크가 만료됐거나(24시간) 이미 사용됐어요. 마이 러닝 상단의 '인증 메일 다시 보내기'로 새 링크를 받아 주세요."}
        </p>
        <Link
          href={`/${locale}/dashboard`}
          className={cn(buttonVariants({ variant: "primary", size: "lg", fullWidth: true }), "mt-8")}
        >
          마이 러닝으로
        </Link>
      </div>
    </div>
  );
}
