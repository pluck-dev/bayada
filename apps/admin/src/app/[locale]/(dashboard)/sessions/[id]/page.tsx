import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { getSession, sessionCourseOptions } from "@/lib/queries/sessions";
import { toKstInput } from "@/lib/kst";
import { formatDateTime } from "@/lib/labels";
import { Card, EmptyState, PageHeader, Stat, buttonClass, cx, tableClass, tdClass, thClass, trClass } from "@/components/ui";
import { SessionForm } from "@/components/sessions/SessionForm";

export default async function SessionDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const user = await requirePage("session", locale);
  const [s, options] = await Promise.all([getSession(id), sessionCourseOptions()]);
  if (!s) notFound();
  // 보관된 프로그램에 연결된 일정도 선택값이 사라지지 않게
  const courses = s.course && !options.some((o) => o.id === s.course!.id) ? [{ id: s.course.id, title: s.course.title, mode: "보관" }, ...options] : options;
  const n = s.registrations.length;
  const initial = {
    courseId: s.courseId ?? "",
    title: s.title,
    region: s.region,
    location: s.location,
    startsAt: toKstInput(s.startsAt),
    endsAt: toKstInput(s.endsAt),
    capacity: s.capacity,
    note: s.note ?? "",
  };

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/sessions`, label: "실습·오프라인 일정" }}
        title={s.title}
        description={`${s.region} · ${s.location} · ${formatDateTime(s.startsAt)} ~ ${formatDateTime(s.endsAt)}`}
      />

      <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-start gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="신청" value={`${n}명`} />
            <Stat label="정원" value={`${s.capacity}명`} />
            <Stat label="잔여" value={`${Math.max(0, s.capacity - n)}명`} hint={n >= s.capacity ? "마감" : undefined} />
          </div>

          <Card
            title={`신청자 (${n}명)`}
            padded={false}
            actions={
              n > 0 && (
                <a href={`/api/v1/sessions/${id}/registrations`} className={buttonClass("secondary", "sm")} download>
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  CSV 내려받기
                </a>
              )
            }
          >
            {n === 0 ? (
              <EmptyState title="아직 신청자가 없습니다" description="학습자가 아카데미에서 신청하면 여기에 쌓입니다." />
            ) : (
              <div className="overflow-x-auto">
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={cx(thClass, "w-10")}>#</th>
                      <th className={thClass}>이름</th>
                      <th className={thClass}>이메일</th>
                      <th className={thClass}>연락처</th>
                      <th className={thClass}>신청 일시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.registrations.map((r, i) => (
                      <tr key={r.user.id} className={trClass}>
                        <td className={cx(tdClass, "tabular text-zinc-400")}>{i + 1}</td>
                        <td className={cx(tdClass, "font-medium")}>
                          {can(user, "member.read") ? (
                            <Link href={`/${locale}/members/${r.user.id}`} className="transition-colors hover:text-brand">
                              {r.user.name ?? "-"}
                            </Link>
                          ) : (
                            r.user.name ?? "-"
                          )}
                        </td>
                        <td className={cx(tdClass, "text-muted")}>{r.user.email}</td>
                        <td className={cx(tdClass, "tabular text-muted")}>{r.user.phone ?? "-"}</td>
                        <td className={cx(tdClass, "tabular text-subtle")}>{formatDateTime(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          <p className="px-1 text-caption text-muted">명단 내려받기는 개인정보 처리 기록으로 감사 로그에 남습니다.</p>
        </div>

        <SessionForm
          // 저장 후 서버 값이 바뀌면 폼을 새 값으로 다시 시작 (TrainingSession 에 updatedAt 이 없다)
          key={JSON.stringify(initial)}
          locale={locale}
          sessionId={id}
          courses={courses}
          registrations={n}
          initial={initial}
        />
      </div>
    </>
  );
}
