import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";

const STATUSES = [
  { slug: "new", label: "Nouveau", color: "#2563eb", position: 0, is_default: true, is_closed: false },
  { slug: "contacted", label: "Contacté", color: "#d97706", position: 1, is_default: false, is_closed: false },
  { slug: "in_progress", label: "En cours", color: "#7c3aed", position: 2, is_default: false, is_closed: false },
  { slug: "won", label: "Gagné", color: "#16a34a", position: 3, is_default: false, is_closed: true },
  { slug: "lost", label: "Perdu", color: "#dc2626", position: 4, is_default: false, is_closed: true },
  { slug: "waiting", label: "En attente", color: "#64748b", position: 5, is_default: false, is_closed: false },
] as const;

const FLOWS = [
  { trigger: "submitted", delay_hours: 0, recipient: "prospect", template_kind: "prospect_confirm" },
  { trigger: "submitted", delay_hours: 0, recipient: "assignee", template_kind: "sales_brief" },
  { trigger: "unprocessed", delay_hours: 4, recipient: "assignee", template_kind: "sales_unprocessed" },
  { trigger: "delay", delay_hours: 24, recipient: "prospect", template_kind: "prospect_reassure" },
  { trigger: "delay", delay_hours: 72, recipient: "prospect", template_kind: "prospect_followup" },
] as const;

const EXTRA_TEMPLATES = [
  {
    kind: "sales_unprocessed",
    subject: "Rappel — demande non traitée",
    body: "Demande de {{contact_name}} ({{contact_company}}) encore au statut Nouveau.",
  },
  {
    kind: "prospect_reassure",
    subject: "Votre demande est bien prise en compte",
    body: "Bonjour {{contact_name}}, votre demande est bien prise en compte. Retour sous 48h.",
  },
  {
    kind: "prospect_followup",
    subject: "Avez-vous eu le temps de réfléchir ?",
    body: "Bonjour {{contact_name}}, votre projet est-il toujours d’actualité ?",
  },
] as const;

export async function seedOrgCrm(supabase: SupabaseClient<Database>, orgId: string) {
  await supabase.from("quote_statuses").insert(
    STATUSES.map((s) => ({ organization_id: orgId, ...s })),
  );
  await supabase.from("automation_flows").insert(
    FLOWS.map((f) => ({ organization_id: orgId, ...f, active: true })),
  );
  await supabase.from("email_templates").insert(
    EXTRA_TEMPLATES.map((t) => ({ organization_id: orgId, ...t })),
  );
}
