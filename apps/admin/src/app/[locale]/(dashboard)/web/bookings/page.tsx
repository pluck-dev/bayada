import Link from "next/link";
import { BOOKING_STATUSES, BOOKING_STATUS_LABEL, TIME_SLOT_SHORT, serviceName } from "@bayada/shared/member";
import { requirePage } from "@/lib/session";
import { listBookings, listVisitStaff, parseBookingFilter } from "@/lib/queries/web-members";
import { formatDateTime } from "@/lib/labels";
import { BOOKING_STATUS_TONE } from "@/lib/web-labels";
import { Pager } from "@/components/Pager";
import { SearchBox } from "@/components/SearchBox";
import { SelectFilter } from "@/components/SelectFilter";
import { Badge, Button, DatePicker, EmptyState, FilterChip, PageHeader, cx, qs, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";

type SP = { status?: string; from?: string; to?: string; q?: string; staff?: string; page?: string };
const dayLabel = (d: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", month: "2-digit", day: "2-digit", weekday: "short" }).format(d);

export default async function WebBookingsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SP> }) {
  const { locale } = await params;
  await requirePage("web.bookings", locale);
  const sp = await searchParams;
  const f = parseBookingFilter(sp);
  const page = Math.max(1, Number(sp.page) || 1);
  const [{ rows, total, pages, statusCounts }, staff] = await Promise.all([listBookings(f, page), listVisitStaff()]);
  const base = `/${locale}/web/bookings`;
  const keep = { from: f.from, to: f.to, q: f.q, staff: f.staff };
  const allCount = Object.values(statusCounts).reduce((n, c) => n + (c ?? 0), 0);

  return (
    <>
      <PageHeader
        title="서비스 예약"
        description="홈페이지 회원이 신청한 방문 서비스 예약입니다. 신청 접수 → 확정(담당자 배정) → 방문 완료(방문 기록) 순서로 처리하고, 바뀔 때마다 회원 마이페이지 진행 이력에 보입니다."
      />

      <div data-tour="booking-status" className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="상태">
        <FilterChip href={qs(base, keep)} active={!f.status} count={allCount}>
          전체
        </FilterChip>
        {BOOKING_STATUSES.map((s) => (
          <FilterChip key={s} href={qs(base, { ...keep, status: s })} active={f.status === s} count={statusCounts[s] ?? 0}>
            {BOOKING_STATUS_LABEL[s]}
          </FilterChip>
        ))}
      </div>

      <div data-tour="booking-filters" className="mb-4 flex flex-wrap items-center gap-2">
        <SelectFilter
          param="staff"
          label="담당자"
          value={f.staff ?? ""}
          options={[{ value: "", label: "모든 담당자" }, { value: "none", label: "배정 전" }, ...staff.map((s) => ({ value: s.id, label: s.name ?? s.email }))]}
        />
        <form className="flex items-center gap-1.5" action={base}>
          {f.status && <input type="hidden" name="status" value={f.status} />}
          {f.q && <input type="hidden" name="q" value={f.q} />}
          {f.staff && <input type="hidden" name="staff" value={f.staff} />}
          <DatePicker size="sm" name="from" aria-label="방문일 시작" placeholder="방문일 시작" defaultValue={f.from} />
          <span className="text-caption text-subtle">~</span>
          <DatePicker size="sm" name="to" aria-label="방문일 끝" placeholder="방문일 끝" defaultValue={f.to} />
          <Button type="submit" size="sm" variant="primary" className="h-9 px-4">
            기간 적용
          </Button>
          {(f.from || f.to) && (
            <Link href={qs(base, { status: f.status, q: f.q, staff: f.staff })} className="text-caption text-muted hover:text-ink">
              기간 해제
            </Link>
          )}
        </form>
        <div className="ml-auto">
          <SearchBox placeholder="예약번호·이용자·연락처·주소" />
        </div>
      </div>

      <div data-tour="booking-table" className={tableWrap}>
        {rows.length === 0 ? (
          <EmptyState title={allCount === 0 && !f.q ? "아직 예약이 없습니다" : "조건에 맞는 예약이 없습니다"} description="홈페이지 마이페이지 '서비스 예약'에서 신청한 예약이 여기에 쌓입니다." />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>예약번호</th>
                <th className={thClass}>방문일</th>
                <th className={thClass}>서비스</th>
                <th className={thClass}>이용자</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>담당자</th>
                <th className={thClass}>신청 일시</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={trClass}>
                  <td className={cx(tdClass, "tabular")}>
                    <Link href={`${base}/${r.id}`} className="font-bold text-ink transition-colors hover:text-brand">
                      {r.bookingNumber}
                    </Link>
                  </td>
                  <td className={cx(tdClass, "tabular")}>
                    {dayLabel(r.scheduledDate)} <span className="text-muted">{r.scheduledTime ?? TIME_SLOT_SHORT[r.timeSlot]}</span>
                  </td>
                  <td className={cx(tdClass, "text-muted")}>{serviceName(r.serviceType)}</td>
                  <td className={tdClass}>
                    <span className="font-medium">{r.patient.name ?? "-"}</span>
                    {r.requestedBy.id !== r.patient.id && <p className="text-micro text-subtle">신청 {r.requestedBy.name} (보호자)</p>}
                  </td>
                  <td className={tdClass}>
                    <Badge tone={BOOKING_STATUS_TONE[r.status]} dot>
                      {BOOKING_STATUS_LABEL[r.status]}
                    </Badge>
                    {r.rating && <span className="ml-1.5 text-micro text-subtle">★ {r.rating.rating}</span>}
                  </td>
                  <td className={cx(tdClass, "text-muted")}>{r.assignedStaff?.name ?? "-"}</td>
                  <td className={cx(tdClass, "tabular text-muted")}>{formatDateTime(r.createdAt)}</td>
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
