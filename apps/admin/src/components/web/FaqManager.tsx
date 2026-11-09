"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteFaqCategory,
  deleteFaqItem,
  moveFaqCategory,
  moveFaqItem,
  saveFaqCategory,
  saveFaqItem,
  type FaqItemInput,
} from "@/lib/actions/web-content";
import { Badge, Button, Card, EmptyState, Field, Select, Switch, cx, inputClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

interface Item {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
}
interface Category {
  id: string;
  slug: string;
  name: string;
  items: Item[];
}

type Editing = { kind: "category"; id: string | null } | { kind: "item"; id: string | null } | null;

export function FaqManager({ categories }: { categories: Category[] }) {
  const { run, isPending } = useAction();
  const [editing, setEditing] = useState<Editing>(null);
  const [cat, setCat] = useState({ slug: "", name: "" });
  const [item, setItem] = useState<FaqItemInput>({ categoryId: "", question: "", answer: "", visible: true });
  const close = () => setEditing(null);

  const openCategory = (c?: Category) => {
    setCat(c ? { slug: c.slug, name: c.name } : { slug: "", name: "" });
    setEditing({ kind: "category", id: c?.id ?? null });
  };
  const openItem = (categoryId: string, it?: Item) => {
    setItem(it ? { categoryId, question: it.question, answer: it.answer, visible: it.visible } : { categoryId, question: "", answer: "", visible: true });
    setEditing({ kind: "item", id: it?.id ?? null });
  };

  const editor =
    editing?.kind === "category" ? (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveFaqCategory(editing.id, cat), { onSuccess: (r) => r.ok && close() });
        }}
        className="panel-inset mx-4 mb-4 rounded-2xl p-5"
      >
        <fieldset disabled={isPending} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
          <Field label="카테고리 이름" required>
            <input required maxLength={30} className={inputClass} value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} />
          </Field>
          <Field label="주소 (slug)" required hint="/faq?category= 뒤 값. 영문 소문자·숫자·하이픈">
            <input required maxLength={40} className={inputClass} value={cat.slug} onChange={(e) => setCat({ ...cat, slug: e.target.value })} />
          </Field>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={close}>
              취소
            </Button>
            <Button type="submit" variant="primary">
              {editing.id ? "저장" : "추가"}
            </Button>
          </div>
        </fieldset>
      </form>
    ) : editing?.kind === "item" ? (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveFaqItem(editing.id, item), { onSuccess: (r) => r.ok && close() });
        }}
        className="panel-inset mx-4 mb-4 rounded-2xl p-5"
      >
        <fieldset disabled={isPending} className="grid grid-cols-4 gap-3">
          <Field label="질문" required className="col-span-3">
            <input required maxLength={300} className={inputClass} value={item.question} onChange={(e) => setItem({ ...item, question: e.target.value })} />
          </Field>
          <Field label="카테고리" required>
            <Select
              aria-label="카테고리"
              value={item.categoryId}
              onChange={(x) => setItem({ ...item, categoryId: x })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>
          <Field label="답변" required className="col-span-4">
            <textarea required rows={4} maxLength={5000} className={textareaClass} value={item.answer} onChange={(e) => setItem({ ...item, answer: e.target.value })} />
          </Field>
          <div className="col-span-2 flex items-center">
            <Switch checked={item.visible} onChange={(c) => setItem({ ...item, visible: c })} label="홈페이지에 보이기" />
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={close}>
              취소
            </Button>
            <Button type="submit" variant="primary">
              {editing.id ? "저장" : "추가"}
            </Button>
          </div>
        </fieldset>
      </form>
    ) : null;

  return (
    <Card
      title={`카테고리 ${categories.length}개 · 질문 ${categories.reduce((n, c) => n + c.items.length, 0)}개`}
      padded={false}
      actions={
        editing === null && (
          <Button size="sm" variant="primary" onClick={() => openCategory()}>
            <Plus className="h-3.5 w-3.5" aria-hidden />
            카테고리 추가
          </Button>
        )
      }
    >
      {editor}
      {categories.length === 0 ? (
        <EmptyState
          title="FAQ 카테고리가 없습니다"
          description="하나도 없으면 홈페이지는 기존 기본 FAQ 를 보여 줍니다. pnpm --filter @bayada/db import:web 으로 옮길 수 있습니다."
        />
      ) : (
        <div className="divide-y divide-line">
          {categories.map((c, ci) => (
            <section key={c.id} className="p-4" aria-label={c.name}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-body font-semibold">{c.name}</h3>
                <span className="text-micro text-subtle">{c.slug}</span>
                <div className="ml-auto flex items-center">
                  <Button size="sm" variant="ghost" aria-label={`${c.name} 위로`} disabled={isPending || ci === 0} onClick={() => run(() => moveFaqCategory(c.id, -1))}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${c.name} 아래로`}
                    disabled={isPending || ci === categories.length - 1}
                    onClick={() => run(() => moveFaqCategory(c.id, 1))}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" aria-label={`${c.name} 수정`} onClick={() => openCategory(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${c.name} 삭제`}
                    disabled={isPending}
                    onClick={() =>
                      run(() => deleteFaqCategory(c.id), {
                        confirm: { title: `'${c.name}' 카테고리를 삭제할까요?`, confirmLabel: "삭제", danger: true },
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="secondary" className="ml-1" onClick={() => openItem(c.id)}>
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    질문
                  </Button>
                </div>
              </div>
              {c.items.length === 0 ? (
                <p className="text-caption text-subtle">질문이 없습니다 — 홈페이지 탭에 나오지 않습니다.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-hairline rounded-2xl bg-wash px-1">
                  {c.items.map((it, ii) => (
                    <li key={it.id} className={cx("flex items-start gap-3 px-3 py-2", !it.visible && "opacity-60")}>
                      <div className="min-w-0 flex-1">
                        <p className="text-caption font-medium">
                          {it.question} {!it.visible && <Badge tone="slate">숨김</Badge>}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-caption text-muted">{it.answer}</p>
                      </div>
                      <div className="flex shrink-0">
                        <Button size="sm" variant="ghost" aria-label="위로" disabled={isPending || ii === 0} onClick={() => run(() => moveFaqItem(it.id, -1))}>
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="아래로"
                          disabled={isPending || ii === c.items.length - 1}
                          onClick={() => run(() => moveFaqItem(it.id, 1))}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" aria-label="질문 수정" onClick={() => openItem(c.id, it)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="질문 삭제"
                          disabled={isPending}
                          onClick={() =>
                            run(() => deleteFaqItem(it.id), {
                              confirm: { title: "이 질문을 삭제할까요?", body: it.question, confirmLabel: "삭제", danger: true },
                            })
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </Card>
  );
}
