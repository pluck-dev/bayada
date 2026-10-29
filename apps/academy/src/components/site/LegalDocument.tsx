import { notFound } from "next/navigation";
import { prisma } from "@bayada/db";
import { formatDate } from "@/lib/labels";
import { sanitizeHtml } from "@/lib/sanitize-html";
import Link from "next/link";

/** 이용약관·개인정보처리방침·환불 규정 (Page 테이블, 어드민에서 수정). 문서가 없으면 404 */
export async function LegalDocument({ slug, locale }: { slug: "terms" | "privacy" | "refund"; locale: string }) {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) notFound();
  const other =
    slug === "terms"
      ? { href: `/${locale}/privacy`, label: "개인정보처리방침" }
      : { href: `/${locale}/terms`, label: "이용약관" };

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mx-auto max-w-[760px]">
        <nav aria-label="현재 위치" className="text-xs text-muted">
          <Link href={`/${locale}`} className="hover:text-ink">
            홈
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-soft">{page.title}</span>
        </nav>
        <h1 className="mt-3 text-[32px] font-bold tracking-[-0.02em] text-ink md:text-[40px]">{page.title}</h1>
        <p className="mt-3 text-sm text-muted">
          최종 수정일 <time dateTime={page.updatedAt.toISOString()}>{formatDate(page.updatedAt)}</time>
        </p>
        <article
          className="legal-prose mt-10 border-t border-line pt-8"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
        />
        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-6 py-5 text-sm">
          <span className="text-muted">함께 확인해 주세요</span>
          <Link href={other.href} className="font-semibold text-ink hover:text-brand">
            {other.label} →
          </Link>
        </div>
      </div>
    </div>
  );
}
