import { getViewer } from "@/lib/viewer";
import { getTaxonomy } from "@/lib/queries/courses";
import { HeaderNav } from "./HeaderNav";

export async function SiteHeader({ locale }: { locale: string }) {
  const viewer = await getViewer();
  const taxonomy = await getTaxonomy(viewer);
  return (
    <HeaderNav
      locale={locale}
      user={viewer ? { name: viewer.name ?? viewer.email.split("@")[0], email: viewer.email } : null}
      categories={taxonomy.categories}
      providers={taxonomy.providers}
    />
  );
}
