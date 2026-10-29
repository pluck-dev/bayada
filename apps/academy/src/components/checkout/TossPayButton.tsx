"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";

// 토스페이먼츠 결제위젯 SDK v2 "결제창형" (https://docs.tosspayments.com/sdk/v2/js/payment-window) — 쓰는 부분만 타입 선언
interface TossWidgets {
  setAmount(amount: { currency: "KRW"; value: number }): Promise<void>;
  renderPaymentWindow(params: {
    orderName: string;
    variantKey: { paymentMethod: string; agreement: string };
  }): Promise<{
    on(event: "paymentRequest" | "cancel", cb: () => void | Promise<void>): void;
    destroy(): Promise<void>;
  }>;
  requestPayment(params: {
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerEmail?: string;
    customerName?: string;
  }): Promise<void>;
}
type TossPaymentsFactory = (clientKey: string) => { widgets(opts: { customerKey: string }): TossWidgets };

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory;
  }
}

const SDK_URL = "https://js.tosspayments.com/v2/standard";

function loadSdk(): Promise<TossPaymentsFactory> {
  if (window.TossPayments) return Promise.resolve(window.TossPayments);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => (window.TossPayments ? resolve(window.TossPayments) : reject(new Error("sdk"))));
    script.addEventListener("error", () => reject(new Error("sdk")));
    if (!existing) {
      script.src = SDK_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

/**
 * 동의 → 서버에서 결제 대기 주문 생성 → 토스 결제위젯 결제창(카드·간편결제·계좌이체).
 * 결제 인증이 끝나면 토스가 successUrl / failUrl 로 보낸다. 결제창을 닫으면 cancel 이벤트로 정리.
 */
export function TossPayButton({
  clientKey,
  customerKey,
  target,
  locale,
  amountLabel,
  customerEmail,
  customerName,
  refundHref,
}: {
  clientKey: string;
  customerKey: string;
  target: { courseId: string } | { planId: string };
  locale: string;
  amountLabel: string;
  customerEmail: string;
  customerName: string | null;
  refundHref: string | null;
}) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const [factory, res] = await Promise.all([
        loadSdk(),
        fetch("/api/v1/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(target),
        }),
      ]);
      const data = (await res.json().catch(() => ({}))) as {
        orderId?: string;
        amount?: number;
        orderName?: string;
        error?: string;
      };
      if (!res.ok || !data.orderId || !data.amount || !data.orderName) {
        setError(data.error ?? "주문을 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      const origin = window.location.origin;
      const { orderId, amount, orderName } = data;
      const widgets = factory(clientKey).widgets({ customerKey });
      await widgets.setAmount({ currency: "KRW", value: amount });
      // 결제창(오버레이)에서 결제수단·약관을 고르고 "결제하기"를 누르면 paymentRequest
      const paymentWindow = await widgets.renderPaymentWindow({
        orderName,
        variantKey: { paymentMethod: "DEFAULT", agreement: "AGREEMENT" },
      });
      paymentWindow.on("paymentRequest", async () => {
        try {
          await widgets.requestPayment({
            orderId,
            orderName,
            successUrl: `${origin}/${locale}/checkout/success`,
            failUrl: `${origin}/${locale}/checkout/fail`,
            customerEmail,
            ...(customerName ? { customerName } : {}),
          });
        } catch (err) {
          setError((err as { message?: string })?.message ?? "결제를 요청하지 못했어요.");
          await paymentWindow.destroy();
        }
      });
      paymentWindow.on("cancel", () => paymentWindow.destroy());
    } catch (e) {
      setError(
        (e as Error)?.message === "sdk"
          ? "결제 모듈을 불러오지 못했어요. 네트워크를 확인하고 다시 시도해 주세요."
          : ((e as { message?: string })?.message ?? "결제를 시작하지 못했어요.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-relaxed text-ink-soft">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
        />
        <span>
          주문 내용을 확인했으며{" "}
          {refundHref ? (
            <Link href={refundHref} target="_blank" className="font-semibold text-ink underline underline-offset-2">
              환불 규정
            </Link>
          ) : (
            "환불 규정"
          )}
          과{" "}
          <Link href={`/${locale}/terms`} target="_blank" className="font-semibold text-ink underline underline-offset-2">
            이용약관
          </Link>
          에 동의합니다.
        </span>
      </label>
      <button
        type="button"
        onClick={pay}
        disabled={!agreed || loading}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
        {amountLabel} 결제하기
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-brand">
          {error}
        </p>
      )}
    </div>
  );
}
