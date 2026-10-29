import { getViewer } from "@/lib/viewer";
import { getTaxonomy } from "@/lib/queries/courses";
import { canManageOrg } from "@/lib/queries/business";
import { getActivePlans } from "@/lib/queries/pass";
import { HeaderNav } from "./HeaderNav";

export async function SiteHeader({ locale }: { locale: string }) {
  const viewer = await getViewer();
  const [taxonomy, plans] = await Promise.all([getTaxonomy(viewer), getActivePlans()]);
  return (
    <HeaderNav
      locale={locale}
      user={
        viewer
          ? { name: viewer.name ?? viewer.email.split("@")[0], email: viewer.email, canManageOrg: canManageOrg(viewer) }
          : null
      }
      categories={taxonomy.categories}
      providers={taxonomy.providers}
      hasPass={plans.length > 0}
    />
  );
}
