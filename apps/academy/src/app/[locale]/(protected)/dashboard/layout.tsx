import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { JOB_ROLE_LABEL } from "@/lib/labels";
import { Avatar } from "@bayada/ui";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/dashboard`)}`);
  const name = viewer.name ?? viewer.email.split("@")[0];
  const sub = [viewer.jobRole ? JOB_ROLE_LABEL[viewer.jobRole] : null, viewer.organizationName].filter(Boolean).join(" · ");

  return (
    <div className="container-page page-y grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
      <aside>
        <div className="lg:sticky lg:top-24">
          <div className="flex items-center gap-3 pb-5 lg:border-b lg:border-line">
            <Avatar name={name} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-body font-semibold text-ink">{name}</p>
              <p className="truncate text-caption text-muted">{sub || viewer.email}</p>
            </div>
          </div>
          <DashboardNav locale={locale} />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
