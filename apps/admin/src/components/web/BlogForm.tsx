"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { WEB_BLOG_CATEGORIES } from "@bayada/shared/web-content";
import { createBlogPost, deleteBlogPost, updateBlogPost, type BlogInput } from "@/lib/actions/web-content";
import { Button, Card, Field, cx, inputClass, selectClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export function BlogForm({ locale, id, initial }: { locale: string; id: string | null; initial: BlogInput }) {
  const { run, isPending } = useAction();
  const router = useRouter();
  const [v, setV] = useState<BlogInput>(initial);
  const set = <K extends keyof BlogInput>(k: K, val: BlogInput[K]) => setV((s) => ({ ...s, [k]: val }));
  const list = `/${locale}/web/blog`;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      run(() => updateBlogPost(id, v));
      return;
    }
    run(() => createBlogPost(v), {
      refresh: false,
      onSuccess: (r) => r.ok && r.data && router.push(`${list}/${(r.data as { id: string }).id}`),
    });
  };

  return (
    <form onSubmit={save}>
      <fieldset disabled={isPending} className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
        <Card title="본문">
          <div className="flex flex-col gap-4">
            <Field label="제목" htmlFor="b-title" required>
              <input id="b-title" required maxLength={200} className={cx(inputClass, "font-semibold")} value={v.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="요약" htmlFor="b-excerpt" hint="목록 카드와 검색 설명에 쓰입니다. 500자 이내.">
              <textarea id="b-excerpt" rows={2} maxLength={500} className={textareaClass} value={v.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
            </Field>
            <Field label="본문" htmlFor="b-body" required hint="빈 줄로 문단을 나눕니다.">
              <textarea id="b-body" required rows={18} className={textareaClass} value={v.body} onChange={(e) => set("body", e.target.value)} />
            </Field>
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          <Card title="게시">
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-caption">
                <input type="checkbox" checked={v.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />
                홈페이지에 게시
              </label>
              <Field label="게시일" htmlFor="b-date" required>
                <input id="b-date" type="date" required className={inputClass} value={v.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
              </Field>
              <Button type="submit" variant="primary">
                {id ? "저장" : "만들기"}
              </Button>
            </div>
          </Card>
          <Card title="정보">
            <div className="flex flex-col gap-3">
              <Field label="주소 (slug)" htmlFor="b-slug" required hint="/blog/ 뒤에 붙는 주소. 소문자·숫자·하이픈.">
                <input id="b-slug" required maxLength={120} className={inputClass} value={v.slug} onChange={(e) => set("slug", e.target.value)} />
              </Field>
              <Field label="카테고리" htmlFor="b-cat" required>
                <select id="b-cat" required className={selectClass} value={v.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">선택</option>
                  {WEB_BLOG_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="작성자" htmlFor="b-author">
                <input id="b-author" maxLength={60} className={inputClass} value={v.author} onChange={(e) => set("author", e.target.value)} />
              </Field>
              <Field label="읽는 시간 (분)" htmlFor="b-read">
                <input id="b-read" type="number" min={1} max={120} className={cx(inputClass, "tabular")} value={v.readTime} onChange={(e) => set("readTime", Number(e.target.value))} />
              </Field>
              <Field label="태그" htmlFor="b-tags" hint="쉼표로 구분">
                <input id="b-tags" className={inputClass} value={v.tags} onChange={(e) => set("tags", e.target.value)} />
              </Field>
              <Field label="표지 이미지 URL" htmlFor="b-cover" hint="https:// 또는 /images/… — 비우면 회색 상자">
                <input id="b-cover" className={inputClass} placeholder="https://" value={v.coverImage} onChange={(e) => set("coverImage", e.target.value)} />
              </Field>
            </div>
          </Card>
          {id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                run(() => deleteBlogPost(id), {
                  confirm: { title: `'${v.title}' 글을 삭제할까요?`, body: "되돌릴 수 없습니다. 잠시 내리려면 게시를 끄세요.", confirmLabel: "삭제", danger: true },
                  refresh: false,
                  onSuccess: () => router.push(list),
                })
              }
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />글 삭제
            </Button>
          )}
        </div>
      </fieldset>
    </form>
  );
}
