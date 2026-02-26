import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { BayadaWayClient } from "./BayadaWayClient";

export const metadata: Metadata = createMetadata({
  title: "The BAYADA Way",
  description:
    "열정, 탁월함, 신뢰 — BAYADA의 핵심 가치와 철학, 50년의 역사를 통해 이어져 온 The BAYADA Way를 소개합니다.",
  path: "/ko/bayada-way",
  keywords: ["The BAYADA Way", "바야다 핵심가치", "홈헬스케어 철학", "열정", "탁월함", "신뢰"],
});

export default async function BayadaWayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <BayadaWayClient locale={locale} />;
}
