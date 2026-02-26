import { createMetadata } from "@/lib/seo";
import PaidOnboardingClient from "./PaidOnboardingClient";

export const metadata = createMetadata({
  title: "유료 멤버십 온보딩",
  description:
    "BAYADA 유료 멤버십 맞춤 서비스 설계. 전문 상담을 통해 최적의 케어 플랜을 수립합니다.",
  path: "/ko/onboarding/paid",
  noIndex: true,
});

export default async function PaidOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <PaidOnboardingClient />;
}
