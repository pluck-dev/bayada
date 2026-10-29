import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { JOB_ROLE_LABEL } from "@/lib/labels";
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
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[248px_1fr] lg:gap-10">
      <aside>
        <div className="rounded-2xl border border-line bg-surface p-4 lg:sticky lg:top-[124px]">
          <div className="flex items-center gap-3 px-1 pb-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-base font-bold text-white">
              {name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-ink">{name}</p>
              <p className="truncate text-xs text-muted">{sub || viewer.email}</p>
            </div>
          </div>
          <DashboardNav locale={locale} />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
