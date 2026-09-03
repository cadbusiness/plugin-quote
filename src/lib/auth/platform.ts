import type { User } from "@supabase/supabase-js";

export const SUPER_ADMIN_ROLE = "super_admin";

export function isSuperAdmin(user: User | null | undefined) {
  return user?.app_metadata?.role === SUPER_ADMIN_ROLE;
}

export function postLoginPath(user: User | null | undefined, next?: string | null) {
  if (next?.startsWith("/") && !next.startsWith("//")) return next;
  return isSuperAdmin(user) ? "/admin" : "/accueil";
}
