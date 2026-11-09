import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Star } from "lucide-react";
import {
  BOOKING_MAX_DAYS_AHEAD,
  BOOKING_STATUS_LABEL,
  CANCEL_BEFORE_HOURS,
  TIME_SLOT_LABEL,
  memberCanCancel,
  memberCanChange,
  serviceName,
  ymd,
} from "@bayada/shared/member";
import { kstDate } from "@bayada/shared/web-content";
import { canViewPatient, requireMember } from "@/lib/member/session";
import { getBookingDetail } from "@/lib/member/queries";
import { BookingActions, RatingForm } from "@/components/member/BookingActions";
import { VisitReport } from "@/components/member/VisitReport";
import { BOOKING_TONE, Badge, Card, InfoList, Notice, Timeline, fmtDateTime, fmtDay } from "@/components/member/ui";

export default async function BookingDetailPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { locale, id } = await params;
  const { created } = await searchParams;
  const m = await requireMember(locale, `/my-page/bookings/${id}`);
  const b = await getBookingDetail(id);
  if (!b || !(b.requestedById === m.id || (await canViewPatient(m.id, b.patientId)))) notFound();
  const base = `/${locale}/my-page`;
  const now = Date.now();
  const canChange = memberCanChange(b.status);
  const canCancel = memberCanCancel(b);
  const steps = ["REQUESTED", "CONFIRMED", "COMPLETED"] as const;
  const stepIdx = b.status === "CANCELLED" ? -1 : steps.indexOf(b.status as (typeof steps)[number]);

  return (
    <div className="flex flex-col gap-5">
      <Link href={`${base}/bookings`} className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--fg)]">
        <ChevronLeft className="size-4" aria-hidden />
        예약 목록
      </Link>
      {created && <Notice tone="green">예약 신청을 접수했어요. 운영팀이 확인하면 확정 안내와 함께 상태가 바뀌어요.</Notice>}

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={BOOKING_TONE[b.status]} dot>
            {BOOKING_STATUS_LABEL[b.status]}
          </Badge>
          <span className="text-sm tabular-nums text-gray-400">{b.bookingNumber}</span>
        </div>
        <h1 className="mt-3 text-[24px] font-bold tracking-tight">{serviceName(b.serviceType)}</h1>
        <p className="mt-1 text-[15px] text-[color:var(--muted)]">
          {fmtDay(b.scheduledDate)} · {TIME_SLOT_LABEL[b.timeSlot]}
          {b.scheduledTime ? ` · ${b.scheduledTime} 방문` : ""}
        </p>

        {/* 진행 단계 */}
        {stepIdx >= 0 && (
          <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="진행 단계">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-col gap-2">
                <span className={`h-1.5 rounded-full ${i <= stepIdx ? "bg-[#ce0e2d]" : "bg-gray-200"}`} />
                <span className={`text-xs font-semibold sm:text-sm ${i <= stepIdx ? "text-[color:var(--fg)]" : "text-gray-400"}`}>{BOOKING_STATUS_LABEL[s]}</span>
              </li>
            ))}
          </ol>
        )}
        {b.status === "CANCELLED" && b.cancelReason && (
          <div className="mt-5">
            <Notice>취소 사유: {b.cancelReason}</Notice>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card title="예약 정보">
            <InfoList
              items={[
                ["서비스 받는 분", b.patient.name ?? "-"],
                ...(b.requestedBy.id !== b.patientId ? ([["신청한 분", b.requestedBy.name ?? "-"]] as [string, string][]) : []),
                ["담당자", b.assignedStaff ? `${b.assignedStaff.name ?? ""}${b.assignedStaff.webMemberProfile?.providerRole ? ` (${b.assignedStaff.webMemberProfile.providerRole})` : ""}` : "확정 시 배정돼요"],
                ["방문 주소", b.address],
                ["당일 연락처", b.contactPhone ?? "회원 정보 휴대폰"],
                ["요청 사항", <span key="n" className="whitespace-pre-line">{b.notes ?? "-"}</span>],
                ["신청 일시", fmtDateTime(b.createdAt)],
              ]}
            />
            {(canChange || canCancel || b.status === "CONFIRMED") && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <BookingActions
                  locale={locale}
                  id={b.id}
                  bookingNumber={b.bookingNumber}
                  canChange={canChange}
                  canCancel={canCancel}
                  cancelHint={
                    b.status === "CONFIRMED"
                      ? canCancel
                        ? `확정된 예약은 방문 ${CANCEL_BEFORE_HOURS}시간 전까지 취소할 수 있어요. 일정 변경은 취소 후 다시 신청하거나 1670-1379 로 연락해 주세요.`
                        : `방문 ${CANCEL_BEFORE_HOURS}시간 전부터는 온라인 취소가 안 돼요. 1670-1379 로 연락해 주세요.`
                      : undefined
                  }
                  defaults={{ serviceType: b.serviceType, date: ymd(b.scheduledDate), timeSlot: b.timeSlot, address: b.address, contactPhone: b.contactPhone ?? "", notes: b.notes ?? "" }}
                  minDate={kstDate(new Date(now + 86400_000))}
                  maxDate={kstDate(new Date(now + BOOKING_MAX_DAYS_AHEAD * 86400_000))}
                />
              </div>
            )}
          </Card>

          {b.visit && (
            <Card title="방문 기록" description="담당자가 방문 후 남긴 기록이에요.">
              <VisitReport visit={b.visit} />
            </Card>
          )}

          {b.status === "COMPLETED" && b.visit && (
            <Card title="만족도 평가" description={b.rating ? undefined : "이번 방문은 어떠셨나요? 평가는 서비스 품질 관리에 쓰여요."}>
              {b.rating ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1" aria-label={`${b.rating.rating}점`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`size-6 ${n <= b.rating!.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} aria-hidden />
                    ))}
                    <span className="ml-2 text-sm text-[color:var(--muted)]">{fmtDateTime(b.rating.createdAt)}</span>
                  </div>
                  {b.rating.comment && <p className="whitespace-pre-line text-[15px] leading-relaxed">{b.rating.comment}</p>}
                </div>
              ) : (
                <RatingForm id={b.id} />
              )}
            </Card>
          )}
        </div>

        <Card title="진행 이력" className="self-start">
          <Timeline
            items={b.events.map((e, i) => ({ id: e.id, title: EVENT_TITLE[e.kind] ?? "업데이트", body: e.body, at: fmtDateTime(e.createdAt), current: i === 0 }))}
          />
        </Card>
      </div>
    </div>
  );
}

const EVENT_TITLE: Record<string, string> = {
  requested: "예약 신청",
  changed: "신청 내용 변경",
  confirmed: "예약 확정",
  assigned: "담당자 배정",
  completed: "방문 완료",
  cancelled: "예약 취소",
  visit: "방문 기록",
};
