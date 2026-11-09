"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BOOKABLE_SERVICES, TIME_SLOTS, TIME_SLOT_LABEL } from "@bayada/shared/member";
import { createBooking, updateBooking } from "@/lib/member/actions";
import { formatPhone } from "@/lib/phone";
import { btnClass, Field, inputClass, textareaClass } from "./ui";
import { ActionMessage, ChoiceChips, DatePicker, Select, useMemberAction } from "./controls";

export interface BookingDefaults {
  patientId?: string;
  serviceType?: string;
  date?: string;
  timeSlot?: string;
  address?: string;
  contactPhone?: string;
  notes?: string;
}

export function BookingForm({
  locale,
  patients,
  defaults,
  bookingId,
  minDate,
  maxDate,
  onDone,
}: {
  locale: string;
  /** 보호자: 연결된 가족 (이용자 본인은 비움) */
  patients?: { id: string; label: string }[];
  defaults: BookingDefaults;
  bookingId?: string;
  minDate: string;
  maxDate: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [v, setV] = useState<BookingDefaults>(defaults);
  const set = (k: keyof BookingDefaults) => (x: string) => setV((s) => ({ ...s, [k]: x }));
  const { run, pending, result } = useMemberAction();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      patientId: v.patientId,
      serviceType: v.serviceType ?? "",
      date: v.date ?? "",
      timeSlot: v.timeSlot ?? "",
      address: v.address ?? "",
      contactPhone: v.contactPhone,
      notes: v.notes,
    };
    if (bookingId) {
      run(() => updateBooking(bookingId, input), { onSuccess: onDone });
    } else {
      run(
        async () => {
          const r = await createBooking(input);
          if (r.ok && r.id) router.push(`/${locale}/my-page/bookings/${r.id}?created=1`);
          return r;
        },
        { refresh: false },
      );
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {patients && (
        <Field label="서비스를 받을 가족" required>
          <ChoiceChips aria-label="서비스를 받을 가족" value={v.patientId ?? ""} onChange={(x) => set("patientId")(x as string)} options={patients.map((p) => ({ value: p.id, label: p.label }))} />
        </Field>
      )}
      <Field label="서비스" htmlFor="svc" required>
        <Select id="svc" value={v.serviceType ?? ""} onChange={set("serviceType")} options={BOOKABLE_SERVICES.map((s) => ({ value: s.slug, label: s.name }))} placeholder="서비스를 골라 주세요" />
      </Field>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="희망 방문일" htmlFor="date" required help="내일부터 90일 안에서 고를 수 있어요.">
          <DatePicker id="date" value={v.date ?? ""} onChange={set("date")} min={minDate} max={maxDate} />
        </Field>
        <Field label="희망 시간대" required>
          <ChoiceChips aria-label="희망 시간대" value={v.timeSlot ?? ""} onChange={(x) => set("timeSlot")(x as string)} options={TIME_SLOTS.map((t) => ({ value: t, label: TIME_SLOT_LABEL[t].split(" ")[0], hint: TIME_SLOT_LABEL[t].split(" ")[1] }))} columns={3} />
        </Field>
      </div>
      <Field label="방문 주소" htmlFor="addr" required help="동·호수까지 적어 주세요.">
        <input id="addr" value={v.address ?? ""} onChange={(e) => set("address")(e.target.value)} maxLength={200} className={inputClass} placeholder="서울시 ○○구 ○○로 00, 000동 000호" />
      </Field>
      <Field label="방문 당일 연락처" htmlFor="phone" help="비워 두면 회원 정보의 휴대폰 번호로 연락드려요.">
        <input id="phone" inputMode="numeric" value={v.contactPhone ?? ""} onChange={(e) => set("contactPhone")(formatPhone(e.target.value))} className={inputClass} placeholder="010-0000-0000" />
      </Field>
      <Field label="요청 사항" htmlFor="notes">
        <textarea id="notes" value={v.notes ?? ""} onChange={(e) => set("notes")(e.target.value)} maxLength={1000} className={textareaClass} placeholder="거동 상태, 주차, 반려동물, 꼭 알아야 할 건강 상태 등" />
      </Field>
      <ActionMessage result={result} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onDone && (
          <button type="button" onClick={onDone} className={btnClass("secondary")}>
            닫기
          </button>
        )}
        <button type="submit" disabled={pending} className={btnClass("primary")}>
          {pending ? "저장하는 중…" : bookingId ? "변경 내용 저장" : "예약 신청하기"}
        </button>
      </div>
    </form>
  );
}
