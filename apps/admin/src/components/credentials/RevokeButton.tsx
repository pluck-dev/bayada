"use client";

import { useEffect, useRef, useState } from "react";
import { revokeCredential } from "@/lib/actions/credentials";
import { Button, Field, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

/** 발급된 인증 취소 — 사유를 받아야 해서 공용 confirm 대신 자체 대화상자 */
export function RevokeButton({ id, number }: { id: string; number: string }) {
  const { run, isPending } = useAction();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <Button size="sm" variant="danger" onClick={() => setOpen(true)}>
        취소
      </Button>
      <dialog
        ref={ref}
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        className="m-auto w-[440px] max-w-[calc(100vw-32px)] rounded-xl border border-line bg-canvas p-0 text-fg shadow-[var(--shadow-pop)]"
        aria-labelledby={`revoke-${id}`}
      >
        {open && (
          <form
            className="p-5"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => revokeCredential(id, reason), { onSuccess: () => setOpen(false) });
            }}
          >
            <h2 id={`revoke-${id}`} className="text-body font-semibold">
              인증 {number}을 취소할까요?
            </h2>
            <p className="mt-2 text-caption leading-relaxed text-muted">
              공개 검증 페이지에 &lsquo;취소된 인증&rsquo;으로 표시되고 학습자 지갑에서도 무효로 바뀝니다. 되돌릴 수 없습니다.
            </p>
            <Field label="취소 사유" required htmlFor={`revoke-reason-${id}`} className="mt-4">
              <textarea
                id={`revoke-reason-${id}`}
                required
                rows={3}
                autoFocus
                className={textareaClass}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => setOpen(false)}>닫기</Button>
              <Button type="submit" variant="danger" disabled={isPending || !reason.trim()}>
                인증 취소
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
