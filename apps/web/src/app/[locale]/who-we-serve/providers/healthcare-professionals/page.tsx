import { createMetadata } from "@/lib/seo";
import { HealthcareProfessionalsClient } from "./HealthcareProfessionalsClient";

export const metadata = createMetadata({ title: "의료 전문인", description: "의료 전문인을 위한 BAYADA 파트너 프로그램. 전문성 개발, 교육, 네트워크 기회를 제공합니다.", path: "/ko/who-we-serve/providers/healthcare-professionals" });

export default async function Page() {
  return <HealthcareProfessionalsClient />;
}
