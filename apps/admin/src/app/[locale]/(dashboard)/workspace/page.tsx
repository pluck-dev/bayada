import { requirePage } from "@/lib/session";
import { ProjectWorkspace } from "@/components/project-workspace/ProjectWorkspace";

export const metadata = { title: "프로젝트 협의 · BAYADA" };

export default async function ProjectWorkspacePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requirePage("project.workspace", locale);
  return <ProjectWorkspace locale={locale} canInvite={user.roleKey === "ADMIN"} />;
}
