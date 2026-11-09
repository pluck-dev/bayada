// 어드민 컨트롤 공통 클래스 — 서버·클라이언트 양쪽에서 쓰므로 순수 모듈("use client" 없음)
import { cn } from "@bayada/ui";

export type FieldSize = "md" | "sm";

/**
 * 입력칸: 흰 카드 위 wash 채움, 테두리 없음. 포커스 = 흰 바탕 + 안쪽 잉크 2px.
 * md 44px(폼) · sm 36px(필터 줄·표 안).
 */
export function fieldClass(size: FieldSize = "md", extra?: string) {
  return cn(
    "w-full min-w-0 text-ink outline-none transition-[box-shadow,background-color] duration-150",
    // md = 카드 안 폼(wash 채움) / sm = 필터 줄 — 놓인 바탕에 따라 --chip-bg 가 바뀐다(회색 바탕 위 흰색, 흰 카드 안 wash)
    size === "md" ? "bg-wash hover:bg-wash-strong" : "bg-(--chip-bg) hover:bg-(--chip-hover)",
    "placeholder:text-subtle focus:bg-canvas focus:shadow-[inset_0_0_0_2px_var(--color-ink)] focus:hover:bg-canvas",
    "aria-[invalid=true]:shadow-[inset_0_0_0_2px_var(--color-danger)]",
    "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-disabled read-only:hover:bg-wash",
    size === "md" ? "h-11 rounded-xl px-4 text-[14px]" : "h-9 rounded-full px-4 text-[13px] font-semibold",
    extra,
  );
}

export function textareaFieldClass(extra?: string) {
  return cn(
    fieldClass("md"),
    "h-auto min-h-[96px] resize-y py-3 leading-relaxed",
    extra,
  );
}

/** 팝오버를 여는 트리거 버튼(Select·DatePicker·Combobox) */
export function triggerClass(size: FieldSize, open: boolean, invalid?: boolean) {
  return cn(
    "group flex w-full items-center justify-between gap-2 text-left outline-none transition-[box-shadow,background-color] duration-150",
    size === "md" ? "h-11 rounded-xl px-4 text-[14px]" : "h-9 rounded-full pl-4 pr-3 text-[13px] font-semibold",
    open
      ? "bg-canvas shadow-[inset_0_0_0_2px_var(--color-ink)]"
      : size === "md"
        ? "bg-wash hover:bg-wash-strong"
        : "bg-(--chip-bg) hover:bg-(--chip-hover)",
    invalid && "shadow-[inset_0_0_0_2px_var(--color-danger)]",
    "focus-visible:bg-canvas focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)] focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-disabled",
  );
}

/** 팝오버 목록 항목 */
export function optionClass(active: boolean, selected: boolean, disabled?: boolean) {
  return cn(
    "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-colors",
    active && "bg-wash",
    selected ? "font-bold text-ink" : "text-ink-soft",
    disabled && "cursor-not-allowed opacity-40",
  );
}
