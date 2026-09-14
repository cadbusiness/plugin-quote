/** Chemin interne sûr pour ?next= après login / signup / onboarding. */
export function safeNextPath(next?: string | null) {
  if (!next?.startsWith("/") || next.startsWith("//") || next.includes("://")) return null;
  return next;
}

export function postSignupPath(next?: string | null) {
  const dest = safeNextPath(next);
  if (dest?.startsWith("/invite/")) return dest;
  if (dest) return `/onboarding?next=${encodeURIComponent(dest)}`;
  return "/onboarding";
}
