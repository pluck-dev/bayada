"use client";

import Link from "next/link";
import {
  Receipt,
  ChevronRight,
  Download,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, Badge, Button } from "@bayada/ui";
import { formatPrice } from "@bayada/shared";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";

// 플레이스홀더 주문 데이터
const orders = [
  {
    id: "ORD-20241228-001",
    date: "2024.12.28",
    status: "CONFIRMED" as const,
    items: [
      {
        courseId: "c1",
        slug: "home-care-basics",
        title: "재가 돌봄 서비스 기초 과정",
        price: 89000,
      },
      {
        courseId: "c5",
        slug: "emergency-response-2024",
        title: "응급 상황 대응 매뉴얼 (2024)",
        price: 75000,
      },
    ],
    totalPrice: 164000,
    paymentMethod: "카드결제",
  },
  {
    id: "ORD-20241215-003",
    date: "2024.12.15",
    status: "CONFIRMED" as const,
    items: [
      {
        courseId: "c3",
        slug: "infection-control",
        title: "감염 관리 및 예방 교육",
        price: 55000,
      },
    ],
    totalPrice: 55000,
    paymentMethod: "카드결제",
  },
  {
    id: "ORD-20241201-007",
    date: "2024.12.01",
    status: "CONFIRMED" as const,
    items: [
      {
        courseId: "c4",
        slug: "patient-safety-essentials",
        title: "환자 안전 관리 필수 과정",
        price: 65000,
      },
    ],
    totalPrice: 65000,
    paymentMethod: "계좌이체",
  },
  {
    id: "ORD-20241120-002",
    date: "2024.11.20",
    status: "CANCELLED" as const,
    items: [
      {
        courseId: "c6",
        slug: "nutrition-care",
        title: "영양 관리 및 식이 요법",
        price: 68000,
      },
    ],
    totalPrice: 68000,
    paymentMethod: "카드결제",
  },
];

export default function OrdersPage() {
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();

  const statusConfig = {
    PENDING: { label: dict.order.pending, variant: "warning" as const },
    CONFIRMED: { label: dict.order.confirmed, variant: "success" as const },
    CANCELLED: { label: dict.order.cancelled, variant: "error" as const },
  };

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
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[color:var(--fg)] sm:text-3xl">
          {dict.order.title}
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">
          강의 구매 및 결제 내역을 확인하세요
        </p>
      </div>

      {/* 주문 목록 */}
      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status];
          return (
            <Card key={order.id}>
              <CardContent>
                {/* 주문 헤더 */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--border)] pb-4">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-[color:var(--muted)]" />
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--fg)]">
                        {order.id}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {order.date} | {order.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                {/* 주문 아이템 */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.courseId}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/${locale}/courses/${item.slug}`}
                        className="flex items-center gap-2 text-sm text-[color:var(--fg)] hover:text-[color:var(--brand)]"
                      >
                        <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded bg-[color:var(--surface-3)]">
                          <svg
                            className="h-5 w-5 text-[color:var(--muted)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium">{item.title}</span>
                        <ChevronRight className="h-4 w-4 text-[color:var(--muted)]" />
                      </Link>
                      <span className="text-sm font-medium text-[color:var(--fg)]">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 주문 푸터 */}
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
                      {formatPrice(order.totalPrice)}
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
