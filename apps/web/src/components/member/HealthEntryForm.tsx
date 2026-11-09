"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { addHealthRecord, deleteHealthRecord } from "@/lib/member/actions";
import { btnClass, Field, inputClass } from "./ui";
import { ActionMessage, ConfirmDialog, DatePicker, Select, useMemberAction } from "./controls";

const FIELDS = [
  { k: "bloodPressureSys", label: "수축기", unit: "mmHg", ph: "120" },
  { k: "bloodPressureDia", label: "이완기", unit: "mmHg", ph: "80" },
  { k: "bloodSugar", label: "혈당", unit: "mg/dL", ph: "100" },
  { k: "temperature", label: "체온", unit: "°C", ph: "36.5" },
  { k: "heartRate", label: "맥박", unit: "bpm", ph: "72" },
  { k: "weight", label: "체중", unit: "kg", ph: "60" },
] as const;

const HOURS = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);

export function HealthEntryForm({ today, nowSlot }: { today: string; nowSlot: string }) {
  const [v, setV] = useState<Record<string, string>>({});
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(nowSlot);
  const [notes, setNotes] = useState("");
  const { run, pending, result } = useMemberAction();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => addHealthRecord({ ...v, notes, recordedAt: `${date}T${time}` }), { onSuccess: () => (setV({}), setNotes("")) });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <Field key={f.k} label={f.label} htmlFor={`h-${f.k}`}>
            <div className="relative">
              <input
                id={`h-${f.k}`}
                inputMode="decimal"
                autoComplete="off"
                value={v[f.k] ?? ""}
                onChange={(e) => setV((s) => ({ ...s, [f.k]: e.target.value.replace(/[^0-9.]/g, "") }))}
                className={`${inputClass} pr-14 tabular-nums`}
                placeholder={f.ph}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">{f.unit}</span>
            </div>
          </Field>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="측정 날짜" htmlFor="h-date">
          <DatePicker id="h-date" value={date} onChange={setDate} max={today} />
        </Field>
        <Field label="측정 시각" htmlFor="h-time">
          <Select id="h-time" value={time} onChange={setTime} options={HOURS.map((h) => ({ value: h, label: h }))} />
        </Field>
      </div>
      <Field label="메모" htmlFor="h-notes">
        <input id="h-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} className={inputClass} placeholder="식후 2시간, 어지러움 등" />
      </Field>
      <ActionMessage result={result} />
      <div>
        <button type="submit" disabled={pending} className={btnClass("primary")}>
          {pending ? "저장하는 중…" : "기록 저장"}
        </button>
      </div>
      <p className="text-xs leading-relaxed text-[color:var(--muted)]">
        측정한 항목만 적으면 돼요. 혈압은 수축기·이완기를 함께 적어요. 기록은 참고용이며 진단을 대신하지 않아요.
      </p>
    </form>
  );
}

export function DeleteRecordButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const { run, pending } = useMemberAction();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600" aria-label="기록 지우기">
        <Trash2 className="size-4" />
      </button>
      <ConfirmDialog open={open} title="이 기록을 지울까요?" body="지운 기록은 되돌릴 수 없어요." confirmLabel="지우기" danger pending={pending} onClose={() => setOpen(false)} onConfirm={() => run(() => deleteHealthRecord(id), { onSuccess: () => setOpen(false) })} />
    </>
  );
}
