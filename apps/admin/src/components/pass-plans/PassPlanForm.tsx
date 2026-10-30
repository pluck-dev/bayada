"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPassPlan, deletePassPlan, updatePassPlan, type PassPlanInput } from "@/lib/actions/pass-plans";
import { PRODUCT_TYPES, PRODUCT_TYPE_LABEL } from "@/lib/labels";
import { Button, Card, Field, cx, inputClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export function PassPlanForm({
  locale,
  planId,
  initial,
  deletable = false,
}: {
  locale: string;
  planId?: string;
  initial: PassPlanInput;
  deletable?: boolean;
}) {
  const router = useRouter();
  const { run, isPending } = useAction();
  const [v, setV] = useState<PassPlanInput>(initial);
  const set = <K extends keyof PassPlanInput>(k: K, val: PassPlanInput[K]) => setV((p) => ({ ...p, [k]: val }));
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);
  const list = `/${locale}/pass-plans`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (planId) {
      run(() => updatePassPlan(planId, v));
    } else {
      run(() => createPassPlan(v), {
        refresh: false,
        onSuccess: (r) => {
          if (r.ok) router.push(list);
        },
      });
    }
  };

  return (
    <form onSubmit={submit} className="flex max-w-[720px] flex-col gap-4">
      <Card title="요금제 정보">
        <fieldset disabled={isPending} className="grid grid-cols-2 gap-4">
          <Field label="이름" required htmlFor="pp-name" className="col-span-2">
            <input
              id="pp-name"
              required
              maxLength={60}
              className={inputClass}
              placeholder="예) 연간 패스"
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="설명" htmlFor="pp-desc" className="col-span-2" hint="아카데미 패스 페이지 요금제 카드에 표시됩니다.">
            <textarea
              id="pp-desc"
              rows={3}
              className={textareaClass}
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
          <Field label="가격 (원)" required htmlFor="pp-price" hint="100원 이상 · 결제 시점 금액으로 고정">
            <input
              id="pp-price"
              type="number"
              min={100}
              step={100}
              required
              className={cx(inputClass, "tabular")}
              value={v.price || ""}
              onChange={(e) => set("price", Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="이용 기간 (일)" required htmlFor="pp-days" hint="30 = 1개월 · 365 = 1년. 갱신하면 남은 기간에 이어 붙습니다.">
            <input
              id="pp-days"
              type="number"
              min={1}
              max={3650}
              required
              className={cx(inputClass, "tabular")}
              value={v.durationDays || ""}
              onChange={(e) => set("durationDays", Number(e.target.value) || 0)}
            />
          </Field>
          <fieldset className="col-span-2 flex flex-col gap-1.5">
            <legend className="mb-1.5 text-caption font-medium text-ink-soft">
              무제한 수강 대상 상품 유형<span className="ml-0.5 text-brand">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TYPES.map((t) => {
                const on = v.includes.includes(t);
                return (
                  <label
                    key={t}
                    className={cx(
                      "inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border px-3 text-caption transition-colors",
                      on ? "border-ink bg-zinc-900 text-white" : "border-line bg-canvas text-ink-soft hover:border-line-strong",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => set("includes", on ? v.includes.filter((x) => x !== t) : [...v.includes, t])}
                    />
                    {PRODUCT_TYPE_LABEL[t]}
                  </label>
                );
              })}
            </div>
            <p className="text-micro text-muted">
              유료 프로그램 중 이 유형이면서 학습자에게 노출되는 프로그램을 패스로 수강할 수 있습니다. 사내 전용 노출 규칙은 그대로 적용됩니다.
            </p>
          </fieldset>
          <label className="col-span-2 inline-flex items-center gap-2 text-caption text-ink-soft">
            <input type="checkbox" checked={v.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-zinc-900" />
            판매 중 (끄면 새 구독만 막히고, 이용 중인 구독은 만료일까지 유지)
          </label>
        </fieldset>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          {planId && deletable && (
            <Button
              variant="danger"
              disabled={isPending}
              onClick={() =>
                run(() => deletePassPlan(planId), {
                  confirm: { title: "이 요금제를 삭제할까요?", body: "되돌릴 수 없습니다.", confirmLabel: "삭제", danger: true },
                  refresh: false,
                  onSuccess: (r) => {
                    if (r.ok) router.push(list);
                  },
                })
              }
            >
              삭제
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push(list)} disabled={isPending}>
            목록
          </Button>
          <Button type="submit" variant="primary" disabled={isPending || (!!planId && !dirty)}>
            {planId ? "저장" : "만들기"}
          </Button>
        </div>
      </div>
    </form>
  );
}
