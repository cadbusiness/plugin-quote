import { createHash, randomBytes } from "node:crypto";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 180;

export function visitorCookieName(orgSlug: string) {
  const safe = orgSlug.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 48);
  return `qb_vid_${safe || "org"}`;
}

export function newVisitorToken() {
  return randomBytes(32).toString("base64url");
}

export function hashVisitorToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey !== name) continue;
    const value = rest.join("=").trim();
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}

export function presentedVisitorToken(req: Request, orgSlug: string): { token: string | null; strict: boolean } {
  const header = req.headers.get("x-visitor-token")?.trim() ?? "";
  if (header) return { token: header, strict: true };
  return { token: readCookie(req.headers.get("cookie"), visitorCookieName(orgSlug)), strict: false };
}

export function visitorCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  };
}
