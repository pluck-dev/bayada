"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createBanner, deleteBanner, updateBanner, type BannerInput } from "@/lib/actions/curation";
import { Badge, Button, Card, EmptyState, Field, cx, inputClass, tableClass, tdClass, thClass, trClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

interface BannerRow {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  linkUrl: string | null;
  startsAt: string;
  endsAt: string;
  order: number;
}

/** ISO → datetime-local 값 (KST) */
function toKstInput(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 9 * 3600_000);
  return d.toISOString().slice(0, 16);
}
function fmtKst(iso: string): string {
  return toKstInput(iso).replace("T", " ");
}

function bannerState(b: BannerRow, now: string): { label: string; tone: "green" | "blue" | "slate" } {
  if (b.endsAt <= now) return { label: "종료", tone: "slate" };
  if (b.startsAt > now) return { label: "예약", tone: "blue" };
  return { label: "노출 중", tone: "green" };
}

const EMPTY: BannerInput = { title: "", subtitle: "", image: "", linkUrl: "", startsAt: "", endsAt: "", order: 0 };

export function BannerManager({ banners, now }: { banners: BannerRow[]; now: string }) {
  const { run, isPending } = useAction();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<BannerInput>(EMPTY);
  const set = <K extends keyof BannerInput>(k: K, v: BannerInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    const start = toKstInput(now);
    const end = toKstInput(new Date(new Date(now).getTime() + 30 * 86400_000).toISOString());
    setForm({ ...EMPTY, startsAt: start, endsAt: end, order: banners.length });
    setEditing("new");
  };
  const openEdit = (b: BannerRow) => {
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      image: b.image ?? "",
      linkUrl: b.linkUrl ?? "",
      startsAt: toKstInput(b.startsAt),
      endsAt: toKstInput(b.endsAt),
      order: b.order,
    });
    setEditing(b.id);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editing;
    run(() => (id === "new" ? createBanner(form) : updateBanner(id as string, form)), { onSuccess: () => setEditing(null) });
  };

  return (
    <Card
      title="히어로 배너"
      padded={false}
      actions={
        editing === null && (
          <Button size="sm" variant="primary" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" aria-hidden />
            배너 추가
          </Button>
        )
      }
    >
      {editing !== null && (
        <form onSubmit={save} className="border-b border-line bg-surface p-4">
          <fieldset disabled={isPending} className="grid grid-cols-4 gap-3">
            <Field label="제목" required className="col-span-2">
              <input required className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="부제" className="col-span-2">
              <input className={inputClass} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </Field>
            <Field label="이미지 URL" className="col-span-2">
              <input className={inputClass} placeholder="https://" value={form.image} onChange={(e) => set("image", e.target.value)} />
            </Field>
            <Field label="링크 URL" className="col-span-2" hint="예) /courses/치매-케어 또는 https://">
              <input className={inputClass} value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} />
            </Field>
            <Field label="노출 시작 (KST)" required>
              <input type="datetime-local" required className={inputClass} value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
            </Field>
            <Field label="노출 종료 (KST)" required>
              <input type="datetime-local" required className={inputClass} value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
            </Field>
            <Field label="순서" hint="작을수록 먼저">
              <input type="number" className={cx(inputClass, "tabular")} value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
            </Field>
            <div className="flex items-end justify-end gap-2">
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

      {banners.length === 0 ? (
        <EmptyState title="등록된 배너가 없습니다" description="배너가 없으면 아카데미 메인은 기본 히어로를 보여줍니다." />
      ) : (
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={cx(thClass, "w-12")}>순서</th>
              <th className={thClass}>배너</th>
              <th className={thClass}>링크</th>
              <th className={thClass}>노출 기간 (필수)</th>
              <th className={thClass}>상태</th>
              <th className={cx(thClass, "w-px")} aria-label="작업" />
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => {
              const st = bannerState(b, now);
              return (
                <tr key={b.id} className={trClass}>
                  <td className={cx(tdClass, "tabular text-subtle")}>{b.order}</td>
                  <td className={cx(tdClass, "whitespace-normal!")}>
                    <div className="flex items-center gap-3">
                      {b.image ? (
                        // 외부 URL 썸네일 미리보기
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.image} alt="" className="h-9 w-16 rounded border border-line object-cover" />
                      ) : (
                        <span className="h-9 w-16 rounded border border-dashed border-line bg-surface" aria-hidden />
                      )}
                      <div>
                        <p className="font-medium">{b.title}</p>
                        {b.subtitle && <p className="text-caption text-muted">{b.subtitle}</p>}
                      </div>
                    </div>
                  </td>
                  <td className={cx(tdClass, "max-w-[200px] truncate text-caption text-subtle")}>{b.linkUrl ?? "-"}</td>
                  <td className={cx(tdClass, "tabular text-muted")}>
                    {fmtKst(b.startsAt)} ~ {fmtKst(b.endsAt)}
                  </td>
                  <td className={tdClass}>
                    <Badge tone={st.tone} dot>
                      {st.label}
                    </Badge>
                  </td>
                  <td className={tdClass}>
                    <div className="flex">
                      <Button size="sm" variant="ghost" aria-label={`${b.title} 수정`} onClick={() => openEdit(b)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`${b.title} 삭제`}
                        disabled={isPending}
                        onClick={() =>
                          run(() => deleteBanner(b.id), {
                            confirm: { title: `'${b.title}' 배너를 삭제할까요?`, confirmLabel: "삭제", danger: true },
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}
