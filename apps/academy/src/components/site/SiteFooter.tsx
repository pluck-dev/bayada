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
    <footer className="mt-8 bg-side text-white print:hidden">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 pb-12 pt-16 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="col-span-2 md:col-span-1">
          {footer.tagline && <p className="max-w-[260px] text-body-sm leading-relaxed text-white/70">{footer.tagline}</p>}
          {footer.sns.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="SNS">
              {footer.sns.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center rounded-full bg-white/10 px-4 text-caption font-semibold text-white transition-colors hover:bg-white/20"
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
            <p className="text-body-sm font-bold text-white">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-body-sm text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-page">
        <Link href={base} aria-label="BAYADA Academy 홈" className="block select-none border-t border-white/10 pt-10 pb-6">
          <span className="block text-[15vw] font-black leading-[0.85] tracking-[-0.05em] text-white md:text-[128px]">
            BAYADA<span className="text-brand">.</span>
          </span>
          <span className="mt-2 block text-body font-bold tracking-tight text-white/70 md:text-title">Academy</span>
        </Link>
      </div>
      <div className="container-page flex flex-col gap-3 pb-10 pt-4 text-caption text-white/55 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <nav aria-label="약관 및 정책" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href={`${base}/terms`} className="font-semibold text-white/80 hover:text-white">
              이용약관
            </Link>
            <Link href={`${base}/privacy`} className="font-bold text-white hover:underline underline-offset-4">
              개인정보처리방침
            </Link>
            {refundPage && (
              <Link href={`${base}/refund`} className="font-semibold text-white/80 hover:text-white">
                환불 규정
              </Link>
            )}
          </nav>
          {(footer.companyInfo || footer.businessLine) && (
            <div className="space-y-0.5 leading-relaxed">
              {footer.companyInfo
                .split(/\r?\n/)
                .filter((l) => l.trim())
                .map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              {footer.businessLine && <p>{footer.businessLine}</p>}
            </div>
          )}
          <p>
            © {new Date().getFullYear()} {footer.copyright}
          </p>
        </div>
        {(footer.contactEmail || footer.contactPhone) && (
          <p className="flex flex-wrap gap-x-2">
            <span>운영 문의</span>
            {footer.contactEmail && (
              <a href={`mailto:${footer.contactEmail}`} className="font-semibold text-white/80 hover:text-white">
                {footer.contactEmail}
              </a>
            )}
            {footer.contactPhone && (
              <a href={`tel:${footer.contactPhone.replace(/[^0-9+]/g, "")}`} className="tabular-nums font-semibold text-white/80 hover:text-white">
                {footer.contactPhone}
              </a>
            )}
          </p>
        )}
      </div>
    </footer>
  );
}
