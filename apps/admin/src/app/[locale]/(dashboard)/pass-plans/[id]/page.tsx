import { notFound } from "next/navigation";
import { prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { PassPlanForm } from "@/components/pass-plans/PassPlanForm";

export default async function EditPassPlanPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  await requirePage("commerce", locale);
  const plan = await prisma.passPlan.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true, subscriptions: true } } },
  });
  if (!plan) notFound();
  return (
    <>
      <PageHeader
        title={plan.name}
        description="가격·기간을 바꿔도 이미 결제한 주문과 이용 중인 구독에는 영향이 없습니다."
        back={{ href: `/${locale}/pass-plans`, label: "패스 요금제" }}
      />
      <PassPlanForm
        locale={locale}
        planId={plan.id}
        deletable={plan._count.orderItems === 0 && plan._count.subscriptions === 0}
        initial={{
          name: plan.name,
          description: plan.description ?? "",
          price: plan.price,
          durationDays: plan.durationDays,
          includes: plan.includes,
          active: plan.active,
        }}
      />
    </>
  );
}
