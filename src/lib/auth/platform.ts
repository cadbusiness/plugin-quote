import type { User } from "@supabase/supabase-js";
import { safeNextPath } from "@/lib/auth/next-path";

export const SUPER_ADMIN_ROLE = "super_admin";

export function isSuperAdmin(user: User | null | undefined) {
  return user?.app_metadata?.role === SUPER_ADMIN_ROLE;
}

export function postLoginPath(user: User | null | undefined, next?: string | null) {
  const dest = safeNextPath(next);
  if (dest) return dest;
  return isSuperAdmin(user) ? "/admin" : "/accueil";
}
