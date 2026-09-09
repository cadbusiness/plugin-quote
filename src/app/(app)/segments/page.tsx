import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/auth/org";
import { Chip } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { CreateSegmentDialog } from "@/components/segments/create-segment-dialog";
import { parseSegmentRules } from "@/lib/segments/match";
import { loadFunnelQuestions, resolveSegment } from "@/lib/segments/resolve";
import { FIELD_LABELS } from "@/lib/segments/types";
import { createClient } from "@/lib/supabase/server";

export default async function SegmentsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const [{ data: segments }, { data: funnels }, { data: statuses }, questions] = await Promise.all([
    supabase.from("contact_segments").select("*").eq("organization_id", ctx.organization.id).order("created_at", { ascending: false }),
    supabase.from("configurators").select("id, name").eq("organization_id", ctx.organization.id).order("name"),
    supabase.from("quote_statuses").select("slug, label").eq("organization_id", ctx.organization.id).order("position"),
    loadFunnelQuestions(supabase, ctx.organization.id),
  ]);

  const rows = segments ?? [];
  const counts = await Promise.all(
    rows.map(async (segment) => {
      const members = await resolveSegment(supabase, ctx.organization.id, segment.rules);
      return [segment.id, members.length] as const;
    }),
  );
  const countById = new Map(counts);

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          Découpez les clients : B2B / B2C, réponses de funnel, score, déjà relancés.
        </p>
        <CreateSegmentDialog funnels={funnels ?? []} statuses={statuses ?? []} questions={questions} />
      </ListToolbar>

      {rows.length ? (
        <DataTable headers={["Segment", "Règles", "Contacts"]}>
          {rows.map((segment) => {
            const rules = parseSegmentRules(segment.rules).all;
            return (
              <ClickableRow key={segment.id} href={`/segments/${segment.id}`}>
                <td className="px-4 py-3 lg:px-6">
                  <span className="block font-medium text-slate-900">{segment.name}</span>
                  {segment.description ? (
                    <span className="block text-xs text-slate-500">{segment.description}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 lg:px-6">
                  <div className="flex flex-wrap gap-1">
                    {rules.length ? (
                      rules.map((rule, index) => (
                        <Chip key={`${rule.field}-${index}`} tone={rule.field === "audience" ? "indigo" : "orange"}>
                          {FIELD_LABELS[rule.field] ?? rule.field}
                        </Chip>
                      ))
                    ) : (
                      <Chip tone="slate">Tous</Chip>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums lg:px-6">{countById.get(segment.id) ?? 0}</td>
              </ClickableRow>
            );
          })}
        </DataTable>
      ) : (
        <div className="px-4 py-16 text-center lg:px-6">
          <p className="text-sm font-medium text-slate-900">Aucun segment</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Un segment B2B, un segment « cuisine haut de gamme », un segment jamais relancé. Les campagnes s’appuient dessus.
          </p>
          <p className="mt-4">
            <a href="#nouveau" className="text-sm font-medium text-[#C2410C] underline">
              Nouveau segment
            </a>
          </p>
        </div>
      )}
    </ListPanel>
  );
}
