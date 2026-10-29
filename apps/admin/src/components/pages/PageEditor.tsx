"use client";

import { useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";
import { savePage } from "@/lib/actions/pages";
import { formatDateTime } from "@/lib/labels";
import { Button, Field, cx, inputClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

// 미리보기는 아카데미의 .legacy-content(옛 WP 본문) 스타일에 맞춘다.
// sandbox iframe(allow-scripts 없음)이라 본문에 무엇이 있어도 어드민 화면에서 실행되지 않는다.
const PREVIEW_CSS = `
  body { margin: 0; padding: 24px 28px; font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; font-size: 15px; line-height: 1.8; color: #3f3f46; word-break: keep-all; }
  h1, h2, h3, h4 { color: #18181b; font-weight: 700; line-height: 1.4; margin: 1.4em 0 .5em; }
  h1 { font-size: 1.5rem; } h2 { font-size: 1.375rem; } h3 { font-size: 1.125rem; } h4 { font-size: 1rem; }
  body > :first-child { margin-top: 0; }
  p { margin: .8em 0; }
  ul { list-style: disc; padding-left: 1.4em; } ol { list-style: decimal; padding-left: 1.4em; }
  li { margin: .2em 0; }
  a { color: #e31b34; text-decoration: underline; }
  img, video { max-width: 100%; border-radius: 12px; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #e4e4e7; padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: #fafafa; color: #18181b; }
  blockquote { margin: 1em 0; padding: 12px 16px; background: #fafafa; border-radius: 12px; white-space: pre-line; }
`;

export function previewDoc(title: string, html: string): string {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${PREVIEW_CSS}</style></head><body><h1>${title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")}</h1>${html}</body></html>`;
}

export function PageEditor({
  slug,
  initialTitle,
  initialContent,
  updatedAt,
}: {
  slug: string;
  initialTitle: string;
  initialContent: string;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const { run, isPending } = useAction();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [base, setBase] = useState(updatedAt);
  const [saved, setSaved] = useState({ title: initialTitle, content: initialContent });
  const deferred = useDeferredValue(content);
  const dirty = title !== saved.title || content !== saved.content;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(() => savePage(slug, { title, content, baseUpdatedAt: base }), {
      refresh: false,
      onSuccess: (r) => {
        const next = r.ok && r.data ? r.data.updatedAt : null;
        setBase(next);
        setSaved({ title, content });
        // 헤더의 최종 수정일·새 문서 여부를 서버 값으로 갱신
        router.refresh();
      },
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="문서 제목" required htmlFor="page-title" className="max-w-[420px]">
        <input id="page-title" required className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="page-content" className="flex items-center justify-between text-[12.5px] font-medium text-zinc-700">
            <span>
              본문 HTML<span className="ml-0.5 text-brand">*</span>
            </span>
            <span className="tabular text-[11.5px] font-normal text-subtle">{content.length.toLocaleString()}자</span>
          </label>
          <textarea
            id="page-content"
            required
            spellCheck={false}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={cx(textareaClass, "h-[calc(100vh-330px)] min-h-[420px] resize-none font-mono text-[12px]! leading-[1.6]!")}
          />
          <p className="text-[11.5px] text-muted">h3·p·ol/ul·table·a 태그를 쓸 수 있습니다. 스크립트·iframe·이벤트 속성은 저장되지 않습니다.</p>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-zinc-700">미리보기</span>
          <iframe
            title="문서 미리보기"
            sandbox=""
            srcDoc={previewDoc(title, deferred)}
            className="h-[calc(100vh-330px)] min-h-[420px] w-full rounded-md border border-line bg-white"
          />
          <p className="text-[11.5px] text-muted">아카데미 본문 스타일 기준입니다.</p>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-1 flex items-center justify-end gap-2 border-t border-line bg-white/95 px-1 py-3 backdrop-blur">
        <span className="mr-auto text-[12px]">
          {dirty ? (
            <span className="text-amber-700">저장하지 않은 변경 사항이 있습니다</span>
          ) : (
            <span className="text-muted">최종 수정 {base ? formatDateTime(base) : "-"}</span>
          )}
        </span>
        <Button type="submit" variant="primary" disabled={isPending || !dirty}>
          {isPending ? "저장 중…" : updatedAt ? "저장" : "문서 만들기"}
        </Button>
      </div>
    </form>
  );
}
