// 어드민 공통 UI 프리미티브 — 서버·클라이언트 컴포넌트 어디서나 쓴다 (상태 없음)
import Link from "next/link";
import type { Tone } from "@/lib/labels";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";
type ButtonSize = "sm" | "md";

export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md"): string {
  return cx(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2",
    size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-8 px-3 text-[13px]",
    variant === "primary" && "bg-brand text-white hover:bg-brand-hover shadow-[0_1px_0_rgba(0,0,0,0.08)]",
    variant === "dark" && "bg-zinc-900 text-white hover:bg-zinc-700",
    variant === "secondary" && "border border-line bg-white text-fg hover:bg-zinc-50 hover:border-line-strong",
    variant === "ghost" && "text-zinc-600 hover:bg-zinc-100 hover:text-fg",
    variant === "danger" && "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={cx(buttonClass(variant, size), className)} {...props} />;
}

export function LinkButton({
  href,
  variant,
  size,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cx(buttonClass(variant, size), className)}>
      {children}
    </Link>
  );
}

const TONE: Record<Tone, string> = {
  zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  slate: "bg-slate-100 text-slate-500 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function Badge({ tone = "zinc", children, dot }: { tone?: Tone; children: React.ReactNode; dot?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium ring-1 ring-inset",
        TONE[tone],
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-5">
      {back && (
        <Link href={back.href} className="mb-2 inline-flex text-[12.5px] text-muted hover:text-fg">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-fg">{title}</h1>
          {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({
  title,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cx("rounded-lg border border-line bg-white", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <h2 className="text-[13px] font-semibold text-fg">{title}</h2>
          {actions}
        </header>
      )}
      <div className={padded ? "p-4" : undefined}>{children}</div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 h-9 w-9 rounded-full border border-dashed border-line-strong" aria-hidden />
      <p className="text-[13px] font-medium text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[12.5px] text-muted">{description}</p>}
    </div>
  );
}

// ─── 테이블 ───
export const tableWrap = "overflow-auto rounded-lg border border-line bg-white";
export const tableClass = "w-full border-collapse text-[13px]";
export const thClass =
  "sticky top-0 z-10 whitespace-nowrap border-b border-line bg-zinc-50/95 px-3 py-2 text-left text-[11.5px] font-medium text-muted backdrop-blur";
export const tdClass = "whitespace-nowrap border-b border-zinc-100 px-3 py-2 align-middle";
export const trClass = "hover:bg-zinc-50/70";

// ─── 폼 ───
export const inputClass =
  "h-8 w-full rounded-md border border-line bg-white px-2.5 text-[13px] text-fg placeholder:text-subtle transition-colors hover:border-line-strong focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50 disabled:text-muted";
export const textareaClass =
  "w-full rounded-md border border-line bg-white px-2.5 py-2 text-[13px] leading-relaxed text-fg placeholder:text-subtle hover:border-line-strong focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50";
export const selectClass = inputClass + " pr-7";

export function Field({
  label,
  hint,
  required,
  children,
  htmlFor,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[12.5px] font-medium text-zinc-700">
        {label}
        {required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11.5px] text-muted">{hint}</p>}
    </div>
  );
}

/** URL 쿼리 기반 필터 칩 */
export function FilterChip({ href, active, children, count }: { href: string; active: boolean; children: React.ReactNode; count?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cx(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium transition-colors",
        active ? "border-zinc-900 bg-zinc-900 text-white" : "border-line bg-white text-zinc-600 hover:border-line-strong hover:text-fg",
      )}
    >
      {children}
      {count !== undefined && <span className={cx("tabular", active ? "text-zinc-300" : "text-subtle")}>{count}</span>}
    </Link>
  );
}

export function Stat({ label, value, hint, href }: { label: string; value: React.ReactNode; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-[12px] text-muted">{label}</p>
      <p className="tabular mt-1.5 text-[24px] font-semibold tracking-[-0.02em] text-fg">{value}</p>
      {hint && <p className="mt-0.5 text-[11.5px] text-subtle">{hint}</p>}
    </>
  );
  const cls = "block rounded-lg border border-line bg-white px-4 py-3.5";
  return href ? (
    <Link href={href} className={cx(cls, "transition-colors hover:border-line-strong")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** 쿼리스트링 조립 — 빈 값은 뺀다 */
export function qs(base: string, params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `${base}?${s}` : base;
}
