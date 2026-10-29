import type { Metadata } from "next";
import { getViewer } from "@/lib/viewer";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "프로필" };

export default async function ProfilePage() {
  const viewer = (await getViewer())!;
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink md:text-[28px]">프로필</h1>
      <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
        <div className="bg-white p-5">
          <dt className="text-xs text-muted">이메일</dt>
          <dd className="mt-1 text-[15px] font-semibold text-ink">{viewer.email}</dd>
        </div>
        <div className="bg-white p-5">
          <dt className="text-xs text-muted">소속</dt>
          <dd className="mt-1 text-[15px] font-semibold text-ink">{viewer.organizationName ?? "개인 회원"}</dd>
        </div>
      </dl>
      <div className="mt-8 rounded-2xl border border-line bg-white p-6 md:p-8">
        <ProfileForm name={viewer.name ?? ""} jobRole={viewer.jobRole} />
      </div>
    </div>
  );
}
