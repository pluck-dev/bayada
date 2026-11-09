"use client";

import { useState } from "react";
import { revokeCredential } from "@/lib/actions/credentials";
import { Button, Dialog, Field, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

/** 발급된 인증 취소 — 사유를 받아야 해서 공용 confirm 대신 자체 대화상자 */
export function RevokeButton({ id, number }: { id: string; number: string }) {
  const { run, isPending } = useAction();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const formId = `revoke-form-${id}`;

  return (
    <>
      <Button size="sm" variant="danger" onClick={() => setOpen(true)}>
        취소
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`인증 ${number}을 취소할까요?`}
        description="공개 검증 페이지에 ‘취소된 인증’으로 표시되고 학습자 지갑에서도 무효로 바뀝니다. 되돌릴 수 없습니다."
        footer={
          <>
            <Button size="lg" variant="secondary" onClick={() => setOpen(false)}>
              닫기
            </Button>
            <Button
              size="lg"
              type="submit"
              form={formId}
              variant="brand"
              className="bg-danger shadow-none hover:bg-[color-mix(in_srgb,var(--color-danger)_85%,black)]"
              disabled={isPending || !reason.trim()}
            >
              인증 취소
            </Button>
          </>
        }
      >
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
            run(() => revokeCredential(id, reason), { onSuccess: () => setOpen(false) });
          }}
        >
          <Field label="취소 사유" required htmlFor={`revoke-reason-${id}`}>
            <textarea
              id={`revoke-reason-${id}`}
              required
              rows={3}
              data-autofocus
              className={textareaClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
        </form>
      </Dialog>
    </>
  );
}
