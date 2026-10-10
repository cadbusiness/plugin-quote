import { createHash, randomBytes, randomInt } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { markCollaboratorViewed } from "@/lib/prospect/collaborators";
import type { Tables } from "@/lib/db/database.types";

export type ProspectViewer =
  | { kind: "primary"; accessId: string }
  | { kind: "collaborator"; collaborator: Tables<"quote_collaborators"> };

export type ProspectQuoteItem = Tables<"quote_items"> & { currency: string | null };

export type ProspectBundle = {
  quote: Tables<"quotes">;
  items: ProspectQuoteItem[];
  files: Tables<"quote_files">[];
  statuses: Tables<"quote_statuses">[];
  messages: Tables<"prospect_messages">[];
  collaborators: Tables<"quote_collaborators">[];
  viewer: ProspectViewer;
};

export function hashPin(pin: string, quoteId: string) {
  return createHash("sha256").update(`${quoteId}:${pin}`).digest("hex");
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3003").replace(/\/$/, "");
}

export async function createProspectAccess(input: {
  organizationId: string;
  quoteId: string;
}) {
  const supabase = createServiceClient();
  const token = randomBytes(24).toString("hex");
  const pin = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from("prospect_access").insert({
    organization_id: input.organizationId,
    quote_id: input.quoteId,
    token,
    pin_hash: hashPin(pin, input.quoteId),
    expires_at: expires,
  });
  if (error) throw error;
  return {
    token,
    pin,
    url: `${appUrl()}/suivi/${token}`,
  };
}

export async function loadProspectByToken(token: string): Promise<ProspectBundle | null> {
  const supabase = createServiceClient();
  const { data: access } = await supabase
    .from("prospect_access")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (access && new Date(access.expires_at).getTime() >= Date.now()) {
    await supabase
      .from("prospect_access")
      .update({ last_accessed: new Date().toISOString() })
      .eq("id", access.id);
    return loadProspectBundle(access.quote_id, access.organization_id, {
      kind: "primary",
      accessId: access.id,
    });
  }

  const { data: collaborator } = await supabase
    .from("quote_collaborators")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (!collaborator || new Date(collaborator.expires_at).getTime() < Date.now()) return null;
  await markCollaboratorViewed(collaborator.id);
  const refreshed = {
    ...collaborator,
    status: collaborator.status === "pending" ? ("viewed" as const) : collaborator.status,
    last_accessed: new Date().toISOString(),
  };
  return loadProspectBundle(collaborator.quote_id, collaborator.organization_id, {
    kind: "collaborator",
    collaborator: refreshed,
  });
}

const PIN_MAX_FAILURES = 5;
const PIN_LOCK_MS = 15 * 60 * 1000;

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * PIN alone is not an identifier: it is checked only against the access rows of
 * quotes sent to this email, and repeated failures lock those rows for 15 minutes.
 */
export async function loadProspectByPin(email: string, pin: string) {
  const supabase = createServiceClient();
  const normalized = email.trim().toLowerCase();
  if (!normalized || !pin) return null;

  const { data: quotes } = await supabase
    .from("quotes")
    .select("id")
    .ilike("contact_email", escapeLike(normalized))
    .order("created_at", { ascending: false })
    .limit(50);
  const quoteIds = (quotes ?? []).map((q) => q.id);
  if (quoteIds.length === 0) return null;

  const now = Date.now();
  const { data: rows } = await supabase
    .from("prospect_access")
    .select("*")
    .in("quote_id", quoteIds)
    .gt("expires_at", new Date(now).toISOString());
  const candidates = (rows ?? []).filter(
    (row) => !row.pin_locked_until || new Date(row.pin_locked_until).getTime() <= now,
  );
  if (candidates.length === 0) return null;

  const match = candidates.find((row) => row.pin_hash === hashPin(pin, row.quote_id));
  if (!match) {
    // Count the failure on every row this email could open. Errors are ignored so
    // the check still works before migration 0067 is applied.
    await Promise.all(
      candidates.map((row) => {
        const failures = (row.pin_failed_attempts ?? 0) + 1;
        const locked = failures >= PIN_MAX_FAILURES;
        return supabase
          .from("prospect_access")
          .update({
            pin_failed_attempts: locked ? 0 : failures,
            pin_locked_until: locked ? new Date(now + PIN_LOCK_MS).toISOString() : null,
          })
          .eq("id", row.id);
      }),
    );
    return null;
  }

  await supabase
    .from("prospect_access")
    .update({ last_accessed: new Date(now).toISOString() })
    .eq("id", match.id);
  if (match.pin_failed_attempts) {
    await supabase.from("prospect_access").update({ pin_failed_attempts: 0 }).eq("id", match.id);
  }
  const bundle = await loadProspectBundle(match.quote_id, match.organization_id, {
    kind: "primary",
    accessId: match.id,
  });
  if (!bundle) return null;
  return { ...bundle, token: match.token };
}

async function loadProspectBundle(
  quoteId: string,
  organizationId: string,
  viewer: ProspectViewer,
): Promise<ProspectBundle | null> {
  const supabase = createServiceClient();
  const [
    { data: quote },
    { data: items },
    { data: files },
    { data: statuses },
    { data: messages },
    { data: collaborators },
  ] = await Promise.all([
    supabase.from("quotes").select("*").eq("id", quoteId).maybeSingle(),
    supabase.from("quote_items").select("*").eq("quote_id", quoteId),
    supabase.from("quote_files").select("*").eq("quote_id", quoteId),
    supabase.from("quote_statuses").select("*").eq("organization_id", organizationId).order("position"),
    supabase.from("prospect_messages").select("*").eq("quote_id", quoteId).order("sent_at"),
    supabase.from("quote_collaborators").select("*").eq("quote_id", quoteId).order("created_at"),
  ]);
  if (!quote) return null;
  const productIds = [...new Set((items ?? []).map((item) => item.product_id).filter(Boolean))] as string[];
  const { data: priced } = productIds.length
    ? await supabase.from("products").select("id, currency").in("id", productIds).eq("organization_id", organizationId)
    : { data: [] as { id: string; currency: string }[] };
  const currencyById = new Map((priced ?? []).map((row) => [row.id, row.currency]));
  return {
    quote,
    items: (items ?? []).map((item) => ({
      ...item,
      currency: item.product_id ? (currencyById.get(item.product_id) ?? null) : null,
    })),
    files: files ?? [],
    statuses: statuses ?? [],
    messages: messages ?? [],
    collaborators: collaborators ?? [],
    viewer,
  };
}
