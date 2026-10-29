"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";

export interface BannerInput {
  title: string;
  subtitle: string;
  image: string;
  linkUrl: string;
  startsAt: string; // yyyy-mm-ddThh:mm (KST 로컬)
  endsAt: string;
  order: number;
}

/** datetime-local 값은 한국 시간으로 해석한다 (서버 TZ 와 무관하게) */
function parseKst(v: string, label: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) throw new ActionError(`${label}을 입력하세요.`);
  const d = new Date(`${v}:00+09:00`);
  if (Number.isNaN(d.getTime())) throw new ActionError(`${label}이 올바르지 않습니다.`);
  return d;
}

function clean(input: BannerInput) {
  const title = input.title.trim();
  if (!title) throw new ActionError("배너 제목을 입력하세요.");
  const startsAt = parseKst(input.startsAt, "노출 시작일");
  const endsAt = parseKst(input.endsAt, "노출 종료일");
  if (endsAt <= startsAt) throw new ActionError("노출 종료일은 시작일 이후여야 합니다.");
  for (const [v, label] of [
    [input.image, "이미지"],
    [input.linkUrl, "링크"],
  ] as const) {
    if (v.trim() && !/^(https?:\/\/|\/)/.test(v.trim())) throw new ActionError(`${label} URL 은 http(s) 또는 / 로 시작해야 합니다.`);
  }
  return {
    title,
    subtitle: input.subtitle.trim() || null,
    image: input.image.trim() || null,
    linkUrl: input.linkUrl.trim() || null,
    startsAt,
    endsAt,
    order: Math.round(Number(input.order) || 0),
  };
}

function done() {
  revalidatePath("/[locale]/(dashboard)/curation", "page");
}

export async function createBanner(input: BannerInput) {
  return runAction("curation", async (user) => {
    const b = await prisma.banner.create({ data: clean(input) });
    await audit(user.id, "banner.create", `Banner:${b.id}`, { title: b.title });
    done();
    return { message: "배너를 만들었습니다." };
  });
}

export async function updateBanner(id: string, input: BannerInput) {
  return runAction("curation", async (user) => {
    const b = await prisma.banner.update({ where: { id }, data: clean(input) });
    await audit(user.id, "banner.update", `Banner:${id}`, { title: b.title });
    done();
    return { message: "배너를 저장했습니다." };
  });
}

export async function deleteBanner(id: string) {
  return runAction("curation", async (user) => {
    const b = await prisma.banner.delete({ where: { id } });
    await audit(user.id, "banner.delete", `Banner:${id}`, { title: b.title });
    done();
    return { message: "배너를 삭제했습니다." };
  });
}
