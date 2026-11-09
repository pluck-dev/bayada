// 마이페이지 읽기 — 화면별 조회. 접근 권한(본인·승인된 보호자)은 호출하는 페이지가 canViewPatient 로 먼저 확인한다.
import { prisma } from "@bayada/db";
import { dateOnly, kstToday } from "@bayada/shared/member";

export const bookingListSelect = {
  id: true,
  bookingNumber: true,
  serviceType: true,
  scheduledDate: true,
  timeSlot: true,
  scheduledTime: true,
  status: true,
  address: true,
  createdAt: true,
  patient: { select: { id: true, name: true } },
  assignedStaff: { select: { name: true } },
  visit: { select: { id: true } },
  rating: { select: { rating: true } },
} as const;

/** 회원이 볼 수 있는 예약 — 본인이 받는 예약 + 내가 신청한 예약 + 연결된 가족의 예약 */
export async function listMemberBookings(memberId: string, patientIds: string[]) {
  return prisma.booking.findMany({
    where: { OR: [{ patientId: { in: [memberId, ...patientIds] } }, { requestedById: memberId }] },
    orderBy: [{ scheduledDate: "desc" }, { createdAt: "desc" }],
    take: 200,
    select: bookingListSelect,
  });
}

export async function getBookingDetail(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    select: {
      ...bookingListSelect,
      patientId: true,
      requestedById: true,
      contactPhone: true,
      notes: true,
      cancelReason: true,
      requestedBy: { select: { id: true, name: true } },
      assignedStaff: { select: { name: true, webMemberProfile: { select: { providerRole: true } } } },
      events: { where: { internal: false }, orderBy: { createdAt: "desc" }, select: { id: true, kind: true, body: true, createdAt: true } },
      visit: {
        select: {
          id: true,
          startedAt: true,
          completedAt: true,
          serviceProvided: true,
          patientCondition: true,
          notes: true,
          nextVisitNotes: true,
          staff: { select: { name: true } },
          healthRecords: { select: { bloodPressureSys: true, bloodPressureDia: true, bloodSugar: true, temperature: true, heartRate: true, weight: true } },
        },
      },
      rating: { select: { rating: true, comment: true, createdAt: true } },
    },
  });
}

export async function listHealthRecords(patientId: string, days = 90) {
  return prisma.healthRecord.findMany({
    where: { patientId, recordedAt: { gte: new Date(Date.now() - days * 86400_000) } },
    orderBy: { recordedAt: "desc" },
    take: 300,
    select: {
      id: true,
      source: true,
      bloodPressureSys: true,
      bloodPressureDia: true,
      bloodSugar: true,
      temperature: true,
      heartRate: true,
      weight: true,
      notes: true,
      hasAlert: true,
      alertType: true,
      recordedAt: true,
      recordedBy: { select: { name: true } },
    },
  });
}
export type HealthRow = Awaited<ReturnType<typeof listHealthRecords>>[number];

/** 오늘(KST) 복약 현황 — 활성 + 기간 안의 약, 시각별 체크 */
export async function todayMedications(patientId: string) {
  const today = dateOnly(kstToday())!;
  const meds = await prisma.medication.findMany({
    where: { patientId },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      dosage: true,
      timeSlots: true,
      startDate: true,
      endDate: true,
      instructions: true,
      prescribedBy: true,
      isActive: true,
      logs: { where: { scheduledDate: today }, select: { scheduledTime: true, isTaken: true, takenAt: true } },
    },
  });
  const inPeriod = (m: (typeof meds)[number]) => m.isActive && m.startDate <= today && (!m.endDate || m.endDate >= today);
  const due = meds.filter(inPeriod);
  const total = due.reduce((n, m) => n + m.timeSlots.length, 0);
  const taken = due.reduce((n, m) => n + m.logs.filter((l) => l.isTaken && m.timeSlots.includes(l.scheduledTime)).length, 0);
  return { meds, due, total, taken, inPeriod };
}

/** 최근 7일 복약 순응도 (체크한 횟수 / 예정 횟수) */
export async function weeklyAdherence(patientId: string) {
  const today = dateOnly(kstToday())!;
  const from = new Date(today.getTime() - 6 * 86400_000);
  const meds = await prisma.medication.findMany({
    where: { patientId, isActive: true },
    select: { timeSlots: true, startDate: true, endDate: true, logs: { where: { scheduledDate: { gte: from, lte: today }, isTaken: true }, select: { id: true } } },
  });
  let planned = 0;
  let taken = 0;
  for (const m of meds) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(from.getTime() + i * 86400_000);
      if (m.startDate <= d && (!m.endDate || m.endDate >= d)) planned += m.timeSlots.length;
    }
    taken += m.logs.length;
  }
  return planned ? Math.min(100, Math.round((taken / planned) * 100)) : null;
}

export async function listVisits(patientIds: string[]) {
  return prisma.serviceVisit.findMany({
    where: { patientId: { in: patientIds } },
    orderBy: { completedAt: "desc" },
    take: 100,
    select: {
      id: true,
      startedAt: true,
      completedAt: true,
      serviceProvided: true,
      patientCondition: true,
      notes: true,
      nextVisitNotes: true,
      staff: { select: { name: true } },
      patient: { select: { id: true, name: true } },
      booking: { select: { id: true, bookingNumber: true, serviceType: true, rating: { select: { rating: true } } } },
    },
  });
}

/** 내 문의 — 로그인 중 접수(userId) + 인증된 같은 이메일로 비로그인 때 접수한 건 */
export async function listMemberInquiries(member: { id: string; email: string; emailVerifiedAt: Date | null }, formTypes?: string[]) {
  return prisma.webInquiry.findMany({
    where: {
      AND: [
        member.emailVerifiedAt ? { OR: [{ userId: member.id }, { userId: null, email: member.email }] } : { userId: member.id },
        { status: { not: "SPAM" } },
        ...(formTypes ? [{ formType: { in: formTypes } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      referenceNo: true,
      formType: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      payload: true,
      // 회원에게는 상태 변경 이력만 (내부 메모·담당자 변경은 숨김)
      notes: { where: { kind: "status" }, orderBy: { createdAt: "desc" }, select: { id: true, body: true, createdAt: true } },
    },
  });
}

/** 아카데미 교육 현황 — 같은 계정의 수강·수료·바야다 인증 */
export async function academySummary(userId: string) {
  const [enrollments, certificates, credentials, applications] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, progressPercent: true, completedAt: true, createdAt: true, course: { select: { title: true, slug: true } } },
    }),
    prisma.certificate.findMany({ where: { userId }, orderBy: { issuedAt: "desc" }, take: 20, select: { id: true, number: true, issuedAt: true, course: { select: { title: true } } } }),
    prisma.credential.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      take: 10,
      select: { id: true, number: true, issuedAt: true, expiresAt: true, revokedAt: true, program: { select: { title: true } } },
    }),
    prisma.credentialApplication.findMany({
      where: { userId, status: { in: ["SUBMITTED", "EVALUATING", "EVALUATED"] } },
      select: { id: true, status: true, program: { select: { title: true } } },
    }),
  ]);
  return { enrollments, certificates, credentials, applications };
}
