"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createRole, deleteRole, saveRolePermissions, updateRole } from "@/lib/actions/roles";
import { FIXED_PERMISSIONS, PERMISSION_DEFS, type Permission } from "@/lib/rbac";
import { Badge, Button, Card, Field, cx, inputClass, selectClass, tableClass, tableWrap, tdClass, thClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

interface RoleRow {
  key: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: Permission[];
  users: number;
}

const LABEL = Object.fromEntries(PERMISSION_DEFS.map((p) => [p.key, p.label])) as Record<Permission, string>;
const GROUPS = [...new Set(PERMISSION_DEFS.map((p) => p.group))];

type Matrix = Record<string, Permission[]>;

function toMatrix(roles: RoleRow[]): Matrix {
  return Object.fromEntries(roles.map((r) => [r.key, r.permissions]));
}

export function RoleManager({ roles, selfRoleKey, locale }: { roles: RoleRow[]; selfRoleKey: string; locale: string }) {
  const { run, isPending } = useAction();
  const base = useMemo(() => toMatrix(roles), [roles]);
  const baseSig = JSON.stringify(base);
  const [draft, setDraft] = useState<Matrix>(base);
  // 저장·역할 추가 후 서버 값이 바뀌면 편집본을 새 값으로 맞춘다
  useEffect(() => setDraft(JSON.parse(baseSig) as Matrix), [baseSig]);

  const diff = roles
    .filter((r) => r.key !== "ADMIN")
    .map((r) => {
      const before = base[r.key] ?? [];
      const after = draft[r.key] ?? [];
      return {
        role: r,
        added: after.filter((p) => !before.includes(p)),
        removed: before.filter((p) => !after.includes(p)),
      };
    })
    .filter((d) => d.added.length || d.removed.length);
  const changeCount = diff.reduce((n, d) => n + d.added.length + d.removed.length, 0);

  const toggle = (roleKey: string, p: Permission) =>
    setDraft((m) => {
      const cur = m[roleKey] ?? [];
      return { ...m, [roleKey]: cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p] };
    });

  const save = () =>
    run(() => saveRolePermissions(draft, base), {
      confirm: {
        title: `권한 변경 ${changeCount}건을 저장할까요?`,
        body: diff
          .map(
            (d) =>
              `${d.role.name}: ${[...d.added.map((p) => `+${LABEL[p]}`), ...d.removed.map((p) => `−${LABEL[p]}`)].join(", ")}`,
          )
          .join("\n"),
        confirmLabel: "저장",
      },
    });

  return (
    <div className="flex flex-col gap-5">
      <div className={tableWrap}>
        <table className={cx(tableClass, "min-w-[880px]")}>
          <thead>
            <tr>
              <th className={cx(thClass, "w-[340px]")}>권한</th>
              {roles.map((r) => (
                <th key={r.key} className={cx(thClass, "min-w-[104px] text-center align-bottom")}>
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="flex items-center gap-1 text-caption font-semibold text-fg">
                      {r.key === "ADMIN" && <Lock className="h-3 w-3 text-zinc-400" aria-label="잠금" />}
                      {r.name}
                    </span>
                    <Link href={`/${locale}/members?role=${encodeURIComponent(r.key)}`} className="tabular font-normal hover:text-fg">
                      {r.users}명
                    </Link>
                    {!r.isSystem && <Badge tone="violet">사용자 정의</Badge>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => (
              <Fragment key={g}>
                <tr>
                  <td colSpan={roles.length + 1} className="border-b border-line bg-surface px-3 py-1.5 text-micro font-semibold text-subtle">
                    {g}
                  </td>
                </tr>
                {PERMISSION_DEFS.filter((p) => p.group === g).map((p) => {
                  const fixedTo = FIXED_PERMISSIONS[p.key];
                  return (
                    <tr key={p.key} className="hover:bg-surface">
                      <td className={cx(tdClass, "whitespace-normal")}>
                        <p className="font-medium text-fg">{p.label}</p>
                        <p className="mt-0.5 text-micro leading-snug text-muted">{p.desc}</p>
                      </td>
                      {roles.map((r) => {
                        const locked = r.key === "ADMIN" || !!fixedTo;
                        const checked = (draft[r.key] ?? []).includes(p.key);
                        const changed = checked !== (base[r.key] ?? []).includes(p.key);
                        return (
                          <td key={r.key} className={cx(tdClass, "text-center", changed && "bg-warning-soft")}>
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                              checked={checked}
                              disabled={locked || isPending}
                              onChange={() => toggle(r.key, p.key)}
                              aria-label={`${r.name} — ${p.label}`}
                              title={
                                r.key === "ADMIN"
                                  ? "Super Admin 은 항상 모든 권한을 가집니다 (잠금)"
                                  : fixedTo
                                    ? "파트너 관리자 전용 권한입니다 (변경 불가)"
                                    : undefined
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas/95 px-4 py-3 shadow-[var(--shadow-pop)] backdrop-blur">
        <div className="min-w-0 text-caption">
          {changeCount === 0 ? (
            <span className="text-muted">
              변경 사항 없음 · Super Admin 열은 잠겨 있어 바꿀 수 없습니다.
            </span>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {diff.map((d) => (
                <li key={d.role.key} className="truncate">
                  <span className="font-medium text-fg">{d.role.name}</span>
                  <span className="text-muted"> · </span>
                  {d.added.map((p) => (
                    <span key={p} className="mr-1.5 text-success">+{LABEL[p]}</span>
                  ))}
                  {d.removed.map((p) => (
                    <span key={p} className="mr-1.5 text-danger">−{LABEL[p]}</span>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button disabled={isPending || changeCount === 0} onClick={() => setDraft(base)}>
            되돌리기
          </Button>
          <Button variant="primary" disabled={isPending || changeCount === 0} onClick={save}>
            변경 {changeCount > 0 ? `${changeCount}건 ` : ""}저장
          </Button>
        </div>
      </div>

      <CustomRoles roles={roles} selfRoleKey={selfRoleKey} />
    </div>
  );
}

function CustomRoles({ roles, selfRoleKey }: { roles: RoleRow[]; selfRoleKey: string }) {
  const { run, isPending } = useAction();
  const custom = roles.filter((r) => !r.isSystem);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [copyFrom, setCopyFrom] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5">
      <Card title="사용자 정의 역할" padded={false}>
        {custom.length === 0 ? (
          <p className="px-4 py-6 text-caption text-muted">
            아직 없습니다. 오른쪽에서 역할을 만들고 위 매트릭스에서 권한을 체크하세요. 회원·수강 화면에서 회원에게 지정합니다.
          </p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {custom.map((r) => (
              <li key={r.key} className="flex items-center gap-3 px-4 py-3">
                {editing === r.key ? (
                  <form
                    className="flex flex-1 items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      run(() => updateRole(r.key, { name: editName, description: editDesc }), {
                        onSuccess: (res) => res.ok && setEditing(null),
                      });
                    }}
                  >
                    <input className={cx(inputClass, "w-44")} value={editName} maxLength={40} required onChange={(e) => setEditName(e.target.value)} aria-label="역할 이름" />
                    <input className={inputClass} value={editDesc} maxLength={200} onChange={(e) => setEditDesc(e.target.value)} aria-label="설명" placeholder="설명" />
                    <Button type="submit" size="sm" variant="dark" disabled={isPending}>
                      저장
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                      취소
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="text-caption font-medium text-fg">
                        {r.name}
                        {r.key === selfRoleKey && <span className="ml-1.5 text-micro font-normal text-muted">(내 역할)</span>}
                      </p>
                      <p className="truncate text-micro text-muted">
                        {r.description || "설명 없음"} · 권한 {r.permissions.length}개 · 회원 {r.users}명
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(r.key);
                        setEditName(r.name);
                        setEditDesc(r.description);
                      }}
                    >
                      이름 변경
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={isPending || r.users > 0}
                      title={r.users > 0 ? "지정된 회원이 있어 삭제할 수 없습니다" : undefined}
                      onClick={() =>
                        run(() => deleteRole(r.key), {
                          confirm: { title: `'${r.name}' 역할을 삭제할까요?`, body: "삭제한 역할은 되돌릴 수 없습니다.", confirmLabel: "삭제", danger: true },
                        })
                      }
                    >
                      삭제
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="역할 추가">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => createRole({ name, description, copyFrom: copyFrom || undefined }), {
              onSuccess: (res) => {
                if (res.ok) {
                  setName("");
                  setDescription("");
                  setCopyFrom("");
                }
              },
            });
          }}
        >
          <fieldset disabled={isPending} className="flex flex-col gap-3">
            <Field label="이름" required htmlFor="role-name">
              <input id="role-name" className={inputClass} required maxLength={40} placeholder="예) 교육 운영 보조" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="설명" htmlFor="role-desc">
              <input id="role-desc" className={inputClass} maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <Field label="권한 복사" htmlFor="role-copy" hint="비워 두면 권한 없이 만들어집니다. 권한이 없는 역할은 로그인할 수 없습니다.">
              <select id="role-copy" className={selectClass} value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)}>
                <option value="">복사하지 않음</option>
                {roles
                  .filter((r) => r.key !== "PARTNER_ADMIN")
                  .map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Button type="submit" variant="dark">
              역할 만들기
            </Button>
          </fieldset>
        </form>
      </Card>
    </div>
  );
}
