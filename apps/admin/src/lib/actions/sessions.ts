"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";
import { fromKstInput } from "../kst";

export interface SessionInput {
  courseId: string;
  title: string;
  region: string;
  location: string;
  /** datetime-local 값 (KST) */
  startsAt: string;
  endsAt: string;
  capacity: number;
  note: string;
}

function clean(input: SessionInput) {
  const title = input.title.trim();
  if (!title) throw new ActionError("일정명을 입력하세요.");
  const region = input.region.trim();
  if (!region) throw new ActionError("지역을 입력하세요.");
  const location = input.location.trim();
  if (!location) throw new ActionError("장소를 입력하세요.");
  const startsAt = fromKstInput(input.startsAt);
  const endsAt = fromKstInput(input.endsAt);
  if (!startsAt || !endsAt) throw new ActionError("시작·종료 일시를 입력하세요.");
  if (endsAt <= startsAt) throw new ActionError("종료 일시는 시작 일시보다 뒤여야 합니다.");
  const capacity = Math.round(Number(input.capacity));
  if (!Number.isFinite(capacity) || capacity < 1) throw new ActionError("정원은 1명 이상이어야 합니다.");
  return {
    courseId: input.courseId || null,
    title,
    region,
    location,
    startsAt,
    endsAt,
    capacity,
    note: input.note.trim() || null,
  };
}

async function assertCourse(courseId: string | null) {
  if (!courseId) return;
  const c = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!c) throw new ActionError("연결할 프로그램을 찾을 수 없습니다.");
}

function done(id?: string) {
  revalidatePath("/[locale]/(dashboard)", "layout");
  if (id) revalidatePath(`/[locale]/(dashboard)/sessions/${id}`, "page");
}

export async function createSession(input: SessionInput) {
  return runAction<{ id: string }>("session", async (user) => {
    const data = clean(input);
    await assertCourse(data.courseId);
    const s = await prisma.trainingSession.create({ data });
    await audit(user.id, "session.create", `TrainingSession:${s.id}`, { title: s.title, capacity: s.capacity });
    done();
    return { message: "실습 일정을 만들었습니다.", data: { id: s.id } };
  });
}

export async function updateSession(id: string, input: SessionInput) {
  return runAction("session", async (user) => {
    const data = clean(input);
    await assertCourse(data.courseId);
    const before = await prisma.trainingSession.findUnique({
      where: { id },
      select: { title: true, capacity: true, startsAt: true, _count: { select: { registrations: true } } },
    });
    if (!before) throw new ActionError("일정을 찾을 수 없습니다.");
    // 이미 신청한 사람을 밀어낼 수는 없다
    if (data.capacity < before._count.registrations) {
      throw new ActionError(`이미 ${before._count.registrations}명이 신청해 정원을 그보다 줄일 수 없습니다.`);
    }
    await prisma.trainingSession.update({ where: { id }, data });
    await audit(user.id, "session.update", `TrainingSession:${id}`, {
      title: data.title,
      ...(before.capacity !== data.capacity ? { from: before.capacity, to: data.capacity } : {}),
    });
    done(id);
    return { message: "저장했습니다." };
  });
}

export async function deleteSession(id: string) {
  return runAction("session", async (user) => {
    const s = await prisma.trainingSession.findUnique({
      where: { id },
      select: { title: true, _count: { select: { registrations: true } } },
    });
    if (!s) throw new ActionError("일정을 찾을 수 없습니다.");
    if (s._count.registrations) throw new ActionError("신청자가 있는 일정은 삭제할 수 없습니다. 신청자에게 먼저 안내하세요.");
    await prisma.trainingSession.delete({ where: { id } });
    await audit(user.id, "session.delete", `TrainingSession:${id}`, { title: s.title });
    done();
    return { message: "일정을 삭제했습니다." };
  });
}
