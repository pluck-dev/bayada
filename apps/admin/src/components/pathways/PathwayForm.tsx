"use client";

import { useDeferredValue, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Info, Plus, Trash2 } from "lucide-react";
import type { JobRole } from "@bayada/db";
import {
  deletePathway,
  savePathway,
  setPathwayPublished,
  type PathwayInput,
  type PathwayStepInput,
  type StepLinkKind,
} from "@/lib/actions/pathways";
import type { StepLinkOptions } from "@/lib/queries/pathways";
import { JOB_ROLES, JOB_ROLE_LABEL, formatDateTime } from "@/lib/labels";
import { Badge, Button, Card, Field, cx, inputClass, selectClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";
import { previewDoc } from "@/components/pages/PageEditor";

// 아카데미 상세 화면과 같은 기본 문구 (면책 고지를 비워 두면 이 문구가 나간다)
const DEFAULT_DISCLAIMER =
  "이 정보는 일반 안내이며 법률·이민 자문이 아닙니다. 자격 요건은 국가·기관에 따라 바뀔 수 있으니 공식 기관에서 확인하세요.";

const LINK_LABEL: Record<StepLinkKind, string> = {
  none: "자유 단계 (연결 없음)",
  course: "프로그램 연결",
  credential: "바야다 인증 연결",
};

type StepRow = PathwayStepInput & { key: number };
type FormValue = Omit<PathwayInput, "steps" | "baseUpdatedAt">;

export function PathwayForm({
  locale,
  pathwayId,
  initial,
  initialSteps,
  updatedAt,
  published = false,
  goals = 0,
  options,
}: {
  locale: string;
  pathwayId?: string;
  initial: FormValue;
  initialSteps: PathwayStepInput[];
  updatedAt: string | null;
  published?: boolean;
  goals?: number;
  options: StepLinkOptions;
}) {
  const router = useRouter();
  const { run, isPending } = useAction();
  const keySeq = useRef(0);
  const withKeys = (steps: PathwayStepInput[]): StepRow[] => steps.map((s) => ({ ...s, key: keySeq.current++ }));

  const [v, setV] = useState<FormValue>(initial);
  const [steps, setSteps] = useState<StepRow[]>(() => withKeys(initialSteps));
  const [base, setBase] = useState(updatedAt);
  const [saved, setSaved] = useState(() => JSON.stringify({ v: initial, s: initialSteps }));
  const deferredContent = useDeferredValue(v.content);
  const plainSteps = steps.map(({ key: _key, ...s }) => s);
  const dirty = JSON.stringify({ v, s: plainSteps }) !== saved;

  const set = <K extends keyof FormValue>(k: K, val: FormValue[K]) => setV((p) => ({ ...p, [k]: val }));
  const setStep = (i: number, patch: Partial<PathwayStepInput>) =>
    setSteps((list) => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const moveStep = (i: number, d: -1 | 1) =>
    setSteps((list) => {
      const j = i + d;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const addStep = () =>
    setSteps((list) => [
      ...list,
      { key: keySeq.current++, title: "", description: "", link: "none", courseId: "", credentialProgramId: "" },
    ]);
  const removeStep = (i: number) => setSteps((list) => list.filter((_, j) => j !== i));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: PathwayInput = { ...v, steps: plainSteps, baseUpdatedAt: base };
    run(() => savePathway(pathwayId ?? null, input), {
      refresh: false,
      onSuccess: (r) => {
        if (!r.ok || !r.data) return;
        if (!pathwayId) {
          router.push(`/${locale}/pathways/${r.data.id}`);
          return;
        }
        setBase(r.data.updatedAt);
        setSaved(JSON.stringify({ v, s: plainSteps }));
        router.refresh();
      },
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <fieldset disabled={isPending} className="flex flex-col gap-4">
        <Card title="기본 정보">
          <div className="grid grid-cols-2 gap-4">
            <Field label="패스웨이 이름" required htmlFor="pw-title" className="col-span-2">
              <input
                id="pw-title"
                required
                className={inputClass}
                placeholder="예) 미국 간호사(RN) 커리어 패스웨이"
                value={v.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
            <Field label="주소 (slug)" required htmlFor="pw-slug" hint={`아카데미 /${locale}/pathways/${v.slug || "…"} — 영문 소문자·숫자·하이픈`}>
              <input
                id="pw-slug"
                required
                className={cx(inputClass, "font-mono")}
                placeholder="us-rn"
                value={v.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase())}
              />
            </Field>
            <Field label="국가" required htmlFor="pw-country" hint="아카데미 목록은 이 값으로 묶입니다. 국내 경로는 '국내'">
              <input
                id="pw-country"
                required
                className={inputClass}
                placeholder="예) 미국, 아일랜드, 국내"
                value={v.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </Field>
            <Field label="대상 직군" htmlFor="pw-role">
              <select
                id="pw-role"
                className={selectClass}
                value={v.jobRole}
                onChange={(e) => set("jobRole", e.target.value as JobRole | "")}
              >
                <option value="">지정 안 함</option>
                {JOB_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {JOB_ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="정렬 순서" htmlFor="pw-order" hint="작을수록 먼저 (홈·목록)">
              <input
                id="pw-order"
                type="number"
                className={cx(inputClass, "tabular")}
                value={v.order}
                onChange={(e) => set("order", Number(e.target.value))}
              />
            </Field>
            <Field label="한 줄 소개" htmlFor="pw-summary" className="col-span-2" hint="카드·상세 상단에 보입니다.">
              <textarea id="pw-summary" rows={2} className={textareaClass} value={v.summary} onChange={(e) => set("summary", e.target.value)} />
            </Field>
            <Field label="표지 이미지 주소" htmlFor="pw-cover" className="col-span-2" hint="비워 두면 국가명 카드로 보입니다.">
              <div className="flex items-center gap-3">
                <input
                  id="pw-cover"
                  className={inputClass}
                  placeholder="https://…"
                  value={v.coverImage}
                  onChange={(e) => set("coverImage", e.target.value)}
                />
                {/^https?:\/\//i.test(v.coverImage.trim()) && (
                  // 어드민이 입력한 원격 표지 이미지 미리보기
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.coverImage.trim()} alt="표지 미리보기" className="h-10 w-16 shrink-0 rounded border border-line object-cover" />
                )}
              </div>
            </Field>
          </div>
        </Card>

        <Card title="정보 기준일 · 면책 고지">
          <div className="grid grid-cols-[200px_1fr] gap-4">
            <Field label="정보 기준일" htmlFor="pw-asof" hint="게시하려면 필수">
              <input
                id="pw-asof"
                type="date"
                className={cx(inputClass, "tabular")}
                value={v.infoAsOf}
                onChange={(e) => set("infoAsOf", e.target.value)}
              />
            </Field>
            <Field label="면책 고지" htmlFor="pw-disclaimer" hint="비워 두면 아래 기본 문구가 표시됩니다.">
              <textarea
                id="pw-disclaimer"
                rows={3}
                className={textareaClass}
                placeholder={DEFAULT_DISCLAIMER}
                value={v.disclaimer}
                onChange={(e) => set("disclaimer", e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-4 flex gap-2.5 rounded-md border border-warning-line bg-warning-soft px-3 py-2.5 text-caption leading-relaxed text-warning">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">작성 원칙 — 국가별 면허·비자 요건은 반드시 해당 국가 공식 기관 자료로 확인해 쓰고, 확인한 날짜를 정보 기준일에 넣으세요.</p>
              <p className="mt-1">
                참고: BAYADA 는 미국 외에 독일·아일랜드·뉴질랜드·한국에 거점이 있고 인도는 제휴(India Home Health Care)로 협력합니다(bayada.com/international).
                이 사실만으로 현지 취업·이민 지원을 약속하는 문구는 담당 부서 확인 없이 쓰지 마세요.
              </p>
            </div>
          </div>
        </Card>

        <div className="rounded-lg border border-line bg-canvas">
          <header className="border-b border-line px-4 py-2.5">
            <h2 className="text-caption font-semibold text-fg">자격 경로 개요 (본문)</h2>
          </header>
          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="pw-content" className="flex items-center justify-between text-caption font-medium text-ink-soft">
                <span>본문 HTML</span>
                <span className="tabular text-micro font-normal text-subtle">{v.content.length.toLocaleString()}자</span>
              </label>
              <textarea
                id="pw-content"
                spellCheck={false}
                value={v.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder="<h3>면허 취득 단계</h3><p>…</p>"
                className={cx(textareaClass, "h-[420px] resize-none font-mono text-caption! leading-[1.6]!")}
              />
              <p className="text-micro text-muted">h3·p·ol/ul·table·a 태그를 쓸 수 있습니다. 스크립트·iframe·이벤트 속성은 저장되지 않습니다.</p>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-caption font-medium text-ink-soft">미리보기</span>
              <iframe
                title="본문 미리보기"
                sandbox=""
                srcDoc={previewDoc("자격 경로 개요", deferredContent)}
                className="h-[420px] w-full rounded-md border border-line bg-canvas"
              />
              <p className="text-micro text-muted">아카데미 본문 스타일 기준입니다.</p>
            </div>
          </div>
        </div>

        <Card
          title={`단계 ${steps.length}개`}
          actions={
            <Button size="sm" onClick={addStep}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              단계 추가
            </Button>
          }
        >
          {steps.length === 0 ? (
            <p className="py-6 text-center text-caption text-muted">단계가 없습니다. 게시하려면 1개 이상 필요합니다.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {steps.map((s, i) => (
                <li key={s.key} className="rounded-md border border-line bg-surface p-3">
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-micro font-semibold text-white">STEP {i + 1}</span>
                    <span className="ml-auto flex items-center gap-1">
                      <Button size="sm" variant="ghost" aria-label={`STEP ${i + 1} 위로`} disabled={i === 0} onClick={() => moveStep(i, -1)}>
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`STEP ${i + 1} 아래로`}
                        disabled={i === steps.length - 1}
                        onClick={() => moveStep(i, 1)}
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                      <Button size="sm" variant="ghost" aria-label={`STEP ${i + 1} 삭제`} onClick={() => removeStep(i)}>
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="단계 이름" required htmlFor={`st-title-${s.key}`}>
                      <input
                        id={`st-title-${s.key}`}
                        required
                        className={inputClass}
                        value={s.title}
                        onChange={(e) => setStep(i, { title: e.target.value })}
                      />
                    </Field>
                    <Field label="연결" htmlFor={`st-link-${s.key}`}>
                      <div className="grid grid-cols-[170px_minmax(0,1fr)] gap-2">
                        <select
                          id={`st-link-${s.key}`}
                          className={cx(selectClass, s.link === "none" && "col-span-2")}
                          value={s.link}
                          onChange={(e) => setStep(i, { link: e.target.value as StepLinkKind })}
                        >
                          {(Object.keys(LINK_LABEL) as StepLinkKind[]).map((k) => (
                            <option key={k} value={k}>
                              {LINK_LABEL[k]}
                            </option>
                          ))}
                        </select>
                        {s.link === "course" && (
                          <select
                            aria-label={`STEP ${i + 1} 연결 프로그램`}
                            className={selectClass}
                            value={s.courseId}
                            onChange={(e) => setStep(i, { courseId: e.target.value })}
                          >
                            <option value="">프로그램 선택</option>
                            {options.courses.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                                {c.note ? ` · ${c.note}` : ""}
                              </option>
                            ))}
                          </select>
                        )}
                        {s.link === "credential" &&
                          (options.credentials.length === 0 ? (
                            <span className="flex items-center text-caption text-muted">운영 중인 인증 과정이 없습니다</span>
                          ) : (
                            <select
                              aria-label={`STEP ${i + 1} 연결 인증 과정`}
                              className={selectClass}
                              value={s.credentialProgramId}
                              onChange={(e) => setStep(i, { credentialProgramId: e.target.value })}
                            >
                              <option value="">인증 과정 선택</option>
                              {options.credentials.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title}
                                  {c.note ? ` · ${c.note}` : ""}
                                </option>
                              ))}
                            </select>
                          ))}
                      </div>
                    </Field>
                    <Field label="설명" htmlFor={`st-desc-${s.key}`} className="col-span-2">
                      <textarea
                        id={`st-desc-${s.key}`}
                        rows={2}
                        className={textareaClass}
                        value={s.description}
                        onChange={(e) => setStep(i, { description: e.target.value })}
                      />
                    </Field>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 text-micro text-muted">
            프로그램은 게시된 것만, 인증은 운영 중인 과정만 연결할 수 있습니다. 학습자 화면에서 연결 단계는 수강·수료·인증 보유 상태가 자동으로 표시되고, 자유 단계는 안내만 보입니다.
          </p>
        </Card>
      </fieldset>

      <div className="sticky bottom-0 -mx-1 flex items-center justify-end gap-2 border-t border-line bg-canvas/95 px-1 py-3 backdrop-blur">
        {pathwayId && (
          <>
            <Button
              variant="danger"
              disabled={isPending || published}
              title={published ? "게시 중인 패스웨이는 삭제할 수 없습니다" : undefined}
              onClick={() =>
                run(() => deletePathway(pathwayId), {
                  confirm: {
                    title: "이 패스웨이를 삭제할까요?",
                    body: goals > 0 ? `학습자 ${goals}명의 커리어 목표에서도 사라집니다. 되돌릴 수 없습니다.` : "단계도 함께 삭제되며 되돌릴 수 없습니다.",
                    confirmLabel: "삭제",
                    danger: true,
                  },
                  refresh: false,
                  onSuccess: () => router.push(`/${locale}/pathways`),
                })
              }
            >
              삭제
            </Button>
            <span className="ml-2 flex items-center gap-2 text-caption">
              {published ? (
                <Badge tone="green" dot>
                  게시 중
                </Badge>
              ) : (
                <Badge tone="slate">비공개</Badge>
              )}
              <Button
                size="sm"
                variant={published ? "secondary" : "dark"}
                disabled={isPending || dirty}
                title={dirty ? "변경 사항을 먼저 저장하세요" : undefined}
                onClick={() =>
                  run(() => setPathwayPublished(pathwayId, !published), {
                    confirm: published
                      ? { title: "게시를 중단할까요?", body: "아카데미 목록·상세·홈에서 바로 숨겨집니다.", confirmLabel: "게시 중단" }
                      : undefined,
                  })
                }
              >
                {published ? "게시 중단" : "게시"}
              </Button>
            </span>
          </>
        )}
        <span className="mr-auto" />
        {dirty ? (
          <span className="text-caption text-warning">저장하지 않은 변경 사항이 있습니다</span>
        ) : (
          base && <span className="text-caption text-muted">최종 수정 {formatDateTime(base)}</span>
        )}
        <Button type="submit" variant="primary" disabled={isPending || (!!pathwayId && !dirty)}>
          {isPending ? "저장 중…" : pathwayId ? "저장" : "패스웨이 만들기"}
        </Button>
      </div>
    </form>
  );
}
