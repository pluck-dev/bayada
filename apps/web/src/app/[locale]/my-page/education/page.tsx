import { ExternalLink } from "lucide-react";
import { requireMember } from "@/lib/member/session";
import { academySummary } from "@/lib/member/queries";
import { ACADEMY_URL } from "@/lib/app-url";
import { Badge, Card, EmptyState, PageTitle, btnClass, fmtDate } from "@/components/member/ui";

// 바야다 아카데미(같은 계정) 수강·수료·인증 현황 — 열람만, 학습은 아카데미에서
export default async function EducationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await requireMember(locale, "/my-page/education");
  const { enrollments, certificates, credentials, applications } = await academySummary(m.id);
  const ac = `${ACADEMY_URL}/${locale}`;
  const canOrg = !!m.organizationId && (m.role === "ORG_ADMIN" || m.role === "ADMIN");
  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="교육 현황"
        description="바야다 아카데미에서 같은 계정으로 들은 교육과 수료증·바야다 인증이에요."
        action={
          <a href={`${ac}/dashboard`} className={btnClass("primary")}>
            아카데미 마이 러닝 <ExternalLink className="size-4" aria-hidden />
          </a>
        }
      />
      {canOrg && (
        <Card title="소속 구성원 교육 현황" description={`${m.organization?.name ?? "기관"} 관리자로 지정되어 있어요. 구성원 배정·이수 현황은 아카데미 기관 대시보드에서 관리해요.`}>
          <a href={`${ac}/business`} className={btnClass("outline", "sm")}>
            기관 대시보드 열기 <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </Card>
      )}
      <Card title={`수강 중·수강한 교육 ${enrollments.length}개`}>
        {enrollments.length === 0 ? (
          <EmptyState
            title="아직 수강한 교육이 없어요"
            description="방문 간호·돌봄 실무 교육과 바야다 인증 과정을 아카데미에서 들을 수 있어요."
            action={
              <a href={`${ac}/courses`} className={btnClass("outline", "sm")}>
                교육 둘러보기 <ExternalLink className="size-3.5" aria-hidden />
              </a>
            }
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {enrollments.map((e) => (
              <li key={e.id}>
                <a href={`${ac}/courses/${encodeURIComponent(e.course.slug)}`} className="flex items-center gap-4 py-3 hover:opacity-80">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{e.course.title}</span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <span className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-gray-100">
                        <span className="block h-full rounded-full bg-[#ce0e2d]" style={{ width: `${Math.min(100, e.progressPercent)}%` }} />
                      </span>
                      <span className="text-xs tabular-nums text-[color:var(--muted)]">{e.progressPercent}%</span>
                    </span>
                  </span>
                  {e.completedAt ? <Badge tone="green">수료</Badge> : <Badge tone="blue">수강 중</Badge>}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card title={`수료증 ${certificates.length}건`}>
          {certificates.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)]">교육을 마치면 수료증이 발급돼요.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {certificates.map((c) => (
                <li key={c.id} className="rounded-xl bg-[#f8f9fa] p-3">
                  <p className="truncate text-sm font-semibold">{c.course.title}</p>
                  <p className="text-xs tabular-nums text-[color:var(--muted)]">
                    {c.number} · {fmtDate(c.issuedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="바야다 인증">
          {credentials.length === 0 && applications.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)]">인증 과정을 신청하면 심사 상태가 여기 보여요.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {applications.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#f8f9fa] p-3">
                  <span className="truncate text-sm font-semibold">{a.program.title}</span>
                  <Badge tone="amber">심사 중</Badge>
                </li>
              ))}
              {credentials.map((c) => {
                const expired = !!c.expiresAt && c.expiresAt < new Date();
                return (
                  <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#f8f9fa] p-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{c.program.title}</span>
                      <span className="block text-xs tabular-nums text-[color:var(--muted)]">
                        {c.number}
                        {c.expiresAt ? ` · ${fmtDate(c.expiresAt)}까지` : " · 영구"}
                      </span>
                    </span>
                    {c.revokedAt ? <Badge>취소</Badge> : expired ? <Badge>만료</Badge> : <Badge tone="green">유효</Badge>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
