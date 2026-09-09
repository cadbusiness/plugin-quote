/** Chemin interne sûr pour ?next= après login / signup / onboarding. */
export function safeNextPath(next?: string | null) {
  if (!next?.startsWith("/") || next.startsWith("//") || next.includes("://")) return null;
  return next;
}
