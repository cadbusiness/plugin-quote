import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { DataTable, ListPanel } from "@/components/ui/list-panel";
import { Chip } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { CreateFunnelDialog } from "@/components/dashboard/create-funnel-dialog";
import { getTemplateFamily } from "@/lib/funnels/templates";
import { parseOrgFamily } from "@/lib/funnels/families";
import { funnelKindLabel, funnelKindTone, parseFunnelKind } from "@/lib/funnels/kind";
import { loadStatsDashboard } from "@/lib/stats/dashboard";
import { formatPercent } from "@/lib/format";

export default async function FunnelsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  const [{ data: funnels }, stats] = await Promise.all([
    supabase
      .from("configurators")
      .select("id, name, slug, sector, wizard_enabled, chat_enabled, is_active, theme")
      .eq("organization_id", ctx.organization.id)
      .order("created_at", { ascending: false }),
    loadStatsDashboard(supabase, ctx.organization.id, "month"),
  ]);

  const list = funnels ?? [];
  const byId = new Map(stats.funnels.map((row) => [row.id, row]));

  return (
    <ListPanel>
      <DataTable headers={["Funnel", "Famille", "Type", "30 j", "Lien public"]}>
        {list.map((funnel) => {
          const family = getTemplateFamily(funnel.sector);
          const href = `/c/${ctx.organization.slug}/${funnel.slug}`;
          const kind = parseFunnelKind(funnel.theme, funnel.wizard_enabled, funnel.chat_enabled);
          const row = byId.get(funnel.id);
          return (
            <ClickableRow key={funnel.id} href={`/funnels/${funnel.id}?tab=stats`}>
              <td className="px-4 py-3 lg:px-6">
                <div className="font-medium text-slate-900">{funnel.name}</div>
                <Chip tone={funnel.is_active ? "emerald" : "amber"}>
                  {funnel.is_active ? "Actif" : "Brouillon"}
                </Chip>
              </td>
              <td className="px-4 py-3 lg:px-6">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${family.tint}`}>
                  {family.label}
                </span>
              </td>
              <td className="px-4 py-3 lg:px-6">
                <Chip tone={funnelKindTone(kind)}>{funnelKindLabel(kind)}</Chip>
              </td>
              <td className="px-4 py-3 lg:px-6">
                {row ? (
                  <>
                    <div className="tabular-nums text-slate-900">{row.quotes} devis</div>
                    <Chip tone={row.conversion && row.conversion >= 10 ? "emerald" : "orange"}>
                      {formatPercent(row.conversion)}
                    </Chip>
                  </>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 lg:px-6">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  title="Ouvrir le lien public"
                  className="relative z-10 inline-flex max-w-[16rem] items-center truncate rounded-md bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-orange-50 hover:text-[#C2410C] hover:ring-orange-200"
                >
                  /{ctx.organization.slug}/{funnel.slug}
                </a>
              </td>
            </ClickableRow>
          );
        })}
      </DataTable>
      {list.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          Créez un premier funnel : une famille, un template, vos écrans, puis le catalogue.
        </p>
      ) : null}
      <CreateFunnelDialog
        existingFunnels={list.map((f) => ({ id: f.id, name: f.name }))}
        defaultFamily={parseOrgFamily(ctx.organization.branding)}
      />
    </ListPanel>
  );
}
