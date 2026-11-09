"use client";

import { Badge, CheckVisual, DatePicker, Dialog, buttonVariants, controlClass, tagClass, textareaClass } from "@bayada/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Loader2, Search, UserPlus } from "lucide-react";
import type { JobRole } from "@bayada/db";
import { JOB_ROLE_LABEL } from "@/lib/labels";
import { InviteLink } from "./InviteLink";

interface CourseOption {
  id: string;
  title: string;
  category: string | null;
}
interface MemberOption {
  id: string;
  name: string;
  email: string;
  jobRole: JobRole | null;
}

const btnOutline = buttonVariants({ variant: "secondary" });
const btnPrimary = buttonVariants({ variant: "primary" });

/** 기관 대시보드 상단 버튼: 직원 초대 · 과정 배정 (모달) */
export function BusinessActions({
  locale,
  courses,
  members,
}: {
  locale: string;
  courses: CourseOption[];
  members: MemberOption[];
}) {
  const [open, setOpen] = useState<"invite" | "assign" | null>(null);
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setOpen("invite")} className={btnOutline}>
        <UserPlus className="h-4 w-4" aria-hidden /> 직원 초대
      </button>
      <button type="button" onClick={() => setOpen("assign")} className={btnPrimary} disabled={!courses.length}>
        <ClipboardList className="h-4 w-4" aria-hidden /> 과정 배정
      </button>
      <InviteModal locale={locale} open={open === "invite"} onClose={() => setOpen(null)} />
      <AssignModal open={open === "assign"} onClose={() => setOpen(null)} courses={courses} members={members} />
    </div>
  );
}

function InviteModal({ locale, open, onClose }: { locale: string; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [emails, setEmails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    invites: { id: string; email: string; token: string }[];
    alreadyMembers: string[];
    invalid: string[];
    emailed?: string[];
  } | null>(null);

  function close() {
    if (result) router.refresh();
    setEmails("");
    setError(null);
    setResult(null);
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/business/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? "초대를 만들지 못했어요.");
      setResult(data);
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={close} title="직원 초대">
      {result ? (
        <div>
          <p className="flex items-center gap-2 text-body font-semibold text-ink">
            <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
            초대 {result.invites.length}건을 만들었어요
            {result.emailed && result.emailed.length > 0 && ` · 메일 ${result.emailed.length}통 발송`}
          </p>
          <p className="mt-1.5 text-body-sm text-muted">
            {result.emailed && result.emailed.length > 0
              ? "초대 메일을 보냈어요. 메일을 못 받았다면 아래 링크를 메신저로 전달해 주세요."
              : "메일을 보내지 못했어요. 아래 링크를 직원에게 메신저·메일로 전달해 주세요."}{" "}
            초대받은 이메일로 로그인(또는 가입)하면 기관에 합류해요.
          </p>
          <ul className="mt-4 space-y-3">
            {result.invites.map((i) => (
              <li key={i.id}>
                <p className="mb-1 flex items-center gap-1.5 text-caption font-semibold text-ink-soft">
                  {i.email}
                  {result.emailed?.includes(i.email) ? (
                    <Badge tone="success">메일 발송</Badge>
                  ) : (
                    <Badge>메일 미발송</Badge>
                  )}
                </p>
                <InviteLink path={`/${locale}/invite/${i.token}`} />
              </li>
            ))}
          </ul>
          {(result.alreadyMembers.length > 0 || result.invalid.length > 0) && (
            <div className="mt-4 space-y-1 rounded-lg bg-surface p-3 text-caption text-muted">
              {result.alreadyMembers.length > 0 && (
                <p>이미 소속된 직원이라 건너뜀: {result.alreadyMembers.join(", ")}</p>
              )}
              {result.invalid.length > 0 && <p>이메일 형식이 아니라 건너뜀: {result.invalid.join(", ")}</p>}
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={close} className={btnPrimary}>
              완료
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor="invite-emails" className="text-body-sm font-semibold text-ink">
            직원 이메일
          </label>
          <p className="mt-1 text-caption text-muted">쉼표·줄바꿈으로 여러 명을 한 번에 넣을 수 있어요. (최대 100명)</p>
          <textarea
            id="invite-emails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={5}
            required
            placeholder={"kim@center.kr\nlee@center.kr"}
            className={textareaClass("md", "mt-3 resize-y font-mono text-body-sm")}
          />
          <p className="mt-2 text-caption text-muted">
            입력한 주소로 초대 메일을 보내고, 직접 전달할 수 있게 링크도 보여 드려요. 링크는 받은 사람의 이메일 계정에서만 쓸 수 있어요.
          </p>
          {error && (
            <p role="alert" className="mt-3 text-body-sm text-danger">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={close} className={btnOutline}>
              취소
            </button>
            <button type="submit" disabled={busy || !emails.trim()} className={btnPrimary}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              초대 보내기
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

function AssignModal({
  open,
  onClose,
  courses,
  members,
}: {
  open: boolean;
  onClose: () => void;
  courses: CourseOption[];
  members: MemberOption[];
}) {
  const router = useRouter();
  const [courseQ, setCourseQ] = useState("");
  const [memberQ, setMemberQ] = useState("");
  const [courseIds, setCourseIds] = useState<Set<string>>(new Set());
  const [userIds, setUserIds] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ pairs: number; newAssignments: number; newEnrollments: number } | null>(null);

  const shownCourses = useMemo(() => {
    const q = courseQ.trim().toLowerCase();
    return q ? courses.filter((c) => `${c.title} ${c.category ?? ""}`.toLowerCase().includes(q)) : courses;
  }, [courses, courseQ]);
  const shownMembers = useMemo(() => {
    const q = memberQ.trim().toLowerCase();
    return q
      ? members.filter((m) =>
          `${m.name} ${m.email} ${m.jobRole ? JOB_ROLE_LABEL[m.jobRole] : ""}`.toLowerCase().includes(q)
        )
      : members;
  }, [members, memberQ]);
  const roles = useMemo(() => [...new Set(members.map((m) => m.jobRole).filter((r): r is JobRole => !!r))], [members]);

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };
  const allShownSelected = shownMembers.length > 0 && shownMembers.every((m) => userIds.has(m.id));

  function close() {
    if (done) router.refresh();
    setCourseIds(new Set());
    setUserIds(new Set());
    setDueDate("");
    setCourseQ("");
    setMemberQ("");
    setError(null);
    setDone(null);
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/business/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseIds: [...courseIds], userIds: [...userIds], dueDate: dueDate || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? "배정하지 못했어요.");
      setDone(data);
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setBusy(false);
    }
  }

  const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  const listCls = "mt-2 max-h-56 space-y-0.5 overflow-y-auto rounded-lg border border-line p-1.5";
  const rowCls = "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-body-sm hover:bg-surface";
  const searchCls = controlClass("md", "h-10 pl-9 text-body-sm");

  return (
    <Dialog open={open} onClose={close} title="과정 배정" size="lg">
      {done ? (
        <div>
          <p className="flex items-center gap-2 text-body font-semibold text-ink">
            <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
            배정을 마쳤어요
          </p>
          <p className="mt-2 text-body-sm text-muted">
            {done.pairs}건 배정 (새 배정 {done.newAssignments}건 · 새로 수강 등록 {done.newEnrollments}건). 직원의 마이
            러닝에 바로 표시돼요.
          </p>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={close} className={btnPrimary}>
              완료
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <div>
            <p className="text-body-sm font-semibold text-ink">
              과정 <span className="font-normal text-muted">· {courseIds.size}개 선택</span>
            </p>
            <label className="relative mt-2 block">
              <span className="sr-only">과정 검색</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                aria-hidden
              />
              <input
                value={courseQ}
                onChange={(e) => setCourseQ(e.target.value)}
                placeholder="과정 이름·주제 검색"
                className={searchCls}
              />
            </label>
            <ul className={listCls}>
              {shownCourses.map((c) => (
                <li key={c.id}>
                  <label className={rowCls}>
                    <input
                      type="checkbox"
                      checked={courseIds.has(c.id)}
                      onChange={() => setCourseIds((s) => toggle(s, c.id))}
                      className="peer sr-only"
                    />
                    <span className="rounded-[6px] peer-focus-visible:ring-3 peer-focus-visible:ring-brand-200">
                      <CheckVisual checked={courseIds.has(c.id)} size="sm" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ink">{c.title}</span>
                    {c.category && <span className="shrink-0 text-caption text-muted">{c.category}</span>}
                  </label>
                </li>
              ))}
              {shownCourses.length === 0 && <li className="px-2.5 py-3 text-body-sm text-muted">검색 결과가 없어요</li>}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-body-sm font-semibold text-ink">
                대상 직원 <span className="font-normal text-muted">· {userIds.size}명 선택</span>
              </p>
              <button
                type="button"
                onClick={() =>
                  setUserIds((s) => {
                    const next = new Set(s);
                    shownMembers.forEach((m) => (allShownSelected ? next.delete(m.id) : next.add(m.id)));
                    return next;
                  })
                }
                className="text-caption font-semibold text-ink-soft hover:text-ink"
              >
                {allShownSelected ? "보이는 직원 선택 해제" : `보이는 직원 모두 선택 (${shownMembers.length})`}
              </button>
            </div>
            {roles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() =>
                      setUserIds((s) => {
                        const next = new Set(s);
                        members.filter((m) => m.jobRole === r).forEach((m) => next.add(m.id));
                        return next;
                      })
                    }
                    className={tagClass({ size: "sm" })}
                  >
                    + {JOB_ROLE_LABEL[r]} 전체
                  </button>
                ))}
              </div>
            )}
            <label className="relative mt-2 block">
              <span className="sr-only">직원 검색</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                aria-hidden
              />
              <input
                value={memberQ}
                onChange={(e) => setMemberQ(e.target.value)}
                placeholder="이름·이메일·직군 검색"
                className={searchCls}
              />
            </label>
            <ul className={listCls}>
              {shownMembers.map((m) => (
                <li key={m.id}>
                  <label className={rowCls}>
                    <input
                      type="checkbox"
                      checked={userIds.has(m.id)}
                      onChange={() => setUserIds((s) => toggle(s, m.id))}
                      className="peer sr-only"
                    />
                    <span className="rounded-[6px] peer-focus-visible:ring-3 peer-focus-visible:ring-brand-200">
                      <CheckVisual checked={userIds.has(m.id)} size="sm" />
                    </span>
                    <span className="shrink-0 font-medium text-ink">{m.name}</span>
                    <span className="min-w-0 flex-1 truncate text-caption text-muted">{m.email}</span>
                    {m.jobRole && <span className="shrink-0 text-caption text-muted">{JOB_ROLE_LABEL[m.jobRole]}</span>}
                  </label>
                </li>
              ))}
              {shownMembers.length === 0 && <li className="px-2.5 py-3 text-body-sm text-muted">검색 결과가 없어요</li>}
            </ul>
          </div>

          <div>
            <label htmlFor="assign-due" className="text-body-sm font-semibold text-ink">
              이수 기한 <span className="font-normal text-muted">(선택)</span>
            </label>
            <DatePicker
              id="assign-due"
              min={today}
              value={dueDate}
              onChange={setDueDate}
              placeholder="기한 없음"
              className="mt-2 max-w-[280px]"
            />
          </div>

          {error && (
            <p role="alert" className="text-body-sm text-danger">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
            <p className="text-caption text-muted">
              {courseIds.size && userIds.size
                ? `${courseIds.size * userIds.size}건이 배정되고, 수강 등록이 함께 돼요.`
                : "과정과 직원을 골라 주세요."}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={close} className={btnOutline}>
                취소
              </button>
              <button type="submit" disabled={busy || !courseIds.size || !userIds.size} className={btnPrimary}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                배정하기
              </button>
            </div>
          </div>
        </form>
      )}
    </Dialog>
  );
}
