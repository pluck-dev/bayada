// 마이페이지·회원 화면 공용 조각 (서버 안전 — "use client" 아님). 홈페이지 시각 언어: 흰 바탕, 레드 #ce0e2d, rounded-2xl 테두리 카드.
// 네이티브 select/checkbox/date 는 쓰지 않는다 → controls.tsx 의 디자인된 컨트롤.
import Link from "next/link";
import { cn } from "@bayada/ui";

export const inputClass =
  "h-12 w-full rounded-xl border border-[color:var(--border)] bg-white px-4 text-[15px] text-[color:var(--fg)] outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 hover:border-gray-400 focus:border-[#ce0e2d] focus:ring-4 focus:ring-[#ce0e2d]/10 disabled:bg-gray-50 disabled:text-gray-400";
export const textareaClass = cn(inputClass, "h-auto min-h-[104px] resize-y py-3 leading-relaxed");

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export function btnClass(variant: BtnVariant = "primary", size: "md" | "sm" = "md") {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    size === "md" ? "h-12 px-5 text-[15px]" : "h-9 px-3.5 text-sm",
    variant === "primary" && "bg-[#ce0e2d] text-white hover:bg-[#a50b24]",
    variant === "secondary" && "bg-[#f0f4f7] text-[color:var(--fg)] hover:bg-[#e3e9ee]",
    variant === "outline" && "border border-[color:var(--border)] bg-white text-[color:var(--fg)] hover:border-gray-400",
    variant === "ghost" && "text-gray-600 hover:bg-gray-100 hover:text-[color:var(--fg)]",
    variant === "danger" && "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className,
  id,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("rounded-2xl border border-[color:var(--border)] bg-white p-5 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-[17px] font-bold text-[color:var(--fg)]">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-[color:var(--fg)] sm:text-[30px]">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] leading-relaxed text-[color:var(--muted)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export type Tone = "red" | "green" | "blue" | "amber" | "gray";
const TONE: Record<Tone, string> = {
  red: "bg-red-50 text-[#ce0e2d]",
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  gray: "bg-gray-100 text-gray-600",
};
const DOT: Record<Tone, string> = { red: "bg-[#ce0e2d]", green: "bg-emerald-500", blue: "bg-blue-500", amber: "bg-amber-500", gray: "bg-gray-400" };

export function Badge({ tone = "gray", children, dot }: { tone?: Tone; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", TONE[tone])}>
      {dot && <span className={cn("size-1.5 rounded-full", DOT[tone])} aria-hidden />}
      {children}
    </span>
  );
}

export const BOOKING_TONE: Record<string, Tone> = { REQUESTED: "amber", CONFIRMED: "blue", COMPLETED: "green", CANCELLED: "gray" };
export const INQUIRY_TONE: Record<string, Tone> = { NEW: "amber", CONTACTED: "blue", IN_PROGRESS: "blue", DONE: "green", SPAM: "gray" };
export const CONDITION_TONE: Record<string, Tone> = { STABLE: "green", OBSERVATION: "amber", URGENT: "red" };

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[color:var(--border)] bg-[#f8f9fa] px-6 py-10 text-center">
      <p className="font-semibold text-[color:var(--fg)]">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[color:var(--muted)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  required,
  help,
  children,
  className,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  help?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-[color:var(--fg)]">
        {label}
        {required && <span className="ml-0.5 text-[#ce0e2d]">*</span>}
      </label>
      {children}
      {help && <p className="text-xs leading-relaxed text-[color:var(--muted)]">{help}</p>}
    </div>
  );
}

export function Notice({ tone = "gray", children }: { tone?: Tone; children: React.ReactNode }) {
  return <div className={cn("rounded-xl px-4 py-3 text-sm leading-relaxed", TONE[tone])}>{children}</div>;
}

/** 라벨·값 목록 */
export function InfoList({ items }: { items: [React.ReactNode, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm sm:grid-cols-[112px_minmax(0,1fr)]">
      {items.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="text-[color:var(--muted)]">{k}</dt>
          <dd className="break-words text-[color:var(--fg)]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TextLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("text-sm font-semibold text-[#ce0e2d] hover:underline", className)}>
      {children}
    </Link>
  );
}

/** 진행 이력 타임라인 (예약·문의) — 최신이 위 */
export function Timeline({ items }: { items: { id: string; title: React.ReactNode; body?: React.ReactNode; at: string; current?: boolean }[] }) {
  return (
    <ol className="relative ml-1.5 border-l-2 border-gray-100 pl-5">
      {items.map((it) => (
        <li key={it.id} className="relative pb-5 last:pb-0">
          <span
            className={cn(
              "absolute -left-[27px] top-1 size-3 rounded-full border-2 border-white ring-2",
              it.current ? "bg-[#ce0e2d] ring-[#ce0e2d]/20" : "bg-gray-300 ring-gray-100",
            )}
            aria-hidden
          />
          <p className="text-sm font-semibold text-[color:var(--fg)]">{it.title}</p>
          {it.body && <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-[color:var(--muted)]">{it.body}</p>}
          <p className="mt-1 text-xs tabular-nums text-gray-400">{it.at}</p>
        </li>
      ))}
    </ol>
  );
}

const KST = "Asia/Seoul";
export const fmtDateTime = (d: Date) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: KST, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
export const fmtDate = (d: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: KST, year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(d);
/** @db.Date (UTC 자정) 값 표기 */
export const fmtDay = (d: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(d);
export const fmtDayShort = (d: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", month: "numeric", day: "numeric", weekday: "short" }).format(d);
