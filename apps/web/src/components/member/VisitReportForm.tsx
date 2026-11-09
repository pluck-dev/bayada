"use client";

import { useState } from "react";
import { VISIT_CONDITIONS, VISIT_CONDITION_LABEL, VISIT_SERVICE_ITEMS } from "@bayada/shared/member";
import { submitVisitReport } from "@/lib/member/actions";
import { btnClass, Field, inputClass, textareaClass } from "./ui";
import { ActionMessage, ChoiceChips, ConfirmDialog, Select, useMemberAction } from "./controls";

const TIMES = Array.from({ length: 64 }, (_, i) => {
  const min = 6 * 60 + i * 15;
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
});
const VITALS = [
  { k: "bloodPressureSys", label: "수축기", unit: "mmHg" },
  { k: "bloodPressureDia", label: "이완기", unit: "mmHg" },
  { k: "bloodSugar", label: "혈당", unit: "mg/dL" },
  { k: "temperature", label: "체온", unit: "°C" },
  { k: "heartRate", label: "맥박", unit: "bpm" },
  { k: "weight", label: "체중", unit: "kg" },
] as const;

export function VisitReportForm({ bookingId }: { bookingId: string }) {
  const [startedAt, setStartedAt] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [nextNotes, setNextNotes] = useState("");
  const [vitals, setVitals] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState(false);
  const { run, pending, result } = useMemberAction();

  const submit = () =>
    run(() => submitVisitReport(bookingId, { startedAt, completedAt, serviceProvided: services, patientCondition: condition, notes, nextVisitNotes: nextNotes, vitals }), {
      onSuccess: () => setConfirm(false),
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setConfirm(true);
      }}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="방문 시작" htmlFor="v-start" required>
          <Select id="v-start" value={startedAt} onChange={setStartedAt} options={TIMES.map((t) => ({ value: t, label: t }))} placeholder="시각" />
        </Field>
        <Field label="방문 종료" htmlFor="v-end" required>
          <Select id="v-end" value={completedAt} onChange={setCompletedAt} options={TIMES.filter((t) => !startedAt || t > startedAt).map((t) => ({ value: t, label: t }))} placeholder="시각" />
        </Field>
      </div>
      <Field label="제공한 서비스" required>
        <ChoiceChips aria-label="제공한 서비스" multiple columns={3} value={services} onChange={(v) => setServices(v as string[])} options={VISIT_SERVICE_ITEMS.map((s) => ({ value: s, label: s }))} />
      </Field>
      <Field label="이용자 상태" required help="'긴급'은 운영팀이 바로 확인해요. 응급 상황은 먼저 119 에 신고하세요.">
        <ChoiceChips aria-label="이용자 상태" columns={3} value={condition} onChange={(v) => setCondition(v as string)} options={VISIT_CONDITIONS.map((c) => ({ value: c, label: VISIT_CONDITION_LABEL[c] }))} />
      </Field>
      <Field label="활력징후 (측정한 항목만)">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {VITALS.map((f) => (
            <div key={f.k} className="relative">
              <input
                aria-label={f.label}
                inputMode="decimal"
                value={vitals[f.k] ?? ""}
                onChange={(e) => setVitals((s) => ({ ...s, [f.k]: e.target.value.replace(/[^0-9.]/g, "") }))}
                className={`${inputClass} pr-14 tabular-nums`}
                placeholder={f.label}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">{f.unit}</span>
            </div>
          ))}
        </div>
      </Field>
      <Field label="방문 기록" htmlFor="v-notes" required help="처치 내용, 관찰한 점, 이용자·보호자에게 전한 내용을 적어 주세요. 이용자와 보호자가 그대로 읽어요.">
        <textarea id="v-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={3000} className={`${textareaClass} min-h-[140px]`} />
      </Field>
      <Field label="다음 방문 참고" htmlFor="v-next">
        <textarea id="v-next" value={nextNotes} onChange={(e) => setNextNotes(e.target.value)} maxLength={2000} className={textareaClass} placeholder="다음 담당자가 알아야 할 점" />
      </Field>
      <ActionMessage result={result} />
      <div>
        <button type="submit" disabled={pending} className={btnClass("primary")}>
          방문 기록 저장
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title="방문 기록을 저장할까요?"
        body="저장하면 예약이 '방문 완료'로 바뀌고 고칠 수 없어요."
        confirmLabel="저장"
        pending={pending}
        onClose={() => setConfirm(false)}
        onConfirm={submit}
      >
        {result && !result.ok && <ActionMessage result={result} />}
      </ConfirmDialog>
    </form>
  );
}
