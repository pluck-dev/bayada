import { prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { FaqManager } from "@/components/web/FaqManager";

export default async function WebFaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("web.content", locale);
  const categories = await prisma.webFaqCategory.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { items: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
  });
  return (
    <>
      <PageHeader
        title="자주 묻는 질문"
        description="홈페이지 /faq 페이지의 카테고리와 질문입니다. 숨긴 질문은 홈페이지에 나오지 않고, 질문이 없는 카테고리는 탭에서 빠집니다."
      />
      <FaqManager
        categories={categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          items: c.items.map((i) => ({ id: i.id, question: i.question, answer: i.answer, visible: i.visible })),
        }))}
      />
    </>
  );
}
