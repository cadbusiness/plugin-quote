import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function newOpaqueToken(prefix: string) {
  return `${prefix}${randomBytes(24).toString("base64url")}`;
}

export function pkceChallengeS256(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function verifyPkceS256(verifier: string, challenge: string) {
  const computed = pkceChallengeS256(verifier);
  const a = Buffer.from(computed);
  const b = Buffer.from(challenge);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
