"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { HeartHandshake, Stethoscope, Building2, UserRound } from "lucide-react";
import { cn } from "@bayada/ui";
import { PASSWORD_RULE, passwordError } from "@bayada/shared/password-policy";
import {
  MEMBER_TYPES,
  MEMBER_TYPE_DESC,
  MEMBER_TYPE_LABEL,
  ORG_TYPES,
  PROVIDER_ROLES,
  isMemberType,
  type MemberTypeKey,
} from "@bayada/shared/member";
import { btnClass, Field, inputClass } from "@/components/member/ui";
import { Checkbox, ChoiceChips, Select } from "@/components/member/controls";
import { formatPhone } from "@/lib/phone";

export const MEMBER_ICON: Record<MemberTypeKey, typeof UserRound> = {
  SERVICE_USER: UserRound,
  GUARDIAN: HeartHandshake,
  PROVIDER: Stethoscope,
  ORGANIZATION: Building2,
};

export function RegisterForm({ locale, callbackUrl, initialType }: { locale: string; callbackUrl: string; initialType: string | null }) {
  const [type, setType] = useState<MemberTypeKey | null>(isMemberType(initialType) ? initialType : null);
  const [phone, setPhone] = useState("");
  const [providerRole, setProviderRole] = useState("");
  const [orgType, setOrgType] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const all = terms && privacy && marketing;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!type) return;
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const pwErr = passwordError(password);
    if (pwErr) return setError(pwErr);
    if (password !== fd.get("password2")) return setError("비밀번호 확인이 일치하지 않아요.");
    if (type === "PROVIDER" && !providerRole) return setError("직군을 선택해 주세요.");
    if (type === "ORGANIZATION" && !orgType) return setError("기관 유형을 선택해 주세요.");
    if (!terms || !privacy) return setError("필수 약관에 동의해 주세요.");
    setPending(true);
    setError(null);
    const email = String(fd.get("email") ?? "").trim();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email,
        phone,
        password,
        memberType: type,
        providerRole,
        orgName: fd.get("orgName"),
        orgType,
        agreeTerms: terms,
        agreePrivacy: privacy,
        marketing,
        locale,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setPending(false);
      setError(json.error ?? "가입하지 못했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    const login = await signIn("credentials", { email, password, redirect: false });
    if (!login || login.error) {
      window.location.assign(`/${locale}/auth/login?registered=1`);
      return;
    }
    window.location.assign(callbackUrl);
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-10">
      <p className="text-sm font-semibold text-[#ce0e2d]">BAYADA 회원</p>
      <h1 className="mt-1 text-[26px] font-bold tracking-tight text-[color:var(--fg)]">회원가입</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--muted)]">
        하나의 계정으로 홈페이지 마이페이지와 바야다 아카데미를 함께 이용해요.
      </p>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-[color:var(--fg)]">
          어떤 회원이신가요?<span className="ml-0.5 text-[#ce0e2d]">*</span>
        </p>
        <MemberTypePicker value={type} onChange={setType} />
      </div>

      {type && (
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-6">
          <Field label={type === "ORGANIZATION" ? "담당자 이름" : "이름"} htmlFor="name" required>
            <input id="name" name="name" required maxLength={50} autoComplete="name" className={inputClass} />
          </Field>
          <Field label="이메일" htmlFor="email" required help="로그인 아이디로 써요. 문의·예약 안내도 이 주소로 보내요.">
            <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="name@example.com" />
          </Field>
          <Field label="휴대폰 번호" htmlFor="phone" required>
            <input
              id="phone"
              name="phone"
              inputMode="numeric"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className={inputClass}
              placeholder="010-0000-0000"
            />
          </Field>
          {type === "PROVIDER" && (
            <Field label="직군" required>
              <ChoiceChips
                aria-label="직군"
                columns={3}
                value={providerRole}
                onChange={(v) => setProviderRole(v as string)}
                options={PROVIDER_ROLES.map((r) => ({ value: r, label: r }))}
              />
            </Field>
          )}
          {type === "ORGANIZATION" && (
            <>
              <Field label="기관명" htmlFor="orgName" required>
                <input id="orgName" name="orgName" required maxLength={100} className={inputClass} />
              </Field>
              <Field label="기관 유형" htmlFor="orgType" required>
                <Select id="orgType" value={orgType} onChange={setOrgType} options={ORG_TYPES.map((t) => ({ value: t, label: t }))} />
              </Field>
            </>
          )}
          <Field label="비밀번호" htmlFor="password" required help={PASSWORD_RULE}>
            <input id="password" name="password" type="password" required autoComplete="new-password" className={inputClass} />
          </Field>
          <Field label="비밀번호 확인" htmlFor="password2" required>
            <input id="password2" name="password2" type="password" required autoComplete="new-password" className={inputClass} />
          </Field>

          <div className="mt-2 flex flex-col gap-3 rounded-2xl bg-[#f8f9fa] p-4">
            <Checkbox
              checked={all}
              onChange={(v) => {
                setTerms(v);
                setPrivacy(v);
                setMarketing(v);
              }}
            >
              <span className="font-bold">전체 동의</span>
            </Checkbox>
            <div className="h-px bg-gray-200" />
            <Checkbox checked={terms} onChange={setTerms}>
              [필수]{" "}
              <Link href={`/${locale}/terms`} target="_blank" className="underline underline-offset-2">
                이용약관
              </Link>
            </Checkbox>
            <Checkbox checked={privacy} onChange={setPrivacy}>
              [필수]{" "}
              <Link href={`/${locale}/privacy`} target="_blank" className="underline underline-offset-2">
                개인정보 수집·이용
              </Link>
            </Checkbox>
            <Checkbox checked={marketing} onChange={setMarketing} description="이메일·문자로 서비스 소식과 건강 정보를 받아요. 마이페이지에서 언제든 바꿀 수 있어요.">
              [선택] 소식·알림 수신
            </Checkbox>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={pending} className={btnClass("primary")}>
            {pending ? "가입하는 중…" : "가입하기"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
        이미 계정이 있으신가요?{" "}
        <Link href={`/${locale}/auth/login`} className="font-semibold text-[#ce0e2d] hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}

/** 회원 유형 4개 카드 — 가입·온보딩 공용 */
export function MemberTypePicker({ value, onChange }: { value: MemberTypeKey | null; onChange: (t: MemberTypeKey) => void }) {
  return (
    <>
      <div role="radiogroup" aria-label="회원 유형" className="grid grid-cols-2 gap-2">
        {MEMBER_TYPES.map((t) => {
          const Icon = MEMBER_ICON[t];
          const on = value === t;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(t)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors",
                on ? "border-[#ce0e2d] bg-red-50/60 ring-1 ring-[#ce0e2d]" : "border-[color:var(--border)] hover:border-gray-400",
              )}
            >
              <span className={cn("flex size-9 items-center justify-center rounded-full", on ? "bg-[#ce0e2d] text-white" : "bg-[#f0f4f7] text-gray-600")}>
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <span className="text-[15px] font-bold text-[color:var(--fg)]">{MEMBER_TYPE_LABEL[t]}</span>
              <span className="hidden text-xs leading-relaxed text-[color:var(--muted)] sm:block">{MEMBER_TYPE_DESC[t]}</span>
            </button>
          );
        })}
      </div>
      {value && <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)] sm:hidden">{MEMBER_TYPE_DESC[value]}</p>}
    </>
  );
}
