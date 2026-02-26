import { getPlatformBySlug } from "@/data/platforms";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";
import { DeiBudClient } from "./DeiBudClient";

export const metadata = createMetadata({ title: "DeiBud - AI 케어 가이드", description: "AI 기반 실시간 케어 가이드 DeiBud. 질환 정보, 맞춤 서비스 추천, 24시간 건강 상담을 지원합니다.", path: "/ko/platform/deibud" });

export default async function DeiBudPage({ params: _ }: { params: Promise<{ locale: string }> }) {
  const platform = getPlatformBySlug("deibud");
  if (!platform) notFound();
  return <DeiBudClient />;
}
