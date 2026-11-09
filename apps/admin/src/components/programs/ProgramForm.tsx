"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import type { CoverMode, JobRole, LearningMode, Level, ProductType, Visibility } from "@bayada/db";
import { CourseCover } from "@bayada/ui/cover";
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
import {
  Button,
  Card,
  Checkbox,
  Field,
  NumberInput,
  Segmented,
  Select,
  ToggleChip,
  actionBarClass,
  cx,
  inputClass,
  textareaClass,
} from "@/components/ui";
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
  categories: { id: string; name: string; slug: string }[];
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
        <Card tour="program-form-basic" title="기본 정보">
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
            <Field label="slug (URL)" required htmlFor="slug" hint="아카데미 주소에 쓰입니다. 글자·숫자·하이픈만." className="col-span-2">
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

        <Card tour="program-form-cover" title="표지" description="아카데미 카드·상세·공유 이미지에 쓰입니다.">
          <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-lg:grid-cols-1">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="mb-0.5 text-[13px] font-bold text-ink">표지 방식</span>
                <Segmented
                  aria-label="표지 방식"
                  className="w-fit"
                  value={v.coverMode}
                  onChange={(m) => set("coverMode", m)}
                  options={[
                    { value: "AUTO" as CoverMode, label: "자동 생성" },
                    { value: "UPLOAD" as CoverMode, label: "업로드 이미지" },
                  ]}
                />
                <p className="text-micro text-muted">
                  {v.coverMode === "AUTO"
                    ? "제목·카테고리·유형·난이도·대상 직군으로 표지를 그립니다. 카테고리마다 색이 정해져 있어요."
                    : "아래 이미지를 표지로 씁니다. 이미지를 불러오지 못하면 자동 표지로 대신 보입니다."}
                </p>
              </div>
              {v.coverMode === "UPLOAD" && (
                <Field label="표지 이미지 URL" required htmlFor="thumbnail" hint="16:9 비율 권장 (예: 1280×720). 글씨가 작은 배너는 카드에서 읽히지 않아요.">
                  <input
                    id="thumbnail"
                    required
                    className={inputClass}
                    placeholder="https://"
                    value={v.thumbnail}
                    onChange={(e) => set("thumbnail", e.target.value)}
                  />
                </Field>
              )}
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-bold text-ink">미리보기</span>
              <CoverPreview value={v} categories={categories} />
            </div>
          </div>
        </Card>

        <Card tour="program-form-meta" title="분류·대상">
          <div className="grid grid-cols-3 gap-4">
            <Field label="유형" htmlFor="productType">
              <Select
                id="productType"
                value={v.productType}
                onChange={(x) => set("productType", x as ProductType)}
                options={PRODUCT_TYPES.map((t) => ({ value: t, label: PRODUCT_TYPE_LABEL[t] }))}
              />
            </Field>
            <Field label="학습 방식" htmlFor="learningMode" hint="블렌디드·오프라인은 실습 일정과 연결됩니다.">
              <Select
                id="learningMode"
                value={v.learningMode}
                onChange={(x) => set("learningMode", x as LearningMode)}
                options={LEARNING_MODES.map((m) => ({ value: m, label: LEARNING_MODE_LABEL[m] }))}
              />
            </Field>
            <Field label="난이도" htmlFor="level">
              <Select
                id="level"
                value={v.level}
                onChange={(x) => set("level", x as Level | "")}
                options={[{ value: "", label: "선택 안 함" }, ...LEVELS.map((l) => ({ value: l, label: LEVEL_LABEL[l] }))]}
              />
            </Field>
            <Field label="카테고리" htmlFor="categoryId">
              <Select
                id="categoryId"
                value={v.categoryId}
                onChange={(x) => set("categoryId", x)}
                options={[{ value: "", label: "미분류" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
              />
            </Field>
            <Field label="제공기관" required htmlFor="providerId">
              <Select
                id="providerId"
                value={v.providerId}
                disabled={partner}
                onChange={(x) => set("providerId", x)}
                options={providers.map((p) => ({ value: p.id, label: p.name, text: p.name, hint: p.isPartner ? "파트너" : undefined }))}
              />
            </Field>
            <Field label="소요시간 (분)" required htmlFor="durationMin">
              <NumberInput
                id="durationMin"
                min={0}
                value={v.durationMin ?? ""}
                onChange={(e) => set("durationMin", e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
            <Field label="가격 (원)" htmlFor="price" hint="0 = 무료">
              <NumberInput
                id="price"
                min={0}
                step={1000}
                value={v.price}
                onChange={(e) => set("price", Number(e.target.value) || 0)}
              />
            </Field>
            <div className="col-span-3 flex flex-col gap-1.5">
              <span className="mb-0.5 text-[13px] font-bold text-ink" id="aud-label">
                대상 직군<span className="ml-0.5 text-brand">*</span>
              </span>
              <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="aud-label">
                {JOB_ROLES.map((r) => {
                  const on = v.audiences.includes(r);
                  return (
                    <ToggleChip
                      key={r}
                      on={on}
                      onToggle={() => set("audiences", on ? v.audiences.filter((a) => a !== r) : [...v.audiences, r as JobRole])}
                    >
                      {JOB_ROLE_LABEL[r]}
                    </ToggleChip>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card
          tour="program-form-goals"
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
                <span className="mb-0.5 text-[13px] font-bold text-ink" id="vis-label">
                  공개범위
                </span>
                <Segmented
                  aria-label="공개범위"
                  className="w-fit"
                  value={v.visibility}
                  onChange={(vis) => set("visibility", vis)}
                  options={[
                    { value: "INTERNAL" as Visibility, label: "사내 전용" },
                    { value: "PUBLIC" as Visibility, label: "외부 공개" },
                  ]}
                />
                <p className="text-micro text-muted">사내 전용은 바야다 사내 조직 소속 회원에게만 보입니다.</p>
              </div>
              <div className="pt-7">
                <Checkbox
                  checked={v.featured}
                  onChange={(c) => set("featured", c)}
                  label="메인 큐레이션(신규·인기)에 노출"
                  desc="게시 상태일 때만 메인에 보입니다."
                />
              </div>
            </div>
          </Card>
        )}
      </fieldset>

      {!locked && (
        <div data-tour="program-form-save" className={actionBarClass}>
          {dirty && <span className="mr-auto text-caption text-warning">저장하지 않은 변경 사항이 있습니다</span>}
          <Button type="submit" variant="primary" disabled={isPending || (!!programId && !dirty)}>
            {isPending ? "저장 중…" : programId ? "저장" : "만들고 커리큘럼 편집"}
          </Button>
        </div>
      )}
    </form>
  );
}

/** 표지 미리보기 — 아카데미와 같은 그리기 규칙(@bayada/ui/cover)이라 보이는 그대로 나간다 */
function CoverPreview({ value: v, categories }: { value: ProgramFormValue; categories: { id: string; name: string; slug: string }[] }) {
  const [broken, setBroken] = useState<string | null>(null);
  const category = categories.find((c) => c.id === v.categoryId) ?? null;
  const auto = (
    <CourseCover
      course={{
        slug: v.slug || v.title,
        title: v.title || "프로그램명",
        category: category ? { name: category.name, slug: category.slug } : null,
        typeLabel: PRODUCT_TYPE_LABEL[v.productType],
        levelLabel: v.level ? LEVEL_LABEL[v.level] : null,
        audienceLabel:
          v.audiences.length === 0
            ? "전 직군"
            : v.audiences.length > 1
              ? `${JOB_ROLE_LABEL[v.audiences[0]]} 외 ${v.audiences.length - 1}`
              : JOB_ROLE_LABEL[v.audiences[0]],
      }}
    />
  );
  const src = v.coverMode === "UPLOAD" ? v.thumbnail.trim() : "";
  return (
    <div className="aspect-video w-full overflow-hidden rounded-[14px] bg-wash">
      {src && broken !== src ? (
        // 운영자가 입력한 원격 이미지 URL — next/image 최적화 대상 아님
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="표지 이미지 미리보기" className="h-full w-full object-cover" onError={() => setBroken(src)} />
      ) : (
        auto
      )}
    </div>
  );
}
