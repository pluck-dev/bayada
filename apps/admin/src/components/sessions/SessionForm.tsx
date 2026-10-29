"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession, deleteSession, updateSession, type SessionInput } from "@/lib/actions/sessions";
import { Button, Card, Field, cx, inputClass, selectClass, textareaClass } from "@/components/ui";
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
            <select id="s-course" className={selectClass} value={v.courseId} onChange={(e) => set("courseId", e.target.value)}>
              <option value="">연결 안 함 (단독 실습)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} · {c.mode}
                </option>
              ))}
            </select>
          </Field>
          <Field label="지역" required htmlFor="s-region" hint="예) 서울, 부산, 경기 남부">
            <input id="s-region" required className={inputClass} value={v.region} onChange={(e) => set("region", e.target.value)} />
          </Field>
          <Field label="장소" required htmlFor="s-location" hint="교육장 주소·호실">
            <input id="s-location" required className={inputClass} value={v.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="시작 (한국 시간)" required htmlFor="s-start">
            <input
              id="s-start"
              type="datetime-local"
              required
              className={cx(inputClass, "tabular")}
              value={v.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
            />
          </Field>
          <Field label="종료 (한국 시간)" required htmlFor="s-end">
            <input
              id="s-end"
              type="datetime-local"
              required
              min={v.startsAt || undefined}
              className={cx(inputClass, "tabular")}
              value={v.endsAt}
              onChange={(e) => set("endsAt", e.target.value)}
            />
          </Field>
          <Field
            label="정원"
            required
            htmlFor="s-capacity"
            hint={registrations ? `현재 신청 ${registrations}명 — 이보다 줄일 수 없습니다.` : undefined}
          >
            <input
              id="s-capacity"
              type="number"
              required
              min={Math.max(1, registrations)}
              className={cx(inputClass, "tabular")}
              value={v.capacity}
              onChange={(e) => set("capacity", Number(e.target.value))}
            />
          </Field>
          <Field label="안내 메모" htmlFor="s-note" className="col-span-2" hint="준비물·주차·복장 등 신청자 안내 문구">
            <textarea id="s-note" rows={4} className={textareaClass} value={v.note} onChange={(e) => set("note", e.target.value)} />
          </Field>
        </fieldset>
      </Card>

      <div className="sticky bottom-0 -mx-1 flex items-center justify-end gap-2 border-t border-line bg-white/95 px-1 py-3 backdrop-blur">
        {sessionId && (
          <Button
            variant="danger"
            className="mr-auto"
            disabled={isPending || registrations > 0}
            title={registrations > 0 ? "신청자가 있는 일정은 삭제할 수 없습니다" : undefined}
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
        )}
        {dirty && <span className="text-[12px] text-amber-700">저장하지 않은 변경 사항이 있습니다</span>}
        <Button type="submit" variant="primary" disabled={isPending || (!!sessionId && !dirty)}>
          {isPending ? "저장 중…" : sessionId ? "저장" : "일정 만들기"}
        </Button>
      </div>
    </form>
  );
}
