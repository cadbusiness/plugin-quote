import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { Chip } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { CreateMemberSpaceDialog } from "@/components/members/create-member-space-dialog";
import { MemberSpaceRowActions } from "@/components/members/member-space-row-actions";
import { DataTable, ListPanel } from "@/components/ui/list-panel";
import { parseStatus } from "@/lib/members/parse";
import { memberSpaceAbsoluteUrl } from "@/lib/members/urls";
import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const STATUS_COPY: Record<string, { label: string; tone: "emerald" | "slate" | "amber" }> = {
  published: { label: "En ligne", tone: "emerald" },
  draft: { label: "Brouillon", tone: "amber" },
  archived: { label: "Archivé", tone: "slate" },
};

export default async function MembresPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const supabase = await createClient();
  const { data: spaces, error } = await supabase
    .from("member_spaces")
    .select("id, name, slug, status, published_at, updated_at")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });

  const list = error ? [] : (spaces ?? []);
  const origin = getAppUrl();
  const missingTable = Boolean(error);

  return (
    <ListPanel>
      {missingTable ? (
        <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">
          L’espace membres n’est pas encore activé sur cette base. Appliquez la migration 0040_member_spaces.
        </p>
      ) : list.length ? (
        <DataTable headers={["Espace", "Lien", "État", ""]} columnClassNames={["", "", "", "w-px text-right"]}>
          {list.map((space) => {
            const status = parseStatus(space.status);
            const copy = STATUS_COPY[status] ?? STATUS_COPY.draft;
            const publicUrl = memberSpaceAbsoluteUrl(origin, ctx.organization.slug, space.slug);
            return (
              <ClickableRow key={space.id} href={`/membres/${space.id}`}>
                <td className="px-4 py-3 lg:px-6">
                  <div className={`font-medium ${status === "archived" ? "text-slate-500" : "text-slate-900"}`}>
                    {space.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 lg:px-6">
                  <a href={publicUrl} target="_blank" rel="noreferrer" className="hover:text-slate-900">
                    /m/{ctx.organization.slug}/{space.slug}
                  </a>
                </td>
                <td className="px-4 py-3 lg:px-6">
                  <Chip tone={copy.tone}>{copy.label}</Chip>
                </td>
                <td className="whitespace-nowrap px-4 py-3 lg:px-6">
                  <MemberSpaceRowActions
                    spaceId={space.id}
                    name={space.name}
                    publicUrl={publicUrl}
                    archived={status === "archived"}
                  />
                </td>
              </ClickableRow>
            );
          })}
        </DataTable>
      ) : (
        <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">
          Créez un espace membres : vos clients y retrouvent tous leurs devis, plus les documents et plugins que vous
          ajoutez.
        </p>
      )}
      <CreateMemberSpaceDialog orgName={ctx.organization.name} />
    </ListPanel>
  );
}
