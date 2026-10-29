import { notFound } from "next/navigation";
import { prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { pageDoc } from "@/lib/pages";
import { formatDateTime } from "@/lib/labels";
import { Badge, PageHeader } from "@/components/ui";
import { PageEditor } from "@/components/pages/PageEditor";

export default async function PageEditPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  await requirePage("pages", locale);
  const doc = pageDoc(slug);
  if (!doc) notFound();
  const page = await prisma.page.findUnique({ where: { slug } });

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/pages`, label: "문서 관리" }}
        title={page?.title ?? doc.title}
        description={
          <span className="flex items-center gap-2">
            <span className="font-mono text-[12px]">{slug}</span>
            <span className="text-subtle">·</span>
            {page ? <span>최종 수정 {formatDateTime(page.updatedAt)}</span> : <Badge tone="amber">아직 없는 문서 — 저장하면 만들어집니다</Badge>}
          </span>
        }
      />
      <PageEditor
        slug={slug}
        initialTitle={page?.title ?? doc.title}
        initialContent={page?.content ?? ""}
        updatedAt={page ? page.updatedAt.toISOString() : null}
      />
    </>
  );
}
