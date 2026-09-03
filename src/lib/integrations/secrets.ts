import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { ProviderCredentials } from "@/lib/integrations/types";

const PREFIX = "v1:";

function encryptionKey() {
  const raw =
    process.env.INTEGRATIONS_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!raw) {
    throw new Error(
      "INTEGRATIONS_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY) manquante : impossible de chiffrer les accès boutique.",
    );
  }
  return createHash("sha256").update(`quotebuilder:integrations:${raw}`).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const body = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return PREFIX + Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
}

export function decryptSecret(value: string) {
  // Les anciennes connexions Woo étaient stockées en clair : on les accepte encore.
  if (!value.startsWith(PREFIX)) return value;
  const buf = Buffer.from(value.slice(PREFIX.length), "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString("utf8");
}

export function encryptCredentials(credentials: ProviderCredentials): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(credentials)) {
    out[key] = encryptSecret(value);
  }
  return out;
}

export function decryptCredentials(stored: unknown): ProviderCredentials {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
  const out: ProviderCredentials = {};
  for (const [key, value] of Object.entries(stored as Record<string, unknown>)) {
    if (typeof value !== "string") continue;
    try {
      out[key] = decryptSecret(value);
    } catch {
      throw new Error(
        "Accès boutique illisibles (clé de chiffrement changée). Reconnectez la boutique.",
      );
    }
  }
  return out;
}

export function maskHint(value: string) {
  return value.length <= 4 ? "••••" : `••••${value.slice(-4)}`;
}

export function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function randomToken(bytes = 24) {
  return randomBytes(bytes).toString("base64url");
}

// Sans I, O, 0, 1 : le code est lu à l'écran puis retapé dans WordPress.
const PAIRING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomPairingCode(length = 12) {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += PAIRING_ALPHABET[bytes[i] % PAIRING_ALPHABET.length];
  }
  return code;
}
