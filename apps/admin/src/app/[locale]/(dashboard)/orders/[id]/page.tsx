import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Building2, FileText } from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from "@bayada/ui";
import { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS, formatPrice } from "@bayada/shared";
import type { OrderStatusValue, OrderTypeValue } from "@bayada/shared";
import { orderService } from "@/lib/services";

const statusBadgeVariant: Record<OrderStatusValue, "success" | "warning" | "error"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  CANCELLED: "error",
};

const typeBadgeVariant: Record<OrderTypeValue, "info" | "default"> = {
  B2C: "info",
  B2B: "default",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order: Awaited<ReturnType<typeof orderService.getById>>;
  try {
    order = await orderService.getById(id);
  } catch {
    notFound();
  }

  const o = order as Record<string, unknown>;
  const user = o.user as { id: string; name: string | null; email: string } | null;
  const org = o.organization as { id: string; name: string } | null;
  const items = (o.items as Array<{ id: string; quantity: number; price: number; course: { id: string; title: string } }>) ?? [];
  const invoice = o.invoice as { id: string } | null;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[color:var(--fg)]">
              주문 {o.orderNo as string}
            </h1>
            <Badge variant={statusBadgeVariant[o.status as OrderStatusValue]}>
              {ORDER_STATUS_LABELS[o.status as string]}
            </Badge>
            <Badge variant={typeBadgeVariant[o.type as OrderTypeValue]}>
              {ORDER_TYPE_LABELS[o.type as string]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            주문일: {new Date(o.createdAt as string).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 주문 항목 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>주문 항목</CardTitle>
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
                    <td className="py-3">
                      <Link
                        href={`/courses/${item.course.id}/edit`}
                        className="text-[#ce0e2d] hover:underline"
                      >
                        {item.course.title}
                      </Link>
                    </td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">{formatPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[color:var(--border)]">
                  <td colSpan={2} className="pt-3 text-right font-medium text-[color:var(--fg)]">
                    합계
                  </td>
                  <td className="pt-3 text-right text-lg font-bold text-[color:var(--fg)]">
                    {formatPrice(o.totalAmount as number)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* 고객 정보 + 청구서 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                고객 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-[color:var(--muted)]">이름</p>
                <p className="font-medium">
                  <Link href={`/users/${user?.id}`} className="text-[#ce0e2d] hover:underline">
                    {user?.name ?? "-"}
                  </Link>
                </p>
              </div>
              <div>
                <p className="text-xs text-[color:var(--muted)]">이메일</p>
                <p className="font-medium">{user?.email ?? "-"}</p>
              </div>
              {org && (
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 text-[color:var(--muted)]" />
                  <div>
                    <p className="text-xs text-[color:var(--muted)]">소속 기관</p>
                    <p className="font-medium">
                      <Link href={`/organizations/${org.id}`} className="text-[#ce0e2d] hover:underline">
                        {org.name}
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {invoice && (
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <FileText className="h-5 w-5 text-[color:var(--muted)]" />
                <div className="flex-1">
                  <p className="text-xs text-[color:var(--muted)]">청구서</p>
                  <Link href={`/invoices/${invoice.id}`} className="text-sm font-medium text-[#ce0e2d] hover:underline">
                    청구서 보기
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
