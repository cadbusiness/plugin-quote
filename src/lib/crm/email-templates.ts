import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";

/** Default org email templates. Insert-if-missing only — never overwrite custom copy. */
export const DEFAULT_EMAIL_TEMPLATES = [
  {
    kind: "prospect_confirm",
    subject: "Votre demande — récapitulatif",
    body: "Bonjour {{contact_name}},\n\nMerci pour votre demande. Vous trouverez ci-joint le récapitulatif de votre configuration.\nNotre équipe vous recontacte sous 24h ouvrées.\n\nSuivez votre demande : {{suivi_url}}\nCode PIN : {{pin}}\n\n{{sales_name}}",
  },
  {
    kind: "sales_brief",
    subject: "[QuoteBuilder] Nouveau brief {{contact_company}} — {{score_label}}",
    body: "Nouveau devis reçu.\n\nProspect : {{contact_name}} ({{contact_email}})\nSociété : {{contact_company}}\nScore : {{score}} / 100 ({{score_label}})\n\nParamètres :\n{{answers_text}}\n\nConfiguration : {{suggestion_name}}\nFourchette : {{price_range}}",
  },
  {
    kind: "sales_unprocessed",
    subject: "Rappel, demande non traitée",
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
  {
    kind: "prospect_reactivation",
    subject: "On reprend votre projet ?",
    body: "Bonjour {{contact_name}}, cela fait un moment. Votre projet est-il toujours d’actualité ? Répondez ou reprenez ici : {{suivi_url}}",
  },
] as const;

export type DefaultEmailTemplateKind = (typeof DEFAULT_EMAIL_TEMPLATES)[number]["kind"];

export function missingDefaultEmailTemplates(existingKinds: Iterable<string>) {
  const have = new Set(existingKinds);
  return DEFAULT_EMAIL_TEMPLATES.filter((template) => !have.has(template.kind));
}

export async function ensureDefaultEmailTemplates(
  supabase: SupabaseClient<Database>,
  orgId: string,
) {
  const { data: existing } = await supabase
    .from("email_templates")
    .select("kind")
    .eq("organization_id", orgId);
  const missing = missingDefaultEmailTemplates((existing ?? []).map((row) => row.kind));
  if (missing.length === 0) return { inserted: [] as string[] };

  const { error } = await supabase.from("email_templates").insert(
    missing.map((template) => ({ organization_id: orgId, ...template })),
  );
  if (error) {
    console.error("ensureDefaultEmailTemplates", error.message);
    return { inserted: [] as string[] };
  }
  return { inserted: missing.map((template) => template.kind) };
}
