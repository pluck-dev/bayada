"use client";

// 토스트 + 확인 대화상자 + 서버 액션 실행 훅. window.confirm/alert 대신 이것만 쓴다.
// FeedbackProvider 는 커스텀 툴팁(TooltipLayer)·검증 말풍선(FormGuard)도 같이 띄운다 — 레이아웃에 하나.
import { createContext, useCallback, useContext, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@bayada/ui";
import { Button } from "./index";
import { Dialog } from "./kit/Dialog";
import { TooltipLayer } from "./kit/Tooltip";
import { FormGuard } from "./kit/FormGuard";

export type ToastKind = "success" | "error" | "info";

export interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 되돌릴 수 없는 작업(삭제·반려·회수) — 확인 버튼이 위험색 */
  danger?: boolean;
}

interface FeedbackCtx {
  toast: (kind: ToastKind, text: string) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const Ctx = createContext<FeedbackCtx | null>(null);

const ICON = { success: CheckCircle2, error: XCircle, info: Info } as const;

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: number; kind: ToastKind; text: string }>>([]);
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (kind: ToastKind, text: string) => {
      const id = ++seq.current;
      setToasts((t) => [...t.slice(-3), { id, kind, text }]);
      setTimeout(() => dismiss(id), kind === "error" ? 6500 : 3500);
    },
    [dismiss],
  );

  const confirm = useCallback(
    (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...opts, resolve })),
    [],
  );

  const settle = useCallback(
    (v: boolean) => {
      setPending((p) => {
        p?.resolve(v);
        return null;
      });
    },
    [],
  );
  const cancel = useCallback(() => settle(false), [settle]);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <Dialog
        open={!!pending}
        onClose={cancel}
        title={
          pending?.danger ? (
            <span className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-pill-danger text-danger">
                <AlertTriangle className="size-4" aria-hidden />
              </span>
              {pending.title}
            </span>
          ) : (
            (pending?.title ?? "")
          )
        }
        description={pending?.body}
        footer={
          <>
            <Button size="lg" variant="secondary" onClick={cancel}>
              {pending?.cancelLabel ?? "취소"}
            </Button>
            <Button
              size="lg"
              data-autofocus
              variant={pending?.danger ? "brand" : "primary"}
              className={pending?.danger ? "bg-danger shadow-none hover:bg-[color-mix(in_srgb,var(--color-danger)_85%,black)]" : undefined}
              onClick={() => settle(true)}
            >
              {pending?.confirmLabel ?? "확인"}
            </Button>
          </>
        }
      />
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-toast flex -translate-x-1/2 flex-col items-center gap-2" role="status" aria-live="polite">
        {toasts.map((t) => {
          const I = ICON[t.kind];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex min-w-[280px] max-w-[480px] animate-toast-up items-center gap-3 rounded-full bg-ink py-2.5 pl-3 pr-2 text-[13.5px] font-semibold text-white shadow-float"
            >
              <I
                className={cn(
                  "size-5 shrink-0",
                  t.kind === "error" ? "text-brand-300" : t.kind === "info" ? "text-info-line" : "text-success-line",
                )}
                aria-hidden
              />
              <span className="flex-1 leading-[1.45]">{t.text}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="알림 닫기"
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
      <TooltipLayer />
      <FormGuard />
    </Ctx.Provider>
  );
}

export function useFeedback(): FeedbackCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("FeedbackProvider 가 없습니다");
  return c;
}

export function useToast() {
  return useFeedback().toast;
}

type Result = { ok: true; message?: string } | { ok: false; error: string };

/**
 * 서버 액션 실행 → 토스트 → router.refresh.
 * confirm 옵션이 있으면 먼저 확인 대화상자를 띄운다.
 */
export function useAction() {
  const { toast, confirm } = useFeedback();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = useCallback(
    async <R extends Result>(
      fn: () => Promise<R>,
      opts?: { confirm?: ConfirmOptions; success?: string; onSuccess?: (r: R) => void; refresh?: boolean },
    ): Promise<R | null> => {
      if (opts?.confirm && !(await confirm(opts.confirm))) return null;
      return new Promise((resolve) => {
        startTransition(async () => {
          const r = await fn();
          if (r.ok) {
            const msg = r.message ?? opts?.success;
            if (msg) toast("success", msg);
            opts?.onSuccess?.(r);
            if (opts?.refresh !== false) router.refresh();
          } else {
            toast("error", r.error);
          }
          resolve(r);
        });
      });
    },
    [confirm, toast, router],
  );

  return { run, isPending };
}
