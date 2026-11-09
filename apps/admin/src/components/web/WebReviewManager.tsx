"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { WEB_SERVICE_OPTIONS, kstDate } from "@bayada/shared/web-content";
import { deleteWebReview, saveWebReview, setWebReviewVisible, type WebReviewInput } from "@/lib/actions/web-content";
import {
  Badge,
  Button,
  Card,
  DatePicker,
  EmptyState,
  Field,
  NumberInput,
  Select,
  Switch,
  cx,
  inputClass,
  tableClass,
  tdClass,
  textareaClass,
  thClass,
  trClass,
} from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export interface WebReviewRow extends WebReviewInput {
  id: string;
}

const serviceName = (slug: string) => WEB_SERVICE_OPTIONS.find((s) => s.slug === slug)?.name ?? slug;

export function WebReviewManager({ reviews }: { reviews: WebReviewRow[] }) {
  const { run, isPending } = useAction();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<WebReviewInput>({ rating: 5, content: "", author: "", serviceType: "", reviewedAt: "", visible: true, order: 0 });
  const set = <K extends keyof WebReviewInput>(k: K, v: WebReviewInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setForm({ rating: 5, content: "", author: "", serviceType: "", reviewedAt: kstDate(new Date()), visible: true, order: reviews.length });
    setEditing("new");
  };
  const openEdit = (r: WebReviewRow) => {
    const { id: _id, ...rest } = r;
    setForm(rest);
    setEditing(r.id);
  };

  return (
    <Card
      tour="web-manager"
      title={`후기 ${reviews.length}개 · 공개 ${reviews.filter((r) => r.visible).length}개`}
      padded={false}
      actions={
        editing === null && (
          <Button size="sm" variant="primary" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" aria-hidden />
            후기 추가
          </Button>
        )
      }
    >
      {editing !== null && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(() => saveWebReview(editing === "new" ? null : editing, form), { onSuccess: (r) => r.ok && setEditing(null) });
          }}
          className="panel-inset mx-4 mb-4 rounded-2xl p-5"
        >
          <fieldset disabled={isPending} className="grid grid-cols-4 gap-3">
            <Field label="후기 내용" required className="col-span-4">
              <textarea required rows={3} maxLength={2000} className={textareaClass} value={form.content} onChange={(e) => set("content", e.target.value)} />
            </Field>
            <Field label="작성자 표기" required hint="익명: 70대 여성 보호자">
              <input required maxLength={40} className={inputClass} value={form.author} onChange={(e) => set("author", e.target.value)} />
            </Field>
            <Field label="서비스" required>
              <Select
                aria-label="서비스"
                required
                value={form.serviceType}
                onChange={(x) => set("serviceType", x)}
                options={WEB_SERVICE_OPTIONS.map((s) => ({ value: s.slug, label: s.name }))}
              />
            </Field>
            <Field label="별점" required>
              <Select
                aria-label="별점"
                value={String(form.rating)}
                onChange={(x) => set("rating", Number(x))}
                options={[5, 4, 3, 2, 1].map((n) => ({
                  value: String(n),
                  text: `${n}`,
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <span className="tracking-[0.08em] text-brand">{"★".repeat(n)}<span className="text-line-strong">{"★".repeat(5 - n)}</span></span>
                      {n}점
                    </span>
                  ),
                }))}
              />
            </Field>
            <Field label="작성일" required>
              <DatePicker aria-label="작성일" required clearable={false} value={form.reviewedAt} onChange={(x) => set("reviewedAt", x)} />
            </Field>
            <Field label="순서" hint="작을수록 먼저 (홈 캐러셀은 앞 8개)">
              <NumberInput min={0} value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
            </Field>
            <div className="flex items-end pb-2.5">
              <Switch checked={form.visible} onChange={(c) => set("visible", c)} label="홈페이지에 보이기" />
            </div>
            <div className="col-span-2 flex items-end justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                취소
              </Button>
              <Button type="submit" variant="primary">
                {editing === "new" ? "추가" : "저장"}
              </Button>
            </div>
          </fieldset>
        </form>
      )}

      {reviews.length === 0 ? (
        <EmptyState
          title="등록된 후기가 없습니다"
          description="하나도 없으면 홈페이지는 기존 기본 후기를 보여 줍니다. pnpm --filter @bayada/db import:web 으로 옮길 수 있습니다."
        />
      ) : (
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={cx(thClass, "w-12")}>순서</th>
              <th className={thClass}>후기</th>
              <th className={thClass}>서비스</th>
              <th className={thClass}>별점</th>
              <th className={thClass}>상태</th>
              <th className={cx(thClass, "w-px")} aria-label="작업" />
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className={cx(trClass, !r.visible && "opacity-60")}>
                <td className={cx(tdClass, "tabular text-subtle")}>{r.order}</td>
                <td className={cx(tdClass, "max-w-[460px] whitespace-normal!")}>
                  <p className="line-clamp-2">{r.content}</p>
                  <p className="mt-0.5 text-micro text-subtle">
                    — {r.author} · {r.reviewedAt}
                  </p>
                </td>
                <td className={cx(tdClass, "text-muted")}>{serviceName(r.serviceType)}</td>
                <td className={cx(tdClass, "tabular")}>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-warning" aria-hidden />
                    {r.rating}
                  </span>
                </td>
                <td className={tdClass}>{r.visible ? <Badge tone="green" dot>공개</Badge> : <Badge tone="slate">숨김</Badge>}</td>
                <td className={tdClass}>
                  <div className="flex">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={r.visible ? "숨기기" : "보이기"}
                      disabled={isPending}
                      onClick={() => run(() => setWebReviewVisible(r.id, !r.visible))}
                    >
                      {r.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" aria-label="수정" onClick={() => openEdit(r)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="삭제"
                      disabled={isPending}
                      onClick={() =>
                        run(() => deleteWebReview(r.id), {
                          confirm: { title: "이 후기를 삭제할까요?", body: "잠시 내리려면 숨기기를 쓰세요.", confirmLabel: "삭제", danger: true },
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
