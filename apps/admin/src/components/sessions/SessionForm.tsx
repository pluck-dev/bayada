"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession, deleteSession, updateSession, type SessionInput } from "@/lib/actions/sessions";
import {
  Button,
  Card,
  DatePicker,
  Field,
  NumberInput,
  Select,
  Tooltip,
  actionBarClass,
  inputClass,
  textareaClass,
} from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export function SessionForm({
  locale,
  sessionId,
  initial,
  courses,
  registrations = 0,
}: {
  locale: string;
  sessionId?: string;
  initial: SessionInput;
  courses: { id: string; title: string; mode: string }[];
  registrations?: number;
}) {
  const router = useRouter();
  const { run, isPending } = useAction();
  const [v, setV] = useState<SessionInput>(initial);
  const set = <K extends keyof SessionInput>(k: K, val: SessionInput[K]) => setV((p) => ({ ...p, [k]: val }));
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId) {
      run(() => updateSession(sessionId, v));
    } else {
      run(() => createSession(v), {
        refresh: false,
        onSuccess: (r) => {
          if (r.ok && r.data) router.push(`/${locale}/sessions/${r.data.id}`);
        },
      });
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Card title="일정 정보">
        <fieldset disabled={isPending} className="grid grid-cols-2 gap-4">
          <Field label="일정명" required htmlFor="s-title" className="col-span-2">
            <input
              id="s-title"
              required
              className={inputClass}
              placeholder="예) 요양보호사 실기 실습 — 서울 1차"
              value={v.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
          <Field label="연결 프로그램" htmlFor="s-course" className="col-span-2" hint="선택 사항. 블렌디드·오프라인 프로그램의 실습이면 연결하세요.">
            <Select
              id="s-course"
              value={v.courseId}
              onChange={(x) => set("courseId", x)}
              options={[
                { value: "", label: "연결 안 함 (단독 실습)" },
                ...courses.map((c) => ({ value: c.id, label: c.title, text: c.title, hint: c.mode })),
              ]}
            />
          </Field>
          <Field label="지역" required htmlFor="s-region" hint="예) 서울, 부산, 경기 남부">
            <input id="s-region" required className={inputClass} value={v.region} onChange={(e) => set("region", e.target.value)} />
          </Field>
          <Field label="장소" required htmlFor="s-location" hint="교육장 주소·호실">
            <input id="s-location" required className={inputClass} value={v.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="시작 (한국 시간)" required htmlFor="s-start">
            <DatePicker id="s-start" mode="datetime" required clearable={false} value={v.startsAt} onChange={(x) => set("startsAt", x)} />
          </Field>
          <Field label="종료 (한국 시간)" required htmlFor="s-end">
            <DatePicker
              id="s-end"
              mode="datetime"
              required
              clearable={false}
              min={v.startsAt ? v.startsAt.slice(0, 10) : undefined}
              value={v.endsAt}
              onChange={(x) => set("endsAt", x)}
            />
          </Field>
          <Field
            label="정원"
            required
            htmlFor="s-capacity"
            hint={registrations ? `현재 신청 ${registrations}명 — 이보다 줄일 수 없습니다.` : undefined}
          >
            <NumberInput
              id="s-capacity"
              required
              min={Math.max(1, registrations)}
              value={v.capacity}
              onChange={(e) => set("capacity", Number(e.target.value))}
            />
          </Field>
          <Field label="안내 메모" htmlFor="s-note" className="col-span-2" hint="준비물·주차·복장 등 신청자 안내 문구">
            <textarea id="s-note" rows={4} className={textareaClass} value={v.note} onChange={(e) => set("note", e.target.value)} />
          </Field>
        </fieldset>
      </Card>

      <div className={actionBarClass}>
        {sessionId && (
          <Tooltip className="mr-auto" content={registrations > 0 ? "신청자가 있는 일정은 삭제할 수 없습니다" : undefined}>
          <Button
            variant="danger"
            disabled={isPending || registrations > 0}
            onClick={() =>
              run(() => deleteSession(sessionId), {
                confirm: { title: "이 일정을 삭제할까요?", body: "되돌릴 수 없습니다.", confirmLabel: "삭제", danger: true },
                refresh: false,
                onSuccess: () => router.push(`/${locale}/sessions`),
              })
            }
          >
            일정 삭제
          </Button>
          </Tooltip>
        )}
        {dirty && <span className="text-caption text-warning">저장하지 않은 변경 사항이 있습니다</span>}
        <Button type="submit" variant="primary" disabled={isPending || (!!sessionId && !dirty)}>
          {isPending ? "저장 중…" : sessionId ? "저장" : "일정 만들기"}
        </Button>
      </div>
    </form>
  );
}
