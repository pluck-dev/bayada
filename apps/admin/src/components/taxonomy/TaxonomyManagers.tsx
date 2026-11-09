"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCategory,
  createProvider,
  deleteCategory,
  deleteProvider,
  updateCategory,
  updateProvider,
  type CategoryInput,
  type ProviderInput,
} from "@/lib/actions/taxonomy";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  NumberInput,
  cx,
  inputClass,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

interface CategoryRow extends CategoryInput {
  id: string;
  count: number;
}

export function CategoryManager({ rows }: { rows: CategoryRow[] }) {
  const { run, isPending } = useAction();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<CategoryInput>({ name: "", slug: "", order: 0 });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editing;
    run(() => (id === "new" ? createCategory(form) : updateCategory(id as string, form)), { onSuccess: () => setEditing(null) });
  };

  return (
    <Card
      title={`카테고리 (${rows.length})`}
      padded={false}
      actions={
        editing === null && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setForm({ name: "", slug: "", order: rows.length });
              setEditing("new");
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            추가
          </Button>
        )
      }
    >
      {editing !== null && (
        <form onSubmit={save} className="grid grid-cols-[1fr_1fr_72px] gap-3 panel-inset mx-4 mb-4 rounded-2xl p-5">
          <Field label="이름" required>
            <input required autoFocus className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="slug" required>
            <input required className={cx(inputClass, "font-mono text-caption!")} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </Field>
          <Field label="순서">
            <NumberInput value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </Field>
          <div className="col-span-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {editing === "new" ? "추가" : "저장"}
            </Button>
          </div>
        </form>
      )}
      {rows.length === 0 ? (
        <EmptyState title="카테고리가 없습니다" />
      ) : (
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={cx(thClass, "w-12")}>순서</th>
              <th className={thClass}>이름</th>
              <th className={thClass}>slug</th>
              <th className={cx(thClass, "text-right")}>프로그램</th>
              <th className={cx(thClass, "w-px")} aria-label="작업" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className={trClass}>
                <td className={cx(tdClass, "tabular text-subtle")}>{c.order}</td>
                <td className={cx(tdClass, "font-medium")}>{c.name}</td>
                <td className={cx(tdClass, "font-mono text-caption text-subtle")}>{c.slug}</td>
                <td className={cx(tdClass, "tabular text-right")}>{c.count}</td>
                <td className={tdClass}>
                  <div className="flex">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`${c.name} 수정`}
                      onClick={() => {
                        setForm({ name: c.name, slug: c.slug, order: c.order });
                        setEditing(c.id);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`${c.name} 삭제`}
                      disabled={isPending || c.count > 0}
                      title={c.count > 0 ? "사용 중인 카테고리는 삭제할 수 없습니다" : undefined}
                      onClick={() =>
                        run(() => deleteCategory(c.id), { confirm: { title: `'${c.name}' 카테고리를 삭제할까요?`, confirmLabel: "삭제", danger: true } })
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

interface ProviderRow {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isPartner: boolean;
  count: number;
}

export function ProviderManager({ rows }: { rows: ProviderRow[] }) {
  const { run, isPending } = useAction();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<ProviderInput>({ name: "", slug: "", logo: "", isPartner: false });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editing;
    run(() => (id === "new" ? createProvider(form) : updateProvider(id as string, form)), { onSuccess: () => setEditing(null) });
  };

  return (
    <Card
      title={`제공기관 (${rows.length})`}
      padded={false}
      actions={
        editing === null && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setForm({ name: "", slug: "", logo: "", isPartner: true });
              setEditing("new");
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            추가
          </Button>
        )
      }
    >
      {editing !== null && (
        <form onSubmit={save} className="grid grid-cols-2 gap-3 panel-inset mx-4 mb-4 rounded-2xl p-5">
          <Field label="이름" required>
            <input required autoFocus className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="slug" required>
            <input required className={cx(inputClass, "font-mono text-caption!")} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </Field>
          <Field label="로고 URL" className="col-span-2">
            <input className={inputClass} placeholder="https://" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
          </Field>
          <div className="flex items-center">
            <Checkbox checked={form.isPartner} onChange={(c) => setForm({ ...form, isPartner: c })} label="외부 파트너 기관" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {editing === "new" ? "추가" : "저장"}
            </Button>
          </div>
        </form>
      )}
      {rows.length === 0 ? (
        <EmptyState title="제공기관이 없습니다" description="승인 요청에는 제공기관이 필수입니다." />
      ) : (
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>기관</th>
              <th className={thClass}>구분</th>
              <th className={cx(thClass, "text-right")}>프로그램</th>
              <th className={cx(thClass, "w-px")} aria-label="작업" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className={trClass}>
                <td className={tdClass}>
                  <div className="flex items-center gap-2.5">
                    {p.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logo} alt="" className="h-7 w-7 rounded border border-line object-contain" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded bg-surface-sunken text-micro font-semibold text-subtle">
                        {p.name.slice(0, 1)}
                      </span>
                    )}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="font-mono text-micro text-subtle">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className={tdClass}>{p.isPartner ? <Badge tone="violet">파트너</Badge> : <Badge>바야다</Badge>}</td>
                <td className={cx(tdClass, "tabular text-right")}>{p.count}</td>
                <td className={tdClass}>
                  <div className="flex">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`${p.name} 수정`}
                      onClick={() => {
                        setForm({ name: p.name, slug: p.slug, logo: p.logo ?? "", isPartner: p.isPartner });
                        setEditing(p.id);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`${p.name} 삭제`}
                      disabled={isPending || p.count > 0}
                      title={p.count > 0 ? "프로그램이 연결된 기관은 삭제할 수 없습니다" : undefined}
                      onClick={() =>
                        run(() => deleteProvider(p.id), { confirm: { title: `'${p.name}'을(를) 삭제할까요?`, confirmLabel: "삭제", danger: true } })
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
