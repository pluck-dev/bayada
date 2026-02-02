import { Search, Download } from "lucide-react";
import { Button, Badge, DataTable, type Column, Input } from "@bayada/ui";
import {
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  formatPrice,
} from "@bayada/shared";
import type { OrderStatusValue, OrderTypeValue } from "@bayada/shared";
import { orderService } from "@/lib/services";

interface OrderRow {
  [key: string]: unknown;
  id: string;
  orderNo: string;
  customer: string;
  email: string;
  type: OrderTypeValue;
  items: string;
  quantity: number;
  amount: number;
  status: OrderStatusValue;
  createdAt: string;
}

const statusBadgeVariant: Record<OrderStatusValue, "success" | "warning" | "error"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  CANCELLED: "error",
};

const typeBadgeVariant: Record<OrderTypeValue, "info" | "default"> = {
  B2C: "info",
  B2B: "default",
};

const columns: Column<OrderRow>[] = [
  {
    key: "orderNo",
    header: "주문번호",
    render: (row) => (
      <span className="font-mono text-xs">{row.orderNo}</span>
    ),
  },
  {
    key: "customer",
    header: "고객",
    render: (row) => (
      <div>
        <p className="font-medium text-[color:var(--fg)]">{row.customer}</p>
        <p className="text-xs text-[color:var(--muted)]">{row.email}</p>
      </div>
    ),
  },
  {
    key: "type",
    header: "유형",
    render: (row) => (
      <Badge variant={typeBadgeVariant[row.type]}>
        {ORDER_TYPE_LABELS[row.type]}
      </Badge>
    ),
  },
  {
    key: "items",
    header: "강의",
    render: (row) => (
      <div>
        <p className="text-sm">{row.items}</p>
        {row.quantity > 1 && (
          <p className="text-xs text-[color:var(--muted)]">{row.quantity}명</p>
        )}
      </div>
    ),
  },
  {
    key: "amount",
    header: "금액",
    render: (row) => (
      <span className="font-medium">{formatPrice(row.amount)}</span>
    ),
  },
  {
    key: "status",
    header: "상태",
    render: (row) => (
      <Badge variant={statusBadgeVariant[row.status]}>
        {ORDER_STATUS_LABELS[row.status]}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    header: "주문일",
  },
  {
    key: "actions",
    header: "",
    render: () => (
      <Button variant="ghost" size="sm">
        상세
      </Button>
    ),
  },
];

export default async function OrdersPage() {
  const result = await orderService.list({});

  const orders: OrderRow[] = result.items.map((o) => {
    const order = o as Record<string, unknown>;
    const user = order.user as { name: string | null; email: string } | null;
    const org = order.organization as { name: string } | null;
    const items = (order.items as Array<{ course?: { title: string } }>) ?? [];
    const firstItem = items[0]?.course?.title ?? "-";
    const itemLabel = items.length > 1 ? `${firstItem} 외 ${items.length - 1}건` : firstItem;

    return {
      id: order.id as string,
      orderNo: order.orderNo as string,
      customer: org?.name ?? user?.name ?? "-",
      email: user?.email ?? "-",
      type: (order.type as OrderTypeValue) ?? "B2C",
      items: itemLabel,
      quantity: (order.quantity as number) ?? 1,
      amount: order.totalAmount as number,
      status: order.status as OrderStatusValue,
      createdAt: new Date(order.createdAt as string).toLocaleDateString("ko-KR"),
    };
  });

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--fg)]">
            주문 관리
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            전체 주문을 조회하고 처리합니다.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          엑셀 다운로드
        </Button>
      </div>

      {/* 필터/검색 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          <Input
            placeholder="주문번호 또는 고객명으로 검색..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            전체
          </Button>
          <Button variant="ghost" size="sm">
            대기
          </Button>
          <Button variant="ghost" size="sm">
            확정
          </Button>
          <Button variant="ghost" size="sm">
            취소
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            개인(B2C)
          </Button>
          <Button variant="ghost" size="sm">
            기관(B2B)
          </Button>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <DataTable<OrderRow> columns={columns} data={orders} keyField="id" />

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted)]">
          전체 {orders.length}건
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            이전
          </Button>
          <Button variant="outline" size="sm" disabled>
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
