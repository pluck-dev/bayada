"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  createCredentialProgram,
  deleteCredentialProgram,
  updateCredentialProgram,
  type CredentialProgramInput,
} from "@/lib/actions/credentials";
import { validityLabel } from "@/lib/credentials";
import { Button, Card, Field, cx, inputClass, selectClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export function CredentialProgramForm({
  locale,
  programId,
  initial,
  courses,
  records = 0,
  pending = 0,
}: {
  locale: string;
  programId?: string;
  initial: CredentialProgramInput;
  courses: { id: string; title: string; note: string }[];
  /** 신청 + 발급 건수 (있으면 삭제 불가) */
  records?: number;
  /** 결론 안 난 신청 수 (합격 기준을 바꾸면 판정이 다시 계산된다는 경고용) */
  pending?: number;
}) {
  const router = useRouter();
  const { run, isPending } = useAction();
  const [v, setV] = useState<CredentialProgramInput>(initial);
  const [pick, setPick] = useState("");
  const set = <K extends keyof CredentialProgramInput>(k: K, val: CredentialProgramInput[K]) => setV((p) => ({ ...p, [k]: val }));
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);
  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const remaining = courses.filter((c) => !v.requiredCourseIds.includes(c.id));
  const thresholdChanged =
    !!programId &&
    (v.examPassingScore !== initial.examPassingScore ||
      v.practicalRequired !== initial.practicalRequired ||
      v.practicalPassingScore !== initial.practicalPassingScore);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (programId) {
      run(() => updateCredentialProgram(programId, v));
    } else {
      run(() => createCredentialProgram(v), {
        refresh: false,
        onSuccess: (r) => {
          if (r.ok && r.data) router.push(`/${locale}/credentials/programs/${r.data.id}`);
        },
      });
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <fieldset disabled={isPending} className="flex flex-col gap-4">
        <Card title="기본 정보">
          <div className="grid grid-cols-2 gap-4">
            <Field label="과정명" required htmlFor="cp-title" className="col-span-2">
              <input
                id="cp-title"
                required
                className={inputClass}
                placeholder="예) 홈케어 전문 돌봄제공자"
                value={v.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
            <Field label="주소 (slug)" required htmlFor="cp-slug" hint={`아카데미 /certifications/${v.slug || "slug"} — 영문 소문자·숫자·하이픈`}>
              <input
                id="cp-slug"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                className={cx(inputClass, "font-mono")}
                value={v.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase())}
              />
            </Field>
            <Field label="공개" htmlFor="cp-active" hint="공개하면 아카데미 인증 목록에 보이고 신청을 받습니다.">
              <label className="flex h-8 items-center gap-2 text-[13px]">
                <input id="cp-active" type="checkbox" className="h-4 w-4 accent-zinc-900" checked={v.active} onChange={(e) => set("active", e.target.checked)} />
                {v.active ? "공개 중 (신청 받음)" : "비공개"}
              </label>
            </Field>
            <Field label="한 줄 소개" htmlFor="cp-summary" className="col-span-2">
              <input id="cp-summary" className={inputClass} value={v.summary} onChange={(e) => set("summary", e.target.value)} />
            </Field>
            <Field label="상세 설명" htmlFor="cp-desc" className="col-span-2" hint="인증의 목적·대상·취득 후 활용처. 줄바꿈이 그대로 보입니다.">
              <textarea id="cp-desc" rows={5} className={textareaClass} value={v.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card title="신청 자격 — 선수 프로그램">
          <div className="flex flex-col gap-3">
            <p className="text-[12.5px] text-muted">모두 수료(수료일 기록)한 학습자만 신청할 수 있습니다. 게시 중인 프로그램에서 고릅니다.</p>
            {v.requiredCourseIds.length > 0 && (
              <ul className="flex flex-col divide-y divide-zinc-100 rounded-md border border-line">
                {v.requiredCourseIds.map((id, i) => {
                  const c = courseById.get(id);
                  return (
                    <li key={id} className="flex items-center gap-2.5 px-3 py-2 text-[13px]">
                      <span className="tabular w-5 text-[12px] text-subtle">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate">{c?.title ?? "삭제된 프로그램"}</span>
                      {c?.note && <span className="shrink-0 text-[11.5px] text-subtle">{c.note}</span>}
                      <button
                        type="button"
                        aria-label={`${c?.title ?? "프로그램"} 빼기`}
                        className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-fg"
                        onClick={() => set("requiredCourseIds", v.requiredCourseIds.filter((x) => x !== id))}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex gap-2">
              <select aria-label="선수 프로그램 추가" className={selectClass} value={pick} onChange={(e) => setPick(e.target.value)}>
                <option value="">프로그램 선택…</option>
                {remaining.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                    {c.note ? ` · ${c.note}` : ""}
                  </option>
                ))}
              </select>
              <Button
                disabled={!pick}
                onClick={() => {
                  set("requiredCourseIds", [...v.requiredCourseIds, pick]);
                  setPick("");
                }}
              >
                추가
              </Button>
            </div>
          </div>
        </Card>

        <Card title="평가 · 유효기간">
          <div className="grid grid-cols-2 gap-4">
            <Field label="시험 합격 점수" required htmlFor="cp-exam" hint="100점 만점">
              <input
                id="cp-exam"
                type="number"
                required
                min={0}
                max={100}
                className={cx(inputClass, "tabular")}
                value={v.examPassingScore}
                onChange={(e) => set("examPassingScore", Number(e.target.value))}
              />
            </Field>
            <Field label="실기 평가" htmlFor="cp-practical">
              <div className="flex gap-2">
                <select
                  id="cp-practical"
                  className={selectClass}
                  value={v.practicalRequired ? "1" : "0"}
                  onChange={(e) => set("practicalRequired", e.target.value === "1")}
                >
                  <option value="1">실시</option>
                  <option value="0">없음 (시험만)</option>
                </select>
                {v.practicalRequired && (
                  <input
                    aria-label="실기 합격 점수"
                    type="number"
                    min={0}
                    max={100}
                    className={cx(inputClass, "tabular w-28!")}
                    value={v.practicalPassingScore}
                    onChange={(e) => set("practicalPassingScore", Number(e.target.value))}
                  />
                )}
              </div>
            </Field>
            <Field label="유효기간 (개월)" htmlFor="cp-validity" hint={`비우면 영구 · 현재 ${validityLabel(v.validityMonths.trim() ? Number(v.validityMonths) : null)}`}>
              <input
                id="cp-validity"
                type="number"
                min={1}
                max={600}
                placeholder="영구"
                className={cx(inputClass, "tabular")}
                value={v.validityMonths}
                onChange={(e) => set("validityMonths", e.target.value)}
              />
            </Field>
            <Field label="갱신 알림 (만료 전 일수)" htmlFor="cp-notice" hint="이 기간에 들어오면 학습자 인증서 지갑에 갱신 안내가 뜹니다.">
              <input
                id="cp-notice"
                type="number"
                min={0}
                max={365}
                className={cx(inputClass, "tabular")}
                value={v.renewalNoticeDays}
                disabled={!v.validityMonths.trim()}
                onChange={(e) => set("renewalNoticeDays", Number(e.target.value))}
              />
            </Field>
            <Field label="평가 기준 안내" htmlFor="cp-criteria" className="col-span-2" hint="학습자 신청 화면과 심사 화면에 그대로 보입니다.">
              <textarea id="cp-criteria" rows={4} className={textareaClass} value={v.criteria} onChange={(e) => set("criteria", e.target.value)} />
            </Field>
          </div>
          {thresholdChanged && pending > 0 && (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
              진행 중인 신청 {pending}건의 합격/불합격 판정이 새 기준으로 다시 계산됩니다.
            </p>
          )}
        </Card>
      </fieldset>

      <div className="sticky bottom-0 -mx-1 flex items-center justify-end gap-2 border-t border-line bg-white/95 px-1 py-3 backdrop-blur">
        {programId && (
          <Button
            variant="danger"
            className="mr-auto"
            disabled={isPending || records > 0}
            title={records > 0 ? "신청·발급 기록이 있는 과정은 삭제할 수 없습니다 (비공개로 전환)" : undefined}
            onClick={() =>
              run(() => deleteCredentialProgram(programId), {
                confirm: { title: "이 인증 과정을 삭제할까요?", body: "되돌릴 수 없습니다.", confirmLabel: "삭제", danger: true },
                refresh: false,
                onSuccess: () => router.push(`/${locale}/credentials/programs`),
              })
            }
          >
            과정 삭제
          </Button>
        )}
        {dirty && <span className="text-[12px] text-amber-700">저장하지 않은 변경 사항이 있습니다</span>}
        <Button type="submit" variant="primary" disabled={isPending || (!!programId && !dirty)}>
          {isPending ? "저장 중…" : programId ? "저장" : "과정 만들기"}
        </Button>
      </div>
    </form>
  );
}
