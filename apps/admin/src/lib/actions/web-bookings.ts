"use server";

// 홈페이지 서비스 예약 처리 — 확정·담당자 배정·일정 조정·완료·취소·내부 메모.
// 상태 전이는 updateMany(where status in 기대 상태) count=1 로만 (동시 처리 이중 반영 방지). 전이마다 BookingEvent(회원 타임라인) + AuditLog.
import { revalidatePath } from "next/cache";
import { prisma, type BookingStatus, type TimeSlot } from "@bayada/db";
import { TIME_SLOT_SHORT, dateOnly, isTimeSlot, serviceName } from "@bayada/shared/member";
import { listVisitStaff } from "../queries/web-members";
import { ActionError, audit, runAction } from "../session";

const PERM = "web.bookings" as const;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const dayLabel = (d: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", month: "long", day: "numeric", weekday: "short" }).format(d);

function done(id: string) {
  revalidatePath("/[locale]/(dashboard)/web", "layout");
  revalidatePath(`/[locale]/(dashboard)/web/bookings/${id}`, "page");
}

async function load(id: string) {
  const b = await prisma.booking.findUnique({
    where: { id },
    select: { id: true, bookingNumber: true, status: true, assignedStaffId: true, scheduledDate: true, timeSlot: true, scheduledTime: true, serviceType: true },
  });
  if (!b) throw new ActionError("예약을 찾을 수 없습니다.");
  return b;
}

async function transition(id: string, from: BookingStatus[], data: Parameters<typeof prisma.booking.updateMany>[0]["data"]) {
  const r = await prisma.booking.updateMany({ where: { id, status: { in: from } }, data });
  if (r.count !== 1) throw new ActionError("그 사이 예약 상태가 바뀌었습니다. 새로고침 후 다시 시도하세요.");
}

export interface ScheduleInput {
  staffId: string;
  date: string;
  timeSlot: string;
  scheduledTime?: string;
}

async function parseSchedule(input: ScheduleInput) {
  const staff = (await listVisitStaff()).find((s) => s.id === input.staffId);
  if (!staff) throw new ActionError("담당자를 고르세요. 목록은 '홈페이지 회원'에서 방문 인력으로 지정한 제공자입니다.");
  const date = dateOnly(input.date);
  if (!date) throw new ActionError("방문일을 고르세요.");
  if (!isTimeSlot(input.timeSlot)) throw new ActionError("시간대를 고르세요.");
  const time = input.scheduledTime?.trim() || null;
  if (time && !TIME_RE.test(time)) throw new ActionError("방문 시각 형식이 올바르지 않습니다 (HH:mm).");
  return { staff, date, timeSlot: input.timeSlot as TimeSlot, scheduledTime: time };
}

/** 신청 접수 → 확정 (담당자·방문 시각 지정). 회원과 통화해 날짜·시간대를 조정했으면 같이 바꾼다 */
export async function confirmBooking(id: string, input: ScheduleInput) {
  return runAction(PERM, async (user) => {
    const b = await load(id);
    if (b.status !== "REQUESTED") throw new ActionError("신청 접수 상태의 예약만 확정할 수 있습니다.");
    const s = await parseSchedule(input);
    await transition(id, ["REQUESTED"], {
      status: "CONFIRMED",
      confirmedAt: new Date(),
      assignedStaffId: s.staff.id,
      scheduledDate: s.date,
      timeSlot: s.timeSlot,
      scheduledTime: s.scheduledTime,
    });
    const when = `${dayLabel(s.date)} ${TIME_SLOT_SHORT[s.timeSlot]}${s.scheduledTime ? ` ${s.scheduledTime}` : ""}`;
    await prisma.bookingEvent.create({ data: { bookingId: id, actorId: user.id, kind: "confirmed", body: `${when} 방문 확정 · 담당 ${s.staff.name ?? "방문 인력"}` } });
    await audit(user.id, "web.booking.confirm", `Booking:${id}`, { bookingNumber: b.bookingNumber, staffId: s.staff.id, date: input.date, timeSlot: s.timeSlot, scheduledTime: s.scheduledTime });
    done(id);
    return { message: `${b.bookingNumber} 예약을 확정했습니다.` };
  });
}

/** 확정된 예약의 담당자·일정 변경 */
export async function rescheduleBooking(id: string, input: ScheduleInput) {
  return runAction(PERM, async (user) => {
    const b = await load(id);
    if (b.status !== "CONFIRMED") throw new ActionError("확정된 예약만 담당자·일정을 바꿀 수 있습니다.");
    const s = await parseSchedule(input);
    const sameStaff = b.assignedStaffId === s.staff.id;
    const sameTime = b.scheduledDate.getTime() === s.date.getTime() && b.timeSlot === s.timeSlot && (b.scheduledTime ?? null) === s.scheduledTime;
    if (sameStaff && sameTime) return { message: "변경 사항이 없습니다." };
    await transition(id, ["CONFIRMED"], { assignedStaffId: s.staff.id, scheduledDate: s.date, timeSlot: s.timeSlot, scheduledTime: s.scheduledTime });
    const parts = [
      !sameTime ? `일정 변경 → ${dayLabel(s.date)} ${TIME_SLOT_SHORT[s.timeSlot]}${s.scheduledTime ? ` ${s.scheduledTime}` : ""}` : null,
      !sameStaff ? `담당 변경 → ${s.staff.name ?? "방문 인력"}` : null,
    ].filter(Boolean);
    await prisma.bookingEvent.create({ data: { bookingId: id, actorId: user.id, kind: sameStaff ? "changed" : "assigned", body: parts.join(" · ") } });
    await audit(user.id, "web.booking.reschedule", `Booking:${id}`, {
      bookingNumber: b.bookingNumber,
      from: { staffId: b.assignedStaffId, date: b.scheduledDate.toISOString().slice(0, 10), timeSlot: b.timeSlot, scheduledTime: b.scheduledTime },
      to: { staffId: s.staff.id, date: input.date, timeSlot: s.timeSlot, scheduledTime: s.scheduledTime },
    });
    done(id);
    return { message: "담당자·일정을 바꿨습니다." };
  });
}

/** 수동 완료 — 방문 기록을 종이·전화로 받은 경우 등. 방문 기록이 없으면 회원 만족도 평가는 열리지 않는다 */
export async function completeBooking(id: string) {
  return runAction(PERM, async (user) => {
    const b = await load(id);
    if (b.status !== "CONFIRMED") throw new ActionError("확정된 예약만 완료 처리할 수 있습니다.");
    await transition(id, ["CONFIRMED"], { status: "COMPLETED", completedAt: new Date() });
    await prisma.bookingEvent.create({ data: { bookingId: id, actorId: user.id, kind: "completed", body: "방문 완료 (운영팀 처리)" } });
    await audit(user.id, "web.booking.complete", `Booking:${id}`, { bookingNumber: b.bookingNumber });
    done(id);
    return { message: `${b.bookingNumber} 예약을 완료 처리했습니다.` };
  });
}

export async function cancelBookingAdmin(id: string, reason: string) {
  return runAction(PERM, async (user) => {
    const why = reason.trim();
    if (!why) throw new ActionError("취소 사유를 입력하세요. 회원 화면에 그대로 보입니다.");
    if (why.length > 300) throw new ActionError("취소 사유는 300자 이내로 입력하세요.");
    const b = await load(id);
    if (b.status !== "REQUESTED" && b.status !== "CONFIRMED") throw new ActionError("신청 접수·확정 상태의 예약만 취소할 수 있습니다.");
    await transition(id, ["REQUESTED", "CONFIRMED"], { status: "CANCELLED", cancelledAt: new Date(), cancelReason: why });
    await prisma.bookingEvent.create({ data: { bookingId: id, actorId: user.id, kind: "cancelled", body: `운영팀 취소 · ${why}` } });
    await audit(user.id, "web.booking.cancel", `Booking:${id}`, { bookingNumber: b.bookingNumber, from: b.status, reason: why });
    done(id);
    return { message: `${b.bookingNumber} 예약을 취소했습니다.` };
  });
}

/** 내부 메모 — 회원에게 보이지 않는다(internal) */
export async function addBookingMemo(id: string, body: string) {
  return runAction(PERM, async (user) => {
    const text = body.trim();
    if (!text) throw new ActionError("메모 내용을 입력하세요.");
    if (text.length > 2000) throw new ActionError("메모는 2,000자 이내로 입력하세요.");
    const b = await load(id);
    await prisma.bookingEvent.create({ data: { bookingId: id, actorId: user.id, kind: "memo", body: text, internal: true } });
    await audit(user.id, "web.booking.memo", `Booking:${id}`, { bookingNumber: b.bookingNumber, service: serviceName(b.serviceType) });
    done(id);
    return { message: "메모를 남겼습니다." };
  });
}
