import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { ListPanel } from "@/components/ui/list-panel";
import { AbandonSessionsView } from "@/components/crm/abandon-sessions";
import { loadAbandonSnapshot, resolveAbandonView } from "@/lib/crm/abandons";

export default async function AbandonedSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const { vue } = await searchParams;
  const view = resolveAbandonView(vue);
  const supabase = await createClient();
  const snapshot = await loadAbandonSnapshot(supabase, ctx.organization.id);

  return (
    <ListPanel>
      <AbandonSessionsView snapshot={snapshot} initialView={view} />
    </ListPanel>
  );
}
