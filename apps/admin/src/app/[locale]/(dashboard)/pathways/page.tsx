import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePage } from "@/lib/session";
import { listPathways } from "@/lib/queries/pathways";
import { JOB_ROLE_LABEL, formatDate, formatDateTime } from "@/lib/labels";
import { Badge, EmptyState, LinkButton, PageHeader, cx, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";

export default async function PathwaysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("pathway", locale);
  const rows = await listPathways();
  const base = `/${locale}/pathways`;

  return (
    <>
      <PageHeader
        title="커리어 패스웨이"
        description="국가·직군별 커리어 경로와 단계를 관리합니다. 정보 기준일과 단계가 있어야 게시할 수 있고, 게시하면 아카데미 홈·목록에 바로 보입니다."
        actions={
          <LinkButton href={`${base}/new`} variant="primary">
            <Plus className="h-3.5 w-3.5" aria-hidden />새 패스웨이
          </LinkButton>
        }
      />

      <div className={tableWrap}>
        {rows.length === 0 ? (
          <EmptyState
            title="등록된 커리어 패스웨이가 없습니다"
            description="새 패스웨이를 만들고 게시하면 아카데미 홈 ⑤ 섹션과 /pathways 에 나타납니다."
          />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>국가</th>
                <th className={thClass}>패스웨이</th>
                <th className={thClass}>직군</th>
                <th className={cx(thClass, "text-right")}>단계</th>
                <th className={cx(thClass, "text-right")}>목표 설정</th>
                <th className={thClass}>정보 기준일</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>최종 수정</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={trClass}>
                  <td className={cx(tdClass, "font-medium")}>{p.country}</td>
                  <td className={cx(tdClass, "min-w-[260px] whitespace-normal!")}>
                    <Link href={`${base}/${p.id}`} className="font-medium hover:underline">
                      {p.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-[11.5px] text-subtle">{p.slug}</p>
                  </td>
                  <td className={cx(tdClass, "text-zinc-600")}>{p.jobRole ? JOB_ROLE_LABEL[p.jobRole] : "-"}</td>
                  <td className={cx(tdClass, "tabular text-right")}>{p._count.steps}</td>
                  <td className={cx(tdClass, "tabular text-right")}>{p._count.goals.toLocaleString()}</td>
                  <td className={cx(tdClass, "tabular text-zinc-600")}>
                    {p.infoAsOf ? formatDate(p.infoAsOf) : <Badge tone="amber">미입력</Badge>}
                  </td>
                  <td className={tdClass}>
                    {p.published ? (
                      <Badge tone="green" dot>
                        게시 중
                      </Badge>
                    ) : (
                      <Badge tone="slate">비공개</Badge>
                    )}
                  </td>
                  <td className={cx(tdClass, "tabular text-zinc-600")}>{formatDateTime(p.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
