import { createMetadata } from "@/lib/seo";
import { DtxClient } from "./DtxClient";

export const metadata = createMetadata({ title: "Dtx - 디지털 치료제", description: "BAYADA 디지털 치료제 플랫폼 Dtx. AI 기반 맞춤형 디지털 치료 솔루션을 제공합니다.", path: "/ko/platform/dtx" });

export default function DtxPage() {
  return <DtxClient />;
}
