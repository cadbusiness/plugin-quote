import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";

export default async function AbandonedSessionsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("quote_sessions")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .is("submitted_quote_id", null)
    .order("last_activity_at", { ascending: false });

  const abandoned = (sessions ?? []).filter((s) => {
    const draft = (s.contact_draft ?? {}) as { email?: string };
    return Boolean(draft.email);
  });

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          Configurations sauvegardées, pas encore soumises.
        </p>
      </ListToolbar>
      <DataTable headers={["Prospect", "Email", "Étape", "Dernière activité"]}>
        {abandoned.map((session) => {
          const draft = (session.contact_draft ?? {}) as { name?: string; email?: string };
          return (
            <tr key={session.id} className="border-b border-slate-100">
              <td className="px-4 py-2.5 lg:px-6">{draft.name || "—"}</td>
              <td className="px-4 py-2.5 lg:px-6">{draft.email}</td>
              <td className="px-4 py-2.5 lg:px-6">{session.current_step + 1}</td>
              <td className="px-4 py-2.5 text-slate-500 lg:px-6">
                {new Date(session.last_activity_at ?? session.updated_at).toLocaleString("fr-FR")}
              </td>
            </tr>
          );
        })}
      </DataTable>
    </ListPanel>
  );
}
