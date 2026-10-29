"use client";

import { useState } from "react";
import type { UserStatus } from "@bayada/db";
import { changeRole, decideSignup } from "@/lib/actions/members";
import { Button, Field, selectClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export interface RoleOption {
  key: string;
  label: string;
  /** 사용자 정의 역할 */
  custom: boolean;
  /** 어드민 콘솔에 들어올 수 있는 역할 (권한이 하나라도 있음) */
  admin: boolean;
}

export function MemberControls({
  id,
  status,
  roleKey,
  options,
}: {
  id: string;
  status: UserStatus;
  roleKey: string;
  options: RoleOption[];
}) {
  const { run, isPending } = useAction();
  const [nextRole, setNextRole] = useState(roleKey);
  const next = options.find((o) => o.key === nextRole);
  const system = options.filter((o) => !o.custom);
  const custom = options.filter((o) => o.custom);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-[12.5px] font-medium text-zinc-700">가입 승인</span>
        <div className="flex gap-2">
          <Button
            variant="dark"
            className="flex-1"
            disabled={isPending || status === "APPROVED"}
            onClick={() => run(() => decideSignup([id], "APPROVED"))}
          >
            승인
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={isPending || status === "REJECTED"}
            onClick={() =>
              run(() => decideSignup([id], "REJECTED"), {
                confirm: { title: "이 회원을 거절할까요?", body: "거절된 계정은 로그인할 수 없습니다.", confirmLabel: "거절", danger: true },
              })
            }
          >
            거절
          </Button>
        </div>
      </div>
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => changeRole(id, nextRole), {
            confirm: next?.admin
              ? {
                  title: `${next.label} 권한을 줄까요?`,
                  body: "이 회원이 어드민 콘솔에 로그인할 수 있게 됩니다.",
                  confirmLabel: "권한 부여",
                }
              : undefined,
          });
        }}
      >
        <Field label="역할" htmlFor="role">
          <select id="role" className={selectClass} value={nextRole} onChange={(e) => setNextRole(e.target.value)}>
            <optgroup label="시스템 역할">
              {/* 파트너 관리자는 파트너 화면에서 제공기관과 함께 지정한다 */}
              {system
                .filter((o) => o.key !== "PARTNER_ADMIN" || o.key === roleKey)
                .map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
            </optgroup>
            {custom.length > 0 && (
              <optgroup label="사용자 정의 역할">
                {custom.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </Field>
        <Button type="submit" disabled={isPending || nextRole === roleKey}>
          역할 변경
        </Button>
      </form>
    </div>
  );
}
