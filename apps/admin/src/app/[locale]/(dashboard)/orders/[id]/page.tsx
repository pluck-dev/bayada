import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@bayada/db";
import { ORDER_AUDIT } from "@bayada/services";
import { requirePage } from "@/lib/session";
import { paymentService } from "@/lib/services";
import { AUDIT_ACTION_LABEL, formatDate, formatDateTime } from "@/lib/labels";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, ORDER_TYPE_LABEL } from "@/lib/order-labels";
import { Badge, Card, PageHeader, cx, tableClass, tdClass, thClass } from "@/components/ui";
import { RefundPanel } from "@/components/orders/RefundPanel";

function detailText(action: string, d: Record<string, unknown>): string {
  if (action === ORDER_AUDIT.REFUND_REQUEST) return `사유: ${String(d.reason ?? "")}`;
  if (action === ORDER_AUDIT.REFUND_REJECT) return `반려 사유: ${String(d.memo ?? "")}`;
  if (action === ORDER_AUDIT.REFUND) {
    const r = d.revoked as { enrollmentsDeleted?: number; enrollmentsReverted?: number; subscriptionsCanceled?: number } | undefined;
    return [
      `${Number(d.amount ?? 0).toLocaleString()}원 환불${d.full ? " (전액 환불 완료)" : " (부분)"}`,
      `사유: ${String(d.reason ?? "")}`,
      d.tossStatus ? `토스 ${String(d.tossStatus)} · 잔액 ${Number(d.balanceAmount ?? 0).toLocaleString()}원` : null,
      r ? `수강 삭제 ${r.enrollmentsDeleted ?? 0} · 패스 수강 복귀 ${r.enrollmentsReverted ?? 0} · 구독 해지 ${r.subscriptionsCanceled ?? 0}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (action === ORDER_AUDIT.PAID) {
    const created = (d.enrollmentsCreated as string[] | undefined)?.length ?? 0;
    return [`${Number(d.amount ?? 0).toLocaleString()}원 승인`, d.method ? String(d.method) : null, created ? `수강 등록 ${created}건` : null, d.subscriptionId ? "구독 시작" : null]
      .filter(Boolean)
      .join(" · ");
  }
  return "";
}

export default async function OrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  await requirePage("commerce", locale);
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      organization: { select: { id: true, name: true } },
      items: { include: { course: { select: { id: true, title: true } }, passPlan: { select: { id: true, name: true, durationDays: true } } } },
      subscription: true,
      invoice: { select: { id: true, invoiceNo: true } },
    },
  });
  if (!order) notFound();

  const [state, logs] = await Promise.all([
    paymentService.refundState(order.id),
    prisma.auditLog.findMany({
      where: { target: `Order:${order.id}` },
      orderBy: { at: "desc" },
      take: 50,
    }),
  ]);
  const actorIds = [...new Set(logs.map((l) => l.actorId).filter((x): x is string => !!x))];
  const actors = new Map(
    (await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true, email: true } })).map((u) => [
      u.id,
      u.name ?? u.email,
    ]),
  );
  const receiptUrl = ((logs.find((l) => l.action === ORDER_AUDIT.PAID)?.detail ?? {}) as { receiptUrl?: string | null }).receiptUrl ?? null;
  const remaining = order.totalAmount - (order.refundAmount ?? 0);
  const canRefund = order.status === "CONFIRMED" && !!order.paymentKey && remaining > 0;
  const base = `/${locale}`;

  return (
    <>
      <PageHeader
        back={{ href: `${base}/orders`, label: "주문" }}
        title={
          <span className="flex items-center gap-2">
            <span className="font-mono">{order.orderNo}</span>
            <Badge tone={ORDER_STATUS_TONE[order.status]}>
              {order.status === "CONFIRMED" && order.refundAmount ? "부분 환불" : ORDER_STATUS_LABEL[order.status]}
            </Badge>
            {state.status === "requested" && <Badge tone="red">환불 요청</Badge>}
          </span>
        }
        description={`${ORDER_TYPE_LABEL[order.type]} 주문 · ${formatDateTime(order.createdAt)}`}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="주문 항목" padded={false}>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>상품</th>
                  <th className={thClass}>수량</th>
                  <th className={cx(thClass, "text-right!")}>금액</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td className={cx(tdClass, "whitespace-normal!")}>
                      {it.course ? (
                        <Link href={`${base}/programs/${it.course.id}`} className="font-bold text-ink transition-colors hover:text-brand">
                          {it.course.title}
                        </Link>
                      ) : it.passPlan ? (
                        <Link href={`${base}/pass-plans/${it.passPlan.id}`} className="font-bold text-ink transition-colors hover:text-brand">
                          아카데미 패스 · {it.passPlan.name}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className={cx(tdClass, "tabular")}>{it.quantity}</td>
                    <td className={cx(tdClass, "tabular text-right font-medium")}>{it.price.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="결제 정보">
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-caption">
              <dt className="text-muted">결제 금액</dt>
              <dd className="tabular font-medium">{order.totalAmount.toLocaleString()}원</dd>
              <dt className="text-muted">환불 금액</dt>
              <dd className="tabular">
                {order.refundAmount ? `${order.refundAmount.toLocaleString()}원 · ${formatDateTime(order.refundedAt)}` : "-"}
              </dd>
              <dt className="text-muted">결제 수단</dt>
              <dd>{order.paymentMethod ?? "-"}</dd>
              <dt className="text-muted">승인 일시</dt>
              <dd className="tabular">{order.paidAt ? formatDateTime(order.paidAt) : "-"}</dd>
              <dt className="text-muted">Toss paymentKey</dt>
              <dd className="break-all font-mono text-caption">{order.paymentKey ?? "-"}</dd>
              <dt className="text-muted">영수증</dt>
              <dd>
                {receiptUrl ? (
                  <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline underline-offset-2 hover:text-brand-700">
                    토스 영수증 열기
                  </a>
                ) : (
                  "-"
                )}
              </dd>
              {order.subscription && (
                <>
                  <dt className="text-muted">구독 기간</dt>
                  <dd className="tabular">
                    {formatDate(order.subscription.startsAt)} ~ {formatDate(order.subscription.endsAt)}
                    {order.subscription.canceledAt && <span className="ml-1.5 text-danger">해지 {formatDate(order.subscription.canceledAt)}</span>}
                  </dd>
                </>
              )}
              {order.invoice && (
                <>
                  <dt className="text-muted">청구서</dt>
                  <dd>
                    <Link href={`${base}/invoices/${order.invoice.id}`} className="font-medium text-ink underline underline-offset-2 hover:text-brand-700">
                      {order.invoice.invoiceNo}
                    </Link>
                  </dd>
                </>
              )}
            </dl>
          </Card>

          <Card title="처리 이력" padded={false}>
            {logs.length === 0 ? (
              <p className="px-4 py-6 text-center text-caption text-muted">기록이 없습니다.</p>
            ) : (
              <ol className="divide-y divide-hairline">
                {logs.map((l) => (
                  <li key={l.id} className="flex gap-3 px-4 py-2.5 text-caption">
                    <span className="tabular w-[118px] shrink-0 text-subtle">{formatDateTime(l.at)}</span>
                    <div className="min-w-0">
                      <p className="font-medium">
                        {AUDIT_ACTION_LABEL[l.action] ?? l.action}
                        <span className="ml-1.5 font-normal text-subtle">{l.actorId ? actors.get(l.actorId) ?? "-" : "시스템"}</span>
                      </p>
                      <p className="mt-0.5 text-muted">{detailText(l.action, (l.detail ?? {}) as Record<string, unknown>)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card title="주문자">
            <p className="text-caption font-medium">
              <Link href={`${base}/members/${order.user.id}`} className="transition-colors hover:text-brand">
                {order.user.name ?? "-"}
              </Link>
            </p>
            <p className="text-caption text-muted">{order.user.email}</p>
            {order.organization && (
              <p className="mt-2 text-caption">
                기관{" "}
                <Link href={`${base}/organizations/${order.organization.id}`} className="font-medium text-ink underline underline-offset-2 hover:text-brand-700">
                  {order.organization.name}
                </Link>
              </p>
            )}
          </Card>
          <RefundPanel
            key={`${remaining}-${state.status}`}
            orderId={order.id}
            canRefund={canRefund}
            remaining={remaining}
            totalAmount={order.totalAmount}
            request={state.status === "requested" ? { reason: state.reason, at: formatDateTime(state.at) } : null}
            notRefundableReason={
              order.status === "REFUNDED"
                ? "전액 환불된 주문입니다."
                : order.status === "CONFIRMED" && !order.paymentKey
                  ? "온라인 결제(토스) 주문이 아니라 여기서 환불할 수 없습니다."
                  : order.status !== "CONFIRMED"
                    ? "결제 완료 상태의 주문만 환불할 수 있습니다."
                    : null
            }
          />
        </div>
      </div>
    </>
  );
}
