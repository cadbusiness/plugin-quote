import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { ensureDefaultEmailTemplates } from "@/lib/crm/email-templates";
import { ensureDefaultWorkflows } from "@/lib/workflows/ensure";

const STATUSES = [
  { slug: "new", label: "Nouveau", color: "#2563eb", position: 0, is_default: true, is_closed: false },
  { slug: "contacted", label: "Contacté", color: "#d97706", position: 1, is_default: false, is_closed: false },
  { slug: "in_progress", label: "En cours", color: "#7c3aed", position: 2, is_default: false, is_closed: false },
  { slug: "won", label: "Gagné", color: "#16a34a", position: 3, is_default: false, is_closed: true },
  { slug: "lost", label: "Perdu", color: "#dc2626", position: 4, is_default: false, is_closed: true },
  { slug: "waiting", label: "En attente", color: "#64748b", position: 5, is_default: false, is_closed: false },
] as const;

export async function seedOrgCrm(supabase: SupabaseClient<Database>, orgId: string) {
  await supabase.from("quote_statuses").insert(
    STATUSES.map((s) => ({ organization_id: orgId, ...s })),
  );
  await ensureDefaultEmailTemplates(supabase, orgId);
  await ensureDefaultWorkflows(supabase, orgId);
}
