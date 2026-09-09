import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel } from "@/components/ui/list-panel";
import { HomeDashboardView } from "@/components/home/home-dashboard";
import { HomeModulesDialog } from "@/components/home/home-modules-dialog";
import { HOME_MODULES, loadHomeDashboard, resolveHomeModules } from "@/lib/crm/home";

export default async function AccueilPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const isAdmin = isAdminRole(ctx.role);
  const cookie = (await cookies()).get("qb-home-modules")?.value;
  const modules = resolveHomeModules({
    cookie,
    branding: ctx.organization.branding,
    isAdmin,
  });
  const catalog = HOME_MODULES.filter((item) => !item.admin || isAdmin);
  const supabase = await createClient();
  const data = await loadHomeDashboard(supabase, ctx.organization.id, ctx.organization.slug, modules);

  return (
    <ListPanel>
      <HomeDashboardView data={data} />
      <HomeModulesDialog catalog={catalog} enabled={modules} />
    </ListPanel>
  );
}
