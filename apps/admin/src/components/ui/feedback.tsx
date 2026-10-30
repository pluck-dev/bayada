"use client";

// 서버 액션 실행 훅. 토스트·확인 대화상자는 @bayada/ui FeedbackProvider(디자인 시스템)를 그대로 쓴다
import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FeedbackProvider, useFeedback, type ConfirmOptions } from "@bayada/ui";

export { FeedbackProvider, useFeedback };

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
