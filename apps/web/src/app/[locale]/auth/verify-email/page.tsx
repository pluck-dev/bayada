import Link from "next/link";
import { verifyEmail } from "@bayada/services/account";
import { btnClass, Notice } from "@/components/member/ui";

export const metadata = { title: "이메일 인증 | 바야다홈헬스케어", robots: { index: false } };

const MESSAGE = {
  verified: { tone: "green", text: "이메일 인증이 끝났어요. 이전에 이 이메일로 남긴 상담·문의도 마이페이지에서 볼 수 있어요." },
  already: { tone: "green", text: "이미 인증된 이메일이에요." },
  invalid: { tone: "red", text: "만료됐거나 올바르지 않은 링크예요. 마이페이지에서 인증 메일을 다시 받아 주세요." },
} as const;

// 메일 링크 열기 = 인증 (누가 먼저 열어도 결과가 같아 GET 에서 처리)
export default async function VerifyEmailPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string }> }) {
  const { locale } = await params;
  const { token = "" } = await searchParams;
  const result = await verifyEmail(token);
  const m = MESSAGE[result];
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-10">
      <h1 className="text-[26px] font-bold tracking-tight text-[color:var(--fg)]">이메일 인증</h1>
      <div className="mt-6 flex flex-col gap-4">
        <Notice tone={m.tone}>{m.text}</Notice>
        <Link href={`/${locale}/my-page`} className={btnClass("primary")}>
          마이페이지로
        </Link>
      </div>
    </div>
  );
}
