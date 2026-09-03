import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { ensureDefaultWorkflows } from "@/lib/workflows/ensure";

const STATUSES = [
  { slug: "new", label: "Nouveau", color: "#2563eb", position: 0, is_default: true, is_closed: false },
  { slug: "contacted", label: "Contacté", color: "#d97706", position: 1, is_default: false, is_closed: false },
  { slug: "in_progress", label: "En cours", color: "#7c3aed", position: 2, is_default: false, is_closed: false },
  { slug: "won", label: "Gagné", color: "#16a34a", position: 3, is_default: false, is_closed: true },
  { slug: "lost", label: "Perdu", color: "#dc2626", position: 4, is_default: false, is_closed: true },
  { slug: "waiting", label: "En attente", color: "#64748b", position: 5, is_default: false, is_closed: false },
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
  {
    kind: "session_resume",
    subject: "Votre configuration est sauvegardée",
    body: "Bonjour {{contact_name}}, vous avez commencé à configurer votre projet. Reprenez ici : {{resume_url}}",
  },
  {
    kind: "session_resume_late",
    subject: "Votre projet attend",
    body: "Bonjour {{contact_name}}, votre projet attend. Reprenez où vous en étiez : {{resume_url}}",
  },
  {
    kind: "prospect_photo",
    subject: "Une photo aiderait à affiner votre devis",
    body: "Bonjour {{contact_name}}, ajoutez une photo ici : {{suivi_url}}",
  },
] as const;

export async function seedOrgCrm(supabase: SupabaseClient<Database>, orgId: string) {
  await supabase.from("quote_statuses").insert(
    STATUSES.map((s) => ({ organization_id: orgId, ...s })),
  );
  await supabase.from("email_templates").insert(
    EXTRA_TEMPLATES.map((t) => ({ organization_id: orgId, ...t })),
  );
  await ensureDefaultWorkflows(supabase, orgId);
}
