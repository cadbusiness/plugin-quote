import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import type { Tables } from "@/lib/db/database.types";

export type ApiKeyRow = Tables<"api_keys">;

export type ApiAuthContext = {
  organizationId: string;
  apiKeyId: string;
  keyName: string;
};

const KEY_PREFIX = "qb_live_";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function safeEqualHex(a: string, b: string) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function extractApiToken(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.replace(/^Bearer\s+/i, "").trim();
  if (bearer) return bearer;
  const header = req.headers.get("x-api-key")?.trim();
  return header || null;
}

export async function authenticateApiKey(req: Request): Promise<ApiAuthContext | null> {
  const token = extractApiToken(req);
  if (!token || !token.startsWith(KEY_PREFIX)) return null;

  const prefix = token.slice(0, KEY_PREFIX.length + 8);
  const hash = hashToken(token);
  const supabase = createServiceClient();

  const { data: rows } = await supabase
    .from("api_keys")
    .select("id, name, organization_id, key_hash, revoked_at")
    .eq("key_prefix", prefix)
    .is("revoked_at", null)
    .limit(5);

  const match = (rows ?? []).find((row) => safeEqualHex(row.key_hash, hash));
  if (!match) return null;

  void supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", match.id);

  return {
    organizationId: match.organization_id,
    apiKeyId: match.id,
    keyName: match.name,
  };
}

export async function createOrgApiKey(input: {
  organizationId: string;
  name: string;
  createdBy: string | null;
}) {
  const secret = randomBytes(24).toString("base64url");
  const token = `${KEY_PREFIX}${secret}`;
  const prefix = token.slice(0, KEY_PREFIX.length + 8);
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      organization_id: input.organizationId,
      name: input.name.trim() || "MCP / Claude",
      key_prefix: prefix,
      key_hash: hashToken(token),
      created_by: input.createdBy,
    })
    .select("id, name, key_prefix, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Impossible de créer la clé API");
  }

  return { key: data, token };
}

export async function listOrgApiKeys(organizationId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function revokeOrgApiKey(organizationId: string, keyId: string) {
  const supabase = createServiceClient();
  await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", keyId)
    .eq("organization_id", organizationId)
    .is("revoked_at", null);
}
