import { getViewer } from "@/lib/viewer";
import { getTaxonomy } from "@/lib/queries/courses";
import { canManageOrg } from "@/lib/queries/business";
import { getActivePlans } from "@/lib/queries/pass";
import { getSiteSettings } from "@/lib/site-settings";
import { HeaderNav } from "./HeaderNav";

export async function SiteHeader({ locale }: { locale: string }) {
  const viewer = await getViewer();
  const [taxonomy, plans, settings] = await Promise.all([getTaxonomy(viewer), getActivePlans(), getSiteSettings()]);
  const { hidden } = settings["home.sections"];
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
      showOrg={!hidden.includes("upsell")}
      showFaq={!hidden.includes("faq") && settings.faq.items.length > 0}
    />
  );
}
