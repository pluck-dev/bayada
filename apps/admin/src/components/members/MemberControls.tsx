"use client";

import { useState } from "react";
import type { Role, UserStatus } from "@bayada/db";
import { changeRole, decideSignup } from "@/lib/actions/members";
import { ROLES, ROLE_LABEL } from "@/lib/labels";
import { Button, Field, selectClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

const ADMIN_CONSOLE_ROLES: Role[] = ["ADMIN", "CONTENT_MANAGER", "CLINICAL_REVIEWER"];

export function MemberControls({ id, status, role }: { id: string; status: UserStatus; role: Role }) {
  const { run, isPending } = useAction();
  const [nextRole, setNextRole] = useState<Role>(role);

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
            confirm: ADMIN_CONSOLE_ROLES.includes(nextRole)
              ? {
                  title: `${ROLE_LABEL[nextRole]} 권한을 줄까요?`,
                  body: "이 회원이 어드민 콘솔에 로그인할 수 있게 됩니다.",
                  confirmLabel: "권한 부여",
                }
              : undefined,
          });
        }}
      >
        <Field label="역할" htmlFor="role">
          <select id="role" className={selectClass} value={nextRole} onChange={(e) => setNextRole(e.target.value as Role)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </Field>
        <Button type="submit" disabled={isPending || nextRole === role}>
          역할 변경
        </Button>
      </form>
    </div>
  );
}
