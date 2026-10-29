"use client";

import { useState } from "react";
import { assignPartnerAdmin, unassignPartnerAdmin } from "@/lib/actions/partners";
import { Button, Field, inputClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export function AssignPartnerAdminForm({ providerId, providerName }: { providerId: string; providerName: string }) {
  const { run, isPending } = useAction();
  const [email, setEmail] = useState("");
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => assignPartnerAdmin(providerId, email), {
          confirm: {
            title: `${providerName} 파트너 관리자로 지정할까요?`,
            body: "이 회원은 어드민 콘솔의 파트너 콘솔에 로그인해 이 기관 프로그램만 작성·승인 요청할 수 있습니다. 승인·게시는 할 수 없습니다.",
            confirmLabel: "지정",
          },
          onSuccess: () => setEmail(""),
        });
      }}
    >
      <Field label="회원 이메일" htmlFor="pa-email" hint="아카데미에 가입·승인된 학습자 계정만 지정할 수 있습니다.">
        <input
          id="pa-email"
          type="email"
          required
          placeholder="partner@example.com"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Button type="submit" variant="dark" disabled={isPending || !email.trim()}>
        파트너 관리자 지정
      </Button>
    </form>
  );
}

export function UnassignPartnerAdminButton({ providerId, userId, label }: { providerId: string; userId: string; label: string }) {
  const { run, isPending } = useAction();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={() =>
        run(() => unassignPartnerAdmin(providerId, userId), {
          confirm: { title: `${label} 님의 파트너 관리자 권한을 해제할까요?`, body: "학습자 계정으로 돌아가고 파트너 콘솔에 들어올 수 없습니다.", confirmLabel: "해제", danger: true },
        })
      }
    >
      해제
    </Button>
  );
}
