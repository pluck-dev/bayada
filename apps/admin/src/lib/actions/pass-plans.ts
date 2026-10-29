"use server";

import { revalidatePath } from "next/cache";
import { prisma, type ProductType } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";
import { PRODUCT_TYPES } from "../labels";

export interface PassPlanInput {
  name: string;
  description: string;
  price: number;
  durationDays: number;
  includes: ProductType[];
  active: boolean;
}

function clean(input: PassPlanInput) {
  const name = input.name.trim();
  if (!name) throw new ActionError("요금제 이름을 입력하세요.");
  if (name.length > 60) throw new ActionError("요금제 이름은 60자 이내로 입력하세요.");
  const price = Math.round(Number(input.price));
  // 토스 결제 최소 금액(100원) 아래는 결제가 안 된다
  if (!Number.isFinite(price) || price < 100) throw new ActionError("가격은 100원 이상이어야 합니다.");
  const durationDays = Math.round(Number(input.durationDays));
  if (!Number.isFinite(durationDays) || durationDays < 1 || durationDays > 3650) {
    throw new ActionError("이용 기간은 1~3650일 사이로 입력하세요.");
  }
  const includes = PRODUCT_TYPES.filter((t) => input.includes.includes(t));
  if (includes.length === 0) throw new ActionError("무제한 수강 대상 상품 유형을 하나 이상 고르세요.");
  return { name, description: input.description.trim() || null, price, durationDays, includes, active: !!input.active };
}

function done() {
  revalidatePath("/[locale]/(dashboard)", "layout");
}

export async function createPassPlan(input: PassPlanInput) {
  return runAction<{ id: string }>("commerce", async (user) => {
    const data = clean(input);
    const plan = await prisma.passPlan.create({ data });
    await audit(user.id, "passplan.create", `PassPlan:${plan.id}`, { name: plan.name, price: plan.price, durationDays: plan.durationDays });
    done();
    return { message: "요금제를 만들었습니다.", data: { id: plan.id } };
  });
}

/** 가격·기간을 바꿔도 이미 결제한 주문·구독에는 영향이 없다 (주문 금액·구독 종료일은 결제 시점에 고정) */
export async function updatePassPlan(id: string, input: PassPlanInput) {
  return runAction("commerce", async (user) => {
    const data = clean(input);
    const before = await prisma.passPlan.findUnique({ where: { id } });
    if (!before) throw new ActionError("요금제를 찾을 수 없습니다.");
    await prisma.passPlan.update({ where: { id }, data });
    await audit(user.id, "passplan.update", `PassPlan:${id}`, {
      before: { name: before.name, price: before.price, durationDays: before.durationDays, includes: before.includes, active: before.active },
      after: { name: data.name, price: data.price, durationDays: data.durationDays, includes: data.includes, active: data.active },
    });
    done();
    return { message: "저장했습니다." };
  });
}

/** 주문·구독 기록이 있는 요금제는 지우지 않고 판매 중지만 할 수 있다 */
export async function deletePassPlan(id: string) {
  return runAction("commerce", async (user) => {
    const plan = await prisma.passPlan.findUnique({
      where: { id },
      select: { name: true, _count: { select: { orderItems: true, subscriptions: true } } },
    });
    if (!plan) throw new ActionError("요금제를 찾을 수 없습니다.");
    if (plan._count.orderItems > 0 || plan._count.subscriptions > 0) {
      throw new ActionError("주문·구독 기록이 있어 삭제할 수 없습니다. 판매 중지로 바꾸세요.");
    }
    await prisma.passPlan.delete({ where: { id } });
    await audit(user.id, "passplan.delete", `PassPlan:${id}`, { name: plan.name });
    done();
    return { message: "요금제를 삭제했습니다." };
  });
}
