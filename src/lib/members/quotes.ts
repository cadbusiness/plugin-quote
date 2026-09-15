import { createServiceClient } from "@/lib/supabase/service";
import { appUrl } from "@/lib/prospect/access";
import { clientQuoteStageLabel } from "@/lib/members/parse";
import type { MemberQuoteCard } from "@/lib/members/types";

export async function loadMemberQuotes(organizationId: string, email: string): Promise<MemberQuoteCard[]> {
  const supabase = createServiceClient();
  const [{ data: quotes }, { data: statuses }] = await Promise.all([
    supabase
      .from("quotes")
      .select("id, created_at, contact_name, contact_company, status, status_id")
      .eq("organization_id", organizationId)
      .ilike("contact_email", email.trim().toLowerCase())
      .order("created_at", { ascending: false }),
    supabase.from("quote_statuses").select("id, label, slug").eq("organization_id", organizationId),
  ]);
  const list = quotes ?? [];
  if (!list.length) return [];
  const { data: access } = await supabase
    .from("prospect_access")
    .select("quote_id, token, expires_at")
    .in(
      "quote_id",
      list.map((row) => row.id),
    );
  const tokenByQuote = new Map(
    (access ?? [])
      .filter((row) => new Date(row.expires_at).getTime() >= Date.now())
      .map((row) => [row.quote_id, row.token]),
  );
  const statusById = new Map((statuses ?? []).map((row) => [row.id, row]));
  return list.map((quote) => {
    const status = quote.status_id ? statusById.get(quote.status_id) : undefined;
    const token = tokenByQuote.get(quote.id);
    return {
      id: quote.id,
      createdAt: quote.created_at,
      contactName: quote.contact_name,
      contactCompany: quote.contact_company,
      statusLabel: clientQuoteStageLabel(status?.slug ?? quote.status),
      statusSlug: status?.slug ?? quote.status,
      suiviUrl: token ? `${appUrl()}/suivi/${token}` : null,
    };
  });
}
