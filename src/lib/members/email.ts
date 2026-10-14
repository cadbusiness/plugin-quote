import { escapeLike } from "@/lib/prospect/access";

const MEMBER_EMAIL = /^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/;

export function normalizeMemberEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Real address only. `%` is rejected (LIKE wildcard, never a valid address).
 * `_` is allowed — callers must still pass the value through `escapeLike`.
 */
export function isMemberLoginEmail(email: string) {
  const normalized = normalizeMemberEmail(email);
  return MEMBER_EMAIL.test(normalized) && !normalized.includes("\\");
}

/** Case-insensitive exact match. Wildcards in the input stay literal. */
export function memberEmailIlikePattern(email: string) {
  return escapeLike(normalizeMemberEmail(email));
}

/**
 * Session key is the quote's stored address, never the string typed at login.
 * A pattern such as `%@%` must not be persisted.
 */
export function sessionEmailFromMatchedQuote(
  _typedEmail: string,
  matchedContactEmail: string | null | undefined,
): string | null {
  if (typeof matchedContactEmail !== "string") return null;
  const canonical = normalizeMemberEmail(matchedContactEmail);
  if (!isMemberLoginEmail(canonical)) return null;
  return canonical;
}
