import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { requirePage } from "@/lib/session";
import { getPartnerConsole } from "@/lib/queries/partners";
import { COURSE_STATUS_LABEL, COURSE_STATUS_TONE, LEARNING_MODE_LABEL, PRODUCT_TYPE_LABEL, formatDate } from "@/lib/labels";
import {
  Badge,
  EmptyState,
  LinkButton,
  PageHeader,
  Stat,
  cx,
  tableClass,
  tableWrap,
  tdClass,
  thClass,
  trClass,
} from "@/components/ui";
import { ProviderLogo } from "@/components/partners/ProviderLogo";

function rate(done: number, total: number): string {
  return total ? `${Math.round((done / total) * 100)}%` : "-";
}

export default async function PartnerConsolePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requirePage("partner.console", locale);
  // providerId 는 세션(DB)에서만 — URL·폼 값으로 다른 기관을 볼 수 없다
  const { provider, rows, totals } = await getPartnerConsole(user.providerId!);
  if (!provider) notFound();
  const base = `/${locale}/partner-console`;
  const published = rows.filter((r) => r.status === "PUBLISHED").length;
  const changes = rows.filter((r) => r.status === "CHANGES_REQUESTED").length;

  return (
    <>
      <PageHeader title="파트너 콘솔" description="우리 기관 프로그램을 작성하고 승인 요청합니다. 승인·게시와 메인 노출은 바야다 운영자가 결정합니다." />

      <div className="mb-4 flex items-center gap-4 surface-card rounded-[22px] bg-canvas px-6 py-5">
        <ProviderLogo name={provider.name} logo={provider.logo} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold tracking-[-0.01em]">{provider.name}</p>
          <p className="mt-0.5 text-caption text-muted">{provider.description ?? "외부 파트너 제공기관"} · 담당 {user.name ?? user.email}</p>
        </div>
        <LinkButton href={`${base}/programs/new`} variant="primary">
          <Plus className="h-3.5 w-3.5" aria-hidden />
          프로그램 등록
        </LinkButton>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-3">
        <Stat tone="brand" label="프로그램" value={rows.length} hint={changes ? `수정 요청 ${changes}개` : undefined} />
        <Stat tone="ink" label="게시 중" value={published} />
        <Stat label="누적 수강" value={totals.enrollments.toLocaleString()} hint="전체 프로그램 합계 (인원)" />
        <Stat label="수료율" value={rate(totals.completed, totals.enrollments)} hint={`수료 ${totals.completed.toLocaleString()}명`} />
      </div>

      <div className={tableWrap}>
        {rows.length === 0 ? (
          <EmptyState title="아직 등록한 프로그램이 없습니다" description="프로그램 등록으로 작성(draft)을 시작하세요." />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>프로그램명</th>
                <th className={thClass}>유형</th>
                <th className={thClass}>학습 방식</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>수정 요청 사유</th>
                <th className={cx(thClass, "text-right")}>수강자</th>
                <th className={cx(thClass, "text-right")}>수료율</th>
                <th className={thClass}>수정일</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={trClass}>
                  <td className={cx(tdClass, "min-w-[240px] whitespace-normal!")}>
                    <Link href={`${base}/programs/${r.id}`} className="font-bold text-ink transition-colors hover:text-brand">
                      {r.title}
                    </Link>
                  </td>
                  <td className={cx(tdClass, "text-muted")}>{PRODUCT_TYPE_LABEL[r.productType]}</td>
                  <td className={cx(tdClass, "text-muted")}>{LEARNING_MODE_LABEL[r.learningMode].split(" ")[0]}</td>
                  <td className={tdClass}>
                    <Badge tone={COURSE_STATUS_TONE[r.status]} dot>
                      {COURSE_STATUS_LABEL[r.status]}
                    </Badge>
                  </td>
                  <td className={cx(tdClass, "max-w-[260px] truncate", r.status === "CHANGES_REQUESTED" ? "text-warning" : "text-zinc-400")} data-tip={r.reviewNote ?? undefined}>
                    {r.status === "CHANGES_REQUESTED" && r.reviewNote ? r.reviewNote : "-"}
                  </td>
                  <td className={cx(tdClass, "tabular text-right")}>{r.enrollments ? r.enrollments.toLocaleString() : "-"}</td>
                  <td className={cx(tdClass, "tabular text-right")}>{rate(r.completed, r.enrollments)}</td>
                  <td className={cx(tdClass, "tabular text-subtle")}>{formatDate(r.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-3 text-caption leading-relaxed text-muted">
        제출 전 필수 항목(학습목표·대상 직군·소요시간·커리큘럼·제공기관)을 채워야 승인 요청할 수 있습니다. 수강 통계는 개인정보 보호를 위해 인원과 수료율만
        보여 줍니다.
      </p>
    </>
  );
}
