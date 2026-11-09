import { redirect } from "next/navigation";
import { getMember } from "@/lib/member/session";
import { OnboardingForm } from "./OnboardingForm";

// 아카데미·간편 로그인으로 가입해 홈페이지 회원 유형이 아직 없는 계정 — 한 번만 묻는다
export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await getMember();
  if (!m) redirect(`/${locale}/auth/login`);
  if (m.webMemberProfile) redirect(`/${locale}/my-page`);
  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-10">
      <p className="text-sm font-semibold text-[#ce0e2d]">처음 오셨네요</p>
      <h1 className="mt-1 text-[26px] font-bold tracking-tight text-[color:var(--fg)]">어떤 회원으로 이용하시나요?</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--muted)]">
        바야다 아카데미 계정 그대로 홈페이지 마이페이지를 쓸 수 있어요. 회원 유형에 맞춰 메뉴를 준비해 드려요.
      </p>
      <OnboardingForm hasPhone={!!m.phone} />
    </div>
  );
}
