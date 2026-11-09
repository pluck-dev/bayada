import { prisma } from "@bayada/db";
import { WEB_SETTING_KEYS, resolveWebSettings } from "@bayada/shared/web-content";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { WebSettingsForm } from "@/components/web/WebSettingsForm";

export default async function WebSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("web.settings", locale);
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: WEB_SETTING_KEYS } } });
  const savedAt = Object.fromEntries(rows.map((r) => [r.key, r.updatedAt.toISOString()]));
  return (
    <>
      <PageHeader
        title="사이트 정보"
        description="홈페이지 푸터와 문의 페이지의 회사·연락처, SNS 링크, 새 문의 알림 메일입니다. 저장하면 홈페이지가 다시 만들어지고 감사 로그에 남습니다."
      />
      <WebSettingsForm settings={resolveWebSettings(rows)} savedAt={savedAt} />
    </>
  );
}
