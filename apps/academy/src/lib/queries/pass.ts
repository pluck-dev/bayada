import { cache } from "react";
import { prisma } from "@bayada/db";
import type { ProductType } from "@bayada/db";
import { paymentService } from "@/lib/services";

/** 판매 중인 아카데미 패스 요금제 (가격 오름차순) */
export const getActivePlans = cache(async () =>
  prisma.passPlan.findMany({
    where: { active: true, price: { gt: 0 } },
    orderBy: [{ price: "asc" }, { durationDays: "asc" }],
    select: { id: true, name: true, description: true, price: true, durationDays: true, includes: true },
  })
);

export type PassPlanView = Awaited<ReturnType<typeof getActivePlans>>[number];

/**
 * 내 이용 중인 패스 요약. 여러 건(갱신·다른 요금제)이면 가장 늦게 끝나는 것을 대표로, 포함 유형은 모두 합친다.
 */
export const getMyPass = cache(async (userId: string) => {
  const subs = await paymentService.activeSubscriptions(userId);
  if (subs.length === 0) return null;
  const top = subs[0]!;
  const includes = [...new Set(subs.flatMap((s) => s.plan.includes))] as ProductType[];
  // 갱신 구독은 시작=결제 시각, 종료=기존 종료일+기간이라 가장 늦게 끝나는 건이 곧 연속 구간의 끝이다
  const endsAt = top.endsAt;
  const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / 86_400_000));
  return { planName: top.plan.name, endsAt, daysLeft, includes };
});

export type MyPass = NonNullable<Awaited<ReturnType<typeof getMyPass>>>;

/** 이용 기간 표기 — 365일 → "1년", 30일 단위 → "N개월", 그 외 "N일" */
export function formatPassDuration(days: number): string {
  if (days % 365 === 0) return `${days / 365}년`;
  if (days % 30 === 0) return `${days / 30}개월`;
  return `${days}일`;
}
