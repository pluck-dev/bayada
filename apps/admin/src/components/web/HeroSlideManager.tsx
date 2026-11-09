"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteHeroSlide, saveHeroSlide, type HeroSlideInput } from "@/lib/actions/web-content";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  NumberInput,
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

export interface HeroSlideRow extends HeroSlideInput {
  id: string;
}

const EMPTY: HeroSlideInput = { imageUrl: "", alt: "", title: "", subtitle: "", ctaLabel: "", ctaHref: "", order: 0, visible: true };

export function HeroSlideManager({ slides }: { slides: HeroSlideRow[] }) {
  const { run, isPending } = useAction();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<HeroSlideInput>(EMPTY);
  const set = <K extends keyof HeroSlideInput>(k: K, v: HeroSlideInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    // 새 슬라이드는 첫 슬라이드 문구를 이어받는다 (원래 화면은 세 장이 같은 문구)
    const first = slides[0];
    setForm({ ...EMPTY, ...(first ? { title: first.title, subtitle: first.subtitle, ctaLabel: first.ctaLabel, ctaHref: first.ctaHref } : {}), order: slides.length });
    setEditing("new");
  };
  const openEdit = (s: HeroSlideRow) => {
    const { id: _id, ...rest } = s;
    setForm(rest);
    setEditing(s.id);
  };

  return (
    <Card
      tour="web-manager"
      title={`슬라이드 ${slides.length}장 · 노출 ${slides.filter((s) => s.visible).length}장`}
      padded={false}
      actions={
        editing === null && (
          <Button size="sm" variant="primary" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" aria-hidden />
            슬라이드 추가
          </Button>
        )
      }
    >
      {editing !== null && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(() => saveHeroSlide(editing === "new" ? null : editing, form), { onSuccess: (r) => r.ok && setEditing(null) });
          }}
          className="panel-inset mx-4 mb-4 rounded-2xl p-5"
        >
          <fieldset disabled={isPending} className="grid grid-cols-4 gap-3">
            <Field label="배경 이미지" required className="col-span-2" hint="/images/hero/hero-1.webp 또는 https:// (가로형 큰 이미지)">
              <input required className={inputClass} value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
            </Field>
            <Field label="대체 텍스트" className="col-span-2" hint="화면 읽기 프로그램용 이미지 설명">
              <input maxLength={120} className={inputClass} value={form.alt} onChange={(e) => set("alt", e.target.value)} />
            </Field>
            <Field label="제목" required className="col-span-2" hint="줄을 바꾸면 화면에서도 줄이 바뀝니다.">
              <textarea required rows={3} maxLength={120} className={cx(textareaClass, "font-semibold")} value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="부제" className="col-span-2">
              <textarea rows={3} maxLength={400} className={textareaClass} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </Field>
            <Field label="버튼 문구" hint="비우면 버튼 없음">
              <input maxLength={30} className={inputClass} value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} />
            </Field>
            <Field label="버튼 링크" hint="#services-by-age(홈 안 위치), /contact, https://">
              <input maxLength={300} className={inputClass} value={form.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} />
            </Field>
            <Field label="순서" hint="작을수록 먼저">
              <NumberInput min={0} value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
            </Field>
            <div className="flex items-end pb-2.5">
              <Switch checked={form.visible} onChange={(c) => set("visible", c)} label="노출" />
            </div>
            <div className="col-span-4 flex justify-end gap-2">
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

      {slides.length === 0 ? (
        <EmptyState title="등록된 슬라이드가 없습니다" description="노출 중인 슬라이드가 없으면 홈페이지는 기존 기본 히어로를 보여 줍니다." />
      ) : (
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={cx(thClass, "w-12")}>순서</th>
              <th className={thClass}>슬라이드</th>
              <th className={thClass}>버튼</th>
              <th className={thClass}>상태</th>
              <th className={cx(thClass, "w-px")} aria-label="작업" />
            </tr>
          </thead>
          <tbody>
            {slides.map((s) => (
              <tr key={s.id} className={cx(trClass, !s.visible && "opacity-60")}>
                <td className={cx(tdClass, "tabular text-subtle")}>{s.order}</td>
                <td className={cx(tdClass, "whitespace-normal!")}>
                  <div className="flex items-center gap-3">
                    {/* 홈페이지 경로(/images/…)는 어드민 도메인에 없어 썸네일 대신 경로만 보인다 */}
                    {/^https?:/i.test(s.imageUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.imageUrl} alt="" className="h-9 w-16 rounded border border-line object-cover" />
                    ) : (
                      <span className="h-9 w-16 rounded border border-dashed border-line bg-surface" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-medium">{s.title.replace(/\n/g, " ")}</p>
                      <p className="text-micro text-subtle">{s.imageUrl}</p>
                    </div>
                  </div>
                </td>
                <td className={cx(tdClass, "text-caption text-muted")}>{s.ctaLabel ? `${s.ctaLabel} → ${s.ctaHref}` : "-"}</td>
                <td className={tdClass}>{s.visible ? <Badge tone="green" dot>노출</Badge> : <Badge tone="slate">숨김</Badge>}</td>
                <td className={tdClass}>
                  <div className="flex">
                    <Button size="sm" variant="ghost" aria-label="수정" onClick={() => openEdit(s)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="삭제"
                      disabled={isPending}
                      onClick={() =>
                        run(() => deleteHeroSlide(s.id), {
                          confirm: { title: "이 슬라이드를 삭제할까요?", confirmLabel: "삭제", danger: true },
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
