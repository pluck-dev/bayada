"use client";

import { MailCheck } from "lucide-react";
import { resendVerification } from "@/lib/member/actions";
import { btnClass } from "./ui";
import { useMemberAction } from "./controls";

// 미인증 이메일 안내 — 인증하면 비로그인 때 같은 이메일로 남긴 상담도 '내 문의'에 모인다
export function VerifyEmailBanner({ locale, email }: { locale: string; email: string }) {
  const { run, pending, result } = useMemberAction();
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
      <MailCheck className="size-5 shrink-0 text-amber-600" aria-hidden />
      <div className="min-w-0 flex-1 text-sm leading-relaxed text-amber-900">
        <p className="font-semibold">이메일 인증을 해 주세요</p>
        <p>
          {result ? (result.ok ? result.message : result.error) : `${email} 인증을 마치면 로그인 전에 이 이메일로 남긴 상담·문의도 함께 볼 수 있어요.`}
        </p>
      </div>
      <button type="button" disabled={pending} onClick={() => run(() => resendVerification(locale), { refresh: false })} className={btnClass("outline", "sm")}>
        {pending ? "보내는 중…" : "인증 메일 보내기"}
      </button>
    </div>
  );
}
