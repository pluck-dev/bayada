import Link from "next/link";
import { prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { PAGE_DOCS } from "@/lib/pages";
import { formatDateTime } from "@/lib/labels";
import { Badge, LinkButton, PageHeader, cx, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";

export default async function PagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("pages", locale);
  const rows = await prisma.page.findMany({ select: { slug: true, title: true, updatedAt: true, content: true } });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const base = `/${locale}/pages`;

  return (
    <>
      <PageHeader
        title="문서 관리"
        description="아카데미 하단에 연결되는 이용약관·개인정보처리방침·환불 규정 원문입니다. 저장하면 감사 로그에 남습니다."
      />
      <div className={tableWrap}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>문서</th>
              <th className={thClass}>slug</th>
              <th className={cx(thClass, "text-right")}>분량</th>
              <th className={thClass}>최종 수정일</th>
              <th className={cx(thClass, "w-px")} aria-label="작업" />
            </tr>
          </thead>
          <tbody>
            {PAGE_DOCS.map((d) => {
              const p = bySlug.get(d.slug);
              return (
                <tr key={d.slug} className={trClass}>
                  <td className={tdClass}>
                    {p ? (
                      <Link href={`${base}/${d.slug}`} className="font-bold text-ink transition-colors hover:text-brand">
                        {p.title}
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2 text-subtle">
                        {d.title}
                        <Badge tone="amber">미작성</Badge>
                      </span>
                    )}
                  </td>
                  <td className={cx(tdClass, "font-mono text-caption text-subtle")}>{d.slug}</td>
                  <td className={cx(tdClass, "tabular text-right text-muted")}>{p ? `${p.content.length.toLocaleString()}자` : "-"}</td>
                  <td className={cx(tdClass, "tabular text-subtle")}>{p ? formatDateTime(p.updatedAt) : "-"}</td>
                  <td className={tdClass}>
                    <LinkButton href={`${base}/${d.slug}`} size="sm" variant={p ? "secondary" : "primary"}>
                      {p ? "편집" : `${d.title} 만들기`}
                    </LinkButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
