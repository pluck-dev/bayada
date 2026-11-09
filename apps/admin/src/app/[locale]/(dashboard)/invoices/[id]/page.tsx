import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingCart, Building2 } from "lucide-react";
import { Badge, Card, DescList, PageHeader } from "@/components/ui";
import type { Tone } from "@/lib/labels";
import { formatPrice } from "@bayada/shared";
import { invoiceService } from "@/lib/services";

type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

const statusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "작성중",
  SENT: "발송됨",
  PAID: "결제완료",
  OVERDUE: "연체",
  CANCELLED: "취소",
};

const statusTone: Record<InvoiceStatus, Tone> = {
  DRAFT: "zinc",
  SENT: "blue",
  PAID: "green",
  OVERDUE: "red",
  CANCELLED: "zinc",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let invoice: Awaited<ReturnType<typeof invoiceService.getById>>;
  try {
    invoice = await invoiceService.getById(id);
  } catch {
    notFound();
  }

  const inv = invoice as Record<string, unknown>;
  const order = inv.order as Record<string, unknown> | null;
  const user = order?.user as { id: string; name: string | null; email: string } | null;
  const org = order?.organization as { id: string; name: string } | null;
  const items = (order?.items as Array<{ id: string; quantity: number; price: number; course: { title: string } }>) ?? [];

  const totalAmount = inv.totalAmount as number;
  const taxAmount = (inv.taxAmount as number) ?? 0;
  const grandTotal = totalAmount + taxAmount;

  const linkCls = "font-bold text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-brand hover:decoration-brand";

  return (
    <>
      <PageHeader
        back={{ href: "/invoices", label: "청구서 목록" }}
        eyebrow={
          <Badge tone={statusTone[inv.status as InvoiceStatus]} dot>
            {statusLabels[inv.status as InvoiceStatus]}
          </Badge>
        }
        title={`청구서 ${inv.invoiceNo as string}`}
        description={`발행일 ${new Date(inv.issueDate as string).toLocaleDateString("ko-KR")} · 납부기한 ${
          inv.dueDate ? new Date(inv.dueDate as string).toLocaleDateString("ko-KR") : "-"
        }`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="청구 항목">
          <table className="w-full border-separate border-spacing-0 text-[13.5px]">
            <thead>
              <tr>
                <th className="rounded-l-full bg-wash py-2.5 pl-4 text-left text-[12px] font-bold text-muted">강의</th>
                <th className="bg-wash py-2.5 text-center text-[12px] font-bold text-muted">수량</th>
                <th className="rounded-r-full bg-wash py-2.5 pr-4 text-right text-[12px] font-bold text-muted">금액</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="border-b border-hairline py-3.5 pl-4 font-bold">{item.course.title}</td>
                  <td className="num border-b border-hairline py-3.5 text-center">{item.quantity}</td>
                  <td className="num border-b border-hairline py-3.5 pr-4 text-right">{formatPrice(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="ml-auto mt-4 flex max-w-[320px] flex-col gap-1.5 pr-4 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted">공급가</dt>
              <dd className="num font-semibold">{formatPrice(totalAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">부가세 (10%)</dt>
              <dd className="num font-semibold">{formatPrice(taxAmount)}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-hairline pt-3">
              <dt className="font-bold">합계</dt>
              <dd className="num text-[22px] font-extrabold tracking-[-0.03em]">{formatPrice(grandTotal)}</dd>
            </div>
          </dl>
        </Card>

        <div className="flex flex-col gap-4">
          {user && (
            <Card title="고객 정보">
              <DescList
                items={[
                  {
                    label: "이름",
                    value: (
                      <Link href={`/members/${user.id}`} className={linkCls}>
                        {user.name ?? "-"}
                      </Link>
                    ),
                  },
                  { label: "이메일", value: user.email },
                ]}
              />
            </Card>
          )}

          {(org || order) && (
            <Card title="연결">
              <ul className="flex flex-col gap-2">
                {org && (
                  <li className="flex items-center gap-3 rounded-2xl bg-wash px-4 py-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-canvas text-muted">
                      <Building2 className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] text-muted">기관</p>
                      <Link href={`/organizations/${org.id}`} className={linkCls}>
                        {org.name}
                      </Link>
                    </div>
                  </li>
                )}
                {order && (
                  <li className="flex items-center gap-3 rounded-2xl bg-wash px-4 py-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-canvas text-muted">
                      <ShoppingCart className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] text-muted">연결된 주문</p>
                      <Link href={`/orders/${order.id as string}`} className={linkCls}>
                        {order.orderNo as string}
                      </Link>
                    </div>
                  </li>
                )}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
