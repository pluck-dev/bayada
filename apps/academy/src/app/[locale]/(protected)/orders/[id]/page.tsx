import { Badge, Notice, PageHeader } from "@bayada/ui";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@bayada/db";
import { ORDER_AUDIT } from "@bayada/services";
import { getViewer } from "@/lib/viewer";
import { paymentService } from "@/lib/services";
import { formatDate, formatPrice } from "@/lib/labels";
import { BADGE_TONE, formatDateTimeKst, orderBadge } from "@/lib/orders";
import { RefundRequestForm } from "@/components/orders/RefundRequestForm";

export const metadata: Metadata = { title: "결제 상세" };

export default async function OrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const base = `/${locale}`;
  const viewer = (await getViewer())!;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { course: { select: { title: true, slug: true } }, passPlan: { select: { name: true, durationDays: true } } },
      },
      subscription: { select: { startsAt: true, endsAt: true, canceledAt: true } },
    },
  });
  // 다른 사람 주문은 존재 자체를 숨긴다
  if (!order || order.userId !== viewer.id || order.status === "PENDING" || order.status === "CANCELLED") notFound();

  const [state, paid, refundPage] = await Promise.all([
    paymentService.refundState(order.id),
    prisma.auditLog.findFirst({
      where: { target: `Order:${order.id}`, action: ORDER_AUDIT.PAID },
      orderBy: { at: "desc" },
      select: { detail: true },
    }),
    prisma.page.findUnique({ where: { slug: "refund" }, select: { id: true } }),
  ]);
  const receiptUrl = ((paid?.detail ?? {}) as { receiptUrl?: string | null }).receiptUrl ?? null;
  const badge = orderBadge(order, state.status === "requested");
  const refundable = order.status === "CONFIRMED" && !!order.paymentKey && (order.refundAmount ?? 0) < order.totalAmount;

  const rows: [string, React.ReactNode][] = [
    ["주문 번호", <span key="no" className="font-mono text-caption">{order.orderNo}</span>],
    ["결제 일시", order.paidAt ? formatDateTimeKst(order.paidAt) : "-"],
    ["결제 수단", order.paymentMethod ?? "-"],
    ["결제 금액", <span key="amt" className="font-semibold">{formatPrice(order.totalAmount)}</span>],
  ];
  if (order.refundAmount) {
    rows.push(["환불 금액", <span key="rf" className="font-semibold text-ink">{formatPrice(order.refundAmount)}</span>]);
    if (order.refundedAt) rows.push(["환불 일시", formatDateTimeKst(order.refundedAt)]);
  }

  return (
    <div>
      <PageHeader
        className="mb-6 md:mb-8"
        back={
          <Link href={`${base}/orders`} className="text-body-sm text-muted hover:text-ink">
            ← 결제 내역
          </Link>
        }
        title="결제 상세"
        meta={
          <Badge size="md" tone={BADGE_TONE[badge.tone]} dot>
            {badge.label}
          </Badge>
        }
      />

      <section aria-labelledby="items-title" className="rounded-xl border border-line bg-canvas p-6">
        <h2 id="items-title" className="text-title text-ink">
          주문 상품
        </h2>
        <ul className="mt-4 divide-y divide-line">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                {it.course ? (
                  <Link href={`${base}/courses/${encodeURIComponent(it.course.slug)}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                    {it.course.title}
                  </Link>
                ) : (
                  <p className="font-semibold text-ink">아카데미 패스 · {it.passPlan?.name}</p>
                )}
                {it.passPlan && order.subscription && (
                  <p className="mt-1 text-caption text-muted">
                    이용 기간 {formatDate(order.subscription.startsAt)} ~ {formatDate(order.subscription.endsAt)}
                    {order.subscription.canceledAt && " · 해지됨"}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-body-sm font-semibold text-ink">{formatPrice(it.price)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="receipt-title" className="mt-4 rounded-xl border border-line bg-canvas p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="receipt-title" className="text-title text-ink">
            결제 정보
          </h2>
          {receiptUrl && (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-body-sm font-semibold text-ink-soft hover:text-ink"
            >
              영수증 보기 <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
        </div>
        <dl className="mt-4 grid grid-cols-[96px_1fr] gap-y-2.5 text-body-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted">{k}</dt>
              <dd className="text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="refund-title" className="mt-4 rounded-xl border border-line bg-canvas p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="refund-title" className="text-title text-ink">
            환불
          </h2>
          {refundPage && (
            <Link href={`${base}/refund`} className="text-body-sm font-medium text-muted hover:text-ink">
              환불 규정 →
            </Link>
          )}
        </div>
        <div className="mt-4 text-body-sm">
          {state.status === "requested" ? (
            <Notice tone="warning" title={`환불 요청을 접수했어요 · ${formatDateTimeKst(state.at)}`}>
              <p>사유: {state.reason}</p>
              <p className="mt-1">운영팀이 확인 후 결제 수단으로 환불해 드려요.</p>
            </Notice>
          ) : order.status === "REFUNDED" ? (
            <p className="text-ink-soft">
              {formatPrice(order.refundAmount ?? order.totalAmount)} 환불이 완료됐어요. 카드사에 따라 영업일 기준 3~4일 걸릴 수 있어요.
            </p>
          ) : (
            <>
              {state.status === "rejected" && (
                <Notice tone="neutral" className="mb-4" title={`환불 요청이 반려됐어요 · ${formatDateTimeKst(state.at)}`}>
                  안내: {state.memo}
                </Notice>
              )}
              {order.refundAmount ? (
                <p className="mb-4 text-ink-soft">{formatPrice(order.refundAmount)}이 부분 환불됐어요.</p>
              ) : null}
              {refundable ? (
                <RefundRequestForm orderId={order.id} />
              ) : (
                <p className="text-muted">환불을 요청할 수 없는 주문이에요.</p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
