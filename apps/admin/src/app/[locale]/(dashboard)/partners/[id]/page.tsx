import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/session";
import { getPartner } from "@/lib/queries/partners";
import { COURSE_STATUS_LABEL, COURSE_STATUS_TONE, formatDate } from "@/lib/labels";
import { Badge, Card, EmptyState, PageHeader, cx, tableClass, tdClass, thClass, trClass } from "@/components/ui";
import { ProviderLogo } from "@/components/partners/ProviderLogo";
import { AssignPartnerAdminForm, UnassignPartnerAdminButton } from "@/components/partners/PartnerAdminControls";

export default async function PartnerDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  await requirePage("partner.manage", locale);
  const p = await getPartner(id);
  if (!p) notFound();

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/partners`, label: "파트너" }}
        title={
          <span className="flex items-center gap-3">
            <ProviderLogo name={p.name} logo={p.logo} size="lg" />
            <span>
              {p.name}
              <span className="ml-2 align-middle">{p.isPartner ? <Badge tone="violet">파트너</Badge> : <Badge>바야다</Badge>}</span>
            </span>
          </span>
        }
        description={p.description ?? undefined}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-6">
        <Card title={`프로그램 (${p.courses.length})`} padded={false}>
          {p.courses.length === 0 ? (
            <EmptyState title="아직 프로그램이 없습니다" description="파트너 관리자가 파트너 콘솔에서 작성하면 여기에 보입니다." />
          ) : (
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>프로그램명</th>
                  <th className={thClass}>상태</th>
                  <th className={cx(thClass, "text-right")}>수강생</th>
                  <th className={thClass}>수정일</th>
                </tr>
              </thead>
              <tbody>
                {p.courses.map((c) => (
                  <tr key={c.id} className={trClass}>
                    <td className={cx(tdClass, "whitespace-normal!")}>
                      <Link href={`/${locale}/programs/${c.id}`} className="font-medium hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className={tdClass}>
                      <Badge tone={COURSE_STATUS_TONE[c.status]} dot>
                        {COURSE_STATUS_LABEL[c.status]}
                      </Badge>
                    </td>
                    <td className={cx(tdClass, "tabular text-right")}>{c._count.enrollments.toLocaleString()}</td>
                    <td className={cx(tdClass, "tabular text-subtle")}>{formatDate(c.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <aside className="flex flex-col gap-4">
          <Card title={`파트너 관리자 (${p.admins.length})`} padded={false}>
            {p.admins.length === 0 ? (
              <p className="px-4 py-5 text-center text-caption text-muted">지정된 파트너 관리자가 없습니다.</p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {p.admins.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 px-4 py-2 text-caption">
                    <span className="min-w-0 flex-1">
                      <Link href={`/${locale}/members/${a.id}`} className="block truncate font-medium hover:underline">
                        {a.name ?? a.email}
                      </Link>
                      <span className="block truncate text-micro text-subtle">{a.email}</span>
                    </span>
                    <UnassignPartnerAdminButton providerId={p.id} userId={a.id} label={a.name ?? a.email} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {p.isPartner ? (
            <Card title="관리자 지정">
              <AssignPartnerAdminForm providerId={p.id} providerName={p.name} />
            </Card>
          ) : (
            <p className="px-1 text-caption text-muted">바야다 자체 제공기관에는 파트너 관리자를 두지 않습니다.</p>
          )}
        </aside>
      </div>
    </>
  );
}
