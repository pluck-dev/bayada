"use client";

import { useState } from "react";
import { FAMILY_RELATIONSHIPS } from "@bayada/shared/member";
import { requestFamilyLink, respondFamilyLink, revokeFamilyLink } from "@/lib/member/actions";
import { btnClass, Field, inputClass } from "./ui";
import { ActionMessage, ChoiceChips, ConfirmDialog, useMemberAction } from "./controls";

export function FamilyRequestForm() {
  const [contact, setContact] = useState("");
  const [relationship, setRelationship] = useState("");
  const { run, pending, result } = useMemberAction();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => requestFamilyLink({ contact, relationship }), { onSuccess: () => setContact("") });
      }}
      className="flex flex-col gap-4"
    >
      <Field label="가족의 이메일 또는 휴대폰 번호" htmlFor="fam-contact" required help="가족이 바야다 홈페이지에 '서비스 이용자'로 가입한 이메일·휴대폰이어야 해요.">
        <input id="fam-contact" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={100} className={inputClass} placeholder="mom@example.com 또는 010-0000-0000" />
      </Field>
      <Field label="가족과의 관계" required>
        <ChoiceChips aria-label="가족과의 관계" columns={3} value={relationship} onChange={(v) => setRelationship(v as string)} options={FAMILY_RELATIONSHIPS.map((r) => ({ value: r, label: r }))} />
      </Field>
      <ActionMessage result={result} />
      <div>
        <button type="submit" disabled={pending || !contact.trim() || !relationship} className={btnClass("primary")}>
          {pending ? "보내는 중…" : "연결 요청 보내기"}
        </button>
      </div>
    </form>
  );
}

export function RespondButtons({ id }: { id: string }) {
  const { run, pending, result } = useMemberAction();
  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex gap-2">
        <button type="button" disabled={pending} onClick={() => run(() => respondFamilyLink(id, true))} className={btnClass("primary", "sm")}>
          승인
        </button>
        <button type="button" disabled={pending} onClick={() => run(() => respondFamilyLink(id, false))} className={btnClass("outline", "sm")}>
          거절
        </button>
      </div>
      {result && !result.ok && <ActionMessage result={result} />}
    </div>
  );
}

export function RevokeButton({ id, label = "연결 해제", who }: { id: string; label?: string; who: string }) {
  const [open, setOpen] = useState(false);
  const { run, pending } = useMemberAction();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnClass("ghost", "sm")}>
        {label}
      </button>
      <ConfirmDialog
        open={open}
        title={`${who} 님과의 연결을 해제할까요?`}
        body="해제하면 보호자는 더 이상 기록을 볼 수 없어요. 다시 연결하려면 새로 요청·승인해야 해요."
        confirmLabel="해제"
        danger
        pending={pending}
        onClose={() => setOpen(false)}
        onConfirm={() => run(() => revokeFamilyLink(id), { onSuccess: () => setOpen(false) })}
      />
    </>
  );
}
