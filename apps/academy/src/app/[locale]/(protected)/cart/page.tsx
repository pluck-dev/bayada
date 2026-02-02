"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Trash2, ShoppingCart, ArrowRight, Tag, Loader2 } from "lucide-react";
import { Card, CardContent, Button, Badge } from "@bayada/ui";
import { formatPrice } from "@bayada/shared";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams, useRouter } from "next/navigation";

interface CartItem {
  courseId: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  price: number;
  category: string;
}

const CART_STORAGE_KEY = "bayada_cart";

function getCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [ordering, setOrdering] = useState(false);
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  useEffect(() => {
    setCartItems(getCartFromStorage());
  }, []);

  const removeItem = useCallback((courseId: string) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => item.courseId !== courseId);
      saveCartToStorage(next);
      return next;
    });
  }, []);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setOrdering(true);
    try {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseIds: cartItems.map((item) => item.courseId),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "주문 생성에 실패했습니다");
        return;
      }
      // 주문 성공: 장바구니 비우고 주문 목록으로 이동
      saveCartToStorage([]);
      setCartItems([]);
      router.push(`/${locale}/orders`);
    } catch {
      alert("네트워크 오류가 발생했습니다");
    } finally {
      setOrdering(false);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

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
          {cartItems.length}개의 강의가 담겨 있습니다
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
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-[color:var(--fg)]">
                            {formatPrice(item.price)}
                          </span>
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

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={ordering}
                >
                  {ordering ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                  {ordering ? "처리 중..." : dict.cart.checkout}
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
