import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";

export async function logActivity(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    quoteId: string;
    actorId?: string | null;
    type: "submitted" | "status_changed" | "assigned" | "note_added" | "email_sent" | "message_sent";
    payload?: Record<string, unknown>;
  },
) {
  await supabase.from("quote_activities").insert({
    organization_id: input.organizationId,
    quote_id: input.quoteId,
    actor_id: input.actorId ?? null,
    type: input.type,
    payload: (input.payload ?? {}) as Json,
  });
}

export async function notifyUser(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    userId: string;
    quoteId?: string | null;
    type: string;
    body: string;
  },
) {
  await supabase.from("notifications").insert({
    organization_id: input.organizationId,
    user_id: input.userId,
    quote_id: input.quoteId ?? null,
    type: input.type,
    body: input.body,
  });
}
