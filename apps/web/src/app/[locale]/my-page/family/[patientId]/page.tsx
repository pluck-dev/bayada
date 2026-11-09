import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@bayada/db";
import { BOOKING_STATUS_LABEL, TIME_SLOT_SHORT, serviceName } from "@bayada/shared/member";
import { canViewPatient, requireMember } from "@/lib/member/session";
import { listHealthRecords, listMemberBookings, listVisits, todayMedications, weeklyAdherence } from "@/lib/member/queries";
import { HealthRecords } from "@/components/member/HealthRecords";
import { TodayChecklist } from "@/components/member/Medications";
import { VisitReport } from "@/components/member/VisitReport";
import { BOOKING_TONE, Badge, Card, EmptyState, PageTitle, TextLink, fmtDay } from "@/components/member/ui";

// 보호자가 연결된 가족의 기록을 보는 화면 (읽기 전용)
export default async function FamilyPatientPage({ params }: { params: Promise<{ locale: string; patientId: string }> }) {
  const { locale, patientId } = await params;
  const m = await requireMember(locale, `/my-page/family/${patientId}`);
  if (patientId === m.id || !(await canViewPatient(m.id, patientId))) notFound();
  const base = `/${locale}/my-page`;
  const [patient, link, meds, weekly, records, bookings, visits] = await Promise.all([
    prisma.user.findUnique({ where: { id: patientId }, select: { name: true } }),
    prisma.familyLink.findFirst({ where: { guardianId: m.id, patientId, status: "APPROVED" }, select: { relationship: true } }),
    todayMedications(patientId),
    weeklyAdherence(patientId),
    listHealthRecords(patientId),
    listMemberBookings(patientId, []),
    listVisits([patientId]),
  ]);
  const name = patient?.name ?? "가족";
  return (
    <div className="flex flex-col gap-5">
      <Link href={`${base}/family`} className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--fg)]">
        <ChevronLeft className="size-4" aria-hidden />
        가족 연결
      </Link>
      <PageTitle title={`${name} 님의 기록`} description={`${link?.relationship ?? "가족"} · 가족이 직접 입력한 기록과 방문 인력의 기록을 함께 보여 줘요.`} />

      <Card title="오늘 복약" description={weekly === null ? undefined : `최근 7일 복약률 ${weekly}%`}>
        {meds.due.length === 0 ? (
          <EmptyState title="오늘 먹을 약이 없어요" />
        ) : (
          <TodayChecklist meds={meds.due.map((d) => ({ id: d.id, name: d.name, dosage: d.dosage, timeSlots: d.timeSlots, instructions: d.instructions, taken: d.logs.filter((l) => l.isTaken).map((l) => l.scheduledTime) }))} />
        )}
      </Card>

      <Card title="예약" action={<TextLink href={`${base}/bookings/new`}>대신 예약하기</TextLink>}>
        {bookings.length === 0 ? (
          <EmptyState title="예약이 없어요" />
        ) : (
          <ul className="divide-y divide-gray-100">
            {bookings.slice(0, 6).map((b) => (
              <li key={b.id}>
                <Link href={`${base}/bookings/${b.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold">{serviceName(b.serviceType)}</span>
                    <span className="block text-sm text-[color:var(--muted)]">
                      {fmtDay(b.scheduledDate)} {TIME_SLOT_SHORT[b.timeSlot]}
                    </span>
                  </span>
                  <Badge tone={BOOKING_TONE[b.status]} dot>
                    {BOOKING_STATUS_LABEL[b.status]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <HealthRecords rows={records} />

      <Card title="방문 기록">
        {visits.length === 0 ? (
          <EmptyState title="아직 방문 기록이 없어요" />
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {visits.slice(0, 5).map((v) => (
              <div key={v.id} className="py-4 first:pt-0">
                <p className="mb-3 text-[15px] font-bold">{serviceName(v.booking.serviceType)}</p>
                <VisitReport visit={v} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
