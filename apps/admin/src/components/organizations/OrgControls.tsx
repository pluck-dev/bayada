"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createOrganization, setOrgAdmin, type OrganizationInput } from "@/lib/actions/organizations";
import { Button, Field, inputClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export function OrgAdminButton({ orgId, userId, name, isAdmin }: { orgId: string; userId: string; name: string; isAdmin: boolean }) {
  const { run, isPending } = useAction();
  return (
    <Button
      size="sm"
      variant={isAdmin ? "ghost" : "secondary"}
      disabled={isPending}
      onClick={() =>
        run(() => setOrgAdmin(orgId, userId, !isAdmin), {
          confirm: isAdmin
            ? { title: `${name}님을 학습자로 되돌릴까요?`, body: "기관 관리자 화면(직원 초대·과정 배정)을 더 이상 쓸 수 없습니다.", confirmLabel: "학습자로" }
            : { title: `${name}님을 기관 관리자로 지정할까요?`, body: "이 기관 직원을 초대하고 과정을 배정할 수 있게 됩니다.", confirmLabel: "지정" },
        })
      }
    >
      {isAdmin ? "학습자로 되돌리기" : "기관 관리자로 지정"}
    </Button>
  );
}

export function NewOrganizationForm({ locale }: { locale: string }) {
  const router = useRouter();
  const { run, isPending } = useAction();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<OrganizationInput>({ name: "", bizNo: "", contact: "" });

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" aria-hidden />새 기관
      </Button>
    );
  }
  return (
    <form
      className="grid w-full grid-cols-[1.4fr_1fr_1fr_auto] items-end gap-3 surface-card rounded-[22px] bg-canvas p-5"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => createOrganization(v), {
          refresh: false,
          onSuccess: (r) => {
            if (r.ok && r.data) router.push(`/${locale}/organizations/${r.data.id}`);
          },
        });
      }}
    >
      <Field label="기관명" required htmlFor="org-name">
        <input id="org-name" required autoFocus className={inputClass} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      </Field>
      <Field label="사업자등록번호" htmlFor="org-biz">
        <input
          id="org-biz"
          inputMode="numeric"
          placeholder="000-00-00000"
          className={inputClass}
          value={v.bizNo}
          onChange={(e) => setV({ ...v, bizNo: e.target.value })}
        />
      </Field>
      <Field label="담당자 연락처" htmlFor="org-contact">
        <input id="org-contact" className={inputClass} value={v.contact} onChange={(e) => setV({ ...v, contact: e.target.value })} />
      </Field>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)}>
          취소
        </Button>
        <Button type="submit" variant="primary" disabled={isPending}>
          만들기
        </Button>
      </div>
    </form>
  );
}
