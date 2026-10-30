"use client";

import { buttonVariants, controlClass, tagClass } from "@bayada/ui";
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
        <label htmlFor="name" className="mb-2 block text-body-sm font-semibold text-ink-soft">
          이름
        </label>
        <input
          id="name"
          name="name"
          defaultValue={name}
          required
          maxLength={40}
          className={controlClass("md", "max-w-sm")}
        />
        <p className="mt-1.5 text-caption text-muted">수료증에 이 이름이 표시돼요.</p>
      </div>
      <fieldset>
        <legend className="mb-2 text-body-sm font-semibold text-ink-soft">직군</legend>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <label key={r} className="cursor-pointer">
              <input type="radio" name="jobRole" value={r} defaultChecked={jobRole === r} className="peer sr-only" />
              <span className={`${tagClass()} peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600`}>
                {JOB_ROLE_LABEL[r]}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-caption text-muted">직군에 맞는 프로그램을 추천하는 데 써요.</p>
      </fieldset>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={buttonVariants({ variant: "primary", size: "lg" })}
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          저장
        </button>
        {state.ok && !pending && (
          <span role="status" className="inline-flex items-center gap-1 text-body-sm font-medium text-success">
            <Check className="h-4 w-4" aria-hidden /> 저장했어요
          </span>
        )}
        {state.error && (
          <span role="alert" className="text-body-sm text-danger">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
