import { createHash, randomBytes, randomInt } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

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

export async function loadProspectByToken(token: string) {
  const supabase = createServiceClient();
  const { data: access } = await supabase
    .from("prospect_access")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (!access || new Date(access.expires_at).getTime() < Date.now()) return null;
  await supabase
    .from("prospect_access")
    .update({ last_accessed: new Date().toISOString() })
    .eq("id", access.id);
  return loadProspectBundle(access.quote_id, access.organization_id);
}

export async function loadProspectByPin(pin: string) {
  const supabase = createServiceClient();
  const { data: rows } = await supabase
    .from("prospect_access")
    .select("*")
    .gt("expires_at", new Date().toISOString())
    .limit(200);
  const match = (rows ?? []).find((row) => row.pin_hash === hashPin(pin, row.quote_id));
  if (!match) return null;
  await supabase
    .from("prospect_access")
    .update({ last_accessed: new Date().toISOString() })
    .eq("id", match.id);
  return { ...(await loadProspectBundle(match.quote_id, match.organization_id)), token: match.token };
}

async function loadProspectBundle(quoteId: string, organizationId: string) {
  const supabase = createServiceClient();
  const [{ data: quote }, { data: items }, { data: files }, { data: statuses }, { data: messages }] =
    await Promise.all([
      supabase.from("quotes").select("*").eq("id", quoteId).maybeSingle(),
      supabase.from("quote_items").select("*").eq("quote_id", quoteId),
      supabase.from("quote_files").select("*").eq("quote_id", quoteId),
      supabase.from("quote_statuses").select("*").eq("organization_id", organizationId).order("position"),
      supabase.from("prospect_messages").select("*").eq("quote_id", quoteId).order("sent_at"),
    ]);
  if (!quote) return null;
  return { quote, items: items ?? [], files: files ?? [], statuses: statuses ?? [], messages: messages ?? [] };
}
