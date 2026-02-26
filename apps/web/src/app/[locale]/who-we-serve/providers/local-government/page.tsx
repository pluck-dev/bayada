import { createMetadata } from "@/lib/seo";
import LocalGovernmentClient from "./LocalGovernmentClient";

export const metadata = createMetadata({ title: "지방자치단체", description: "지방자치단체를 위한 BAYADA 공공 협력 프로그램. 지역 돌봄 인프라 구축을 함께 합니다.", path: "/ko/who-we-serve/providers/local-government" });

export default async function Page() {
  return <LocalGovernmentClient />;
}
