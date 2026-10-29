import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Receipt } from "lucide-react";
import { prisma } from "@bayada/db";
import { ORDER_AUDIT } from "@bayada/services";
import { getViewer } from "@/lib/viewer";
import { formatPrice } from "@/lib/labels";
import { BADGE_CLASS, formatDateTimeKst, orderBadge } from "@/lib/orders";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "결제 내역" };

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = (await getViewer())!;
  // 결제가 끝난 주문만 (결제창에서 이탈한 대기·취소 주문은 내역이 아니다)
  const orders = await prisma.order.findMany({
    where: { userId: viewer.id, status: { in: ["CONFIRMED", "REFUNDED"] } },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { course: { select: { title: true } }, passPlan: { select: { name: true } } } },
    },
  });
  // 환불 요청 중인 주문 — 각 주문의 마지막 환불 관련 기록이 요청이면 "요청 중"
  const logs = orders.length
    ? await prisma.auditLog.findMany({
        where: {
          target: { in: orders.map((o) => `Order:${o.id}`) },
          action: { in: [ORDER_AUDIT.REFUND_REQUEST, ORDER_AUDIT.REFUND_REJECT, ORDER_AUDIT.REFUND] },
        },
        orderBy: { at: "asc" },
        select: { target: true, action: true },
      })
    : [];
  const lastAction = new Map(logs.map((l) => [l.target, l.action]));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink md:text-[28px]">결제 내역</h1>
      <p className="mt-2 text-sm text-muted">프로그램 구매와 아카데미 패스 결제 내역이에요. 환불 요청은 주문 상세에서 할 수 있어요.</p>

      <div className="mt-6">
        {orders.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-5 w-5" />}
            title="결제 내역이 없어요"
            description="유료 프로그램을 구매하거나 아카데미 패스를 구독하면 이곳에 표시돼요."
            action={{ label: "프로그램 둘러보기", href: `/${locale}/courses` }}
          />
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => {
              const badge = orderBadge(o, lastAction.get(`Order:${o.id}`) === ORDER_AUDIT.REFUND_REQUEST);
              const first = o.items[0];
              const title = first?.course?.title ?? (first?.passPlan ? `아카데미 패스 · ${first.passPlan.name}` : "주문");
              return (
                <li key={o.id}>
                  <Link
                    href={`/${locale}/orders/${o.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-lift"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${BADGE_CLASS[badge.tone]}`}>{badge.label}</span>
                        <span className="text-xs text-muted">{formatDateTimeKst(o.paidAt ?? o.createdAt)}</span>
                      </div>
                      <p className="mt-2 line-clamp-1 text-[15px] font-semibold text-ink">
                        {title}
                        {o.items.length > 1 && ` 외 ${o.items.length - 1}건`}
                      </p>
                      <p className="mt-1 font-mono text-xs text-subtle">{o.orderNo}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-bold text-ink">{formatPrice(o.totalAmount)}</p>
                      {o.refundAmount ? <p className="mt-0.5 text-xs text-brand">환불 {formatPrice(o.refundAmount)}</p> : null}
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
