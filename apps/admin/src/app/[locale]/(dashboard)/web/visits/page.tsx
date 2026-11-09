import Link from "next/link";
import { VISIT_CONDITIONS, VISIT_CONDITION_LABEL, serviceName } from "@bayada/shared/member";
import { requirePage } from "@/lib/session";
import { listVisitsAdmin } from "@/lib/queries/web-members";
import { formatDateTime } from "@/lib/labels";
import { VISIT_CONDITION_TONE } from "@/lib/web-labels";
import { Pager } from "@/components/Pager";
import { Badge, EmptyState, FilterChip, PageHeader, Stat, cx, qs, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";

export default async function WebVisitsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ condition?: string; page?: string }> }) {
  const { locale } = await params;
  await requirePage("web.bookings", locale);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total, pages, avgRating, ratingCount } = await listVisitsAdmin(page, sp.condition);
  const base = `/${locale}/web/visits`;

  return (
    <>
      <PageHeader title="방문 기록" description="방문 인력이 홈페이지 마이페이지에서 작성한 방문 기록입니다(열람 전용 — 작성자만 씁니다). 행을 누르면 예약 상세에서 기록 전문과 만족도를 봅니다." />
      <div data-tour="visit-kpi" className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="방문 기록" value={total} hint={sp.condition ? "현재 필터" : "누적"} />
        <Stat tone="ink" label="평균 만족도" value={avgRating ? avgRating.toFixed(1) : "-"} unit={avgRating ? "/ 5" : undefined} hint={`평가 ${ratingCount}건`} />
      </div>
      <div data-tour="visit-filter" className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="이용자 상태">
        <FilterChip href={base} active={!sp.condition}>
          전체
        </FilterChip>
        {VISIT_CONDITIONS.map((c) => (
          <FilterChip key={c} href={qs(base, { condition: c })} active={sp.condition === c}>
            {VISIT_CONDITION_LABEL[c]}
          </FilterChip>
        ))}
      </div>
      <div data-tour="visit-table" className={tableWrap}>
        {rows.length === 0 ? (
          <EmptyState title="방문 기록이 없습니다" description="확정된 예약의 담당자가 방문 후 기록을 쓰면 여기에 쌓입니다." />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>방문 일시</th>
                <th className={thClass}>예약번호</th>
                <th className={thClass}>서비스</th>
                <th className={thClass}>이용자</th>
                <th className={thClass}>담당</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>만족도</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id} className={trClass}>
                  <td className={cx(tdClass, "tabular")}>{formatDateTime(v.startedAt)}</td>
                  <td className={cx(tdClass, "tabular")}>
                    <Link href={`/${locale}/web/bookings/${v.booking.id}`} className="font-bold text-ink hover:text-brand">
                      {v.booking.bookingNumber}
                    </Link>
                  </td>
                  <td className={cx(tdClass, "text-muted")}>{serviceName(v.booking.serviceType)}</td>
                  <td className={tdClass}>{v.patient.name ?? "-"}</td>
                  <td className={cx(tdClass, "text-muted")}>{v.staff.name ?? "-"}</td>
                  <td className={tdClass}>
                    <Badge tone={VISIT_CONDITION_TONE[v.patientCondition]} dot>
                      {VISIT_CONDITION_LABEL[v.patientCondition]}
                    </Badge>
                  </td>
                  <td className={cx(tdClass, "tabular text-muted")}>{v.booking.rating ? `★ ${v.booking.rating.rating}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pager page={page} pages={pages} total={total} />
    </>
  );
}
