import { requirePage } from "@/lib/session";
import { sessionCourseOptions } from "@/lib/queries/sessions";
import { PageHeader } from "@/components/ui";
import { SessionForm } from "@/components/sessions/SessionForm";

export default async function NewSessionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("session", locale);
  const courses = await sessionCourseOptions();

  return (
    <div className="max-w-[860px]">
      <PageHeader title="새 실습 일정" back={{ href: `/${locale}/sessions`, label: "실습·오프라인 일정" }} />
      <SessionForm
        locale={locale}
        courses={courses}
        initial={{ courseId: "", title: "", region: "", location: "", startsAt: "", endsAt: "", capacity: 20, note: "" }}
      />
    </div>
  );
}
