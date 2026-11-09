"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle } from "lucide-react";

/**
 * 브라우저 기본 검증 말풍선("이 입력란을 작성하세요") 대체.
 * 폼 제출 때 invalid 이벤트를 문서 전체에서 가로채(기본 말풍선 취소) 첫 번째 잘못된 칸 아래에
 * 디자인된 말풍선을 띄우고 그 칸으로 포커스를 옮긴다. 커스텀 컨트롤(Select·DatePicker)의 숨은 대리 입력은
 * data-proxy-for 로 실제 트리거를 찾아간다. 레이아웃에 하나만 둔다.
 */
export function FormGuard() {
  const [bubble, setBubble] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    let shownAt = 0;
    const onInvalid = (e: Event) => {
      const input = e.target as HTMLInputElement;
      e.preventDefault();
      // 한 번의 제출에서 첫 칸만
      if (Date.now() - shownAt < 50) return;
      shownAt = Date.now();
      const proxyFor = input.getAttribute("data-proxy-for");
      const target = (proxyFor ? document.getElementById(proxyFor) : input) as HTMLElement | null;
      if (!target) return;
      target.setAttribute("aria-invalid", "true");
      target.scrollIntoView({ block: "center" });
      target.focus({ preventScroll: true });
      const v = input.validity;
      const text = v.valueMissing
        ? proxyFor
          ? "항목을 선택하세요."
          : "필수 항목입니다."
        : v.typeMismatch
          ? input.type === "email"
            ? "이메일 형식이 아닙니다."
            : input.type === "url"
              ? "https:// 로 시작하는 주소를 입력하세요."
              : "형식이 올바르지 않습니다."
          : v.rangeUnderflow
            ? `${input.min} 이상이어야 합니다.`
            : v.rangeOverflow
              ? `${input.max} 이하여야 합니다.`
              : v.stepMismatch
                ? "허용되는 단위의 값이 아닙니다."
                : v.tooShort
                  ? `${input.minLength}자 이상 입력하세요.`
                  : v.patternMismatch
                    ? "형식이 올바르지 않습니다."
                    : input.validationMessage || "입력값을 확인하세요.";
      // 스크롤 이벤트가 지나간 뒤 위치를 잡는다
      setTimeout(() => {
        const r = target.getBoundingClientRect();
        setBubble({ text, x: r.left, y: r.bottom + 6 });
      }, 40);
      const clear = () => {
        target.removeAttribute("aria-invalid");
        setBubble(null);
        target.removeEventListener("input", clear);
        target.removeEventListener("click", clear);
      };
      target.addEventListener("input", clear);
      target.addEventListener("click", clear);
    };
    const hide = () => setBubble(null);
    document.addEventListener("invalid", onInvalid, true);
    window.addEventListener("scroll", hide, true);
    return () => {
      document.removeEventListener("invalid", onInvalid, true);
      window.removeEventListener("scroll", hide, true);
    };
  }, []);

  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(null), 4000);
    return () => clearTimeout(t);
  }, [bubble]);

  if (!bubble || typeof document === "undefined") return null;
  return createPortal(
    <div role="alert" style={{ position: "fixed", left: bubble.x, top: bubble.y, zIndex: 95 }} className="pointer-events-none">
      <div className="relative flex animate-pop-in items-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-[12.5px] font-semibold text-white shadow-float">
        <span className="absolute -top-1 left-4 size-2.5 rotate-45 rounded-[2px] bg-ink" aria-hidden />
        <AlertCircle className="relative size-3.5 text-brand-300" aria-hidden />
        <span className="relative">{bubble.text}</span>
      </div>
    </div>,
    document.body,
  );
}
