"use client";

import { useState } from "react";
import Link from "next/link";
import { TIME_SLOTS, TIME_SLOT_LABEL } from "@bayada/shared/member";
import { addBookingMemo, cancelBookingAdmin, completeBooking, confirmBooking, rescheduleBooking } from "@/lib/actions/web-bookings";
import { Button, Card, DatePicker, Dialog, Field, Notice, Segmented, Select, cx, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

const TIMES = Array.from({ length: 29 }, (_, i) => {
  const min = 8 * 60 + i * 30;
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
});

export function BookingControls({
  id,
  bookingNumber,
  status,
  staff,
  current,
  hasVisit,
  membersHref,
}: {
  id: string;
  bookingNumber: string;
  status: string;
  staff: { id: string; label: string }[];
  current: { staffId: string; date: string; timeSlot: string; scheduledTime: string };
  hasVisit: boolean;
  membersHref: string | null;
}) {
  const { run, isPending } = useAction();
  const [v, setV] = useState(current);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const open = status === "REQUESTED" || status === "CONFIRMED";

  if (!open) {
    return (
      <div data-tour="booking-controls">
        <Card title="처리">
          <p className="text-caption text-muted">
            {status === "COMPLETED" ? (hasVisit ? "방문 기록까지 끝난 예약입니다." : "완료 처리된 예약입니다.") : "취소된 예약입니다. 다시 열 수 없습니다 — 회원이 새로 신청해야 합니다."}
          </p>
        </Card>
      </div>
    );
  }

  const input = { staffId: v.staffId, date: v.date, timeSlot: v.timeSlot, scheduledTime: v.scheduledTime };
  return (
    <div data-tour="booking-controls" className="flex flex-col gap-4">
      <Card title={status === "REQUESTED" ? "확정·담당자 배정" : "담당자·일정"}>
        <fieldset disabled={isPending} className="flex flex-col gap-3">
          <Field label="담당자" htmlFor="bk-staff" required>
            <Select id="bk-staff" value={v.staffId} onChange={(x) => setV((s) => ({ ...s, staffId: x }))} options={staff.map((s) => ({ value: s.id, label: s.label }))} placeholder="방문 인력 선택" />
          </Field>
          {staff.length === 0 && (
            <Notice tone="warning">
              지정된 방문 인력이 없습니다.{" "}
              {membersHref ? (
                <Link href={membersHref} className="font-bold underline">
                  홈페이지 회원
                </Link>
              ) : (
                "홈페이지 회원"
              )}
              에서 제공자 회원을 방문 인력으로 지정하세요.
            </Notice>
          )}
          <Field label="방문일" htmlFor="bk-date" required>
            <DatePicker id="bk-date" value={v.date} onChange={(x) => setV((s) => ({ ...s, date: x }))} clearable={false} />
          </Field>
          <Field label="시간대" required>
            <Segmented
              aria-label="시간대"
              fullWidth
              size="sm"
              value={v.timeSlot as (typeof TIME_SLOTS)[number]}
              onChange={(x) => setV((s) => ({ ...s, timeSlot: x }))}
              options={TIME_SLOTS.map((t) => ({ value: t, label: TIME_SLOT_LABEL[t].split(" ")[0] }))}
            />
          </Field>
          <Field label="방문 시각" htmlFor="bk-time" hint="회원과 정한 시각. 비워 두면 시간대만 안내합니다.">
            <Select id="bk-time" value={v.scheduledTime} onChange={(x) => setV((s) => ({ ...s, scheduledTime: x }))} options={[{ value: "", label: "정하지 않음" }, ...TIMES.map((t) => ({ value: t, label: t }))]} />
          </Field>
          {status === "REQUESTED" ? (
            <Button variant="brand" disabled={isPending || !v.staffId} onClick={() => run(() => confirmBooking(id, input))}>
              예약 확정
            </Button>
          ) : (
            <Button variant="primary" disabled={isPending || !v.staffId} onClick={() => run(() => rescheduleBooking(id, input))}>
              담당자·일정 저장
            </Button>
          )}
        </fieldset>
      </Card>

      <Card title="상태 변경">
        <div className="flex flex-col gap-2">
          {status === "CONFIRMED" && (
            <Button
              variant="secondary"
              disabled={isPending}
              onClick={() =>
                run(() => completeBooking(id), {
                  confirm: {
                    title: `${bookingNumber} 을(를) 완료 처리할까요?`,
                    body: "보통은 담당자가 홈페이지 마이페이지에서 방문 기록을 쓰면 자동으로 완료됩니다. 방문 기록 없이 완료하면 회원 만족도 평가가 열리지 않습니다.",
                    confirmLabel: "완료 처리",
                  },
                })
              }
            >
              방문 기록 없이 완료 처리
            </Button>
          )}
          <Button variant="ghost" disabled={isPending} onClick={() => setCancelOpen(true)}>
            예약 취소
          </Button>
        </div>
      </Card>

      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={`${bookingNumber} 예약을 취소할까요?`}
        description="취소 사유는 회원 마이페이지에 그대로 보입니다. 취소한 예약은 다시 열 수 없습니다."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              닫기
            </Button>
            <Button variant="danger" disabled={isPending || !reason.trim()} onClick={() => run(() => cancelBookingAdmin(id, reason), { onSuccess: () => setCancelOpen(false) })}>
              예약 취소
            </Button>
          </>
        }
      >
        <textarea aria-label="취소 사유" data-autofocus rows={3} maxLength={300} className={cx(textareaClass)} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="예: 담당 가능 인력 없음, 회원 요청" />
      </Dialog>
    </div>
  );
}

export function BookingMemoForm({ id }: { id: string }) {
  const { run, isPending } = useAction();
  const [body, setBody] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => addBookingMemo(id, body), { onSuccess: () => setBody("") });
      }}
      className="flex flex-col gap-2"
    >
      <textarea aria-label="내부 메모" rows={2} maxLength={2000} placeholder="통화 내용, 특이사항 등 내부 메모 (회원에게 보이지 않습니다)" className={cx(textareaClass)} value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="flex justify-end">
        <Button type="submit" size="sm" variant="primary" disabled={isPending || !body.trim()}>
          메모 남기기
        </Button>
      </div>
    </form>
  );
}
