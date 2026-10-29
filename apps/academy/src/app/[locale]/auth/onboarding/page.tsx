import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { JOB_ROLE_OPTIONS } from "@/lib/signup-policy";
import OnboardingForm from "./OnboardingForm";

export const metadata: Metadata = { title: "시작하기", robots: { index: false, follow: false } };

// 소셜 로그인 후 거쳐 가는 곳: 직군이 없으면 한 번 묻고, 있으면 바로 원래 가려던 곳으로
export default async function OnboardingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { locale } = await params;
  const { callbackUrl: raw = "" } = await searchParams;
  // 같은 사이트 경로만 허용 (오픈 리다이렉트 방지)
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : `/${locale}`;
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(next)}`);
  if (viewer.jobRole) redirect(next);
  return <OnboardingForm name={viewer.name} next={next} options={JOB_ROLE_OPTIONS} />;
}
