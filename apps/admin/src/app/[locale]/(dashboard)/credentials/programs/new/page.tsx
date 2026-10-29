import { requirePage } from "@/lib/session";
import { requiredCourseOptions } from "@/lib/queries/credentials";
import { EMPTY_CREDENTIAL_PROGRAM } from "@/lib/credentials";
import { PageHeader } from "@/components/ui";
import { CredentialProgramForm } from "@/components/credentials/CredentialProgramForm";

export default async function NewCredentialProgramPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("credential.program", locale);
  const courses = await requiredCourseOptions();

  return (
    <div className="max-w-[860px]">
      <PageHeader title="새 인증 과정" back={{ href: `/${locale}/credentials/programs`, label: "인증 과정" }} />
      <CredentialProgramForm locale={locale} courses={courses} initial={EMPTY_CREDENTIAL_PROGRAM} />
    </div>
  );
}
