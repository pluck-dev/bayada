import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@bayada/db";
import { TIME_SLOT_LABEL, kstToday, serviceName, ymd } from "@bayada/shared/member";
import { requireMember } from "@/lib/member/session";
import { VisitReport } from "@/components/member/VisitReport";
import { VisitReportForm } from "@/components/member/VisitReportForm";
import { Card, InfoList, Notice, PageTitle, fmtDay } from "@/components/member/ui";

export default async function ScheduleDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const m = await requireMember(locale, `/my-page/schedule/${id}`);
  if (m.webMemberProfile.memberType !== "PROVIDER" || !m.webMemberProfile.isVisitStaff) notFound();
  const b = await prisma.booking.findUnique({
    where: { id },
    select: {
      id: true,
      bookingNumber: true,
      status: true,
      serviceType: true,
      scheduledDate: true,
      timeSlot: true,
      scheduledTime: true,
      address: true,
      contactPhone: true,
      notes: true,
      assignedStaffId: true,
      patientId: true,
      patient: { select: { name: true, phone: true } },
      visit: { select: { startedAt: true, completedAt: true, serviceProvided: true, patientCondition: true, notes: true, nextVisitNotes: true, staff: { select: { name: true } }, healthRecords: { select: { bloodPressureSys: true, bloodPressureDia: true, bloodSugar: true, temperature: true, heartRate: true, weight: true } } } },
    },
  });
  if (!b || b.assignedStaffId !== m.id || (b.status !== "CONFIRMED" && b.status !== "COMPLETED")) notFound();
  // 방문 전 참고: 같은 이용자의 직전 방문 '다음 방문 참고'
  const prev = await prisma.serviceVisit.findFirst({
    where: { patientId: b.patientId, bookingId: { not: b.id } },
    orderBy: { completedAt: "desc" },
    select: { nextVisitNotes: true, completedAt: true, staff: { select: { name: true } } },
  });
  const writable = b.status === "CONFIRMED" && ymd(b.scheduledDate) <= kstToday();

  return (
    <div className="flex flex-col gap-5">
      <Link href={`/${locale}/my-page/schedule`} className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--fg)]">
        <ChevronLeft className="size-4" aria-hidden />
        방문 일정
      </Link>
      <PageTitle title={`${b.patient.name ?? "이용자"} · ${serviceName(b.serviceType)}`} description={`${b.bookingNumber} · ${fmtDay(b.scheduledDate)} ${TIME_SLOT_LABEL[b.timeSlot]}${b.scheduledTime ? ` · ${b.scheduledTime}` : ""}`} />
      <Card title="방문 전 확인">
        <InfoList
          items={[
            ["주소", b.address],
            ["연락처", b.contactPhone ?? b.patient.phone ?? "-"],
            ["요청 사항", <span key="n" className="whitespace-pre-line">{b.notes ?? "-"}</span>],
            ...(prev?.nextVisitNotes ? ([["직전 방문 참고", <span key="p" className="whitespace-pre-line">{prev.nextVisitNotes}</span>]] as [string, React.ReactNode][]) : []),
          ]}
        />
      </Card>
      {b.visit ? (
        <Card title="방문 기록 (제출 완료)">
          <VisitReport visit={b.visit} />
        </Card>
      ) : writable ? (
        <Card title="방문 기록 작성" description="저장하면 예약이 '방문 완료'로 바뀌고 이용자·보호자가 기록을 볼 수 있어요. 저장 후에는 고칠 수 없으니 확인 후 저장해 주세요.">
          <VisitReportForm bookingId={b.id} />
        </Card>
      ) : (
        <Notice tone="blue">방문일({fmtDay(b.scheduledDate)})이 되면 방문 기록을 쓸 수 있어요.</Notice>
      )}
    </div>
  );
}
