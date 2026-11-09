"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@bayada/ui";
import { cancelBooking, rateBooking } from "@/lib/member/actions";
import { BookingForm, type BookingDefaults } from "./BookingForm";
import { ActionMessage, ConfirmDialog, useMemberAction } from "./controls";
import { btnClass, textareaClass } from "./ui";

export function BookingActions({
  locale,
  id,
  bookingNumber,
  canChange,
  canCancel,
  cancelHint,
  defaults,
  minDate,
  maxDate,
}: {
  locale: string;
  id: string;
  bookingNumber: string;
  canChange: boolean;
  canCancel: boolean;
  cancelHint?: string;
  defaults: BookingDefaults;
  minDate: string;
  maxDate: string;
}) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const { run, pending, result } = useMemberAction();

  if (editing) {
    return <BookingForm locale={locale} bookingId={id} defaults={defaults} minDate={minDate} maxDate={maxDate} onDone={() => setEditing(false)} />;
  }
  return (
    <div className="flex flex-col gap-3">
      <ActionMessage result={result} />
      <div className="flex flex-wrap gap-2">
        {canChange && (
          <button type="button" onClick={() => setEditing(true)} className={btnClass("outline", "sm")}>
            신청 내용 변경
          </button>
        )}
        {canCancel && (
          <button type="button" onClick={() => setConfirm(true)} className={btnClass("danger", "sm")}>
            예약 취소
          </button>
        )}
      </div>
      {cancelHint && <p className="text-sm text-[color:var(--muted)]">{cancelHint}</p>}
      <ConfirmDialog
        open={confirm}
        title={`${bookingNumber} 예약을 취소할까요?`}
        body="취소한 예약은 되돌릴 수 없어요. 필요하면 새로 신청해 주세요."
        confirmLabel="예약 취소"
        danger
        pending={pending}
        onClose={() => setConfirm(false)}
        onConfirm={() => run(() => cancelBooking(id, reason), { onSuccess: () => setConfirm(false) })}
      >
        <label className="text-sm font-semibold" htmlFor="cancel-reason">
          취소 사유 (선택)
        </label>
        <textarea id="cancel-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} className={cn(textareaClass, "mt-1.5 min-h-[80px]")} placeholder="일정 변경, 입원 등" />
      </ConfirmDialog>
    </div>
  );
}

export function RatingForm({ id }: { id: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const { run, pending, result } = useMemberAction();
  const label = ["", "아쉬워요", "부족해요", "보통이에요", "좋았어요", "최고예요"];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => rateBooking(id, rating, comment));
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-3">
        <div role="radiogroup" aria-label="별점" className="flex" onPointerLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n}점`}
              onPointerEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className="p-1"
            >
              <Star className={cn("size-8 transition-colors", (hover || rating) >= n ? "fill-amber-400 text-amber-400" : "text-gray-300")} aria-hidden />
            </button>
          ))}
        </div>
        <span className="text-sm font-semibold text-[color:var(--muted)]">{label[hover || rating]}</span>
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} className={textareaClass} placeholder="담당자에게 전하고 싶은 말, 좋았던 점이나 아쉬운 점을 적어 주세요 (선택)" aria-label="평가 내용" />
      <ActionMessage result={result} />
      <div>
        <button type="submit" disabled={pending || rating === 0} className={btnClass("primary", "sm")}>
          {pending ? "남기는 중…" : "평가 남기기"}
        </button>
      </div>
    </form>
  );
}
