import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { Chip } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { CreateFunnelDialog } from "@/components/dashboard/create-funnel-dialog";
import { getFunnelTemplate } from "@/lib/funnels/templates";

export default async function FunnelsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  const { data: funnels } = await supabase
    .from("configurators")
    .select("id, name, slug, sector, wizard_enabled, chat_enabled, is_active")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });

  const list = funnels ?? [];

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          {list.length} funnel{list.length > 1 ? "s" : ""}
        </p>
        <CreateFunnelDialog existingFunnels={list.map((f) => ({ id: f.id, name: f.name }))} />
      </ListToolbar>
      <DataTable headers={["Funnel", "Secteur", "Modes", "Lien public"]}>
        {list.map((funnel) => {
          const template = getFunnelTemplate(funnel.sector);
          const href = `/c/${ctx.organization.slug}/${funnel.slug}`;
          return (
            <ClickableRow key={funnel.id} href={`/funnels/${funnel.id}`}>
              <td className="px-4 py-3 lg:px-6">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-8 w-1.5 shrink-0 rounded-full"
                    style={{ background: template.accent }}
                    aria-hidden
                  />
                  <div>
                    <div className="font-medium text-slate-900">{funnel.name}</div>
                    <Chip tone={funnel.is_active ? "emerald" : "amber"}>
                      {funnel.is_active ? "Actif" : "Brouillon"}
                    </Chip>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 lg:px-6">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${template.tint}`}>
                  {template.label}
                </span>
              </td>
              <td className="px-4 py-3 lg:px-6">
                <div className="flex flex-wrap gap-1.5">
                  {funnel.wizard_enabled ? <Chip tone="orange">Funnel</Chip> : null}
                  {funnel.chat_enabled ? <Chip tone="violet">Chat IA</Chip> : null}
                  {!funnel.wizard_enabled && !funnel.chat_enabled ? (
                    <span className="text-slate-400">—</span>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 lg:px-6">
                <Link href={href} className="relative z-10 text-sm text-sky-700 underline" target="_blank">
                  {href}
                </Link>
              </td>
            </ClickableRow>
          );
        })}
      </DataTable>
      {list.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          Créez un premier funnel — un template de secteur, vos écrans, puis le catalogue.
        </p>
      ) : null}
    </ListPanel>
  );
}
