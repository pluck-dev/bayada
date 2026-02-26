import { createMetadata } from "@/lib/seo";
import { FreeOnboardingClient } from "./FreeOnboardingClient";

export const metadata = createMetadata({
  title: "무료 멤버십 가입",
  description:
    "BAYADA 무료 멤버십 가입. 2분이면 충분합니다. AI 건강 상담, 맞춤 서비스 추천, 건강 콘텐츠를 무료로 이용하세요.",
  path: "/ko/onboarding/free",
  noIndex: true,
});

export default async function FreeOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  return <FreeOnboardingClient />;
}
