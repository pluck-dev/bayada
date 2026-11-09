"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { ORG_TYPES, PROVIDER_ROLES } from "@bayada/shared/member";
import { PASSWORD_RULE } from "@bayada/shared/password-policy";
import { cancelWithdrawal, changePassword, requestWithdrawal, updateNotifications, updateProfile } from "@/lib/member/actions";
import { formatPhone } from "@/lib/phone";
import { btnClass, Field, inputClass, Notice, textareaClass } from "./ui";
import { ActionMessage, ChoiceChips, ConfirmDialog, Select, Switch, useMemberAction } from "./controls";

export function ProfileForm({
  type,
  initial,
}: {
  type: string;
  initial: { name: string; phone: string; address: string; providerRole: string; orgName: string; orgType: string };
}) {
  const [v, setV] = useState(initial);
  const set = (k: keyof typeof initial) => (x: string) => setV((s) => ({ ...s, [k]: x }));
  const { run, pending, result } = useMemberAction();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => updateProfile(v));
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="이름" htmlFor="p-name" required>
          <input id="p-name" value={v.name} onChange={(e) => set("name")(e.target.value)} maxLength={50} className={inputClass} />
        </Field>
        <Field label="휴대폰 번호" htmlFor="p-phone" required>
          <input id="p-phone" inputMode="numeric" value={v.phone} onChange={(e) => set("phone")(formatPhone(e.target.value))} className={inputClass} />
        </Field>
      </div>
      {(type === "SERVICE_USER" || type === "GUARDIAN") && (
        <Field label="기본 방문 주소" htmlFor="p-addr" help="예약 신청 때 기본으로 채워져요.">
          <input id="p-addr" value={v.address} onChange={(e) => set("address")(e.target.value)} maxLength={200} className={inputClass} />
        </Field>
      )}
      {type === "PROVIDER" && (
        <Field label="직군" required>
          <ChoiceChips aria-label="직군" columns={3} value={v.providerRole} onChange={(x) => set("providerRole")(x as string)} options={PROVIDER_ROLES.map((r) => ({ value: r, label: r }))} />
        </Field>
      )}
      {type === "ORGANIZATION" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="기관명" htmlFor="p-org" required>
            <input id="p-org" value={v.orgName} onChange={(e) => set("orgName")(e.target.value)} maxLength={100} className={inputClass} />
          </Field>
          <Field label="기관 유형" htmlFor="p-orgtype" required>
            <Select id="p-orgtype" value={v.orgType} onChange={set("orgType")} options={ORG_TYPES.map((t) => ({ value: t, label: t }))} />
          </Field>
        </div>
      )}
      <ActionMessage result={result} />
      <div>
        <button type="submit" disabled={pending} className={btnClass("primary")}>
          {pending ? "저장하는 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}

export function NotificationForm({ emailOptIn, smsOptIn }: { emailOptIn: boolean; smsOptIn: boolean }) {
  const [email, setEmail] = useState(emailOptIn);
  const [sms, setSms] = useState(smsOptIn);
  const { run, pending, result } = useMemberAction();
  const save = (e: boolean, s: boolean) => run(() => updateNotifications({ emailOptIn: e, smsOptIn: s }));
  return (
    <div className="flex flex-col gap-4">
      <Switch label="이메일 소식·건강 정보" description="서비스 소식, 건강 관리 콘텐츠, 이벤트를 이메일로 받아요." checked={email} disabled={pending} onChange={(x) => (setEmail(x), save(x, sms))} />
      <div className="h-px bg-gray-100" />
      <Switch label="문자(SMS) 알림" description="서비스 소식과 혜택을 문자로 받아요." checked={sms} disabled={pending} onChange={(x) => (setSms(x), save(email, x))} />
      <ActionMessage result={result} />
    </div>
  );
}

export function PasswordForm({ locale }: { locale: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [next2, setNext2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const { run, pending, result } = useMemberAction();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (next !== next2) return setErr("새 비밀번호 확인이 일치하지 않아요.");
        setErr(null);
        run(() => changePassword({ current, next }), {
          refresh: false,
          // 비밀번호를 바꾸면 기존 세션이 모두 무효 → 로그인 화면으로
          onSuccess: () => setTimeout(() => signOut({ callbackUrl: `/${locale}/auth/login?reset=1` }), 1200),
        });
      }}
      className="flex flex-col gap-4"
    >
      <Field label="현재 비밀번호" htmlFor="pw-cur" required>
        <input id="pw-cur" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="새 비밀번호" htmlFor="pw-new" required help={PASSWORD_RULE}>
          <input id="pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
        </Field>
        <Field label="새 비밀번호 확인" htmlFor="pw-new2" required>
          <input id="pw-new2" type="password" autoComplete="new-password" value={next2} onChange={(e) => setNext2(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <ActionMessage result={err ? { ok: false, error: err } : result} />
      <div>
        <button type="submit" disabled={pending || !current || !next} className={btnClass("primary")}>
          {pending ? "바꾸는 중…" : "비밀번호 변경"}
        </button>
      </div>
    </form>
  );
}

export function WithdrawalForm({ requestedAt }: { requestedAt: string | null }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { run, pending, result } = useMemberAction();
  if (requestedAt) {
    return (
      <div className="flex flex-col gap-3">
        <Notice tone="amber">{requestedAt}에 탈퇴를 요청했어요. 처리 전까지는 그대로 이용할 수 있어요.</Notice>
        <ActionMessage result={result} />
        <div>
          <button type="button" disabled={pending} onClick={() => run(() => cancelWithdrawal())} className={btnClass("outline", "sm")}>
            탈퇴 요청 취소
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <ActionMessage result={result} />
      <div>
        <button type="button" onClick={() => setOpen(true)} className={btnClass("danger", "sm")}>
          탈퇴 요청
        </button>
      </div>
      <ConfirmDialog
        open={open}
        title="회원 탈퇴를 요청할까요?"
        body="처리되면 예약·건강·복약 기록과 가족 연결이 지워지고 홈페이지·아카데미 모두 로그인할 수 없어요. 법령상 보관해야 하는 방문 서비스 기록은 익명으로 남아요."
        confirmLabel="탈퇴 요청"
        danger
        pending={pending}
        onClose={() => setOpen(false)}
        onConfirm={() => run(() => requestWithdrawal(reason), { onSuccess: () => setOpen(false) })}
      >
        <label htmlFor="wd-reason" className="text-sm font-semibold">
          떠나시는 이유 (선택)
        </label>
        <textarea id="wd-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} className={`${textareaClass} mt-1.5 min-h-[80px]`} />
      </ConfirmDialog>
    </div>
  );
}
