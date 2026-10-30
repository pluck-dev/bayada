"use client";

import { useState } from "react";
import { refundOrder, rejectRefundRequest } from "@/lib/actions/orders";
import { Button, Card, Field, cx, inputClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

/** 환불 처리 — 전액·부분 금액 + 사유 → 토스 결제 취소 API. 요청 반려도 여기서 */
export function RefundPanel({
  orderId,
  canRefund,
  remaining,
  totalAmount,
  request,
  notRefundableReason,
}: {
  orderId: string;
  canRefund: boolean;
  remaining: number;
  totalAmount: number;
  request: { reason: string; at: string } | null;
  notRefundableReason: string | null;
}) {
  const { run, isPending } = useAction();
  const [amount, setAmount] = useState(remaining);
  const [reason, setReason] = useState(request?.reason ?? "");
  const [memo, setMemo] = useState("");
  const full = amount === remaining && remaining === totalAmount;
  const completes = amount === remaining;

  return (
    <Card title="환불 처리">
      {request && (
        <div className="mb-4 rounded-md border border-danger-line bg-danger-soft px-3 py-2.5 text-caption text-danger">
          <p className="font-medium">학습자 환불 요청 · {request.at}</p>
          <p className="mt-0.5">사유: {request.reason}</p>
        </div>
      )}
      {!canRefund ? (
        <p className="text-caption text-muted">{notRefundableReason ?? "환불할 수 없는 주문입니다."}</p>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => refundOrder(orderId, amount, reason), {
              confirm: {
                title: `${amount.toLocaleString()}원을 환불할까요?`,
                body: completes
                  ? "토스페이먼츠 결제를 취소합니다. 전액 환불이 되면 이 주문으로 생긴 수강권(수강 등록·패스 구독)을 회수합니다. 되돌릴 수 없습니다."
                  : "토스페이먼츠 결제를 부분 취소합니다. 수강권은 유지됩니다. 되돌릴 수 없습니다.",
                confirmLabel: "환불",
                danger: true,
              },
            });
          }}
        >
          <Field label="환불 금액 (원)" htmlFor="rf-amount" hint={`환불 가능 ${remaining.toLocaleString()}원`}>
            <div className="flex gap-1.5">
              <input
                id="rf-amount"
                type="number"
                min={1}
                max={remaining}
                required
                className={cx(inputClass, "tabular")}
                value={amount || ""}
                onChange={(e) => setAmount(Math.min(remaining, Math.max(0, Math.round(Number(e.target.value) || 0))))}
              />
              <Button size="md" variant="secondary" onClick={() => setAmount(remaining)} disabled={amount === remaining}>
                전액
              </Button>
            </div>
          </Field>
          <Field label="환불 사유" htmlFor="rf-reason" hint="토스 결제 취소 사유로 전달되고 감사 로그에 남습니다.">
            <textarea
              id="rf-reason"
              rows={2}
              required
              minLength={2}
              maxLength={200}
              className={textareaClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <p className="text-micro text-muted">
            {completes
              ? full
                ? "전액 환불 → 주문 상태 '환불', 수강권 회수"
                : "남은 금액 전부 환불 → 주문 상태 '환불', 수강권 회수"
              : "부분 환불 → 주문은 '결제 완료' 유지, 환불 금액 누적"}
          </p>
          <Button type="submit" variant="danger" disabled={isPending || amount < 1 || reason.trim().length < 2}>
            {amount.toLocaleString()}원 환불
          </Button>
        </form>
      )}
      {request && (
        <div className="mt-4 border-t border-line pt-4">
          <Field label="요청 반려" htmlFor="rf-memo" hint="학습자 결제 상세에 반려 안내로 보입니다.">
            <textarea id="rf-memo" rows={2} maxLength={500} className={textareaClass} value={memo} onChange={(e) => setMemo(e.target.value)} />
          </Field>
          <Button
            className="mt-2"
            variant="secondary"
            disabled={isPending || memo.trim().length < 2}
            onClick={() =>
              run(() => rejectRefundRequest(orderId, memo), {
                confirm: { title: "환불 요청을 반려할까요?", body: "결제는 그대로 유지됩니다.", confirmLabel: "반려" },
              })
            }
          >
            요청 반려
          </Button>
        </div>
      )}
    </Card>
  );
}
