import type { Metadata } from "next";
import { getViewer } from "@/lib/viewer";
import { DescriptionList, PageHeader } from "@bayada/ui";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "프로필" };

export default async function ProfilePage() {
  const viewer = (await getViewer())!;
  return (
    <div>
      <PageHeader title="프로필" className="mb-6 md:mb-8" />
      <DescriptionList
        className="border-b border-line pb-6"
        items={[
          { label: "이메일", value: viewer.email },
          { label: "소속", value: viewer.organizationName ?? "개인 회원" },
        ]}
      />
      <div className="mt-8 max-w-xl">
        <ProfileForm name={viewer.name ?? ""} jobRole={viewer.jobRole} />
      </div>
    </div>
  );
}
