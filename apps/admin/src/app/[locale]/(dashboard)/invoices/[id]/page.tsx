import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShoppingCart, Building2 } from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from "@bayada/ui";
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

const statusBadgeVariant: Record<InvoiceStatus, "secondary" | "info" | "success" | "error" | "warning"> = {
  DRAFT: "secondary",
  SENT: "info",
  PAID: "success",
  OVERDUE: "error",
  CANCELLED: "warning",
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
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[color:var(--fg)]">
              청구서 {inv.invoiceNo as string}
            </h1>
            <Badge variant={statusBadgeVariant[inv.status as InvoiceStatus]}>
              {statusLabels[inv.status as InvoiceStatus]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            발행일: {new Date(inv.issueDate as string).toLocaleDateString("ko-KR")}
            {" · "}
            납부기한: {inv.dueDate ? new Date(inv.dueDate as string).toLocaleDateString("ko-KR") : "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 청구 항목 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>청구 항목</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--border)]">
                  <th className="pb-3 text-left font-medium text-[color:var(--muted)]">강의</th>
                  <th className="pb-3 text-center font-medium text-[color:var(--muted)]">수량</th>
                  <th className="pb-3 text-right font-medium text-[color:var(--muted)]">금액</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[color:var(--border)] last:border-0">
                    <td className="py-3">{item.course.title}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">{formatPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="pt-3 text-right text-[color:var(--muted)]">공급가</td>
                  <td className="pt-3 text-right font-medium">{formatPrice(totalAmount)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="pt-1 text-right text-[color:var(--muted)]">부가세 (10%)</td>
                  <td className="pt-1 text-right font-medium">{formatPrice(taxAmount)}</td>
                </tr>
                <tr className="border-t-2 border-[color:var(--border)]">
                  <td colSpan={2} className="pt-3 text-right font-bold text-[color:var(--fg)]">합계</td>
                  <td className="pt-3 text-right text-lg font-bold text-[color:var(--fg)]">
                    {formatPrice(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* 고객/주문 정보 */}
        <div className="space-y-4">
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">고객 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-[color:var(--muted)]">이름</p>
                  <p className="font-medium">
                    <Link href={`/users/${user.id}`} className="text-[#ce0e2d] hover:underline">
                      {user.name ?? "-"}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--muted)]">이메일</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {org && (
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Building2 className="h-5 w-5 text-[color:var(--muted)]" />
                <div>
                  <p className="text-xs text-[color:var(--muted)]">기관</p>
                  <Link href={`/organizations/${org.id}`} className="text-sm font-medium text-[#ce0e2d] hover:underline">
                    {org.name}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {order && (
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <ShoppingCart className="h-5 w-5 text-[color:var(--muted)]" />
                <div>
                  <p className="text-xs text-[color:var(--muted)]">연결된 주문</p>
                  <Link href={`/orders/${order.id as string}`} className="text-sm font-medium text-[#ce0e2d] hover:underline">
                    {order.orderNo as string}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
