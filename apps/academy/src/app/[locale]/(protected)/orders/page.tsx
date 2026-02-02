"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  ChevronRight,
  Download,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, Badge, Button, Skeleton } from "@bayada/ui";
import { formatPrice } from "@bayada/shared";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";

interface OrderData {
  id: string;
  orderNo: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    price: number;
    course: { id: string; title: string; slug: string };
  }>;
  invoice?: { id: string } | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    fetch("/api/v1/orders")
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const statusConfig = {
    PENDING: { label: dict.order.pending, variant: "warning" as const },
    CONFIRMED: { label: dict.order.confirmed, variant: "success" as const },
    CANCELLED: { label: dict.order.cancelled, variant: "error" as const },
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-[color:var(--muted)]" />
        <h1 className="mb-2 text-2xl font-bold text-[color:var(--fg)]">
          주문 내역이 없습니다
        </h1>
        <p className="mb-6 text-[color:var(--muted)]">
          강의를 수강하고 학습을 시작해보세요
        </p>
        <Link href={`/${locale}/courses`}>
          <Button size="lg">
            {dict.common.courses}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[color:var(--fg)] sm:text-3xl">
          {dict.order.title}
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">
          강의 구매 및 결제 내역을 확인하세요
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status];
          return (
            <Card key={order.id}>
              <CardContent>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--border)] pb-4">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-[color:var(--muted)]" />
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--fg)]">
                        {order.orderNo}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/${locale}/courses/${item.course.slug}`}
                        className="flex items-center gap-2 text-sm text-[color:var(--fg)] hover:text-[color:var(--brand)]"
                      >
                        <span className="font-medium">{item.course.title}</span>
                        <ChevronRight className="h-4 w-4 text-[color:var(--muted)]" />
                      </Link>
                      <span className="text-sm font-medium text-[color:var(--fg)]">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[color:var(--border)] pt-4">
                  <div className="flex items-center gap-2">
                    {order.status === "CONFIRMED" && (
                      <Button variant="ghost" size="sm">
                        <Download className="mr-1.5 h-4 w-4" />
                        {dict.order.invoice}
                      </Button>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[color:var(--muted)]">
                      {dict.order.amount}
                    </p>
                    <p className="text-lg font-bold text-[color:var(--fg)]">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
