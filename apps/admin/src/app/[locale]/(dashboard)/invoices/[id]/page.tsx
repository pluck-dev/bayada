import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingCart, Building2 } from "lucide-react";
import { Badge, Card, CardHeader, CardBody, PageHeader, type BadgeTone } from "@bayada/ui";
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

const statusTone: Record<InvoiceStatus, BadgeTone> = {
  DRAFT: "neutral",
  SENT: "info",
  PAID: "success",
  OVERDUE: "danger",
  CANCELLED: "neutral",
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

  return (
    <div className="space-y-6">
      <PageHeader
        size="compact"
        back={
          <Link href="/invoices" className="text-caption text-muted hover:text-ink">
            ← 목록으로
          </Link>
        }
        title={`청구서 ${inv.invoiceNo as string}`}
        meta={
          <Badge tone={statusTone[inv.status as InvoiceStatus]} dot>
            {statusLabels[inv.status as InvoiceStatus]}
          </Badge>
        }
        description={`발행일 ${new Date(inv.issueDate as string).toLocaleDateString("ko-KR")} · 납부기한 ${
          inv.dueDate ? new Date(inv.dueDate as string).toLocaleDateString("ko-KR") : "-"
        }`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 청구 항목 */}
        <Card className="lg:col-span-2">
          <CardHeader size="sm" title="청구 항목" />
          <CardBody size="sm">
            <table className="w-full text-caption">
              <thead>
                <tr className="border-b border-line">
                  <th className="pb-3 text-left font-medium text-muted">강의</th>
                  <th className="pb-3 text-center font-medium text-muted">수량</th>
                  <th className="pb-3 text-right font-medium text-muted">금액</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-line last:border-0">
                    <td className="py-3">{item.course.title}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">{formatPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="pt-3 text-right text-muted">공급가</td>
                  <td className="pt-3 text-right font-medium">{formatPrice(totalAmount)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="pt-1 text-right text-muted">부가세 (10%)</td>
                  <td className="pt-1 text-right font-medium">{formatPrice(taxAmount)}</td>
                </tr>
                <tr className="border-t-2 border-line">
                  <td colSpan={2} className="pt-3 text-right font-bold text-ink">합계</td>
                  <td className="pt-3 text-right text-body font-bold text-ink">
                    {formatPrice(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardBody>
        </Card>

        {/* 고객/주문 정보 */}
        <div className="space-y-4">
          {user && (
            <Card>
              <CardHeader size="sm" title="고객 정보" />
              <CardBody size="sm" className="space-y-2 text-caption">
                <div>
                  <p className="text-micro text-muted">이름</p>
                  <p className="font-medium">
                    <Link href={`/members/${user.id}`} className="font-medium text-ink underline underline-offset-2 hover:text-brand-700">
                      {user.name ?? "-"}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-micro text-muted">이메일</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </CardBody>
            </Card>
          )}

          {org && (
            <Card>
              <CardBody size="sm" className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted" />
                <div>
                  <p className="text-micro text-muted">기관</p>
                  <Link href={`/organizations/${org.id}`} className="text-body-sm font-medium text-ink underline underline-offset-2 hover:text-brand-700">
                    {org.name}
                  </Link>
                </div>
              </CardBody>
            </Card>
          )}

          {order && (
            <Card>
              <CardBody size="sm" className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-muted" />
                <div>
                  <p className="text-micro text-muted">연결된 주문</p>
                  <Link href={`/orders/${order.id as string}`} className="text-body-sm font-medium text-ink underline underline-offset-2 hover:text-brand-700">
                    {order.orderNo as string}
                  </Link>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
