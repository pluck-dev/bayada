"use client";

// 토스트 + 확인 대화상자 + 서버 액션 실행 훅
import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, cx } from "./index";

type ToastKind = "success" | "error";
interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface FeedbackCtx {
  toast: (kind: ToastKind, text: string) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const Ctx = createContext<FeedbackCtx | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const seq = useRef(0);

  const toast = useCallback((kind: ToastKind, text: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 6000 : 3500);
  }, []);

  const confirm = useCallback(
    (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...opts, resolve })),
    [],
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (pending && !d.open) d.showModal();
    if (!pending && d.open) d.close();
  }, [pending]);

  const settle = (v: boolean) => {
    pending?.resolve(v);
    setPending(null);
  };

  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}
      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          settle(false);
        }}
        className="m-auto w-[420px] max-w-[calc(100vw-32px)] rounded-xl border border-line bg-white p-0 text-fg shadow-[var(--shadow-pop)]"
        aria-labelledby="confirm-title"
      >
        {pending && (
          <div className="p-5">
            <h2 id="confirm-title" className="text-[15px] font-semibold">
              {pending.title}
            </h2>
            {pending.body && <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">{pending.body}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className={buttonClass("secondary")} onClick={() => settle(false)}>
                취소
              </button>
              <button
                type="button"
                autoFocus
                className={buttonClass(pending.danger ? "danger" : "primary")}
                onClick={() => settle(true)}
              >
                {pending.confirmLabel ?? "확인"}
              </button>
            </div>
          </div>
        )}
      </dialog>
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "toast-in pointer-events-auto flex max-w-sm items-start gap-2 rounded-lg border bg-white px-3.5 py-2.5 text-[13px] shadow-[var(--shadow-pop)]",
              t.kind === "error" ? "border-red-200" : "border-line",
            )}
          >
            <span
              className={cx("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", t.kind === "error" ? "bg-red-600" : "bg-emerald-600")}
              aria-hidden
            />
            <span className={t.kind === "error" ? "text-red-800" : "text-fg"}>{t.text}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useFeedback(): FeedbackCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("FeedbackProvider 가 없습니다");
  return c;
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
