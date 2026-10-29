import Link from "next/link";
import { prisma } from "@bayada/db";
import { JOB_ROLES, JOB_ROLE_LABEL, PRODUCT_TYPES, PRODUCT_TYPE_LABEL } from "@/lib/labels";
import { INQUIRY_EMAIL, INQUIRY_MAILTO } from "@/lib/site";

export async function SiteFooter({ locale }: { locale: string }) {
  const base = `/${locale}`;
  const catalog = `${base}/courses`;
  const [categories, refundPage] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
      take: 6,
    }),
    // 환불 규정은 어드민 문서 관리에서 만들었을 때만 링크
    prisma.page.findUnique({ where: { slug: "refund" }, select: { id: true } }),
  ]);

  const columns: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: "직군별 학습",
      links: JOB_ROLES.map((r) => ({ label: JOB_ROLE_LABEL[r], href: `${catalog}?audience=${r}` })),
    },
    {
      title: "프로그램",
      links: [
        { label: "전체 프로그램", href: catalog },
        ...PRODUCT_TYPES.map((t) => ({ label: PRODUCT_TYPE_LABEL[t], href: `${catalog}?type=${t}` })),
        { label: "신규 프로그램", href: `${catalog}?sort=newest` },
      ],
    },
    {
      title: "주제",
      links: categories.map((c) => ({ label: c.name, href: `${catalog}?category=${encodeURIComponent(c.slug)}` })),
    },
    {
      title: "고객센터",
      links: [
        { label: "자주 묻는 질문", href: `${base}#faq` },
        { label: "기관 도입 문의", href: INQUIRY_MAILTO },
        { label: "수료증 검증", href: `${base}/verify` },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-line bg-surface print:hidden">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div>
          <Link href={base} className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold tracking-tight text-brand">BAYADA</span>
            <span className="text-sm font-semibold text-ink">Academy</span>
          </Link>
          <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-muted">
            돌봄 현장의 전문성을 키우는 바야다홈헬스케어의 온라인 아카데미
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-ink">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-5">
            <nav aria-label="약관 및 정책" className="flex items-center gap-2">
              <Link href={`${base}/terms`} className="font-medium text-ink-soft hover:text-ink">
                이용약관
              </Link>
              <span aria-hidden className="text-line">·</span>
              <Link href={`${base}/privacy`} className="font-semibold text-ink hover:text-brand">
                개인정보처리방침
              </Link>
              {refundPage && (
                <>
                  <span aria-hidden className="text-line">·</span>
                  <Link href={`${base}/refund`} className="font-medium text-ink-soft hover:text-ink">
                    환불 규정
                  </Link>
                </>
              )}
            </nav>
            <p>© {new Date().getFullYear()} BAYADA Home Health Care Korea. All rights reserved.</p>
          </div>
          <p>
            운영 문의 <a href={`mailto:${INQUIRY_EMAIL}`} className="hover:text-ink">{INQUIRY_EMAIL}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
