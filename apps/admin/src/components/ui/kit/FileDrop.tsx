"use client";

import { useRef, useState } from "react";
import { FileUp, LoaderCircle } from "lucide-react";
import { cn } from "@bayada/ui";

/**
 * 네이티브 파일 선택 버튼 대체 — 끌어다 놓기 + 클릭. 실제 <input type=file> 은 화면 밖에 숨긴다.
 * name 을 주면 같은 input 이 폼 전송에도 실린다(선택한 파일명은 카드 안에 표시).
 */
export function FileDrop({
  accept = "image/*",
  maxBytes = 5 * 1024 * 1024,
  onFile,
  name,
  busy,
  title = "파일을 끌어다 놓거나 눌러서 선택",
  hint = "JPG·PNG·WEBP, 최대 5MB",
  disabled,
  className,
}: {
  accept?: string;
  maxBytes?: number;
  onFile?: (f: File) => void;
  name?: string;
  busy?: boolean;
  title?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [err, setErr] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  const take = (f?: File | null) => {
    if (!f) return;
    const okType = accept.split(",").some((a) => {
      const t = a.trim();
      return t === "*" || (t.endsWith("/*") ? f.type.startsWith(t.slice(0, -1)) : f.type === t || f.name.toLowerCase().endsWith(t));
    });
    if (!okType) return setErr("지원하지 않는 파일 형식입니다.");
    if (f.size > maxBytes) return setErr(`파일이 너무 큽니다 (최대 ${Math.round(maxBytes / 1024 / 1024)}MB).`);
    setErr("");
    setPicked(f.name);
    onFile?.(f);
  };

  return (
    <div className={className}>
      <button
        type="button"
        disabled={busy || disabled}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f && input.current && name) {
            const dt = new DataTransfer();
            dt.items.add(f);
            input.current.files = dt.files;
          }
          take(f);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-7 text-center outline-none transition-colors",
          "focus-visible:border-ink disabled:cursor-not-allowed disabled:opacity-50",
          over ? "border-brand bg-brand-soft" : "border-line-strong bg-wash hover:border-ink/40",
        )}
      >
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-full transition-colors",
            over ? "bg-brand text-white" : "bg-ink text-white",
          )}
        >
          {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <FileUp className="size-5" aria-hidden />}
        </span>
        <span className="text-[14px] font-bold">{busy ? "올리는 중…" : picked ?? title}</span>
        <span className="text-[12px] text-muted">{picked ? "다른 파일을 고르려면 다시 누르세요" : hint}</span>
      </button>
      <input
        ref={input}
        type="file"
        name={name}
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-label={title}
        onChange={(e) => {
          take(e.target.files?.[0]);
          if (!name) e.target.value = "";
        }}
      />
      {err && <p className="mt-1.5 text-[12px] font-semibold text-danger">{err}</p>}
    </div>
  );
}
