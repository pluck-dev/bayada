"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import { Button } from "./button";
import { Dialog } from "./dialog";

/**
 * 토스트 + 확인 대화상자. 앱 최상단에 <FeedbackProvider> 하나.
 * 토스트: 오른쪽 아래, 성공 3.5초 / 오류 6초, 흰 카드 + 왼쪽 상태 점.
 */
export type ToastKind = "success" | "error" | "info";

export interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface FeedbackCtx {
  toast: (kind: ToastKind, text: string) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const Ctx = React.createContext<FeedbackCtx | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<{ id: number; kind: ToastKind; text: string }>>([]);
  const [pending, setPending] = React.useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const seq = React.useRef(0);

  const toast = React.useCallback((kind: ToastKind, text: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 6000 : 3500);
  }, []);

  const confirm = React.useCallback(
    (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...opts, resolve })),
    [],
  );

  const settle = (v: boolean) => {
    pending?.resolve(v);
    setPending(null);
  };

  const value = React.useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <Dialog
        open={!!pending}
        onClose={() => settle(false)}
        size="sm"
        title={pending?.title ?? ""}
        description={pending?.body ? <span className="whitespace-pre-line">{pending.body}</span> : undefined}
        footer={
          <>
            <Button size="sm" onClick={() => settle(false)}>
              {pending?.cancelLabel ?? "취소"}
            </Button>
            <Button size="sm" autoFocus variant={pending?.danger ? "danger" : "primary"} onClick={() => settle(true)}>
              {pending?.confirmLabel ?? "확인"}
            </Button>
          </>
        }
      />
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-toast flex flex-col items-end gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-in pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-xl border border-line bg-canvas px-4 py-3 text-body-sm shadow-md"
          >
            <span
              className={cn(
                "mt-2 size-1.5 shrink-0 rounded-full",
                t.kind === "error" ? "bg-danger" : t.kind === "info" ? "bg-info" : "bg-success",
              )}
              aria-hidden
            />
            <span className={t.kind === "error" ? "text-danger" : "text-ink"}>{t.text}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useFeedback(): FeedbackCtx {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("FeedbackProvider 가 없습니다");
  return c;
}

export function useToast() {
  return useFeedback().toast;
}
