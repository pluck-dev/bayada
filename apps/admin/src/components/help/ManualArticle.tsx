import Link from "next/link";
import { Info, TriangleAlert, Lightbulb } from "lucide-react";
import { cn } from "@bayada/ui";
import { PERMISSION_DEFS } from "@/lib/rbac";
import { manualById, type ManualSection } from "./manual";

const permLabel = (k: string) => PERMISSION_DEFS.find((p) => p.key === k)?.label ?? k;

/** 매뉴얼 글 하나 — /manual 본문과 도움말 패널이 같이 쓴다(훅 없음) */
export function ManualArticle({
  s,
  locale,
  compact = false,
  onNavigate,
}: {
  s: ManualSection;
  locale: string;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const related = (s.related ?? []).map(manualById).filter((x): x is ManualSection => !!x);
  return (
    <article id={s.id} className={cn("scroll-mt-6", !compact && "surface-card rounded-[22px] bg-canvas p-6 md:p-7")}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className={cn("font-extrabold tracking-[-0.025em] text-ink", compact ? "text-[16px]" : "text-[20px]")}>{s.title}</h2>
        {s.perms && (
          <span className="inline-flex h-6 items-center rounded-full bg-wash px-2.5 text-[11.5px] font-bold text-ink-soft">
            필요 권한 · {s.perms.map(permLabel).join(" / ")}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[14px] leading-[1.65] text-ink-soft">{s.summary}</p>
      {s.why && (
        <p className="mt-3 flex gap-2 rounded-2xl bg-pill-info px-4 py-3 text-[13px] leading-[1.6] text-ink">
          <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
          <span>
            <b>왜 이렇게 하나요?</b> {s.why}
          </span>
        </p>
      )}
      {s.steps && s.steps.length > 0 && (
        <ol className="mt-4 flex flex-col gap-3">
          {s.steps.map((st, i) => (
            <li key={i} className="flex gap-3">
              <span className="num mt-px flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-white">{i + 1}</span>
              <div className="min-w-0 text-[14px] leading-[1.6]">
                <p className="font-bold text-ink">{st.t}</p>
                {st.d && <p className="text-ink-soft">{st.d}</p>}
                {st.ui && (
                  <p className="mt-1 inline-flex items-center rounded-full bg-pill-brand px-2.5 py-0.5 text-[12px] font-bold text-brand-700">{st.ui}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      {s.tips && s.tips.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1.5 rounded-2xl bg-wash px-4 py-3 text-[13px] leading-[1.6] text-ink-soft">
          {s.tips.map((t, i) => (
            <li key={i} className="flex gap-2">
              <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
      {s.warn && s.warn.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5 rounded-2xl bg-danger-soft px-4 py-3 text-[13px] leading-[1.6] text-danger">
          {s.warn.map((t, i) => (
            <li key={i} className="flex gap-2">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
      {related.length > 0 && (
        <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[12px] font-bold text-muted">
          함께 보기
          {related.map((r) => (
            <Link
              key={r.id}
              href={`/${locale}/manual#${r.id}`}
              onClick={onNavigate}
              className="rounded-full bg-(--chip-bg) px-2.5 py-1 text-ink transition-colors hover:bg-(--chip-hover)"
            >
              {r.title}
            </Link>
          ))}
        </p>
      )}
    </article>
  );
}
