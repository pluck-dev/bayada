import Link from "next/link";
import { CalendarCheck, Star } from "lucide-react";
import { BOOKING_STATUS_LABEL, TIME_SLOT_SHORT, kstToday, serviceName, ymd } from "@bayada/shared/member";
import { requireMember, linkedPatients } from "@/lib/member/session";
import { listMemberBookings } from "@/lib/member/queries";
import { BOOKING_TONE, Badge, EmptyState, Notice, PageTitle, btnClass, fmtDay } from "@/components/member/ui";
import { cn } from "@bayada/ui";

export default async function BookingsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { locale } = await params;
  const { tab } = await searchParams;
  const m = await requireMember(locale, "/my-page/bookings");
  const base = `/${locale}/my-page`;
  const type = m.webMemberProfile.memberType;
  if (type !== "SERVICE_USER" && type !== "GUARDIAN") {
    return <Notice>서비스 예약은 서비스 이용자·보호자 회원이 이용해요.</Notice>;
  }
  const links = type === "GUARDIAN" ? await linkedPatients(m.id) : [];
  const rows = await listMemberBookings(m.id, links.map((l) => l.patient.id));
  const today = kstToday();
  const past = tab === "past";
  const active = rows.filter((b) => (b.status === "REQUESTED" || b.status === "CONFIRMED") && ymd(b.scheduledDate) >= today);
  const done = rows.filter((b) => !active.includes(b));
  const list = past ? done : [...active].reverse();
  const canBook = type === "SERVICE_USER" || links.length > 0;

  return (
    <>
      <PageTitle
        title="서비스 예약"
        description="방문 서비스를 신청하고, 확정·담당자 배정·방문 완료까지 진행 상황을 확인해요."
        action={
          canBook ? (
            <Link href={`${base}/bookings/new`} className={btnClass("primary")}>
              <CalendarCheck className="size-4" aria-hidden />새 예약 신청
            </Link>
          ) : undefined
        }
      />
      {type === "GUARDIAN" && links.length === 0 && (
        <div className="mb-4">
          <Notice tone="blue">
            가족을 대신해 예약하려면 먼저{" "}
            <Link href={`${base}/family`} className="font-semibold underline">
              가족 연결
            </Link>
            을 해 주세요. 가족이 승인하면 예약할 수 있어요.
          </Notice>
        </div>
      )}
      <div className="mb-4 inline-flex rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_var(--border)]" role="tablist">
        {[
          { key: "", label: `진행 중 ${active.length}` },
          { key: "past", label: `지난·취소 ${done.length}` },
        ].map((t) => {
          const on = (tab ?? "") === t.key || (!past && t.key === "");
          return (
            <Link
              key={t.key}
              role="tab"
              aria-selected={on}
              href={`${base}/bookings${t.key ? `?tab=${t.key}` : ""}`}
              className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-colors", on ? "bg-[color:var(--fg)] text-white" : "text-gray-600 hover:text-[color:var(--fg)]")}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState title={past ? "지난 예약이 없어요" : "진행 중인 예약이 없어요"} description={past ? undefined : "원하는 날짜와 시간대를 골라 방문 서비스를 신청해 보세요."} />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {list.map((b) => (
            <li key={b.id}>
              <Link href={`${base}/bookings/${b.id}`} className="flex flex-col gap-3 rounded-2xl border border-[color:var(--border)] bg-white p-4 transition-colors hover:border-gray-400 sm:flex-row sm:items-center sm:p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={BOOKING_TONE[b.status]} dot>
                      {BOOKING_STATUS_LABEL[b.status]}
                    </Badge>
                    <span className="text-xs tabular-nums text-gray-400">{b.bookingNumber}</span>
                  </div>
                  <p className="mt-2 text-[16px] font-bold text-[color:var(--fg)]">{serviceName(b.serviceType)}</p>
                  <p className="mt-0.5 text-sm text-[color:var(--muted)]">
                    {fmtDay(b.scheduledDate)} · {TIME_SLOT_SHORT[b.timeSlot]}
                    {b.scheduledTime ? ` ${b.scheduledTime}` : ""}
                    {b.patient.id !== m.id && b.patient.name ? ` · ${b.patient.name}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm text-[color:var(--muted)]">
                  {b.assignedStaff?.name && <span>담당 {b.assignedStaff.name}</span>}
                  {b.status === "COMPLETED" &&
                    (b.rating ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <Star className="size-4 fill-current" aria-hidden />
                        {b.rating.rating}
                      </span>
                    ) : (
                      <span className="font-semibold text-[#ce0e2d]">평가 남기기</span>
                    ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
