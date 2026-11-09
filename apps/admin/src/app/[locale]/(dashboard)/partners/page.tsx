import Link from "next/link";
import { requirePage } from "@/lib/session";
import { listPartners } from "@/lib/queries/partners";
import { EmptyState, LinkButton, PageHeader, cx, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";
import { ProviderLogo } from "@/components/partners/ProviderLogo";

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("partner.manage", locale);
  const rows = await listPartners();
  const base = `/${locale}/partners`;

  return (
    <>
      <PageHeader
        title="파트너"
        description="외부 교육기관(파트너) 제공기관과 파트너 관리자 계정을 관리합니다. 파트너 관리자는 자기 기관 프로그램만 작성·승인 요청할 수 있고 승인·게시는 운영자가 합니다."
        actions={
          <LinkButton href={`/${locale}/taxonomy`} variant="secondary">
            제공기관 추가 (택소노미)
          </LinkButton>
        }
      />
      <div className={tableWrap}>
        {rows.length === 0 ? (
          <EmptyState
            title="외부 파트너 제공기관이 없습니다"
            description="택소노미 › 제공기관에서 기관을 추가하고 '외부 파트너 기관'에 체크하면 여기에 나타납니다."
          />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>기관</th>
                <th className={cx(thClass, "text-right")}>프로그램</th>
                <th className={thClass}>파트너 관리자</th>
                <th className={cx(thClass, "w-px")} aria-label="작업" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={trClass}>
                  <td className={tdClass}>
                    <Link href={`${base}/${p.id}`} className="flex items-center gap-2.5">
                      <ProviderLogo name={p.name} logo={p.logo} />
                      <span>
                        <span className="block font-medium transition-colors hover:text-brand">{p.name}</span>
                        <span className="block font-mono text-micro text-subtle">{p.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className={cx(tdClass, "tabular text-right")}>{p._count.courses}</td>
                  <td className={cx(tdClass, "whitespace-normal! text-muted")}>
                    {p.admins.length ? (
                      p.admins.map((a) => a.name ?? a.email).join(", ")
                    ) : (
                      <span className="text-warning">미지정</span>
                    )}
                  </td>
                  <td className={tdClass}>
                    <LinkButton href={`${base}/${p.id}`} size="sm" variant="ghost">
                      관리
                    </LinkButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
