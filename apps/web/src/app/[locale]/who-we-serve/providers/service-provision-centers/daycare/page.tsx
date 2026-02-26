import { createMetadata } from "@/lib/seo";
import DaycareClient from "./DaycareClient";

export const metadata = createMetadata({ title: "주야간보호 제공기관", description: "주야간보호 서비스 제공기관을 위한 BAYADA 파트너십. 프로그램 개발과 품질 향상을 지원합니다.", path: "/ko/who-we-serve/providers/service-provision-centers/daycare" });

export default async function Page() {
  return <DaycareClient />;
}
