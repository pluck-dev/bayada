"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingCart, ArrowRight, Tag } from "lucide-react";
import { Card, CardContent, Button, Badge } from "@bayada/ui";
import { formatPrice } from "@bayada/shared";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";

// 플레이스홀더 장바구니 데이터
const initialCartItems = [
  {
    courseId: "c1",
    slug: "home-care-basics",
    title: "재가 돌봄 서비스 기초 과정",
    instructor: "김영희 강사",
    thumbnail: null,
    price: 89000,
    originalPrice: 120000,
    category: "간호 교육",
  },
  {
    courseId: "c2",
    slug: "emergency-response-2024",
    title: "응급 상황 대응 매뉴얼 (2024)",
    instructor: "강도현 강사",
    thumbnail: null,
    price: 75000,
    originalPrice: 75000,
    category: "안전 교육",
  },
  {
    courseId: "c3",
    slug: "dementia-care-advanced",
    title: "치매 환자 돌봄 심화 과정",
    instructor: "정미경 강사",
    thumbnail: null,
    price: 120000,
    originalPrice: 150000,
    category: "간호 교육",
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();

  const removeItem = (courseId: string) => {
    setCartItems((prev) => prev.filter((item) => item.courseId !== courseId));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
  const totalOriginalPrice = cartItems.reduce(
    (sum, item) => sum + item.originalPrice,
    0
  );
  const totalDiscount = totalOriginalPrice - totalPrice;

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-[color:var(--muted)]" />
        <h1 className="mb-2 text-2xl font-bold text-[color:var(--fg)]">
          {dict.cart.empty}
        </h1>
        <p className="mb-6 text-[color:var(--muted)]">
          마음에 드는 강의를 담아보세요
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
          {dict.cart.title}
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">
          {cartItems.length}개의 강의가 담겨있습니다
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 장바구니 아이템 목록 */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.courseId}>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* 썸네일 */}
                    <Link
                      href={`/${locale}/courses/${item.slug}`}
                      className="aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-[color:var(--surface-3)] sm:w-40"
                    >
                      <div className="flex h-full items-center justify-center text-[color:var(--muted)]">
                        <svg
                          className="h-8 w-8"
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
                    </Link>

                    {/* 정보 */}
                    <div className="flex flex-1 flex-col">
                      <Badge variant="secondary" className="mb-1 w-fit">
                        {item.category}
                      </Badge>
                      <Link
                        href={`/${locale}/courses/${item.slug}`}
                        className="mb-1 font-semibold text-[color:var(--fg)] hover:text-[color:var(--brand)]"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-[color:var(--muted)]">
                        {item.instructor}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-[color:var(--fg)]">
                            {formatPrice(item.price)}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="text-sm text-[color:var(--muted)] line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.courseId)}
                          className="rounded-lg p-2 text-[color:var(--muted)] transition-colors hover:bg-[color:var(--error-bg)] hover:text-[color:var(--error)]"
                          aria-label={dict.cart.remove}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 결제 요약 */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardContent className="space-y-4">
                <h2 className="text-lg font-bold text-[color:var(--fg)]">
                  주문 요약
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[color:var(--muted)]">
                    <span>정가</span>
                    <span>{formatPrice(totalOriginalPrice)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-[color:var(--error)]">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        할인
                      </span>
                      <span>-{formatPrice(totalDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t border-[color:var(--border)] pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[color:var(--fg)]">
                        {dict.cart.total}
                      </span>
                      <span className="text-xl font-bold text-[color:var(--brand)]">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  {dict.cart.checkout}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-center text-xs text-[color:var(--muted)]">
                  결제 완료 시 바로 수강할 수 있습니다
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
