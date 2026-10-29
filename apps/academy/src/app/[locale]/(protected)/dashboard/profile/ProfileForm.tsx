"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { JobRole } from "@bayada/db";
import { JOB_ROLES, JOB_ROLE_LABEL } from "@/lib/labels";
import { updateProfile, type ProfileState } from "./actions";

export function ProfileForm({ name, jobRole }: { name: string; jobRole: JobRole | null }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  const roles: JobRole[] = [...JOB_ROLES, "OTHER"];
  return (
    <form action={action} className="space-y-6">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink">
          이름
        </label>
        <input
          id="name"
          name="name"
          defaultValue={name}
          required
          maxLength={40}
          className="h-12 w-full max-w-sm rounded-xl border border-line px-4 text-[15px] text-ink focus:border-ink focus:outline-none"
        />
        <p className="mt-1.5 text-xs text-muted">수료증에 이 이름이 표시돼요.</p>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">직군</legend>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <label key={r} className="cursor-pointer">
              <input type="radio" name="jobRole" value={r} defaultChecked={jobRole === r} className="peer sr-only" />
              <span className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand hover:border-ink-soft">
                {JOB_ROLE_LABEL[r]}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">직군에 맞는 프로그램을 추천하는 데 써요.</p>
      </fieldset>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-70"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          저장
        </button>
        {state.ok && !pending && (
          <span role="status" className="inline-flex items-center gap-1 text-sm font-medium text-success">
            <Check className="h-4 w-4" aria-hidden /> 저장했어요
          </span>
        )}
        {state.error && (
          <span role="alert" className="text-sm text-brand">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
