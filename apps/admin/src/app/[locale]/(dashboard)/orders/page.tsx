import Link from "next/link";
import { requirePage } from "@/lib/session";
import { listOrders } from "@/lib/queries/orders";
import { formatDateTime } from "@/lib/labels";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, ORDER_TYPE_LABEL, orderTitle } from "@/lib/order-labels";
import { SearchBox } from "@/components/SearchBox";
import { Pager } from "@/components/Pager";
import { Badge, EmptyState, FilterChip, PageHeader, cx, qs, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { locale } = await params;
  await requirePage("commerce", locale);
  const sp = await searchParams;
  const data = await listOrders({ q: sp.q, status: sp.status, page: Number(sp.page) || 1 });
  const base = `/${locale}/orders`;
  const chip = (status?: string) => qs(base, { q: sp.q, status });
  const all = Object.values(data.counts).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <>
      <PageHeader
        title="주문"
        description="강의 단건 구매·아카데미 패스 결제(토스페이먼츠)와 기관 주문입니다. 환불 요청을 확인하고 전액·부분 환불을 처리합니다."
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchBox placeholder="주문번호·이름·이메일·paymentKey" />
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="주문 상태">
        <FilterChip href={chip()} active={!data.status} count={all}>
          전체
        </FilterChip>
        <FilterChip href={chip("REFUND_REQUESTED")} active={data.status === "REFUND_REQUESTED"} count={data.requested.size}>
          환불 요청
        </FilterChip>
        {(["PENDING", "CONFIRMED", "REFUNDED", "CANCELLED"] as const).map((s) => (
          <FilterChip key={s} href={chip(s)} active={data.status === s} count={data.counts[s] ?? 0}>
            {ORDER_STATUS_LABEL[s]}
          </FilterChip>
        ))}
      </div>

      <div className={tableWrap}>
        {data.rows.length === 0 ? (
          <EmptyState title="주문이 없습니다" description={sp.q ? "검색 조건을 바꿔 보세요." : undefined} />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>주문번호</th>
                <th className={thClass}>주문자</th>
                <th className={thClass}>상품</th>
                <th className={cx(thClass, "text-right!")}>금액</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>결제수단</th>
                <th className={thClass}>주문일시</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((o) => (
                <tr key={o.id} className={trClass}>
                  <td className={tdClass}>
                    <Link href={`${base}/${o.id}`} className="font-mono text-caption font-medium hover:underline">
                      {o.orderNo}
                    </Link>
                    {o.type === "B2B" && <span className="ml-1.5 text-micro text-subtle">{ORDER_TYPE_LABEL.B2B}</span>}
                  </td>
                  <td className={tdClass}>
                    <p className="font-medium">{o.user.name ?? "-"}</p>
                    <p className="text-micro text-subtle">{o.organization?.name ?? o.user.email}</p>
                  </td>
                  <td className={cx(tdClass, "max-w-[320px] truncate")} title={orderTitle(o.items)}>
                    {orderTitle(o.items)}
                  </td>
                  <td className={cx(tdClass, "tabular text-right")}>
                    <span className="font-medium">{o.totalAmount.toLocaleString()}원</span>
                    {o.refundAmount ? <p className="text-micro text-danger">환불 {o.refundAmount.toLocaleString()}원</p> : null}
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-1">
                      <Badge tone={ORDER_STATUS_TONE[o.status]} dot={o.status === "CONFIRMED"}>
                        {o.status === "CONFIRMED" && o.refundAmount ? "부분 환불" : ORDER_STATUS_LABEL[o.status]}
                      </Badge>
                      {data.requested.has(o.id) && <Badge tone="red">환불 요청</Badge>}
                    </div>
                  </td>
                  <td className={cx(tdClass, "text-muted")}>{o.paymentMethod ?? "-"}</td>
                  <td className={cx(tdClass, "tabular text-muted")}>{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pager page={data.page} pages={data.pages} total={data.total} />
    </>
  );
}
