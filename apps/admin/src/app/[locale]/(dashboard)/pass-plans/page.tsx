import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { PRODUCT_TYPE_LABEL, formatDate } from "@/lib/labels";
import { Badge, EmptyState, LinkButton, PageHeader, cx, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";

export default async function PassPlansPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("commerce", locale);
  const now = new Date();
  const plans = await prisma.passPlan.findMany({
    orderBy: [{ active: "desc" }, { price: "asc" }],
    include: {
      _count: {
        select: {
          subscriptions: { where: { canceledAt: null, startsAt: { lte: now }, endsAt: { gt: now } } },
          orderItems: { where: { order: { status: { in: ["CONFIRMED", "REFUNDED"] } } } },
        },
      },
    },
  });
  const base = `/${locale}/pass-plans`;

  return (
    <>
      <PageHeader
        title="패스 요금제"
        description="아카데미 패스(개인 구독) 요금제를 관리합니다. 판매 중인 요금제가 있으면 아카데미에 패스 메뉴·업셀이 나타납니다. 자동 결제는 없고 기간이 끝나면 종료됩니다."
        actions={
          <LinkButton href={`${base}/new`} variant="primary">
            <Plus className="h-3.5 w-3.5" aria-hidden />새 요금제
          </LinkButton>
        }
      />
      <div className={tableWrap}>
        {plans.length === 0 ? (
          <EmptyState title="요금제가 없습니다" description="요금제를 만들고 판매 중으로 두면 학습자가 아카데미에서 패스를 구독할 수 있습니다." />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>요금제</th>
                <th className={thClass}>가격</th>
                <th className={thClass}>이용 기간</th>
                <th className={thClass}>무제한 대상</th>
                <th className={thClass}>이용 중</th>
                <th className={thClass}>누적 결제</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>생성일</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className={trClass}>
                  <td className={cx(tdClass, "min-w-[200px] whitespace-normal!")}>
                    <Link href={`${base}/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    {p.description && <p className="mt-0.5 line-clamp-1 text-[11.5px] text-subtle">{p.description}</p>}
                  </td>
                  <td className={cx(tdClass, "tabular font-medium")}>{p.price.toLocaleString()}원</td>
                  <td className={cx(tdClass, "tabular text-zinc-600")}>{p.durationDays}일</td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap gap-1">
                      {p.includes.map((t) => (
                        <Badge key={t}>{PRODUCT_TYPE_LABEL[t]}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className={cx(tdClass, "tabular")}>{p._count.subscriptions}명</td>
                  <td className={cx(tdClass, "tabular text-zinc-600")}>{p._count.orderItems}건</td>
                  <td className={tdClass}>
                    {p.active ? (
                      <Badge tone="green" dot>
                        판매 중
                      </Badge>
                    ) : (
                      <Badge tone="slate">판매 중지</Badge>
                    )}
                  </td>
                  <td className={cx(tdClass, "tabular text-zinc-600")}>{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
