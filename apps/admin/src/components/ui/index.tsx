// 어드민 UI — 모양은 전부 @bayada/ui(디자인 시스템)에서 온다. 여기는 어드민 밀도(sm/xs, compact)와
// 기존 호출 형태(buttonClass·tone 이름 등)를 맞추는 얇은 어댑터만 둔다. 새 모양을 여기서 만들지 말 것.
import Link from "next/link";
import {
  Badge as UiBadge,
  Card as UiCard,
  CardHeader,
  EmptyState as UiEmptyState,
  Field as UiField,
  PageHeader as UiPageHeader,
  StatCard,
  buttonVariants,
  cn,
  controlClass,
  selectClass as uiSelectClass,
  tableClasses,
  tagClass,
  textareaClass as uiTextareaClass,
  type BadgeTone,
} from "@bayada/ui";
import type { Tone } from "@/lib/labels";

export const cx = cn;

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";
type ButtonSize = "sm" | "md";

/** 어드민 버튼: md = 32px(sm), sm = 28px(xs). "dark" 는 폐지 — secondary 로 그린다 (화면당 레드 1개 규칙) */
export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md"): string {
  return buttonVariants({
    variant: variant === "dark" ? "secondary" : variant,
    size: size === "sm" ? "xs" : "sm",
  });
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={cn(buttonClass(variant, size), className)} {...props} />;
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
    <Link href={href} className={cn(buttonClass(variant, size), className)}>
      {children}
    </Link>
  );
}

/** 도메인 tone(lib/labels) → 디자인 시스템 상태 색. 상태 색 규칙은 DESIGN-SYSTEM.md §6 */
const TONE: Record<Tone, BadgeTone> = {
  zinc: "neutral",
  slate: "neutral",
  blue: "info",
  violet: "info",
  amber: "warning",
  red: "danger",
  teal: "success",
  green: "success",
};

export function Badge({ tone = "zinc", children, dot }: { tone?: Tone; children: React.ReactNode; dot?: boolean }) {
  return (
    <UiBadge tone={TONE[tone]} dot={dot}>
      {children}
    </UiBadge>
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
    <UiPageHeader
      size="compact"
      title={title}
      description={description}
      actions={actions}
      back={
        back ? (
          <Link href={back.href} className="inline-flex text-caption text-muted hover:text-ink">
            ← {back.label}
          </Link>
        ) : undefined
      }
    />
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
    <UiCard as="section" className={cn("overflow-visible", className)}>
      {(title || actions) && <CardHeader size="sm" divider title={title} actions={actions} className="items-center" />}
      <div className={padded ? "p-4" : undefined}>{children}</div>
    </UiCard>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <UiEmptyState size="sm" title={title} description={description} />;
}

// ─── 테이블 (compact 밀도) ───
export const tableWrap = tableClasses.wrap;
export const tableClass = tableClasses.table;
export const thClass = tableClasses.th;
export const tdClass = tableClasses.td;
export const trClass = tableClasses.tr;

// ─── 폼 (sm 밀도) ───
export const inputClass = controlClass("sm");
export const textareaClass = uiTextareaClass("sm");
export const selectClass = uiSelectClass("sm");

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
    <UiField size="sm" label={label} help={hint} required={required} htmlFor={htmlFor} className={className}>
      {children}
    </UiField>
  );
}

/** URL 쿼리 기반 필터 칩 */
export function FilterChip({ href, active, children, count }: { href: string; active: boolean; children: React.ReactNode; count?: number }) {
  return (
    <Link href={href} aria-current={active ? "true" : undefined} className={tagClass({ active, size: "sm" })}>
      {children}
      {count !== undefined && <span className={cn("tabular", active ? "text-neutral-300" : "text-subtle")}>{count}</span>}
    </Link>
  );
}

/** 숫자 타일 — 어드민 바탕이 회색이라 흰 면 + 선으로 */
export function Stat({ label, value, hint, href }: { label: string; value: React.ReactNode; hint?: string; href?: string }) {
  return (
    <StatCard
      size="sm"
      label={label}
      value={value}
      hint={hint}
      href={href}
      LinkComponent={Link}
      className={cn("border border-line bg-canvas", href && "hover:border-line-strong hover:bg-canvas")}
    />
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
