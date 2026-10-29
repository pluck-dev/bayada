import { requirePage } from "@/lib/session";
import { getTaxonomy } from "@/lib/queries/admin";
import { PageHeader } from "@/components/ui";
import { CategoryManager, ProviderManager } from "@/components/taxonomy/TaxonomyManagers";

export default async function TaxonomyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("taxonomy", locale);
  const { categories, providers } = await getTaxonomy();

  return (
    <>
      <PageHeader
        title="택소노미"
        description="카탈로그 분류(카테고리)와 제공기관을 관리합니다. 대상 직군·유형·난이도는 고정 축이라 프로그램 편집에서 고릅니다."
      />
      <div className="grid grid-cols-2 items-start gap-6">
        <CategoryManager rows={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, order: c.order, count: c._count.courses }))} />
        <ProviderManager
          rows={providers.map((p) => ({ id: p.id, name: p.name, slug: p.slug, logo: p.logo, isPartner: p.isPartner, count: p._count.courses }))}
        />
      </div>
    </>
  );
}
