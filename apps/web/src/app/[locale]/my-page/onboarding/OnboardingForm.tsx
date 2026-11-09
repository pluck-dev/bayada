"use client";

import { useState } from "react";
import { ORG_TYPES, PROVIDER_ROLES, type MemberTypeKey } from "@bayada/shared/member";
import { btnClass, Field, inputClass } from "@/components/member/ui";
import { ActionMessage, ChoiceChips, Select, useMemberAction } from "@/components/member/controls";
import { completeOnboarding } from "@/lib/member/actions";
import { formatPhone } from "@/lib/phone";
import { MemberTypePicker } from "../../auth/register/RegisterForm";

export function OnboardingForm({ hasPhone }: { hasPhone: boolean }) {
  const [type, setType] = useState<MemberTypeKey | null>(null);
  const [providerRole, setProviderRole] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [phone, setPhone] = useState("");
  const { run, pending, result } = useMemberAction();

  return (
    <form
      className="mt-6 flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!type) return;
        run(() => completeOnboarding({ memberType: type, providerRole, orgName, orgType, phone }));
      }}
    >
      <MemberTypePicker value={type} onChange={setType} />
      {type === "PROVIDER" && (
        <Field label="직군" required>
          <ChoiceChips aria-label="직군" columns={3} value={providerRole} onChange={(v) => setProviderRole(v as string)} options={PROVIDER_ROLES.map((r) => ({ value: r, label: r }))} />
        </Field>
      )}
      {type === "ORGANIZATION" && (
        <>
          <Field label="기관명" htmlFor="orgName" required>
            <input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} maxLength={100} className={inputClass} />
          </Field>
          <Field label="기관 유형" htmlFor="orgType" required>
            <Select id="orgType" value={orgType} onChange={setOrgType} options={ORG_TYPES.map((t) => ({ value: t, label: t }))} />
          </Field>
        </>
      )}
      {type && !hasPhone && (
        <Field label="휴대폰 번호" htmlFor="phone" required help="예약·상담 연락에 써요.">
          <input id="phone" inputMode="numeric" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className={inputClass} placeholder="010-0000-0000" />
        </Field>
      )}
      <ActionMessage result={result?.ok ? null : result} />
      <button type="submit" disabled={!type || pending} className={btnClass("primary")}>
        {pending ? "준비하는 중…" : "시작하기"}
      </button>
    </form>
  );
}
