import { redirect } from "next/navigation";
import { enabledSocialProviders } from "@bayada/shared/social-auth";
import { auth } from "@/lib/auth";
import { safeCallback } from "@/lib/safe-callback";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "로그인 | 바야다홈헬스케어", robots: { index: false } };

const ERRORS: Record<string, string> = {
  SocialEmailInUse: "이미 이메일로 가입된 계정이에요. 이메일과 비밀번호로 로그인해 주세요.",
  SocialPending: "가입 승인을 기다리는 계정이에요. 승인 후 로그인할 수 있어요.",
  OAuthCallbackError: "간편 로그인에 실패했어요. 다시 시도해 주세요.",
  AccessDenied: "로그인할 수 없는 계정이에요.",
};

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string; error?: string; reset?: string; registered?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const callbackUrl = safeCallback(sp.callbackUrl, `/${locale}/my-page`);
  if ((await auth())?.user) redirect(callbackUrl);
  return (
    <LoginForm
      locale={locale}
      callbackUrl={callbackUrl}
      social={enabledSocialProviders()}
      initialError={sp.error ? (ERRORS[sp.error] ?? "로그인에 실패했어요. 다시 시도해 주세요.") : null}
      notice={sp.reset ? "비밀번호를 바꿨어요. 새 비밀번호로 로그인해 주세요." : sp.registered ? "가입이 끝났어요. 로그인해 주세요." : null}
    />
  );
}
