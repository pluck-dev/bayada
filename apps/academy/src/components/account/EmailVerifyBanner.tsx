import { prisma } from "@bayada/db";
import { isPlaceholderEmail } from "@bayada/services/account";
import { ResendVerifyButton } from "./ResendVerifyButton";

/**
 * 이메일 인증 안내 (선택 — 로그인·수강을 막지 않는다).
 * 대상: 외부 자가 가입 학습자만 = 미인증 && WP 이관 회원 아님 && 기관 소속 아님 && 자리표시 이메일(소셜) 아님.
 * 이관 회원·기관 계정은 이메일 인증 기록이 원래 없어서 띄우면 전원에게 뜬다.
 */
export async function EmailVerifyBanner({ userId, locale }: { userId: string; locale: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true, emailVerifiedAt: true, legacyWpId: true, organizationId: true },
  });
  if (!user || user.emailVerifiedAt || user.legacyWpId !== null || user.organizationId || user.role !== "STUDENT") return null;
  if (isPlaceholderEmail(user.email)) return null;
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">이메일 인증을 완료해 주세요</p>
        <p className="mt-0.5 text-[13px] text-muted">
          <span className="font-medium text-ink-soft">{user.email}</span> 로 보낸 링크를 누르면 끝나요. 비밀번호 찾기·기관 초대
          메일을 놓치지 않게 도와줘요.
        </p>
      </div>
      <ResendVerifyButton locale={locale} />
    </div>
  );
}
