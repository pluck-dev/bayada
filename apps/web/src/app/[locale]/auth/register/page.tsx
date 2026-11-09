import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { safeCallback } from "@/lib/safe-callback";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "회원가입 | 바야다홈헬스케어", robots: { index: false } };

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string; type?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const callbackUrl = safeCallback(sp.callbackUrl, `/${locale}/my-page`);
  if ((await auth())?.user) redirect(callbackUrl);
  return <RegisterForm locale={locale} callbackUrl={callbackUrl} initialType={sp.type ?? null} />;
}
