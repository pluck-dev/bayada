"use server";

// 마이페이지 서버 액션 — 매번 로그인·회원 유형·대상 이용자 접근 권한을 서버에서 다시 확인한다(화면 상태를 믿지 않는다).
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma, type Prisma } from "@bayada/db";
import { sendVerificationEmail, lastVerificationSentAt } from "@bayada/services/account";
import { verifyPassword } from "@bayada/shared/password";
import { passwordError } from "@bayada/shared/password-policy";
import { kstDate } from "@bayada/shared/web-content";
import {
  BOOKING_MAX_DAYS_AHEAD,
  FAMILY_RELATIONSHIPS,
  ORG_TYPES,
  PROVIDER_ROLES,
  VISIT_CONDITIONS,
  VISIT_SERVICE_ITEMS,
  dateOnly,
  digitsOnly,
  healthAlert,
  healthRangeError,
  isBookableService,
  isMemberType,
  isTimeSlot,
  kstToday,
  memberCanCancel,
  memberCanChange,
  serviceName,
  TIME_SLOT_SHORT,
  type HealthValues,
  type VisitConditionKey,
} from "@bayada/shared/member";
import { appUrl, localeOr } from "@/lib/app-url";
import { canViewPatient, getMember, type Member } from "./session";

export type Result = { ok: true; message?: string } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });
class MemberError extends Error {}

async function run(fn: (m: Member) => Promise<string | void>, opts?: { needProfile?: boolean }): Promise<Result> {
  const m = await getMember();
  if (!m) return fail("로그인이 필요해요. 다시 로그인해 주세요.");
  if (opts?.needProfile !== false && !m.webMemberProfile) return fail("회원 유형을 먼저 선택해 주세요.");
  try {
    const message = await fn(m);
    revalidatePath("/[locale]/my-page", "layout");
    return { ok: true, message: message || undefined };
  } catch (e) {
    if (e instanceof MemberError) return fail(e.message);
    console.error("[my-page]", e);
    return fail("처리하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}

const str = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const need = (v: unknown, label: string, max = 200) => {
  const s = str(v, max);
  if (!s) throw new MemberError(`${label}을(를) 입력해 주세요.`);
  return s;
};
const PHONE_RE = /^[0-9-]{9,13}$/;

// ─── 온보딩·프로필·설정 ───

export async function completeOnboarding(input: { memberType: string; providerRole?: string; orgName?: string; orgType?: string; phone?: string }) {
  return run(
    async (m) => {
      if (m.webMemberProfile) return "이미 회원 유형이 정해져 있어요.";
      if (!isMemberType(input.memberType)) throw new MemberError("회원 유형을 선택해 주세요.");
      const providerRole = input.memberType === "PROVIDER" ? str(input.providerRole, 30) : null;
      if (input.memberType === "PROVIDER" && !(providerRole && (PROVIDER_ROLES as readonly string[]).includes(providerRole))) throw new MemberError("직군을 선택해 주세요.");
      const orgName = input.memberType === "ORGANIZATION" ? str(input.orgName, 100) : null;
      const orgType = input.memberType === "ORGANIZATION" ? str(input.orgType, 30) : null;
      if (input.memberType === "ORGANIZATION" && (!orgName || !orgType || !(ORG_TYPES as readonly string[]).includes(orgType))) throw new MemberError("기관명과 기관 유형을 입력해 주세요.");
      const phone = str(input.phone, 20);
      if (!m.phone && !(phone && PHONE_RE.test(phone))) throw new MemberError("휴대폰 번호를 입력해 주세요.");
      await prisma.$transaction([
        prisma.webMemberProfile.create({ data: { userId: m.id, memberType: input.memberType, providerRole, orgName, orgType } }),
        ...(phone && !m.phone ? [prisma.user.update({ where: { id: m.id }, data: { phone } })] : []),
      ]);
      return "환영해요! 마이페이지를 준비했어요.";
    },
    { needProfile: false },
  );
}

export async function updateProfile(input: { name: string; phone: string; address?: string; providerRole?: string; orgName?: string; orgType?: string }) {
  return run(async (m) => {
    const p = m.webMemberProfile!;
    const name = need(input.name, "이름", 50);
    const phone = need(input.phone, "휴대폰 번호", 20);
    if (!PHONE_RE.test(phone)) throw new MemberError("휴대폰 번호를 확인해 주세요.");
    const data: Prisma.WebMemberProfileUpdateInput = { address: str(input.address, 200) };
    if (p.memberType === "PROVIDER") {
      const r = str(input.providerRole, 30);
      if (!r || !(PROVIDER_ROLES as readonly string[]).includes(r)) throw new MemberError("직군을 선택해 주세요.");
      data.providerRole = r;
    }
    if (p.memberType === "ORGANIZATION") {
      data.orgName = need(input.orgName, "기관명", 100);
      const t = str(input.orgType, 30);
      if (!t || !(ORG_TYPES as readonly string[]).includes(t)) throw new MemberError("기관 유형을 선택해 주세요.");
      data.orgType = t;
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: m.id }, data: { name, phone } }),
      prisma.webMemberProfile.update({ where: { userId: m.id }, data }),
    ]);
    return "회원 정보를 저장했어요.";
  });
}

export async function updateNotifications(input: { emailOptIn: boolean; smsOptIn: boolean }) {
  return run(async (m) => {
    await prisma.webMemberProfile.update({
      where: { userId: m.id },
      data: { emailOptIn: input.emailOptIn === true, smsOptIn: input.smsOptIn === true, marketingConsentAt: new Date() },
    });
    return "알림 수신 설정을 저장했어요.";
  });
}

export async function changePassword(input: { current: string; next: string }) {
  return run(async (m) => {
    const row = await prisma.user.findUniqueOrThrow({ where: { id: m.id }, select: { password: true } });
    const { valid } = await verifyPassword(String(input.current ?? ""), row.password);
    if (!valid) throw new MemberError("현재 비밀번호가 맞지 않아요.");
    const err = passwordError(String(input.next ?? ""));
    if (err) throw new MemberError(err);
    if (input.current === input.next) throw new MemberError("지금과 다른 비밀번호를 입력해 주세요.");
    // passwordChangedAt → 이 세션을 포함한 모든 기존 로그인(홈페이지·아카데미)이 끊긴다
    await prisma.user.update({ where: { id: m.id }, data: { password: await hash(input.next, 12), passwordChangedAt: new Date() } });
    return "비밀번호를 바꿨어요. 새 비밀번호로 다시 로그인해 주세요.";
  });
}

export async function requestWithdrawal(reason: string) {
  return run(async (m) => {
    if (m.webMemberProfile?.withdrawalRequestedAt) return "이미 탈퇴를 요청했어요.";
    await prisma.webMemberProfile.update({
      where: { userId: m.id },
      data: { withdrawalRequestedAt: new Date(), withdrawalReason: str(reason, 500) },
    });
    return "탈퇴 요청을 접수했어요. 진행 중인 예약을 확인한 뒤 처리 결과를 이메일로 안내해 드려요.";
  });
}

export async function cancelWithdrawal() {
  return run(async (m) => {
    await prisma.webMemberProfile.update({ where: { userId: m.id }, data: { withdrawalRequestedAt: null, withdrawalReason: null } });
    return "탈퇴 요청을 취소했어요.";
  });
}

export async function resendVerification(locale: string) {
  return run(
    async (m) => {
      if (m.emailVerifiedAt) return "이미 인증된 이메일이에요.";
      const last = await lastVerificationSentAt(m.id);
      if (last && Date.now() - last.getTime() < 60_000) throw new MemberError("1분 뒤에 다시 보낼 수 있어요.");
      const loc = localeOr(locale);
      await sendVerificationEmail(m.id, (token) => appUrl(`/${loc}/auth/verify-email?token=${encodeURIComponent(token)}`));
      return `${m.email} 로 인증 메일을 보냈어요.`;
    },
    { needProfile: false },
  );
}

// ─── 서비스 예약 ───

async function nextBookingNumber(tx: Prisma.TransactionClient): Promise<string> {
  const head = `BK-${kstDate(new Date()).replace(/-/g, "")}-`;
  const last = await tx.booking.findFirst({ where: { bookingNumber: { startsWith: head } }, orderBy: { bookingNumber: "desc" }, select: { bookingNumber: true } });
  const seq = last ? Number(last.bookingNumber.slice(head.length)) + 1 : 1;
  return `${head}${String(seq).padStart(3, "0")}`;
}

function parseBookingInput(input: BookingInput) {
  if (!isBookableService(input.serviceType)) throw new MemberError("서비스를 선택해 주세요.");
  if (!isTimeSlot(input.timeSlot)) throw new MemberError("희망 시간대를 선택해 주세요.");
  const date = dateOnly(String(input.date ?? ""));
  if (!date) throw new MemberError("희망 방문일을 선택해 주세요.");
  const today = kstToday();
  const max = kstDate(new Date(Date.now() + BOOKING_MAX_DAYS_AHEAD * 86400_000));
  const day = date.toISOString().slice(0, 10);
  if (day <= today) throw new MemberError("희망 방문일은 내일부터 고를 수 있어요.");
  if (day > max) throw new MemberError(`희망 방문일은 ${BOOKING_MAX_DAYS_AHEAD}일 안에서 골라 주세요.`);
  const address = need(input.address, "방문 주소", 200);
  const contactPhone = str(input.contactPhone, 20);
  if (contactPhone && !PHONE_RE.test(contactPhone)) throw new MemberError("연락처를 확인해 주세요.");
  return { serviceType: input.serviceType, timeSlot: input.timeSlot, scheduledDate: date, address, contactPhone, notes: str(input.notes, 1000) };
}

export interface BookingInput {
  patientId?: string;
  serviceType: string;
  date: string;
  timeSlot: string;
  address: string;
  contactPhone?: string;
  notes?: string;
}

export async function createBooking(input: BookingInput): Promise<Result & { id?: string }> {
  let id: string | undefined;
  const res = await run(async (m) => {
    const type = m.webMemberProfile!.memberType;
    if (type !== "SERVICE_USER" && type !== "GUARDIAN") throw new MemberError("서비스 이용자·보호자 회원만 예약할 수 있어요.");
    const patientId = type === "SERVICE_USER" ? m.id : String(input.patientId ?? "");
    if (type === "GUARDIAN" && (!patientId || patientId === m.id || !(await canViewPatient(m.id, patientId)))) {
      throw new MemberError("연결된 가족을 선택해 주세요. 가족 연결이 승인되어야 대신 예약할 수 있어요.");
    }
    const data = parseBookingInput(input);
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const b = await prisma.$transaction(async (tx) => {
          const bookingNumber = await nextBookingNumber(tx);
          return tx.booking.create({
            data: {
              ...data,
              bookingNumber,
              patientId,
              requestedById: m.id,
              events: { create: { kind: "requested", actorId: m.id, body: `${serviceName(data.serviceType)} · ${kstDayLabel(data.scheduledDate)} ${TIME_SLOT_SHORT[data.timeSlot]} 방문 신청` } },
            },
            select: { id: true, bookingNumber: true },
          });
        });
        id = b.id;
        return `예약 신청을 접수했어요 (${b.bookingNumber}). 담당자가 확인 후 확정 안내를 드려요.`;
      } catch (e) {
        if ((e as { code?: string }).code !== "P2002") throw e;
      }
    }
    throw new MemberError("잠시 후 다시 시도해 주세요.");
  });
  return { ...res, id };
}

const kstDayLabel = (d: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", month: "long", day: "numeric", weekday: "short" }).format(d);

/** 예약 변경·취소·평가 대상 — 본인(이용자)·신청자·승인된 보호자만 */
async function loadOwnBooking(m: Member, id: string) {
  const b = await prisma.booking.findUnique({
    where: { id },
    select: { id: true, bookingNumber: true, status: true, patientId: true, requestedById: true, scheduledDate: true, timeSlot: true, scheduledTime: true, visit: { select: { id: true } }, rating: { select: { id: true } } },
  });
  if (!b || !(b.requestedById === m.id || (await canViewPatient(m.id, b.patientId)))) throw new MemberError("예약을 찾을 수 없어요.");
  return b;
}

export async function updateBooking(id: string, input: BookingInput) {
  return run(async (m) => {
    const b = await loadOwnBooking(m, id);
    if (!memberCanChange(b.status)) throw new MemberError("확정된 예약은 변경할 수 없어요. 취소 후 다시 신청하거나 고객센터로 연락해 주세요.");
    const data = parseBookingInput(input);
    const changed = await prisma.booking.updateMany({ where: { id, status: "REQUESTED" }, data });
    if (changed.count !== 1) throw new MemberError("그 사이 예약이 확정됐어요. 새로고침해 주세요.");
    await prisma.bookingEvent.create({
      data: { bookingId: id, actorId: m.id, kind: "changed", body: `신청 내용 변경 → ${serviceName(data.serviceType)} · ${kstDayLabel(data.scheduledDate)} ${TIME_SLOT_SHORT[data.timeSlot]}` },
    });
    return "예약 신청 내용을 바꿨어요.";
  });
}

export async function cancelBooking(id: string, reason: string) {
  return run(async (m) => {
    const b = await loadOwnBooking(m, id);
    if (!memberCanCancel({ ...b, timeSlot: b.timeSlot })) {
      throw new MemberError(b.status === "CONFIRMED" ? "방문 24시간 전부터는 온라인으로 취소할 수 없어요. 고객센터(1670-1379)로 연락해 주세요." : "취소할 수 없는 예약이에요.");
    }
    const why = str(reason, 300) ?? "회원 취소";
    const changed = await prisma.booking.updateMany({
      where: { id, status: { in: ["REQUESTED", "CONFIRMED"] } },
      data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: why },
    });
    if (changed.count !== 1) throw new MemberError("이미 처리된 예약이에요. 새로고침해 주세요.");
    await prisma.bookingEvent.create({ data: { bookingId: id, actorId: m.id, kind: "cancelled", body: `회원 취소 · ${why}` } });
    return `${b.bookingNumber} 예약을 취소했어요.`;
  });
}

export async function rateBooking(id: string, rating: number, comment: string) {
  return run(async (m) => {
    const b = await loadOwnBooking(m, id);
    if (b.status !== "COMPLETED" || !b.visit) throw new MemberError("방문이 끝난 예약만 평가할 수 있어요.");
    if (b.rating) throw new MemberError("이미 평가를 남겼어요.");
    const r = Math.round(Number(rating));
    if (!(r >= 1 && r <= 5)) throw new MemberError("별점을 선택해 주세요.");
    await prisma.serviceRating.create({ data: { bookingId: id, userId: m.id, rating: r, comment: str(comment, 1000) } });
    return "소중한 평가 감사합니다.";
  });
}

// ─── 건강 기록 (이용자 본인 입력) ───

function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function parseVitals(input: Record<string, unknown>): HealthValues {
  const v: HealthValues = {
    bloodPressureSys: num(input.bloodPressureSys),
    bloodPressureDia: num(input.bloodPressureDia),
    bloodSugar: num(input.bloodSugar),
    temperature: num(input.temperature),
    heartRate: num(input.heartRate),
    weight: num(input.weight),
  };
  for (const k of Object.keys(v) as (keyof HealthValues)[]) if (v[k] === undefined) delete v[k];
  return v;
}

export async function addHealthRecord(input: Record<string, unknown> & { recordedAt?: string; notes?: string }) {
  return run(async (m) => {
    if (m.webMemberProfile!.memberType !== "SERVICE_USER") throw new MemberError("건강 기록은 서비스 이용자 본인만 입력해요.");
    const v = parseVitals(input);
    const err = healthRangeError(v);
    if (err) throw new MemberError(err);
    const at = typeof input.recordedAt === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input.recordedAt) ? new Date(`${input.recordedAt}:00+09:00`) : new Date();
    if (Number.isNaN(at.getTime()) || at.getTime() > Date.now() + 5 * 60_000) throw new MemberError("측정 시각을 확인해 주세요.");
    const alert = healthAlert(v);
    await prisma.healthRecord.create({
      data: {
        patientId: m.id,
        recordedById: m.id,
        source: "SELF",
        ...v,
        bloodPressureSys: v.bloodPressureSys !== undefined ? Math.round(v.bloodPressureSys) : undefined,
        bloodPressureDia: v.bloodPressureDia !== undefined ? Math.round(v.bloodPressureDia) : undefined,
        heartRate: v.heartRate !== undefined ? Math.round(v.heartRate) : undefined,
        notes: str(input.notes, 500),
        hasAlert: !!alert,
        alertType: alert?.type ?? null,
        recordedAt: at,
      },
    });
    if (alert?.type === "URGENT") return `기록했어요. ${alert.reasons.join(", ")} — 증상이 있으면 바로 의료기관에 연락하거나 119 에 도움을 요청하세요.`;
    if (alert) return `기록했어요. ${alert.reasons.join(", ")} — 상태를 지켜봐 주세요.`;
    return "건강 기록을 저장했어요.";
  });
}

export async function deleteHealthRecord(id: string) {
  return run(async (m) => {
    const r = await prisma.healthRecord.deleteMany({ where: { id, patientId: m.id, source: "SELF" } });
    if (r.count !== 1) throw new MemberError("내가 입력한 기록만 지울 수 있어요.");
    return "기록을 지웠어요.";
  });
}

// ─── 복약 ───

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function addMedication(input: { name: string; dosage: string; times: string[]; startDate: string; endDate?: string; instructions?: string; prescribedBy?: string }) {
  return run(async (m) => {
    if (m.webMemberProfile!.memberType !== "SERVICE_USER") throw new MemberError("복약 관리는 서비스 이용자 본인만 등록해요.");
    const name = need(input.name, "약 이름", 100);
    const dosage = need(input.dosage, "용량", 50);
    const times = [...new Set((input.times ?? []).filter((t) => TIME_RE.test(t)))].sort();
    if (times.length === 0) throw new MemberError("복용 시각을 하나 이상 골라 주세요.");
    if (times.length > 6) throw new MemberError("복용 시각은 6개까지예요.");
    const start = dateOnly(String(input.startDate ?? ""));
    if (!start) throw new MemberError("복용 시작일을 골라 주세요.");
    const end = input.endDate ? dateOnly(input.endDate) : null;
    if (input.endDate && !end) throw new MemberError("종료일을 확인해 주세요.");
    if (end && end < start) throw new MemberError("종료일은 시작일 이후여야 해요.");
    await prisma.medication.create({
      data: {
        patientId: m.id,
        createdById: m.id,
        name,
        dosage,
        timeSlots: times,
        startDate: start,
        endDate: end,
        instructions: str(input.instructions, 500),
        prescribedBy: str(input.prescribedBy, 100),
      },
    });
    return `${name} 을(를) 복약 목록에 추가했어요.`;
  });
}

export async function setMedicationActive(id: string, active: boolean) {
  return run(async (m) => {
    const r = await prisma.medication.updateMany({ where: { id, patientId: m.id }, data: { isActive: active } });
    if (r.count !== 1) throw new MemberError("약을 찾을 수 없어요.");
    return active ? "복용을 다시 시작했어요." : "복용을 중단했어요. 기록은 남아 있어요.";
  });
}

export async function deleteMedication(id: string) {
  return run(async (m) => {
    const r = await prisma.medication.deleteMany({ where: { id, patientId: m.id } });
    if (r.count !== 1) throw new MemberError("약을 찾을 수 없어요.");
    return "약과 복용 기록을 지웠어요.";
  });
}

/** 오늘(KST) 복용 체크 — 이용자 본인만. 미래 시각도 체크 가능(미리 먹은 경우), 지난 날짜는 못 바꾼다 */
export async function checkMedication(medicationId: string, time: string, taken: boolean) {
  return run(async (m) => {
    const med = await prisma.medication.findFirst({ where: { id: medicationId, patientId: m.id, isActive: true }, select: { id: true, timeSlots: true } });
    if (!med || !med.timeSlots.includes(time)) throw new MemberError("복용 일정을 찾을 수 없어요.");
    const day = dateOnly(kstToday())!;
    await prisma.medicationLog.upsert({
      where: { medicationId_scheduledDate_scheduledTime: { medicationId, scheduledDate: day, scheduledTime: time } },
      create: { medicationId, scheduledDate: day, scheduledTime: time, isTaken: taken, takenAt: taken ? new Date() : null, checkedById: m.id },
      update: { isTaken: taken, takenAt: taken ? new Date() : null, checkedById: m.id },
    });
  });
}

// ─── 가족 연결 ───

export async function requestFamilyLink(input: { contact: string; relationship: string }) {
  return run(async (m) => {
    if (m.webMemberProfile!.memberType !== "GUARDIAN") throw new MemberError("보호자 회원만 가족 연결을 요청할 수 있어요.");
    const contact = need(input.contact, "가족의 이메일 또는 휴대폰 번호", 100);
    const relationship = str(input.relationship, 20);
    if (!relationship || !(FAMILY_RELATIONSHIPS as readonly string[]).includes(relationship)) throw new MemberError("관계를 선택해 주세요.");
    const isEmail = contact.includes("@");
    const digits = digitsOnly(contact);
    if (!isEmail && digits.length < 9) throw new MemberError("이메일 또는 휴대폰 번호를 확인해 주세요.");
    // 휴대폰은 하이픈 표기가 섞여 있어 숫자만 비교
    const target = isEmail
      ? await prisma.user.findFirst({
          where: { email: contact.toLowerCase(), status: "APPROVED", webMemberProfile: { memberType: "SERVICE_USER" } },
          select: { id: true },
        })
      : (
          await prisma.$queryRaw<{ id: string }[]>`
            SELECT u.id FROM "User" u JOIN "WebMemberProfile" p ON p."userId" = u.id
            WHERE u.status = 'APPROVED' AND p."memberType" = 'SERVICE_USER'
              AND regexp_replace(coalesce(u.phone, ''), '\\D', '', 'g') = ${digits}
            LIMIT 1`
        )[0];
    // 계정 존재 여부를 드러내지 않도록 결과와 관계없이 같은 안내
    const same = "요청을 보냈어요. 입력한 정보와 일치하는 이용자 회원이 있으면 그분의 마이페이지에 승인 요청이 표시돼요.";
    if (!target || target.id === m.id) return same;
    const existing = await prisma.familyLink.findUnique({ where: { guardianId_patientId: { guardianId: m.id, patientId: target.id } } });
    if (existing?.status === "APPROVED") return "이미 연결된 가족이에요.";
    if (existing) {
      await prisma.familyLink.update({ where: { id: existing.id }, data: { status: "PENDING", relationship, requestedContact: contact, respondedAt: null } });
    } else {
      await prisma.familyLink.create({ data: { guardianId: m.id, patientId: target.id, relationship, requestedContact: contact } });
    }
    return same;
  });
}

export async function respondFamilyLink(id: string, approve: boolean) {
  return run(async (m) => {
    const r = await prisma.familyLink.updateMany({
      where: { id, patientId: m.id, status: "PENDING" },
      data: { status: approve ? "APPROVED" : "REJECTED", respondedAt: new Date() },
    });
    if (r.count !== 1) throw new MemberError("이미 처리된 요청이에요.");
    return approve ? "연결을 승인했어요. 보호자가 내 예약·건강·복약·방문 기록을 볼 수 있어요." : "요청을 거절했어요.";
  });
}

/** 연결 해제 — 보호자·이용자 어느 쪽이든 */
export async function revokeFamilyLink(id: string) {
  return run(async (m) => {
    const r = await prisma.familyLink.updateMany({
      where: { id, status: { in: ["APPROVED", "PENDING"] }, OR: [{ guardianId: m.id }, { patientId: m.id }] },
      data: { status: "REVOKED", respondedAt: new Date() },
    });
    if (r.count !== 1) throw new MemberError("연결을 찾을 수 없어요.");
    return "연결을 해제했어요.";
  });
}

// ─── 제공자: 방문 기록 작성 ───

export interface VisitInput {
  startedAt: string; // HH:mm (방문일 기준)
  completedAt: string;
  serviceProvided: string[];
  patientCondition: string;
  notes: string;
  nextVisitNotes?: string;
  vitals?: Record<string, unknown>;
}

export async function submitVisitReport(bookingId: string, input: VisitInput) {
  return run(async (m) => {
    const p = m.webMemberProfile!;
    if (p.memberType !== "PROVIDER" || !p.isVisitStaff) throw new MemberError("방문 인력으로 지정된 제공자만 방문 기록을 쓸 수 있어요.");
    const b = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true, assignedStaffId: true, patientId: true, scheduledDate: true, visit: { select: { id: true } } },
    });
    if (!b || b.assignedStaffId !== m.id) throw new MemberError("나에게 배정된 예약이 아니에요.");
    if (b.visit || b.status === "COMPLETED") throw new MemberError("이미 방문 기록이 있어요.");
    if (b.status !== "CONFIRMED") throw new MemberError("확정된 예약만 방문 기록을 쓸 수 있어요.");
    const day = b.scheduledDate.toISOString().slice(0, 10);
    if (day > kstToday()) throw new MemberError("방문일이 지나야 기록을 쓸 수 있어요.");
    if (!TIME_RE.test(input.startedAt) || !TIME_RE.test(input.completedAt)) throw new MemberError("방문 시작·종료 시각을 골라 주세요.");
    if (input.completedAt <= input.startedAt) throw new MemberError("종료 시각은 시작 시각 뒤여야 해요.");
    const services = (input.serviceProvided ?? []).filter((s) => (VISIT_SERVICE_ITEMS as readonly string[]).includes(s));
    if (services.length === 0) throw new MemberError("제공한 서비스를 하나 이상 골라 주세요.");
    if (!(VISIT_CONDITIONS as readonly string[]).includes(input.patientCondition)) throw new MemberError("이용자 상태를 골라 주세요.");
    const notes = need(input.notes, "방문 기록", 3000);
    const vitals = parseVitals(input.vitals ?? {});
    const hasVitals = Object.keys(vitals).length > 0;
    if (hasVitals) {
      const err = healthRangeError(vitals);
      if (err) throw new MemberError(err);
    }
    const startedAt = new Date(`${day}T${input.startedAt}:00+09:00`);
    const completedAt = new Date(`${day}T${input.completedAt}:00+09:00`);
    const condition = input.patientCondition as VisitConditionKey;
    const alert = hasVitals ? healthAlert(vitals) : null;

    await prisma.$transaction(async (tx) => {
      const moved = await tx.booking.updateMany({
        where: { id: bookingId, status: "CONFIRMED", assignedStaffId: m.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      if (moved.count !== 1) throw new MemberError("예약 상태가 바뀌었어요. 새로고침해 주세요.");
      const visit = await tx.serviceVisit.create({
        data: {
          bookingId,
          patientId: b.patientId,
          staffId: m.id,
          startedAt,
          completedAt,
          serviceProvided: services,
          patientCondition: condition,
          notes,
          nextVisitNotes: str(input.nextVisitNotes, 2000),
        },
      });
      // 활력징후를 적으면 이용자 건강 기록에도 남긴다(방문 인력 기록)
      if (hasVitals) {
        await tx.healthRecord.create({
          data: {
            patientId: b.patientId,
            recordedById: m.id,
            source: "STAFF",
            visitId: visit.id,
            ...vitals,
            bloodPressureSys: vitals.bloodPressureSys !== undefined ? Math.round(vitals.bloodPressureSys) : undefined,
            bloodPressureDia: vitals.bloodPressureDia !== undefined ? Math.round(vitals.bloodPressureDia) : undefined,
            heartRate: vitals.heartRate !== undefined ? Math.round(vitals.heartRate) : undefined,
            hasAlert: !!alert,
            alertType: alert?.type ?? null,
            recordedAt: completedAt,
          },
        });
      }
      await tx.bookingEvent.create({
        data: { bookingId, actorId: m.id, kind: "completed", body: `방문 완료 · 방문 기록 등록 (이용자 상태: ${condition === "STABLE" ? "안정" : condition === "OBSERVATION" ? "관찰 필요" : "긴급"})` },
      });
    });
    return "방문 기록을 저장했어요. 이용자와 보호자가 마이페이지에서 볼 수 있어요.";
  });
}
