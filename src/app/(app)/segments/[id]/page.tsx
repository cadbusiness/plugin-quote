import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SegmentEditor } from "@/components/segments/segment-editor";
import { Chip, scoreTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { getOrgContext } from "@/lib/auth/org";
import { loadFunnelQuestions, resolveSegment } from "@/lib/segments/resolve";
import { createClient } from "@/lib/supabase/server";

export default async function SegmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const { id } = await params;
  const supabase = await createClient();
  const { data: segment } = await supabase
    .from("contact_segments")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!segment) notFound();

  const [{ data: funnels }, { data: statuses }, questions, members] = await Promise.all([
    supabase.from("configurators").select("id, name").eq("organization_id", ctx.organization.id).order("name"),
    supabase.from("quote_statuses").select("slug, label").eq("organization_id", ctx.organization.id).order("position"),
    loadFunnelQuestions(supabase, ctx.organization.id),
    resolveSegment(supabase, ctx.organization.id, segment.rules),
  ]);

  return (
    <ListPanel>
      <ListToolbar>
        <Link href="/segments" className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
          Segmentation
        </Link>
        <p className="mr-auto text-sm text-slate-500">{members.length} contact{members.length > 1 ? "s" : ""}</p>
        <Link
          href={`/emails#nouveau`}
          className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
        >
          Email à ce segment
        </Link>
      </ListToolbar>

      <SegmentEditor
        segment={segment}
        funnels={funnels ?? []}
        statuses={statuses ?? []}
        questions={questions}
      />

      {members.length ? (
        <DataTable headers={["Contact", "Audience", "Score", "Dernier email"]}>
          {members.slice(0, 80).map((member) => (
            <ClickableRow key={member.id} href={`/devis/${member.id}`}>
              <td className="px-4 py-3 lg:px-6">
                <span className="block font-medium text-slate-900">{member.contactName}</span>
                <span className="block text-xs text-slate-500">{member.contactEmail}</span>
              </td>
              <td className="px-4 py-3 lg:px-6">
                <Chip tone={member.contactCompany ? "indigo" : "sky"}>
                  {member.contactCompany ? "B2B" : "B2C"}
                </Chip>
              </td>
              <td className="px-4 py-3 lg:px-6">
                <Chip tone={scoreTone(member.scoreLabel)}>{(member.scoreLabel ?? "-").toUpperCase()}</Chip>
              </td>
              <td className="px-4 py-3 text-slate-500 lg:px-6">
                {member.lastCampaignAt ? "Déjà relancé" : "Jamais"}
              </td>
            </ClickableRow>
          ))}
        </DataTable>
      ) : (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">Aucun contact ne correspond encore à ces règles.</p>
      )}
    </ListPanel>
  );
}
