import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePage } from "@/lib/session";
import { listCredentialPrograms } from "@/lib/queries/credentials";
import { validityLabel } from "@/lib/credentials";
import { formatDate } from "@/lib/labels";
import { Badge, EmptyState, LinkButton, PageHeader, cx, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";

export default async function CredentialProgramsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("credential.program", locale);
  const rows = await listCredentialPrograms();
  const base = `/${locale}/credentials/programs`;

  return (
    <>
      <PageHeader
        title="인증 과정"
        description="선수 프로그램·합격 점수·실기 여부·유효기간·갱신 알림을 과정마다 정합니다. 인증 정책이 확정되면 여기 값만 바꾸면 됩니다."
        actions={
          <LinkButton href={`${base}/new`} variant="primary">
            <Plus className="h-3.5 w-3.5" aria-hidden />새 인증 과정
          </LinkButton>
        }
      />

      <div className={tableWrap}>
        {rows.length === 0 ? (
          <EmptyState title="아직 인증 과정이 없습니다" description="인증 과정을 만들고 공개하면 학습자가 아카데미에서 신청할 수 있습니다." />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>과정</th>
                <th className={cx(thClass, "text-right")}>선수 프로그램</th>
                <th className={thClass}>합격 기준</th>
                <th className={thClass}>유효기간</th>
                <th className={cx(thClass, "text-right")}>신청</th>
                <th className={cx(thClass, "text-right")}>발급</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>수정일</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={trClass}>
                  <td className={cx(tdClass, "min-w-[240px] whitespace-normal!")}>
                    <Link href={`${base}/${p.id}`} className="font-medium hover:underline">
                      {p.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-micro text-subtle">/certifications/{p.slug}</p>
                  </td>
                  <td className={cx(tdClass, "tabular text-right")}>{p.requiredCourseIds.length}개</td>
                  <td className={cx(tdClass, "tabular text-muted")}>
                    시험 {p.examPassingScore}
                    {p.practicalRequired ? ` · 실기 ${p.practicalPassingScore}` : " · 실기 없음"}
                  </td>
                  <td className={cx(tdClass, "text-muted")}>
                    {validityLabel(p.validityMonths)}
                    {p.validityMonths != null && <span className="text-subtle"> · {p.renewalNoticeDays}일 전 알림</span>}
                  </td>
                  <td className={cx(tdClass, "tabular text-right")}>{p._count.applications}</td>
                  <td className={cx(tdClass, "tabular text-right")}>{p._count.credentials}</td>
                  <td className={tdClass}>
                    {p.active ? (
                      <Badge tone="green" dot>
                        공개
                      </Badge>
                    ) : (
                      <Badge tone="slate">비공개</Badge>
                    )}
                  </td>
                  <td className={cx(tdClass, "tabular text-subtle")}>{formatDate(p.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
