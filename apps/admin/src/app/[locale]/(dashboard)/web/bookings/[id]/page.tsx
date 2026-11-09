import Link from "next/link";
import { notFound } from "next/navigation";
import { BOOKING_STATUS_LABEL, MEMBER_TYPE_LABEL, TIME_SLOT_LABEL, VISIT_CONDITION_LABEL, serviceName } from "@bayada/shared/member";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { getBooking, listVisitStaff } from "@/lib/queries/web-members";
import { formatDateTime } from "@/lib/labels";
import { BOOKING_STATUS_TONE, VISIT_CONDITION_TONE } from "@/lib/web-labels";
import { prisma } from "@bayada/db";
import { Badge, Card, DescList, Notice, PageHeader } from "@/components/ui";
import { BookingControls, BookingMemoForm } from "@/components/web/BookingControls";

const EVENT_LABEL: Record<string, string> = {
  requested: "신청",
  changed: "변경",
  confirmed: "확정",
  assigned: "담당자",
  completed: "완료",
  cancelled: "취소",
  memo: "메모",
};
const dayLabel = (d: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(d);
const hm = (d: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);

export default async function WebBookingDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const user = await requirePage("web.bookings", locale);
  const [b, staff] = await Promise.all([getBooking(id), listVisitStaff()]);
  if (!b) notFound();
  const patientProfile = await prisma.webMemberProfile.findUnique({ where: { userId: b.patient.id }, select: { memberType: true } });
  const vitals = b.visit?.healthRecords[0];
  const membersLink = can(user, "web.members");

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/web/bookings`, label: "서비스 예약" }}
        title={
          <span className="flex items-center gap-2">
            <span className="tabular">{b.bookingNumber}</span>
            <Badge tone={BOOKING_STATUS_TONE[b.status]} dot>
              {BOOKING_STATUS_LABEL[b.status]}
            </Badge>
          </span>
        }
        description={`${serviceName(b.serviceType)} · ${dayLabel(b.scheduledDate)} ${TIME_SLOT_LABEL[b.timeSlot]}${b.scheduledTime ? ` · ${b.scheduledTime}` : ""}`}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card tour="booking-content" title="예약 내용">
            <DescList
              items={[
                {
                  label: "이용자",
                  value: membersLink ? (
                    <Link href={`/${locale}/web/members/${b.patient.id}`} className="hover:text-brand">
                      {b.patient.name ?? "-"}
                    </Link>
                  ) : (
                    (b.patient.name ?? "-")
                  ),
                },
                { label: "회원 유형", value: patientProfile ? MEMBER_TYPE_LABEL[patientProfile.memberType] : "-" },
                ...(b.requestedBy.id !== b.patient.id ? [{ label: "신청자(보호자)", value: `${b.requestedBy.name ?? ""} · ${b.requestedBy.email}` }] : []),
                { label: "연락처", value: <span className="tabular">{b.contactPhone ?? b.patient.phone ?? "-"}</span> },
                { label: "방문 주소", value: <span className="whitespace-normal">{b.address}</span> },
                { label: "요청 사항", value: <span className="whitespace-pre-line">{b.notes ?? "-"}</span> },
                { label: "담당자", value: b.assignedStaff?.name ?? "배정 전" },
                { label: "신청", value: formatDateTime(b.createdAt) },
                ...(b.confirmedAt ? [{ label: "확정", value: formatDateTime(b.confirmedAt) }] : []),
                ...(b.cancelledAt ? [{ label: "취소", value: `${formatDateTime(b.cancelledAt)} · ${b.cancelReason ?? ""}` }] : []),
              ]}
            />
          </Card>

          {b.visit ? (
            <Card tour="booking-visit" title="방문 기록" description={`${b.visit.staff.name ?? "방문 인력"} 작성 · ${formatDateTime(b.visit.startedAt)} ~ ${hm(b.visit.completedAt)}`}>
              <div className="flex flex-col gap-3 text-caption">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={VISIT_CONDITION_TONE[b.visit.patientCondition]} dot>
                    {VISIT_CONDITION_LABEL[b.visit.patientCondition]}
                  </Badge>
                  {b.visit.serviceProvided.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
                {vitals && (
                  <p className="tabular text-muted">
                    {[
                      vitals.bloodPressureSys ? `혈압 ${vitals.bloodPressureSys}/${vitals.bloodPressureDia}` : null,
                      vitals.bloodSugar != null ? `혈당 ${vitals.bloodSugar}` : null,
                      vitals.temperature != null ? `체온 ${vitals.temperature}°C` : null,
                      vitals.heartRate != null ? `맥박 ${vitals.heartRate}` : null,
                      vitals.weight != null ? `체중 ${vitals.weight}kg` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    {vitals.hasAlert && <span className="ml-2 font-bold text-brand">이상 징후</span>}
                  </p>
                )}
                <p className="whitespace-pre-line text-ink">{b.visit.notes}</p>
                {b.visit.nextVisitNotes && (
                  <Notice tone="info">
                    <b>다음 방문 참고</b> · <span className="whitespace-pre-line">{b.visit.nextVisitNotes}</span>
                  </Notice>
                )}
              </div>
            </Card>
          ) : b.status === "COMPLETED" ? (
            <Notice>방문 기록 없이 운영팀이 완료 처리한 예약입니다.</Notice>
          ) : null}

          {b.rating && (
            <Card title="만족도 평가">
              <p className="text-body font-bold text-ink">
                {"★".repeat(b.rating.rating)}
                <span className="text-subtle">{"★".repeat(5 - b.rating.rating)}</span>
                <span className="ml-2 text-caption font-normal text-muted">{formatDateTime(b.rating.createdAt)}</span>
              </p>
              {b.rating.comment && <p className="mt-2 whitespace-pre-line text-caption">{b.rating.comment}</p>}
            </Card>
          )}

          <Card tour="booking-history" title={`진행 이력 · ${b.events.length}건`} description="'메모'는 운영팀 내부용(회원에게 안 보임), 나머지는 회원 마이페이지 진행 이력에 그대로 보입니다.">
            <BookingMemoForm id={b.id} />
            <ol className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
              {b.events.map((e) => (
                <li key={e.id} className="text-caption">
                  <div className="flex items-center gap-2 text-subtle">
                    <Badge tone={e.internal ? "zinc" : "blue"}>{EVENT_LABEL[e.kind] ?? e.kind}</Badge>
                    <span>{e.actor ? (e.actor.name ?? e.actor.email) : "-"}</span>
                    <span className="tabular">{formatDateTime(e.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-ink">{e.body}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <BookingControls
          id={b.id}
          bookingNumber={b.bookingNumber}
          status={b.status}
          staff={staff.map((s) => ({ id: s.id, label: `${s.name ?? s.email}${s.webMemberProfile?.providerRole ? ` · ${s.webMemberProfile.providerRole}` : ""}` }))}
          current={{
            staffId: b.assignedStaff?.id ?? "",
            date: b.scheduledDate.toISOString().slice(0, 10),
            timeSlot: b.timeSlot,
            scheduledTime: b.scheduledTime ?? "",
          }}
          hasVisit={!!b.visit}
          membersHref={membersLink ? `/${locale}/web/members?type=PROVIDER` : null}
        />
      </div>
    </>
  );
}
