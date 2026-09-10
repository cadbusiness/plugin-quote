import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";

type Client = SupabaseClient<Database>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Org-scoped erasure / anonymization for a contact email (GDPR right to erasure baseline).
 * Keeps quote rows for ops integrity but strips PII from quotes, sessions, campaign sends, messages.
 */
export async function eraseContactByEmail(
  supabase: Client,
  input: { organizationId: string; email: string; actorId: string | null },
) {
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) {
    throw new Error("Email invalide");
  }

  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, session_id")
    .eq("organization_id", input.organizationId)
    .ilike("contact_email", email);

  const quoteIds = (quotes ?? []).map((q) => q.id);
  const sessionIds = (quotes ?? []).map((q) => q.session_id).filter(Boolean) as string[];

  if (quoteIds.length) {
    await supabase
      .from("quotes")
      .update({
        contact_name: "Anonymisé",
        contact_email: `erased+${quoteIds[0].slice(0, 8)}@invalid.local`,
        contact_phone: null,
        contact_company: null,
        notes: null,
        consent_marketing: false,
        answers: {} as Json,
        extracted_params: {} as Json,
      })
      .eq("organization_id", input.organizationId)
      .in("id", quoteIds);

    await supabase.from("quote_activities").insert({
      organization_id: input.organizationId,
      quote_id: quoteIds[0],
      actor_id: input.actorId,
      type: "privacy_erasure",
      payload: { email, quote_ids: quoteIds } as Json,
    });
  }

  if (sessionIds.length) {
    await supabase
      .from("quote_sessions")
      .update({
        contact_draft: {} as Json,
        answers: {} as Json,
        extracted_params: {} as Json,
        chat_messages: [] as unknown as Json,
      })
      .eq("organization_id", input.organizationId)
      .in("id", sessionIds);
  }

  await supabase
    .from("email_campaign_sends")
    .update({
      contact_email: "erased@invalid.local",
      contact_name: "Anonymisé",
    })
    .eq("organization_id", input.organizationId)
    .ilike("contact_email", email);

  if (quoteIds.length) {
    await supabase.from("prospect_access").delete().in("quote_id", quoteIds);
    await supabase.from("prospect_messages").delete().in("quote_id", quoteIds);
  }

  return { quotes: quoteIds.length, sessions: sessionIds.length };
}
