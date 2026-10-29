import { prisma } from "@bayada/db";
import { SITE_SETTING_KEYS, resolveSiteSettings } from "@bayada/shared/site-settings";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { SiteSettingsForm } from "@/components/site-settings/SiteSettingsForm";

export default async function SiteSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("site.manage", locale);
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: SITE_SETTING_KEYS } } });
  const settings = resolveSiteSettings(rows);
  const savedAt = Object.fromEntries(rows.map((r) => [r.key, r.updatedAt.toISOString()]));
  const academyUrl = (process.env.ACADEMY_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://academy.bayada.co.kr").replace(/\/+$/, "");

  return (
    <>
      <PageHeader
        title="사이트 설정"
        description="아카데미(학습자 사이트) 홈 문구·섹션·FAQ·푸터·SEO 기본값입니다. 섹션별로 저장하며 저장 즉시 아카데미에 반영되고 감사 로그에 남습니다."
      />
      <SiteSettingsForm settings={settings} savedAt={savedAt} academyUrl={`${academyUrl}/ko`} />
    </>
  );
}
