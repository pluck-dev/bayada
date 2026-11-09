// 어드민 디자인 시스템 — 모든 어드민 화면은 이 파일(과 ./kit)의 조각으로 조립한다.
// 토큰은 packages/ui/src/theme.css(어드민 콘솔 토큰 블록), 규칙·상태 전체는 /[locale]/style-guide 화면.
//
// WHY 어드민 전용 조각인가: 아카데미·웹사이트(@bayada/ui)는 학습자용 밀도·모양이고 바꾸면 그쪽 화면이 같이 바뀐다.
// 어드민은 "콘솔" 모양(따뜻한 회색 바탕 + 테두리 없는 흰 카드 + 알약 버튼 + 검정 사이드바)이라 여기서 따로 그린다.
// 금지: 네이티브 select·checkbox·radio·date·file·range, confirm/alert/prompt, title 툴팁, <details> → ./kit 컴포넌트를 쓴다.
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Inbox, LoaderCircle } from "lucide-react";
import { cn } from "@bayada/ui";
import type { Tone } from "@/lib/labels";
import { fieldClass, textareaFieldClass } from "./kit/styles";

export const cx = cn;

export { Select, type SelectOption } from "./kit/Select";
export { Checkbox, Radio, Switch } from "./kit/Toggle";
export { DatePicker } from "./kit/DatePicker";
export { Segmented } from "./kit/Segmented";
export { NumberInput } from "./kit/NumberInput";
export { FileDrop } from "./kit/FileDrop";
export { Disclosure } from "./kit/Disclosure";
export { Slider } from "./kit/Slider";
export { Tooltip } from "./kit/Tooltip";
export { Dialog } from "./kit/Dialog";
export { Popover } from "./kit/popover";
export { fieldClass, textareaFieldClass } from "./kit/styles";

// ─── 버튼 ───
// primary = 잉크 알약(화면의 주 행동) · brand = 레드 알약(화면당 최대 1개, 결정적 행동) · secondary = wash 알약
// outline = 흰 바탕 + 선(회색 바탕 위) · ghost = 글자만 · danger = 되돌릴 수 없는 행동. "dark" 는 primary 의 옛 이름.
type ButtonVariant = "primary" | "brand" | "secondary" | "outline" | "ghost" | "danger" | "dark";
type ButtonSize = "sm" | "md" | "lg";

const BTN_VARIANT: Record<Exclude<ButtonVariant, "dark">, string> = {
  primary: "bg-ink text-white hover:bg-black shadow-[0_1px_0_rgb(255_255_255/0.08)_inset]",
  brand: "bg-brand text-white hover:bg-brand-hover shadow-[0_6px_16px_-8px_rgb(227_27_52/0.7)]",
  // 놓인 면에 따라: 회색 바탕 위 흰색 / 흰 카드 안 wash (--chip-bg)
  secondary: "bg-(--chip-bg) text-ink hover:bg-(--chip-hover)",
  outline: "bg-canvas text-ink shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-ink)]",
  ghost: "text-ink-soft hover:bg-wash hover:text-ink",
  danger: "bg-danger-soft text-danger hover:bg-pill-danger",
};
const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3.5 text-[12.5px] [&_svg]:size-3.5",
  md: "h-10 gap-1.5 px-5 text-[13.5px] [&_svg]:size-4",
  lg: "h-12 gap-2 px-7 text-[15px] [&_svg]:size-[18px]",
};

export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md"): string {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-bold tracking-[-0.01em]",
    "transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
    BTN_VARIANT[variant === "dark" ? "primary" : variant],
    BTN_SIZE[size],
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  loading,
  children,
  disabled,
  title,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean }) {
  const btn = (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClass(variant, size), className)}
      {...props}
    >
      {loading && <LoaderCircle className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
  // title 은 브라우저 툴팁 대신 커스텀 툴팁으로. 비활성 버튼은 이벤트를 못 받으니 감싼 span 이 대신 받는다
  if (!title) return btn;
  return (
    <span data-tip={title} className="inline-flex [&>button:disabled]:pointer-events-none">
      {btn}
    </span>
  );
}

export function LinkButton({
  href,
  variant,
  size,
  className,
  children,
  external,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cn(buttonClass(variant, size), className)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(buttonClass(variant, size), className)}>
      {children}
    </Link>
  );
}

/** 아이콘만 있는 원형 버튼 — label 은 접근성 이름이자 커스텀 툴팁 */
export function IconButton({
  label,
  variant = "ghost",
  size = "md",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; variant?: "ghost" | "secondary" | "outline" | "primary"; size?: "sm" | "md" }) {
  return (
    <button
      type={type}
      aria-label={label}
      data-tip={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-colors active:scale-95 disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "size-8 [&_svg]:size-4" : "size-10 [&_svg]:size-[18px]",
        variant === "ghost" && "text-muted hover:bg-wash hover:text-ink",
        variant === "secondary" && "bg-wash text-ink hover:bg-wash-strong",
        variant === "outline" && "bg-canvas text-ink shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-ink)]",
        variant === "primary" && "bg-ink text-white hover:bg-black",
        className,
      )}
      {...props}
    />
  );
}

/** 본문 안 텍스트 링크 (전체 보기 · 감사 로그 등) */
export function TextLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-0.5 text-[12.5px] font-bold text-muted transition-colors hover:text-ink [&_svg]:size-3.5", className)}
    >
      {children}
      <ArrowUpRight aria-hidden />
    </Link>
  );
}

// ─── 상태 알약 ───
/** 도메인 tone(lib/labels) → 알약 색. 상태 의미 매핑은 DESIGN-SYSTEM.md §6 과 같다 */
const PILL: Record<Tone | "brand" | "ink", string> = {
  zinc: "bg-pill-neutral text-ink-soft",
  slate: "bg-pill-neutral text-ink-soft",
  blue: "bg-pill-info text-info",
  violet: "bg-pill-info text-info",
  amber: "bg-pill-warning text-warning",
  red: "bg-pill-danger text-danger",
  teal: "bg-pill-success text-success",
  green: "bg-pill-success text-success",
  brand: "bg-pill-brand text-brand-700",
  ink: "bg-ink text-white",
};
const DOT: Record<Tone | "brand" | "ink", string> = {
  zinc: "bg-subtle",
  slate: "bg-subtle",
  blue: "bg-info",
  violet: "bg-info",
  amber: "bg-warning",
  red: "bg-danger",
  teal: "bg-success",
  green: "bg-success",
  brand: "bg-brand",
  ink: "bg-white",
};

export function Badge({
  tone = "zinc",
  children,
  dot,
  className,
  tip,
}: {
  tone?: Tone | "brand" | "ink";
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
  /** 마우스를 올리면 나오는 설명(커스텀 툴팁) */
  tip?: string;
}) {
  return (
    <span
      data-tip={tip}
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-bold leading-none tracking-[-0.01em]",
        PILL[tone],
        tip && "cursor-help",
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", DOT[tone])} aria-hidden />}
      {children}
    </span>
  );
}

// ─── 페이지 머리글 ───
export function PageHeader({
  title,
  description,
  actions,
  back,
  eyebrow,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  eyebrow?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="group mb-3 inline-flex items-center gap-1 rounded-full text-[13px] font-bold text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            {back.label}
          </Link>
        )}
        {eyebrow && <div className="mb-2 flex flex-wrap items-center gap-1.5">{eyebrow}</div>}
        <h1 className="text-[30px] font-extrabold leading-[1.25] tracking-[-0.035em] text-ink">{title}</h1>
        {description && <div className="mt-1.5 max-w-[760px] text-[14px] leading-[1.6] text-muted">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

// ─── 카드 ───
export function Card({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
  tone = "paper",
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  tone?: "paper" | "wash";
}) {
  const head = title || actions;
  return (
    <section className={cn("surface-card min-w-0 rounded-[22px]", tone === "paper" ? "bg-canvas" : "bg-wash", className)}>
      {head && (
        <div className={cn("flex items-start justify-between gap-3 px-6 pt-5", padded ? "pb-0" : "pb-3")}>
          <div className="min-w-0">
            {title && <h2 className="text-[16px] font-extrabold leading-[1.4] tracking-[-0.02em] text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-[12.5px] leading-[1.5] text-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {/* padded=false: 표·목록이 카드 가장자리에서 12px 안쪽으로 (행 hover 가 둥근 띠로 보이게) */}
      <div className={padded ? cn("px-6 pb-6", head ? "pt-4" : "pt-6") : cn("px-3 pb-3", !head && "pt-3")}>{children}</div>
    </section>
  );
}

/** 카드 안 소제목 + 구분 (폼 섹션) */
export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="text-[13.5px] font-extrabold text-ink">{children}</h3>
      {hint && <span className="text-[12px] text-muted">{hint}</span>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-wash text-muted [&_svg]:size-5" aria-hidden>
        {icon ?? <Inbox />}
      </span>
      <p className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">{title}</p>
      {description && <p className="mt-1 max-w-[420px] text-[13px] leading-[1.6] text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** 안내 띠 */
export function Notice({
  tone = "neutral",
  children,
  className,
  icon,
}: {
  tone?: "neutral" | "info" | "success" | "warning" | "danger" | "brand";
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={cn(
        "flex items-start gap-2.5 rounded-2xl px-4 py-3 text-[13px] leading-[1.6] [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0",
        tone === "neutral" && "bg-wash text-ink-soft",
        tone === "info" && "bg-pill-info/70 text-info",
        tone === "success" && "bg-pill-success/70 text-success",
        tone === "warning" && "bg-pill-warning/70 text-warning",
        tone === "danger" && "bg-pill-danger/70 text-danger",
        tone === "brand" && "bg-brand-soft text-brand-700",
        className,
      )}
    >
      {icon}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-4 w-full animate-shimmer rounded-lg bg-[linear-gradient(90deg,var(--color-wash)_0%,var(--color-wash-strong)_50%,var(--color-wash)_100%)] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn("size-4 animate-spin text-muted", className)} aria-label="불러오는 중" />;
}

// ─── 표 ───
// 흰 카드 안에 표. 머리줄은 wash 알약 띠, 행 구분은 옅은 선 하나, 첫 열은 굵게(.td-strong 로 지정).
export const tableWrap = "surface-card overflow-auto rounded-[22px] bg-canvas px-4 pb-2 pt-4";
export const tableClass = "w-full border-separate border-spacing-0 text-[13.5px]";
export const thClass =
  "sticky top-0 z-[1] whitespace-nowrap bg-wash px-3 py-2.5 text-left text-[12px] font-bold text-muted first:rounded-l-full first:pl-4 last:rounded-r-full last:pr-4";
export const tdClass = "whitespace-nowrap border-b border-hairline px-3 py-3.5 align-middle text-ink first:pl-4 last:pr-4";
export const trClass = "transition-colors hover:bg-wash/55 [&:last-child>td]:border-b-0";

// ─── 폼 ───
export const inputClass = fieldClass("md");
export const inputSmClass = fieldClass("sm");
export const textareaClass = textareaFieldClass();

export function Field({
  label,
  hint,
  error,
  required,
  children,
  htmlFor,
  className,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <label htmlFor={htmlFor} className="mb-2 flex items-center gap-1 text-[13px] font-bold text-ink">
        {label}
        {required && (
          <span className="text-brand" aria-label="필수">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[12px] font-semibold text-danger">{error}</p>
      ) : hint ? (
        <div className="mt-1.5 text-[12px] leading-[1.5] text-muted">{hint}</div>
      ) : null}
    </div>
  );
}

/** URL 쿼리 기반 필터 칩 (회색 바탕 위: 흰 알약 / 선택: 잉크 알약) */
export function FilterChip({
  href,
  active,
  children,
  count,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full pl-4 text-[13px] font-bold transition-colors",
        count !== undefined ? "pr-1.5" : "pr-4",
        active ? "bg-ink text-white" : "bg-(--chip-bg) text-ink-soft hover:bg-(--chip-hover) hover:text-ink",
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "num inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11.5px] font-bold",
            active ? "bg-white/15 text-white" : "bg-console text-muted",
          )}
        >
          {count.toLocaleString()}
        </span>
      )}
    </Link>
  );
}

/** 여러 개를 고르는 칩 (체크박스 묶음 대체) — 켜지면 잉크 알약 + 체크 */
export function ToggleChip({
  on,
  onToggle,
  children,
  disabled,
}: {
  on: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-colors disabled:opacity-40",
        on ? "bg-ink pl-3 text-white" : "bg-wash text-ink-soft hover:bg-wash-strong hover:text-ink",
      )}
    >
      {on && <Check className="size-3.5 animate-check-in text-brand-300" strokeWidth={3} aria-hidden />}
      {children}
    </button>
  );
}

/** 필터 칩 묶음 — 같은 축의 칩끼리 한 줄 */
export function FilterRow({ children, label, className }: { children: React.ReactNode; label?: string; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {children}
    </div>
  );
}

// ─── 지표 카드 ───
// 화면의 핵심 지표 1~2개만 brand/ink 로 채우고 나머지는 흰 카드. 숫자는 고정폭.
export type StatTone = "paper" | "brand" | "ink" | "rose" | "sand";
const STAT_TONE: Record<StatTone, string> = {
  // 회색 바탕 위 흰 카드 / 흰 카드 안에서는 wash 타일
  paper: "bg-(--chip-bg) text-ink",
  brand: "bg-brand text-white",
  ink: "bg-ink text-white",
  rose: "bg-kpi-rose text-ink",
  sand: "bg-kpi-sand text-ink",
};

export function Stat({
  label,
  value,
  hint,
  href,
  tone = "paper",
  icon,
  unit,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  tone?: StatTone;
  icon?: React.ReactNode;
  unit?: React.ReactNode;
}) {
  const filled = tone === "brand" || tone === "ink";
  const body = (
    <>
      <div className={cn("flex items-center justify-between gap-2 text-[13px] font-bold", filled ? "text-white/85" : "text-ink-soft")}>
        <span className="truncate">{label}</span>
        {(icon || href) && (
          <span className={cn("[&_svg]:size-4", filled ? "text-white/80" : "text-subtle")} aria-hidden>
            {icon ?? <ArrowUpRight />}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="num text-[28px] font-extrabold leading-none tracking-[-0.04em] whitespace-nowrap">{value}</span>
        {unit && <span className={cn("text-[14px] font-bold", filled ? "text-white/80" : "text-muted")}>{unit}</span>}
      </div>
      {hint && <div className={cn("mt-2 truncate text-[12px]", filled ? "text-white/70" : "text-muted")}>{hint}</div>}
    </>
  );
  const cls = cn("block min-w-0 rounded-[22px] px-5 py-[18px]", STAT_TONE[tone]);
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          cls,
          "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgb(21_20_20/0.35)]",
        )}
      >
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}

/** 라벨:값 목록 (상세 화면 요약) */
export function DescList({ items, className }: { items: { label: React.ReactNode; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("flex flex-col", className)}>
      {items.map((it, i) => (
        <div key={i} className="flex items-start justify-between gap-4 border-b border-hairline py-2.5 last:border-0">
          <dt className="shrink-0 text-[13px] text-muted">{it.label}</dt>
          <dd className="min-w-0 text-right text-[13px] font-semibold text-ink">{it.value}</dd>
        </div>
      ))}
    </dl>
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

/** 폼 하단 고정 저장 줄 — 화면 아래에 떠 있는 흰 알약 막대 */
export const actionBarClass =
  "sticky bottom-5 z-sticky mt-6 flex items-center justify-end gap-2 rounded-full bg-canvas/92 px-3 py-2.5 shadow-[0_14px_36px_-14px_rgb(21_20_20/0.35),0_0_0_1px_rgb(21_20_20/0.05)] backdrop-blur-md";

/** 진행 막대 — 레드 채움(100% 면 초록). label·값은 위 한 줄 */
export function ProgressBar({
  value,
  label,
  showValue,
  size = "md",
  className,
}: {
  value: number;
  label?: React.ReactNode;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const v = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className={className}>
      {(label || showValue) && size === "md" && (
        <div className="mb-2 flex items-baseline justify-between gap-2 text-[12.5px]">
          <span className="text-muted">{label}</span>
          {showValue && <span className="num text-[15px] font-extrabold text-ink">{v}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        aria-label={typeof label === "string" ? label : undefined}
        className={cn("overflow-hidden rounded-full bg-wash-strong", size === "md" ? "h-2.5" : "h-1.5")}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-out", v >= 100 ? "bg-success" : "bg-brand")}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

// ─── 탭 (라우트 탭) ─── 흰 트랙 위 잉크 알약. 링크로 쓴다(aria-current="page")
export const tabBarClass = "mb-6 inline-flex gap-1 rounded-full bg-canvas p-1";
export function tabClass(active: boolean) {
  return cn(
    "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-colors",
    active ? "bg-ink text-white" : "text-muted hover:bg-wash hover:text-ink",
  );
}
