import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import { hashPin } from "@/lib/prospect/access";

export const MEMBER_COOKIE = "qb-member";
const SESSION_DAYS = 30;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createMemberSession(input: {
  organizationId: string;
  spaceId: string;
  email: string;
}) {
  const supabase = createServiceClient();
  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const { error } = await supabase.from("member_space_sessions").insert({
    organization_id: input.organizationId,
    space_id: input.spaceId,
    email: normalizeEmail(input.email),
    token,
    expires_at: expires.toISOString(),
  });
  if (error) throw error;
  const store = await cookies();
  store.set(MEMBER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return token;
}

export async function clearMemberSession() {
  const store = await cookies();
  const token = store.get(MEMBER_COOKIE)?.value;
  if (token) {
    const supabase = createServiceClient();
    await supabase.from("member_space_sessions").delete().eq("token", token);
  }
  store.delete(MEMBER_COOKIE);
}

export async function loadMemberSession(spaceId: string) {
  const store = await cookies();
  const token = store.get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("member_space_sessions")
    .select("*")
    .eq("token", token)
    .eq("space_id", spaceId)
    .maybeSingle();
  if (!data || new Date(data.expires_at).getTime() < Date.now()) return null;
  await supabase.from("member_space_sessions").update({ last_accessed: new Date().toISOString() }).eq("id", data.id);
  return { email: data.email, spaceId: data.space_id, organizationId: data.organization_id };
}

export async function loginMemberWithPin(input: {
  organizationId: string;
  spaceId: string;
  email: string;
  pin: string;
}) {
  const email = normalizeEmail(input.email);
  const pin = input.pin.replace(/\D/g, "").slice(0, 6);
  if (!email.includes("@") || pin.length !== 6) return { ok: false as const };
  const supabase = createServiceClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id")
    .eq("organization_id", input.organizationId)
    .ilike("contact_email", email);
  const quoteIds = (quotes ?? []).map((row) => row.id);
  if (!quoteIds.length) return { ok: false as const };

  const { data: accessRows } = await supabase.from("prospect_access").select("*").in("quote_id", quoteIds);
  const match = (accessRows ?? []).find(
    (row) => new Date(row.expires_at).getTime() >= Date.now() && row.pin_hash === hashPin(pin, row.quote_id),
  );
  if (!match) return { ok: false as const };
  await createMemberSession({ organizationId: input.organizationId, spaceId: input.spaceId, email });
  return { ok: true as const };
}

export async function loginMemberWithProspectToken(input: {
  organizationId: string;
  spaceId: string;
  token: string;
}) {
  const supabase = createServiceClient();
  const { data: access } = await supabase.from("prospect_access").select("*").eq("token", input.token).maybeSingle();
  if (!access || access.organization_id !== input.organizationId) return { ok: false as const };
  if (new Date(access.expires_at).getTime() < Date.now()) return { ok: false as const };
  const { data: quote } = await supabase
    .from("quotes")
    .select("contact_email")
    .eq("id", access.quote_id)
    .maybeSingle();
  const email = quote?.contact_email?.trim();
  if (!email) return { ok: false as const };
  await createMemberSession({ organizationId: input.organizationId, spaceId: input.spaceId, email });
  return { ok: true as const };
}
