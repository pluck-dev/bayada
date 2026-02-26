import { createMetadata } from "@/lib/seo";
import { OtherProfessionalsClient } from "./OtherProfessionalsClient";

export const metadata = createMetadata({ title: "기타 전문인", description: "BAYADA 네트워크에 참여할 수 있는 기타 전문인력. 함께 성장하는 파트너십을 제안합니다.", path: "/ko/who-we-serve/providers/other-professionals" });

export default async function Page() {
  return <OtherProfessionalsClient />;
}
