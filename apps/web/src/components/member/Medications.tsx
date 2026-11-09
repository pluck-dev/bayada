"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@bayada/ui";
import { addMedication, checkMedication, deleteMedication, setMedicationActive } from "@/lib/member/actions";
import { btnClass, Field, inputClass } from "./ui";
import { ActionMessage, ConfirmDialog, DatePicker, useMemberAction } from "./controls";

export type MedRow = {
  id: string;
  name: string;
  dosage: string;
  timeSlots: string[];
  instructions: string | null;
  taken: string[]; // 오늘 체크한 시각
};

/** 오늘 복약 체크 — editable=false 면 보호자 열람용 */
export function TodayChecklist({ meds, editable }: { meds: MedRow[]; editable?: boolean }) {
  const { run, pending, result } = useMemberAction();
  const [busy, setBusy] = useState<string | null>(null);
  const slots = meds.flatMap((m) => m.timeSlots.map((t) => ({ m, t }))).sort((a, b) => a.t.localeCompare(b.t));
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {slots.map(({ m, t }) => {
          const on = m.taken.includes(t);
          const key = `${m.id}-${t}`;
          return (
            <li key={key}>
              <button
                type="button"
                disabled={!editable || (pending && busy === key)}
                aria-pressed={on}
                onClick={() => {
                  setBusy(key);
                  run(() => checkMedication(m.id, t, !on));
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors",
                  on ? "border-emerald-200 bg-emerald-50" : "border-[color:var(--border)] bg-white",
                  editable && !on && "hover:border-gray-400",
                  !editable && "cursor-default",
                )}
              >
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full border-2", on ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300")}>
                  {on && <Check className="size-4" strokeWidth={3} aria-hidden />}
                </span>
                <span className="w-12 shrink-0 text-[15px] font-bold tabular-nums">{t}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold">{m.name}</span>
                  <span className="block truncate text-sm text-[color:var(--muted)]">
                    {m.dosage}
                    {m.instructions ? ` · ${m.instructions}` : ""}
                  </span>
                </span>
                <span className={cn("shrink-0 text-sm font-semibold", on ? "text-emerald-700" : "text-gray-400")}>{on ? "복용" : "미복용"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {!result?.ok && <ActionMessage result={result} />}
    </div>
  );
}

const TIME_PRESETS = [
  { t: "08:00", label: "아침" },
  { t: "12:30", label: "점심" },
  { t: "18:30", label: "저녁" },
  { t: "22:00", label: "자기 전" },
];
const ALL_TIMES = Array.from({ length: 36 }, (_, i) => `${String(6 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);

export function AddMedicationForm({ today }: { today: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState("");
  const [instructions, setInstructions] = useState("");
  const [prescribedBy, setPrescribedBy] = useState("");
  const [more, setMore] = useState(false);
  const { run, pending, result } = useMemberAction();
  const toggle = (t: string) => setTimes((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t].sort()));

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={btnClass("outline")}>
        <Plus className="size-4" aria-hidden />약 추가
      </button>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => addMedication({ name, dosage, times, startDate: start, endDate: end || undefined, instructions, prescribedBy }), {
          onSuccess: () => {
            setOpen(false);
            setName("");
            setDosage("");
            setTimes([]);
            setInstructions("");
            setPrescribedBy("");
            setEnd("");
          },
        });
      }}
      className="flex flex-col gap-4 rounded-2xl bg-[#f8f9fa] p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="약 이름" htmlFor="med-name" required>
          <input id="med-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className={inputClass} placeholder="예: 메트포르민" />
        </Field>
        <Field label="용량" htmlFor="med-dose" required>
          <input id="med-dose" value={dosage} onChange={(e) => setDosage(e.target.value)} maxLength={50} className={inputClass} placeholder="예: 500mg 1정" />
        </Field>
      </div>
      <Field label="복용 시각" required help={`${times.length ? times.join(", ") : "하나 이상 골라 주세요"} · 하루 최대 6번`}>
        <div className="flex flex-wrap gap-2">
          {TIME_PRESETS.map((p) => (
            <TimeChip key={p.t} on={times.includes(p.t)} onClick={() => toggle(p.t)}>
              {p.label} {p.t}
            </TimeChip>
          ))}
          <button type="button" onClick={() => setMore((x) => !x)} className="h-10 rounded-full px-3 text-sm font-semibold text-[#ce0e2d] hover:bg-red-50">
            {more ? "시각 접기" : "다른 시각"}
          </button>
        </div>
        {more && (
          <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {ALL_TIMES.map((t) => (
              <TimeChip key={t} on={times.includes(t)} onClick={() => toggle(t)} small>
                {t}
              </TimeChip>
            ))}
          </div>
        )}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="시작일" htmlFor="med-start" required>
          <DatePicker id="med-start" value={start} onChange={setStart} />
        </Field>
        <Field label="종료일" htmlFor="med-end" help="비우면 계속 복용">
          <DatePicker id="med-end" value={end} onChange={setEnd} min={start} placeholder="계속" />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="복용 방법" htmlFor="med-inst">
          <input id="med-inst" value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={500} className={inputClass} placeholder="식후 30분" />
        </Field>
        <Field label="처방 기관·의사" htmlFor="med-dr">
          <input id="med-dr" value={prescribedBy} onChange={(e) => setPrescribedBy(e.target.value)} maxLength={100} className={inputClass} />
        </Field>
      </div>
      <ActionMessage result={result} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={btnClass("primary")}>
          {pending ? "추가하는 중…" : "추가"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={btnClass("secondary")}>
          닫기
        </button>
      </div>
    </form>
  );
}

function TimeChip({ on, onClick, children, small }: { on: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "rounded-full border font-semibold tabular-nums transition-colors",
        small ? "h-9 text-xs" : "h-10 px-4 text-sm",
        on ? "border-[#ce0e2d] bg-red-50 text-[#ce0e2d]" : "border-[color:var(--border)] bg-white text-gray-700 hover:border-gray-400",
      )}
    >
      {children}
    </button>
  );
}

export function MedicationRowActions({ id, name, active }: { id: string; name: string; active: boolean }) {
  const [del, setDel] = useState(false);
  const { run, pending } = useMemberAction();
  return (
    <div className="flex gap-1.5">
      <button type="button" disabled={pending} onClick={() => run(() => setMedicationActive(id, !active))} className={btnClass("outline", "sm")}>
        {active ? "복용 중단" : "다시 복용"}
      </button>
      <button type="button" onClick={() => setDel(true)} className={btnClass("ghost", "sm")}>
        삭제
      </button>
      <ConfirmDialog
        open={del}
        title={`${name} 을(를) 지울까요?`}
        body="복용 기록도 함께 지워져요. 잠시 쉬는 거라면 '복용 중단'을 쓰세요."
        confirmLabel="삭제"
        danger
        pending={pending}
        onClose={() => setDel(false)}
        onConfirm={() => run(() => deleteMedication(id), { onSuccess: () => setDel(false) })}
      />
    </div>
  );
}
