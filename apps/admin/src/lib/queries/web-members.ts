// 홈페이지 회원·서비스 예약·방문 기록 조회 (웹사이트 작업 영역)
import { prisma, type BookingStatus, type Prisma, type WebMemberType } from "@bayada/db";
import { BOOKING_STATUSES, MEMBER_TYPES, dateOnly, kstToday } from "@bayada/shared/member";

const PAGE = 30;

export interface MemberFilter {
  type?: WebMemberType;
  q?: string;
  staff?: boolean;
  withdrawal?: boolean;
}

export function parseMemberFilter(sp: { type?: string; q?: string; staff?: string; withdrawal?: string }): MemberFilter {
  return {
    type: (MEMBER_TYPES as readonly string[]).includes(sp.type ?? "") ? (sp.type as WebMemberType) : undefined,
    q: sp.q?.trim() || undefined,
    staff: sp.staff === "1" || undefined,
    withdrawal: sp.withdrawal === "1" || undefined,
  };
}

export async function listWebMembers(f: MemberFilter, page: number) {
  const where: Prisma.WebMemberProfileWhereInput = {
    ...(f.type ? { memberType: f.type } : {}),
    ...(f.staff ? { isVisitStaff: true } : {}),
    ...(f.withdrawal ? { withdrawalRequestedAt: { not: null }, withdrawnAt: null } : {}),
    ...(f.q
      ? {
          OR: [
            { user: { name: { contains: f.q, mode: "insensitive" } } },
            { user: { email: { contains: f.q.toLowerCase() } } },
            { user: { phone: { contains: f.q } } },
            { orgName: { contains: f.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [rows, total, byType, withdrawals] = await Promise.all([
    prisma.webMemberProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
      select: {
        userId: true,
        memberType: true,
        providerRole: true,
        orgName: true,
        isVisitStaff: true,
        withdrawalRequestedAt: true,
        withdrawnAt: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            emailVerifiedAt: true,
            _count: { select: { bookingsAsPatient: true, bookingsAssigned: true, webInquiries: true } },
          },
        },
      },
    }),
    prisma.webMemberProfile.count({ where }),
    prisma.webMemberProfile.groupBy({ by: ["memberType"], _count: { _all: true } }),
    prisma.webMemberProfile.count({ where: { withdrawalRequestedAt: { not: null }, withdrawnAt: null } }),
  ]);
  const typeCounts = Object.fromEntries(byType.map((g) => [g.memberType, g._count._all])) as Partial<Record<WebMemberType, number>>;
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE)), typeCounts, withdrawals };
}

export async function getWebMember(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
      createdAt: true,
      organization: { select: { name: true } },
      webMemberProfile: true,
      _count: { select: { enrollments: true, certificates: true, healthRecords: true, medications: true } },
      bookingsAsPatient: { orderBy: { scheduledDate: "desc" }, take: 20, select: bookingRowSelect },
      bookingsAssigned: { orderBy: { scheduledDate: "desc" }, take: 20, select: bookingRowSelect },
      familyLinksAsGuardian: { select: { id: true, status: true, relationship: true, createdAt: true, patient: { select: { id: true, name: true, email: true } } } },
      familyLinksAsPatient: { select: { id: true, status: true, relationship: true, createdAt: true, guardian: { select: { id: true, name: true, email: true } } } },
      webInquiries: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, referenceNo: true, formType: true, status: true, createdAt: true } },
    },
  });
}

export const bookingRowSelect = {
  id: true,
  bookingNumber: true,
  serviceType: true,
  scheduledDate: true,
  timeSlot: true,
  scheduledTime: true,
  status: true,
  address: true,
  createdAt: true,
  patient: { select: { id: true, name: true, phone: true } },
  requestedBy: { select: { id: true, name: true } },
  assignedStaff: { select: { id: true, name: true } },
  visit: { select: { id: true, patientCondition: true } },
  rating: { select: { rating: true } },
} as const;

export interface BookingFilter {
  status?: BookingStatus;
  from?: string;
  to?: string;
  q?: string;
  staff?: string;
}

export function parseBookingFilter(sp: { status?: string; from?: string; to?: string; q?: string; staff?: string }): BookingFilter {
  const d = (v?: string) => (v && dateOnly(v) ? v : undefined);
  return {
    status: (BOOKING_STATUSES as readonly string[]).includes(sp.status ?? "") ? (sp.status as BookingStatus) : undefined,
    from: d(sp.from),
    to: d(sp.to),
    q: sp.q?.trim() || undefined,
    staff: sp.staff || undefined,
  };
}

export async function listBookings(f: BookingFilter, page: number) {
  const base: Prisma.BookingWhereInput = {
    ...(f.from || f.to ? { scheduledDate: { ...(f.from ? { gte: dateOnly(f.from)! } : {}), ...(f.to ? { lte: dateOnly(f.to)! } : {}) } } : {}),
    ...(f.staff === "none" ? { assignedStaffId: null } : f.staff ? { assignedStaffId: f.staff } : {}),
    ...(f.q
      ? {
          OR: [
            { bookingNumber: { contains: f.q.toUpperCase() } },
            { patient: { name: { contains: f.q, mode: "insensitive" } } },
            { patient: { phone: { contains: f.q } } },
            { address: { contains: f.q } },
          ],
        }
      : {}),
  };
  const where = { ...base, ...(f.status ? { status: f.status } : {}) };
  // 신청 접수는 방문일 가까운 순(처리 순서), 나머지는 최근 방문일 순
  const orderBy: Prisma.BookingOrderByWithRelationInput[] =
    f.status === "REQUESTED" || f.status === "CONFIRMED" ? [{ scheduledDate: "asc" }, { createdAt: "asc" }] : [{ scheduledDate: "desc" }, { createdAt: "desc" }];
  const [rows, total, byStatus] = await Promise.all([
    prisma.booking.findMany({ where, orderBy, skip: (page - 1) * PAGE, take: PAGE, select: bookingRowSelect }),
    prisma.booking.count({ where }),
    prisma.booking.groupBy({ by: ["status"], where: base, _count: { _all: true } }),
  ]);
  const statusCounts = Object.fromEntries(byStatus.map((g) => [g.status, g._count._all])) as Partial<Record<BookingStatus, number>>;
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE)), statusCounts };
}

export async function getBooking(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    select: {
      ...bookingRowSelect,
      patientId: true,
      contactPhone: true,
      notes: true,
      durationMin: true,
      cancelReason: true,
      confirmedAt: true,
      completedAt: true,
      cancelledAt: true,
      updatedAt: true,
      patient: { select: { id: true, name: true, phone: true, email: true } },
      requestedBy: { select: { id: true, name: true, email: true } },
      events: { orderBy: { createdAt: "desc" }, select: { id: true, kind: true, body: true, internal: true, createdAt: true, actor: { select: { name: true, email: true } } } },
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
          healthRecords: { select: { bloodPressureSys: true, bloodPressureDia: true, bloodSugar: true, temperature: true, heartRate: true, weight: true, hasAlert: true } },
        },
      },
      rating: { select: { rating: true, comment: true, createdAt: true } },
    },
  });
}

/** 배정 가능한 방문 인력 — 어드민이 지정한 제공자 회원(승인 계정, 탈퇴 전) */
export async function listVisitStaff() {
  return prisma.user.findMany({
    where: { status: "APPROVED", webMemberProfile: { memberType: "PROVIDER", isVisitStaff: true, withdrawnAt: null } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, webMemberProfile: { select: { providerRole: true } } },
  });
}

export async function listVisitsAdmin(page: number, condition?: string) {
  const where: Prisma.ServiceVisitWhereInput = condition && ["STABLE", "OBSERVATION", "URGENT"].includes(condition) ? { patientCondition: condition as "STABLE" } : {};
  const [rows, total, avg] = await Promise.all([
    prisma.serviceVisit.findMany({
      where,
      orderBy: { completedAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
      select: {
        id: true,
        startedAt: true,
        completedAt: true,
        patientCondition: true,
        serviceProvided: true,
        patient: { select: { name: true } },
        staff: { select: { name: true } },
        booking: { select: { id: true, bookingNumber: true, serviceType: true, rating: { select: { rating: true } } } },
      },
    }),
    prisma.serviceVisit.count({ where }),
    prisma.serviceRating.aggregate({ _avg: { rating: true }, _count: { _all: true } }),
  ]);
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE)), avgRating: avg._avg.rating, ratingCount: avg._count._all };
}

/** 웹사이트 대시보드 — 예약·회원 숫자 */
export async function getBookingDashboard() {
  const today = dateOnly(kstToday())!;
  const [requested, upcoming, todayCount, urgent, members, withdrawals, rating] = await Promise.all([
    prisma.booking.count({ where: { status: "REQUESTED" } }),
    prisma.booking.count({ where: { status: "CONFIRMED", scheduledDate: { gte: today } } }),
    prisma.booking.count({ where: { status: { in: ["CONFIRMED", "COMPLETED"] }, scheduledDate: today } }),
    prisma.serviceVisit.count({ where: { patientCondition: "URGENT", completedAt: { gte: new Date(Date.now() - 7 * 86400_000) } } }),
    prisma.webMemberProfile.count({ where: { withdrawnAt: null } }),
    prisma.webMemberProfile.count({ where: { withdrawalRequestedAt: { not: null }, withdrawnAt: null } }),
    prisma.serviceRating.aggregate({ _avg: { rating: true } }),
  ]);
  return { requested, upcoming, today: todayCount, urgent, members, withdrawals, avgRating: rating._avg.rating };
}
