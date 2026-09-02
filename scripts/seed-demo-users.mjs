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
  },
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
    QUOTES.map((q) => ({
      organization_id: org.id,
      configurator_id: configurator.id,
      contact_name: q.contact_name,
      contact_email: q.contact_email,
      contact_company: q.contact_company,
      contact_phone: q.contact_phone,
      score: q.score,
      score_label: q.score_label,
      status: q.status,
      status_id: statusBySlug.get(q.status_slug) ?? null,
    })),
  );
  if (error) throw error;
}

console.log("Comptes démo prêts :");
for (const account of ACCOUNTS) {
  console.log(`  ${account.email} / ${account.password} (${account.platform || account.role})`);
}
