import { buttonVariants } from "@bayada/ui";
import Link from "next/link";
import { prisma } from "@bayada/db";
import { JOB_ROLES, JOB_ROLE_LABEL, PRODUCT_TYPES, PRODUCT_TYPE_LABEL } from "@/lib/labels";
import { inquiryHref } from "@bayada/shared/site-settings";
import { getSiteSettings } from "@/lib/site-settings";

export async function SiteFooter({ locale }: { locale: string }) {
  const base = `/${locale}`;
  const catalog = `${base}/courses`;
  const [categories, refundPage, settings] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
      take: 6,
    }),
    // 환불 규정은 어드민 문서 관리에서 만들었을 때만 링크
    prisma.page.findUnique({ where: { slug: "refund" }, select: { id: true } }),
    getSiteSettings(),
  ]);
  const { footer, faq } = settings;
  const sections = settings["home.sections"];
  const faqVisible = !sections.hidden.includes("faq") && faq.items.length > 0;

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
        ...(faqVisible ? [{ label: faq.title || "자주 묻는 질문", href: `${base}#faq` }] : []),
        { label: "기관 도입 문의", href: inquiryHref(settings.inquiry) },
        { label: "수료증 검증", href: `${base}/verify` },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-surface print:hidden">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="col-span-2 md:col-span-1">
          <Link href={base} className="flex items-baseline gap-1.5">
            <span className="text-title font-extrabold tracking-tight text-brand">BAYADA</span>
            <span className="text-body-sm font-semibold text-ink">Academy</span>
          </Link>
          {footer.tagline && <p className="mt-3 max-w-[240px] text-body-sm leading-relaxed text-muted">{footer.tagline}</p>}
          {footer.sns.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="SNS">
              {footer.sns.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-body-sm font-semibold text-ink">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-body-sm text-muted transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-caption text-muted md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-5">
            <nav aria-label="약관 및 정책" className="flex items-center gap-2">
              <Link href={`${base}/terms`} className="font-medium text-ink-soft hover:text-ink">
                이용약관
              </Link>
              <span aria-hidden className="text-line">·</span>
              <Link href={`${base}/privacy`} className="font-semibold text-ink underline-offset-4 hover:underline">
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
            <p>
              © {new Date().getFullYear()} {footer.copyright}
            </p>
          </div>
          {(footer.contactEmail || footer.contactPhone) && (
            <p className="flex flex-wrap gap-x-1">
              <span>운영 문의</span>
              {footer.contactEmail && (
                <a href={`mailto:${footer.contactEmail}`} className="hover:text-ink">
                  {footer.contactEmail}
                </a>
              )}
              {footer.contactPhone && (
                <a href={`tel:${footer.contactPhone.replace(/[^0-9+]/g, "")}`} className="tabular-nums hover:text-ink">
                  {footer.contactPhone}
                </a>
              )}
            </p>
          )}
        </div>
        {(footer.companyInfo || footer.businessLine) && (
          <div className="container-page space-y-1 pb-6 text-caption leading-relaxed text-subtle">
            {footer.companyInfo
              .split(/\r?\n/)
              .filter((l) => l.trim())
              .map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            {footer.businessLine && <p>{footer.businessLine}</p>}
          </div>
        )}
      </div>
    </footer>
  );
}
