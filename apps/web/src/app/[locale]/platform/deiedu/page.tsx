import { createMetadata } from "@/lib/seo";
import { DeiEduClient } from "./DeiEduClient";

export const metadata = createMetadata({ title: "DeiEdu - 교육 플랫폼", description: "BAYADA 50년 노하우 기반 헬스케어 교육 플랫폼 DeiEdu. 제공자 전문 교육, 이용자 보호자 교육 과정을 제공합니다.", path: "/ko/platform/deiedu" });

export default function DeiEduPage() {
  return <DeiEduClient />;
}
