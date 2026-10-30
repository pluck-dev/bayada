"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import type { JobRole, LearningMode, Level, ProductType, Visibility } from "@bayada/db";
import { createProgram, updateProgram } from "@/lib/actions/programs";
import {
  JOB_ROLES,
  JOB_ROLE_LABEL,
  LEARNING_MODES,
  LEARNING_MODE_LABEL,
  LEVELS,
  LEVEL_LABEL,
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABEL,
} from "@/lib/labels";
import { Button, Card, Field, cx, inputClass, selectClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";
import type { ProgramFormValue } from "@/lib/program-defaults";


function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function ProgramForm({
  locale,
  programId,
  initial,
  categories,
  providers,
  locked,
  partner,
  basePath,
}: {
  locale: string;
  programId?: string;
  initial: ProgramFormValue;
  categories: { id: string; name: string }[];
  providers: { id: string; name: string; isPartner: boolean }[];
  locked?: boolean;
  /** 파트너 콘솔 — 제공기관은 고정, 공개범위·메인 노출은 운영자 몫이라 숨긴다 */
  partner?: boolean;
  /** 생성 후 이동할 상세 경로의 기준 (기본 /{locale}/programs) */
  basePath?: string;
}) {
  const router = useRouter();
  const { run, isPending } = useAction();
  const [v, setV] = useState<ProgramFormValue>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const set = <K extends keyof ProgramFormValue>(k: K, val: ProgramFormValue[K]) => setV((p) => ({ ...p, [k]: val }));
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (programId) {
      await run(() => updateProgram(programId, v));
    } else {
      await run(() => createProgram(v), {
        refresh: false,
        onSuccess: (r) => {
          const id = "data" in r && r.data ? (r.data as { id: string }).id : null;
          if (id) router.push(`${basePath ?? `/${locale}/programs`}/${id}?tab=curriculum`);
        },
      });
    }
  };

  const objectives = v.objectives.length ? v.objectives : [""];
  const setObjective = (i: number, text: string) => set("objectives", objectives.map((o, j) => (j === i ? text : o)));
  const moveObjective = (i: number, d: -1 | 1) => {
    const next = [...objectives];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("objectives", next);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <fieldset disabled={locked || isPending} className="flex flex-col gap-4 disabled:opacity-80">
        <Card title="기본 정보">
          <div className="grid grid-cols-2 gap-4">
            <Field label="프로그램명" required htmlFor="title" className="col-span-2">
              <input
                id="title"
                required
                className={inputClass}
                value={v.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="slug (URL)" required htmlFor="slug" hint="아카데미 주소에 쓰입니다. 글자·숫자·하이픈만.">
              <input
                id="slug"
                required
                className={cx(inputClass, "font-mono text-caption!")}
                value={v.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value);
                }}
              />
            </Field>
            <Field label="썸네일 URL" htmlFor="thumbnail">
              <input
                id="thumbnail"
                className={inputClass}
                placeholder="https://"
                value={v.thumbnail}
                onChange={(e) => set("thumbnail", e.target.value)}
              />
            </Field>
            <Field label="한 줄 소개" htmlFor="summary" className="col-span-2" hint="카탈로그 카드에 표시됩니다.">
              <input id="summary" className={inputClass} value={v.summary} onChange={(e) => set("summary", e.target.value)} />
            </Field>
            <Field label="상세 설명" htmlFor="description" className="col-span-2" hint="HTML 을 그대로 쓸 수 있습니다 (기존 강좌 본문 호환).">
              <textarea
                id="description"
                rows={8}
                className={cx(textareaClass, "font-mono text-caption!")}
                value={v.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card title="분류·대상">
          <div className="grid grid-cols-3 gap-4">
            <Field label="유형" htmlFor="productType">
              <select
                id="productType"
                className={selectClass}
                value={v.productType}
                onChange={(e) => set("productType", e.target.value as ProductType)}
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PRODUCT_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="학습 방식" htmlFor="learningMode" hint="블렌디드·오프라인은 실습 일정과 연결됩니다.">
              <select
                id="learningMode"
                className={selectClass}
                value={v.learningMode}
                onChange={(e) => set("learningMode", e.target.value as LearningMode)}
              >
                {LEARNING_MODES.map((m) => (
                  <option key={m} value={m}>
                    {LEARNING_MODE_LABEL[m]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="난이도" htmlFor="level">
              <select id="level" className={selectClass} value={v.level} onChange={(e) => set("level", e.target.value as Level | "")}>
                <option value="">선택 안 함</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABEL[l]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="카테고리" htmlFor="categoryId">
              <select id="categoryId" className={selectClass} value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">미분류</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="제공기관" required htmlFor="providerId">
              <select
                id="providerId"
                className={selectClass}
                value={v.providerId}
                disabled={partner}
                onChange={(e) => set("providerId", e.target.value)}
              >
                <option value="">선택</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.isPartner ? " (파트너)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="소요시간 (분)" required htmlFor="durationMin">
              <input
                id="durationMin"
                type="number"
                min={0}
                className={cx(inputClass, "tabular")}
                value={v.durationMin ?? ""}
                onChange={(e) => set("durationMin", e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
            <Field label="가격 (원)" htmlFor="price" hint="0 = 무료">
              <input
                id="price"
                type="number"
                min={0}
                step={1000}
                className={cx(inputClass, "tabular")}
                value={v.price}
                onChange={(e) => set("price", Number(e.target.value) || 0)}
              />
            </Field>
            <div className="col-span-3 flex flex-col gap-1.5">
              <span className="text-caption font-medium text-ink-soft" id="aud-label">
                대상 직군<span className="ml-0.5 text-brand">*</span>
              </span>
              <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="aud-label">
                {JOB_ROLES.map((r) => {
                  const on = v.audiences.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("audiences", on ? v.audiences.filter((a) => a !== r) : [...v.audiences, r as JobRole])}
                      className={cx(
                        "h-7 rounded-full border px-3 text-caption transition-colors",
                        on ? "border-ink bg-zinc-900 text-white" : "border-line text-muted hover:border-line-strong",
                      )}
                    >
                      {JOB_ROLE_LABEL[r]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card
          title={
            <>
              학습목표 <span className="text-brand">*</span>
            </>
          }
          actions={
            <Button size="sm" variant="ghost" onClick={() => set("objectives", [...objectives, ""])}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              목표 추가
            </Button>
          }
        >
          <ol className="flex flex-col gap-2">
            {objectives.map((o, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="tabular w-5 text-right text-caption text-subtle">{i + 1}</span>
                <input
                  className={inputClass}
                  value={o}
                  aria-label={`학습목표 ${i + 1}`}
                  placeholder="예) 치매 어르신의 행동 변화를 관찰하고 기록할 수 있다"
                  onChange={(e) => setObjective(i, e.target.value)}
                />
                <Button size="sm" variant="ghost" aria-label="위로" disabled={i === 0} onClick={() => moveObjective(i, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="아래로"
                  disabled={i === objectives.length - 1}
                  onClick={() => moveObjective(i, 1)}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="삭제"
                  onClick={() => set("objectives", objectives.filter((_, j) => j !== i))}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ol>
        </Card>

        {!partner && (
          <Card title="노출">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-caption font-medium text-ink-soft" id="vis-label">
                  공개범위
                </span>
                <div className="inline-flex w-fit rounded-md border border-line p-0.5" role="radiogroup" aria-labelledby="vis-label">
                  {(["INTERNAL", "PUBLIC"] as Visibility[]).map((vis) => (
                    <button
                      key={vis}
                      type="button"
                      role="radio"
                      aria-checked={v.visibility === vis}
                      onClick={() => set("visibility", vis)}
                      className={cx(
                        "h-7 rounded px-3 text-caption font-medium",
                        v.visibility === vis ? "bg-zinc-900 text-white" : "text-muted hover:text-fg",
                      )}
                    >
                      {vis === "INTERNAL" ? "사내 전용" : "외부 공개"}
                    </button>
                  ))}
                </div>
                <p className="text-micro text-muted">사내 전용은 바야다 사내 조직 소속 회원에게만 보입니다.</p>
              </div>
              <label className="flex items-start gap-2 pt-6 text-caption">
                <input
                  type="checkbox"
                  checked={v.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-zinc-900"
                />
                <span>
                  메인 큐레이션(신규·인기)에 노출
                  <span className="block text-micro text-muted">게시 상태일 때만 메인에 보입니다.</span>
                </span>
              </label>
            </div>
          </Card>
        )}
      </fieldset>

      {!locked && (
        <div className="sticky bottom-0 -mx-1 flex items-center justify-end gap-2 border-t border-line bg-canvas/95 px-1 py-3 backdrop-blur">
          {dirty && <span className="mr-auto text-caption text-warning">저장하지 않은 변경 사항이 있습니다</span>}
          <Button type="submit" variant="primary" disabled={isPending || (!!programId && !dirty)}>
            {isPending ? "저장 중…" : programId ? "저장" : "만들고 커리큘럼 편집"}
          </Button>
        </div>
      )}
    </form>
  );
}
