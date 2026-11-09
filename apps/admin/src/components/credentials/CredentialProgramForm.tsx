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
import {
  Button,
  Card,
  Field,
  NumberInput,
  Select,
  Switch,
  Tooltip,
  actionBarClass,
  cx,
  inputClass,
  textareaClass,
} from "@/components/ui";
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
              <div className="flex h-11 items-center">
                <Switch id="cp-active" checked={v.active} onChange={(on) => set("active", on)} label={v.active ? "공개 중 (신청 받음)" : "비공개"} />
              </div>
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
            <p className="text-caption text-muted">모두 수료(수료일 기록)한 학습자만 신청할 수 있습니다. 게시 중인 프로그램에서 고릅니다.</p>
            {v.requiredCourseIds.length > 0 && (
              <ul className="flex flex-col divide-y divide-hairline rounded-2xl bg-wash px-1">
                {v.requiredCourseIds.map((id, i) => {
                  const c = courseById.get(id);
                  return (
                    <li key={id} className="flex items-center gap-2.5 px-3 py-2 text-caption">
                      <span className="tabular w-5 text-caption text-subtle">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate">{c?.title ?? "삭제된 프로그램"}</span>
                      {c?.note && <span className="shrink-0 text-micro text-subtle">{c.note}</span>}
                      <button
                        type="button"
                        aria-label={`${c?.title ?? "프로그램"} 빼기`}
                        className="flex size-7 items-center justify-center rounded-full text-subtle transition-colors hover:bg-canvas hover:text-ink"
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
              <Select
                aria-label="선수 프로그램 추가"
                className="flex-1"
                placeholder="프로그램 선택…"
                value={pick}
                onChange={setPick}
                options={remaining.map((c) => ({ value: c.id, label: c.title, hint: c.note || undefined, text: c.title }))}
              />
              <Button
                size="lg"
                variant="primary"
                className="h-11"
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
              <NumberInput
                id="cp-exam"
                required
                min={0}
                max={100}
                value={v.examPassingScore}
                onChange={(e) => set("examPassingScore", Number(e.target.value))}
              />
            </Field>
            <Field label="실기 평가" htmlFor="cp-practical">
              <div className="flex gap-2">
                <Select
                  id="cp-practical"
                  value={v.practicalRequired ? "1" : "0"}
                  onChange={(x) => set("practicalRequired", x === "1")}
                  options={[
                    { value: "1", label: "실시" },
                    { value: "0", label: "없음 (시험만)" },
                  ]}
                />
                {v.practicalRequired && (
                  <NumberInput
                    aria-label="실기 합격 점수"
                    min={0}
                    max={100} className="w-28!"
                    value={v.practicalPassingScore}
                    onChange={(e) => set("practicalPassingScore", Number(e.target.value))}
                  />
                )}
              </div>
            </Field>
            <Field label="유효기간 (개월)" htmlFor="cp-validity" hint={`비우면 영구 · 현재 ${validityLabel(v.validityMonths.trim() ? Number(v.validityMonths) : null)}`}>
              <NumberInput
                id="cp-validity"
                min={1}
                max={600}
                placeholder="영구"
                value={v.validityMonths}
                onChange={(e) => set("validityMonths", e.target.value)}
              />
            </Field>
            <Field label="갱신 알림 (만료 전 일수)" htmlFor="cp-notice" hint="이 기간에 들어오면 학습자 인증서 지갑에 갱신 안내가 뜹니다.">
              <NumberInput
                id="cp-notice"
                min={0}
                max={365}
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
            <p className="mt-4 rounded-2xl bg-pill-warning/70 px-4 py-3 text-caption font-medium text-warning">
              진행 중인 신청 {pending}건의 합격/불합격 판정이 새 기준으로 다시 계산됩니다.
            </p>
          )}
        </Card>
      </fieldset>

      <div className={actionBarClass}>
        {programId && (
          <Tooltip className="mr-auto" content={records > 0 ? "신청·발급 기록이 있는 과정은 삭제할 수 없습니다 (비공개로 전환)" : undefined}>
          <Button
            variant="danger"
            disabled={isPending || records > 0}
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
          </Tooltip>
        )}
        {dirty && <span className="text-caption text-warning">저장하지 않은 변경 사항이 있습니다</span>}
        <Button type="submit" variant="primary" disabled={isPending || (!!programId && !dirty)}>
          {isPending ? "저장 중…" : programId ? "저장" : "과정 만들기"}
        </Button>
      </div>
    </form>
  );
}
