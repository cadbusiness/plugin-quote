import { createClient } from "@supabase/supabase-js";

const DEMO_ORG = { name: "Espace démo", slug: "demo" };
const ACCOUNTS = [
  { email: "admin@quotebuilder.app", password: "Demo2026!QB", role: null, platform: "super_admin" },
  { email: "demo@quotebuilder.app", password: "Demo2026!QB", role: "owner" },
  { email: "sales@quotebuilder.app", password: "Demo2026!QB", role: "sales" },
];

const QUOTES = [
  {
    contact_name: "Claire Martin",
    contact_email: "claire.martin@atelier-nord.test",
    contact_company: "Atelier Nord",
    contact_phone: "06 12 34 56 01",
    score: 86,
    score_label: "hot",
    status: "new",
    status_slug: "new",
    utm_source: "linkedin",
    utm_medium: "social",
    utm_campaign: "atelier-q3",
    referrer: "https://www.linkedin.com/",
    answers: {
      project_type: "atelier",
      surface: 180,
      height: 5.5,
      load: 400,
      access: "moyenne",
      constraints: ["dalle_existante"],
      notes: "Besoin de ranger outillage et pièces, allée chariot 1,20 m.",
    },
    items: [
      { name: "Rayonnage mi-lourd 3 m", quantity: 6, price_min: 420, price_max: 580, options: { finition: "Galvanisé" } },
      { name: "Plateau mélaminé 1200×800", quantity: 18, price_min: 38, price_max: 52, options: {} },
    ],
    note: "Premier contact LinkedIn. Relancer lundi avec un plan d’implantation.",
    message: "Pouvez-vous passer à l’atelier mardi matin ?",
  },
  {
    contact_name: "Thomas Berger",
    contact_email: "thomas.berger@logispace.test",
    contact_company: "LogiSpace",
    contact_phone: "06 12 34 56 02",
    score: 64,
    score_label: "warm",
    status: "contacted",
    status_slug: "contacted",
    utm_source: "google",
    utm_medium: "organic",
    utm_campaign: null,
    referrer: "https://www.google.com/",
    answers: {
      project_type: "entrepot",
      surface: 90,
      height: 6,
      load: 250,
      access: "facile",
      constraints: ["aucune"],
      notes: "Petite réserve, picking fréquent.",
    },
    items: [
      { name: "Rayonnage picking 2,50 m", quantity: 4, price_min: 310, price_max: 390, options: { niveaux: "4" } },
    ],
    note: "Appelé le 02/09. Envoie un plan de la réserve cette semaine.",
    message: null,
  },
  {
    contact_name: "Léa Moreau",
    contact_email: "lea.moreau@rivage.test",
    contact_company: "Hôtel Rivage",
    contact_phone: "06 12 34 56 03",
    score: 91,
    score_label: "hot",
    status: "new",
    status_slug: "in_progress",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "hotel-cuisine-2026",
    referrer: "https://www.google.com/",
    answers: {
      project_type: "cuisine_pro",
      surface: 420,
      height: 3.8,
      load: 800,
      access: "haute",
      constraints: ["hauteur", "horaires_nuit"],
      timeline: "avant saison",
      budget: "80k+",
      notes: "Rénovation cuisine centrale, 80 couverts. Accès par monte-charge 1,20 m.",
    },
    items: [
      {
        name: "Ligne de cuisson professionnelle",
        quantity: 1,
        price_min: 12800,
        price_max: 16400,
        options: { alimentation: "Gaz + électrique", finition: "Inox 304" },
      },
      {
        name: "Chambre froide positive 8 m³",
        quantity: 1,
        price_min: 4200,
        price_max: 5600,
        options: { groupe: "À distance" },
      },
      {
        name: "Îlot central inox 2,40 m",
        quantity: 1,
        price_min: 3800,
        price_max: 5200,
        options: { évier: "2 bacs" },
      },
      {
        name: "Plonge 2 bacs + égouttoir",
        quantity: 2,
        price_min: 890,
        price_max: 1200,
        options: {},
      },
    ],
    note: "Cuisine existante à démonter. Devis avant le 15/09 pour le comité.",
    message: "Pouvez-vous passer sur site mercredi matin ?",
  },
];

const FLOWS = [
  { trigger: "submitted", delay_hours: 0, recipient: "prospect", template_kind: "prospect_confirm" },
  { trigger: "submitted", delay_hours: 0, recipient: "assignee", template_kind: "sales_brief" },
  { trigger: "unprocessed", delay_hours: 4, recipient: "assignee", template_kind: "sales_unprocessed" },
  { trigger: "delay", delay_hours: 24, recipient: "prospect", template_kind: "prospect_reassure" },
  { trigger: "delay", delay_hours: 72, recipient: "prospect", template_kind: "prospect_followup" },
];

const STATUSES = [
  { slug: "new", label: "Nouveau", color: "#2563eb", position: 0, is_default: true, is_closed: false },
  { slug: "contacted", label: "Contacté", color: "#d97706", position: 1, is_default: false, is_closed: false },
  { slug: "in_progress", label: "En cours", color: "#7c3aed", position: 2, is_default: false, is_closed: false },
  { slug: "won", label: "Gagné", color: "#16a34a", position: 3, is_default: false, is_closed: true },
  { slug: "lost", label: "Perdu", color: "#dc2626", position: 4, is_default: false, is_closed: true },
  { slug: "waiting", label: "En attente", color: "#64748b", position: 5, is_default: false, is_closed: false },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis.");
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function upsertUser(email, password, appMetadata) {
  const payload = { email, password, email_confirm: true, app_metadata: appMetadata ?? {} };
  const { data: created, error: createError } = await supabase.auth.admin.createUser(payload);
  if (!createError && created.user) return created.user;

  const { data: list, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listError) throw listError;
  const existing = list.users.find((u) => u.email === email);
  if (!existing) throw createError ?? new Error(`Utilisateur introuvable: ${email}`);

  const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
    app_metadata: appMetadata ?? {},
  });
  if (updateError) throw updateError;
  return updated.user;
}

const { data: orgExisting } = await supabase.from("organizations").select("*").eq("slug", DEMO_ORG.slug).maybeSingle();
let org = orgExisting;
if (!org) {
  const { data: created, error } = await supabase
    .from("organizations")
    .insert({ name: DEMO_ORG.name, slug: DEMO_ORG.slug, plan: "pro" })
    .select("*")
    .single();
  if (error) throw error;
  org = created;
}

let { data: configurator } = await supabase
  .from("configurators")
  .select("*")
  .eq("organization_id", org.id)
  .eq("slug", "principal")
  .maybeSingle();
if (!configurator) {
  const { data, error } = await supabase
    .from("configurators")
    .insert({
      organization_id: org.id,
      name: "Configurateur principal",
      slug: "principal",
      sector: "general",
      wizard_enabled: true,
      chat_enabled: true,
    })
    .select("*")
    .single();
  if (error) throw error;
  configurator = data;
}

const { count: statusCount } = await supabase
  .from("quote_statuses")
  .select("id", { count: "exact", head: true })
  .eq("organization_id", org.id);
if (!statusCount) {
  const { error } = await supabase.from("quote_statuses").insert(
    STATUSES.map((s) => ({ organization_id: org.id, ...s })),
  );
  if (error) throw error;
}

const { data: existingFlows } = await supabase
  .from("automation_flows")
  .select("template_kind")
  .eq("organization_id", org.id);
const haveFlow = new Set((existingFlows ?? []).map((f) => f.template_kind));
const missingFlows = FLOWS.filter((f) => !haveFlow.has(f.template_kind));
if (missingFlows.length) {
  const { error } = await supabase.from("automation_flows").insert(
    missingFlows.map((f) => ({ organization_id: org.id, ...f, active: true })),
  );
  if (error) throw error;
}

const { data: statuses } = await supabase.from("quote_statuses").select("*").eq("organization_id", org.id);
const statusBySlug = new Map((statuses ?? []).map((s) => [s.slug, s.id]));

for (const account of ACCOUNTS) {
  const user = await upsertUser(
    account.email,
    account.password,
    account.platform ? { role: account.platform } : {},
  );
  if (!account.role) continue;
  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("organization_id", org.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) {
    const { error } = await supabase.from("memberships").insert({
      organization_id: org.id,
      user_id: user.id,
      role: account.role,
      status: "active",
    });
    if (error) throw error;
  }
}

const { count: quoteCount } = await supabase
  .from("quotes")
  .select("id", { count: "exact", head: true })
  .eq("organization_id", org.id);
if (!quoteCount) {
  const { error } = await supabase.from("quotes").insert(
    QUOTES.map((q) => quoteRow(q, org.id, configurator.id, statusBySlug)),
  );
  if (error) throw error;
}

const { data: existingQuotes } = await supabase
  .from("quotes")
  .select("id, contact_email, created_at")
  .eq("organization_id", org.id);
const quoteByEmail = new Map((existingQuotes ?? []).map((q) => [q.contact_email, q]));

for (const spec of QUOTES) {
  const row = quoteByEmail.get(spec.contact_email);
  if (!row) continue;
  const { error: updateError } = await supabase
    .from("quotes")
    .update(quoteRow(spec, org.id, configurator.id, statusBySlug))
    .eq("id", row.id);
  if (updateError) throw updateError;

  const { count: itemCount } = await supabase
    .from("quote_items")
    .select("id", { count: "exact", head: true })
    .eq("quote_id", row.id);
  if (!itemCount && spec.items?.length) {
    const { error } = await supabase.from("quote_items").insert(
      spec.items.map((item) => ({
        organization_id: org.id,
        quote_id: row.id,
        name: item.name,
        quantity: item.quantity,
        price_min: item.price_min,
        price_max: item.price_max,
        options: item.options ?? {},
      })),
    );
    if (error) throw error;
  }

  const { count: noteCount } = await supabase
    .from("quote_notes")
    .select("id", { count: "exact", head: true })
    .eq("quote_id", row.id);
  if (!noteCount && spec.note) {
    const { error } = await supabase.from("quote_notes").insert({
      organization_id: org.id,
      quote_id: row.id,
      content: spec.note,
    });
    if (error) throw error;
  }

  const { count: activityCount } = await supabase
    .from("quote_activities")
    .select("id", { count: "exact", head: true })
    .eq("quote_id", row.id);
  if (!activityCount) {
    const submitted = new Date(row.created_at);
    const later = new Date(submitted.getTime() + 36 * 60 * 1000);
    const { error } = await supabase.from("quote_activities").insert([
      {
        organization_id: org.id,
        quote_id: row.id,
        type: "submitted",
        payload: { score: spec.score, label: spec.score_label },
        created_at: submitted.toISOString(),
      },
      {
        organization_id: org.id,
        quote_id: row.id,
        type: "email_sent",
        payload: { template_kind: "prospect_confirm" },
        created_at: new Date(submitted.getTime() + 2 * 60 * 1000).toISOString(),
      },
      {
        organization_id: org.id,
        quote_id: row.id,
        type: "email_sent",
        payload: { template_kind: "sales_brief" },
        created_at: new Date(submitted.getTime() + 3 * 60 * 1000).toISOString(),
      },
      {
        organization_id: org.id,
        quote_id: row.id,
        type: "status_changed",
        payload: { status: spec.status_slug, label: STATUSES.find((s) => s.slug === spec.status_slug)?.label },
        created_at: later.toISOString(),
      },
    ]);
    if (error) throw error;
  }

  const { count: messageCount } = await supabase
    .from("prospect_messages")
    .select("id", { count: "exact", head: true })
    .eq("quote_id", row.id);
  if (!messageCount && spec.message) {
    const { error } = await supabase.from("prospect_messages").insert({
      organization_id: org.id,
      quote_id: row.id,
      sender: "prospect",
      content: spec.message,
    });
    if (error) throw error;
  }
}

function quoteRow(q, organizationId, configuratorId, statusBySlug) {
  return {
    organization_id: organizationId,
    configurator_id: configuratorId,
    contact_name: q.contact_name,
    contact_email: q.contact_email,
    contact_company: q.contact_company,
    contact_phone: q.contact_phone,
    score: q.score,
    score_label: q.score_label,
    status: q.status,
    status_id: statusBySlug.get(q.status_slug) ?? null,
    answers: q.answers ?? {},
    extracted_params: {},
    utm_source: q.utm_source ?? null,
    utm_medium: q.utm_medium ?? null,
    utm_campaign: q.utm_campaign ?? null,
    referrer: q.referrer ?? null,
  };
}

console.log("Comptes démo prêts :");
for (const account of ACCOUNTS) {
  console.log(`  ${account.email} / ${account.password} (${account.platform || account.role})`);
}
