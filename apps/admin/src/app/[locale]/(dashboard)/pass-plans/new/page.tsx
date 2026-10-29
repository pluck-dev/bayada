import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { PassPlanForm } from "@/components/pass-plans/PassPlanForm";

export default async function NewPassPlanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("commerce", locale);
  return (
    <>
      <PageHeader title="새 패스 요금제" back={{ href: `/${locale}/pass-plans`, label: "패스 요금제" }} />
      <PassPlanForm
        locale={locale}
        initial={{ name: "", description: "", price: 0, durationDays: 30, includes: ["COURSE"], active: true }}
      />
    </>
  );
}
