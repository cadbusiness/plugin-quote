import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { fetchAllRows } from "@/lib/supabase/paginate";
import { getAppUrl } from "@/lib/supabase/env";
import { PUBLIC_APP_URL } from "@/lib/supabase/public-defaults";
import { SITE_URL } from "@/lib/marketing/site";
import { isAdminRole } from "@/lib/auth/org";
import type { Json, Tables } from "@/lib/db/database.types";
import { funnelEmbedCodes } from "@/lib/configurator/capture-embed";
import { insertFunnelFromTemplate, parseCreateFunnelForm } from "@/lib/funnels/create";
import { funnelKindLabel, parseFunnelKind } from "@/lib/funnels/kind";
import { QUESTION_LABEL, screenLabel, type FunnelKind } from "@/lib/funnels/builder";
import { mergeFunnelTracking, parseFunnelTracking, parseOrgGtm } from "@/lib/funnels/tracking";
import {
  AGENT_GREETING_MAX,
  AGENT_INSTRUCTIONS_MAX,
  mergeFunnelAgentSettings,
  parseFunnelAgentSettings,
} from "@/lib/funnels/agent-settings";
import type { CatalogProductRow } from "@/lib/api/catalog-search";
import { isUuid } from "@/lib/api/crm-core";
import {
  applyTrackingPatch,
  listTemplates,
  normalizeConditions,
  planStepsReplace,
  publishWarnings,
  resolveProductRefs,
  resolveTemplateId,
  structureIssues,
  type RuleInput,
  type StepInput,
} from "@/lib/api/funnel-config-core";
import type { RuleConditions, ScreenType } from "@/lib/wizard/types";

type Supabase = ReturnType<typeof createServiceClient>;
type FunnelRow = Tables<"configurators">;

/** Who is writing: API keys are org-level (created by an admin); OAuth tokens carry the user. */
export type FunnelActor = { userId: string | null };

const PRODUCT_COLUMNS =
  "id, name, sku, category, tags, price_min, price_max, currency, stock_status, external_url, configurator_id, is_active, variants";

function fail(messages: string[] | string): never {
  const list = Array.isArray(messages) ? messages : [messages];
  throw new Error(list.length === 1 ? list[0] : `Modification refusée :\n- ${list.join("\n- ")}`);
}

/** Page links on the marketing host; widget.js and /embed stay on the host installed sites call. */
export function funnelOrigins() {
  const widgetOrigin = getAppUrl().replace(/\/$/, "");
  const pageOrigin = widgetOrigin === PUBLIC_APP_URL ? SITE_URL : widgetOrigin;
  return { widgetOrigin, pageOrigin };
}

export async function assertFunnelAdmin(organizationId: string, actor: FunnelActor) {
  if (!actor.userId) return;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", actor.userId)
    .eq("status", "active")
    .maybeSingle();
  if (!data || !isAdminRole(data.role)) {
    fail("Droits insuffisants : seul un propriétaire ou un admin de l’organisation peut configurer un funnel.");
  }
}

async function loadFunnel(supabase: Supabase, organizationId: string, funnelId: string): Promise<FunnelRow> {
  if (!isUuid(funnelId)) fail("Funnel introuvable");
  const { data } = await supabase
    .from("configurators")
    .select("*")
    .eq("id", funnelId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!data) fail("Funnel introuvable");
  return data;
}

function kindOf(funnel: FunnelRow): FunnelKind {
  return parseFunnelKind(funnel.theme, funnel.wizard_enabled, funnel.chat_enabled);
}

/** Editor writes go live at once (no draft copy in the app), so a live funnel needs explicit consent. */
function assertEditable(funnel: FunnelRow, confirmPublished: boolean | undefined) {
  if (funnel.is_active && confirmPublished !== true) {
    fail(
      `Le funnel « ${funnel.name} » est publié : comme dans l’éditeur, la modification s’appliquera immédiatement aux visiteurs. Montrez le changement au marchand puis relancez avec confirm_published=true, ou dépubliez d’abord (publish_funnel publish=false).`,
    );
  }
}

async function loadStructure(supabase: Supabase, organizationId: string, funnelId: string) {
  const { data: steps } = await supabase
    .from("wizard_steps")
    .select("id, screen_type, sort_order, title, subtitle")
    .eq("organization_id", organizationId)
    .eq("configurator_id", funnelId)
    .order("sort_order", { ascending: true });
  const stepIds = (steps ?? []).map((step) => step.id);
  const { data: questions } = stepIds.length
    ? await supabase
        .from("wizard_questions")
        .select("id, step_id, key, label, help_text, type, required, sort_order, options")
        .eq("organization_id", organizationId)
        .in("step_id", stepIds)
        .order("sort_order", { ascending: true })
    : { data: [] };
  return { steps: steps ?? [], questions: questions ?? [] };
}

async function loadRules(supabase: Supabase, organizationId: string, funnelId: string) {
  const { data } = await supabase
    .from("suggestion_rules")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("configurator_id", funnelId)
    .order("priority", { ascending: false });
  return data ?? [];
}

async function loadOrgProducts(supabase: Supabase, organizationId: string) {
  return fetchAllRows<CatalogProductRow>(
    (from, to) =>
      supabase
        .from("products")
        .select(PRODUCT_COLUMNS)
        .eq("organization_id", organizationId)
        .order("id")
        .range(from, to) as unknown as PromiseLike<{ data: CatalogProductRow[] | null; error: { message: string } | null }>,
    { max: 20000 },
  );
}

async function activeProductCount(supabase: Supabase, organizationId: string, funnelId: string) {
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("configurator_id", funnelId)
    .eq("is_active", true);
  return count ?? 0;
}

function touch(funnelId: string) {
  try {
    revalidatePath("/funnels");
    revalidatePath(`/funnels/${funnelId}`);
  } catch {
    // Outside a Next request (scripts): nothing cached to refresh.
  }
}

// --- read

export async function apiGetFunnel(organizationId: string, funnelId: string) {
  const supabase = createServiceClient();
  const funnel = await loadFunnel(supabase, organizationId, funnelId);
  const [{ data: org }, structure, rules, productCount] = await Promise.all([
    supabase
      .from("organizations")
      .select("slug, name, sales_email, ga_measurement_id, branding")
      .eq("id", organizationId)
      .maybeSingle(),
    loadStructure(supabase, organizationId, funnel.id),
    loadRules(supabase, organizationId, funnel.id),
    activeProductCount(supabase, organizationId, funnel.id),
  ]);
  if (!org) fail("Organisation introuvable");

  const ruleProductIds = [...new Set(rules.flatMap((rule) => rule.product_ids ?? []))];
  const { data: ruleProducts } = ruleProductIds.length
    ? await supabase
        .from("products")
        .select("id, name, sku, is_active, configurator_id")
        .eq("organization_id", organizationId)
        .in("id", ruleProductIds)
    : { data: [] };
  const productById = new Map((ruleProducts ?? []).map((product) => [product.id, product]));

  const kind = kindOf(funnel);
  const tracking = parseFunnelTracking(funnel.theme);
  const agent = parseFunnelAgentSettings(funnel.theme);
  const { widgetOrigin, pageOrigin } = funnelOrigins();
  const codes = funnelEmbedCodes({
    pageOrigin,
    widgetOrigin,
    orgSlug: org.slug,
    funnelSlug: funnel.slug,
    funnelName: funnel.name,
  });
  const questionLabels = new Map(structure.questions.map((q) => [q.key, q.label]));
  const shape = structure.steps.map((step) => ({
    screen_type: step.screen_type,
    questions: structure.questions
      .filter((q) => q.step_id === step.id)
      .map((q) => ({ type: q.type, options: q.options, label: q.label })),
  }));
  const blockers = structureIssues(shape, kind);
  const warnings = publishWarnings({
    kind,
    productCount,
    ruleCount: rules.filter((rule) => rule.is_active).length,
    hasSuggestionsStep: structure.steps.some((step) => step.screen_type === "suggestions"),
  });

  return {
    id: funnel.id,
    name: funnel.name,
    slug: funnel.slug,
    mode: kind,
    mode_label: funnelKindLabel(kind),
    status: funnel.is_active ? "published" : "unpublished",
    status_label: funnel.is_active ? "Publié" : "Non publié (brouillon)",
    template: funnel.sector,
    created_at: funnel.created_at,
    links: {
      public_url: codes.publicUrl,
      editor_url: `${pageOrigin}/funnels/${funnel.id}`,
      note: funnel.is_active
        ? null
        : "Non publié : le lien public et les codes d’intégration renvoient « introuvable » tant que le funnel n’est pas publié. Aperçu : onglet Parcours de l’éditeur.",
    },
    steps: structure.steps.map((step, index) => ({
      id: step.id,
      position: index + 1,
      type: step.screen_type,
      type_label: screenLabel(step.screen_type as ScreenType, kind),
      title: step.title,
      subtitle: step.subtitle,
      questions: structure.questions
        .filter((q) => q.step_id === step.id)
        .map((q) => ({
          id: q.id,
          key: q.key,
          label: q.label,
          type: q.type,
          type_label: QUESTION_LABEL[q.type as keyof typeof QUESTION_LABEL] ?? q.type,
          required: q.required,
          help: q.help_text,
          options: q.options,
        })),
    })),
    suggestion_rules: rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      is_active: rule.is_active,
      priority: rule.priority,
      headline: rule.headline,
      description: rule.description,
      price_min: rule.price_min,
      price_max: rule.price_max,
      conditions: (((rule.conditions ?? {}) as RuleConditions).all ?? []).map((condition) => ({
        question_key: condition.key,
        question_label: questionLabels.get(condition.key) ?? null,
        op: condition.op,
        value: condition.value,
      })),
      products: (rule.product_ids ?? []).map((id) => {
        const product = productById.get(id);
        return {
          id,
          name: product?.name ?? null,
          sku: product?.sku ?? null,
          usable: Boolean(product?.is_active && product.configurator_id === funnel.id),
        };
      }),
    })),
    catalog: {
      active_products: productCount,
      note: "Un funnel ne propose que les produits de son propre catalogue (search_catalog avec funnel_id).",
    },
    chat_agent: funnel.chat_enabled
      ? {
          instructions: agent.instructions || null,
          greeting: agent.greeting || null,
          escalation: {
            sales_email: org.sales_email,
            note: "Les demandes finalisées par l’agent arrivent dans QuoteBuilder comme les autres devis ; l’email commercial se règle dans Paramètres (organisation).",
          },
          language: "fr",
        }
      : null,
    tracking: {
      ga4_id: tracking.ga || null,
      gtm_id: tracking.gtm || null,
      meta_pixel_id: tracking.metaPixel || null,
      inherited: {
        ga4_id: tracking.ga ? null : org.ga_measurement_id,
        gtm_id: tracking.gtm ? null : parseOrgGtm(org.branding as Json) || null,
      },
    },
    publish_check: { blockers, warnings },
    embed: embedView(funnel, kind, codes, widgetOrigin),
  };
}

function embedView(
  funnel: FunnelRow,
  kind: FunnelKind,
  codes: ReturnType<typeof funnelEmbedCodes>,
  widgetOrigin: string,
) {
  return {
    available: funnel.is_active,
    public_url: codes.publicUrl,
    widget_js: codes.widget,
    question_module: codes.capture,
    agent_module: codes.agent,
    iframe: codes.iframe,
    wordpress: {
      shortcode: codes.shortcode,
      question_shortcode: codes.captureShortcode,
      agent_shortcode: codes.agentShortcode,
      plugin_download_url: `${widgetOrigin}/api/public/plugin/wordpress/download`,
      instructions:
        "Installer l’extension QuoteBuilder (QuoteBuilder → Intégrations → WordPress, ou le lien de téléchargement), puis coller le shortcode dans une page ou utiliser le bloc Gutenberg QuoteBuilder.",
    },
    guide: {
      widget_js: "Funnel complet dans la page : coller le bloc là où le funnel doit apparaître.",
      question_module: "Carte « une question » qui ouvre le funnel.",
      agent_module:
        kind === "chat" ? "Bloc chat de l’agent IA, intégré dans la page (recommandé pour ce funnel chat)." : "Bloc chat agent intégré dans la page.",
      iframe: "Si le site interdit les scripts tiers.",
    },
  };
}

export async function apiGetEmbedCode(organizationId: string, funnelId: string) {
  const view = await apiGetFunnel(organizationId, funnelId);
  return {
    funnel: { id: view.id, name: view.name, status: view.status, status_label: view.status_label },
    editor_url: view.links.editor_url,
    note: view.links.note,
    ...view.embed,
  };
}

export function apiListFunnelTemplates() {
  return {
    modes: [
      { id: "form", label: "Formulaire", description: "Questions de cadrage puis produits recommandés et contact." },
      { id: "chat", label: "Chat IA", description: "Le prospect décrit son projet, l’agent IA cherche dans le catalogue du funnel." },
      { id: "catalog", label: "Catalogue", description: "Le prospect parcourt les rayons et envoie une demande unique." },
    ],
    templates: listTemplates(),
  };
}

// --- create

export async function apiCreateFunnel(
  organizationId: string,
  actor: FunnelActor,
  input: { name: string; mode: FunnelKind; template?: string; from_catalog?: string; screens?: ScreenType[] },
) {
  const templateId = resolveTemplateId(input.template, input.mode);
  if (!templateId) {
    fail(`Template « ${input.template} » inconnu. Voir list_funnel_templates.`);
  }
  await assertFunnelAdmin(organizationId, actor);
  const supabase = createServiceClient();

  let catalogFrom: string | null = null;
  if (input.from_catalog) {
    if (input.from_catalog === "auto") {
      const rows = await fetchAllRows<{ configurator_id: string }>(
        (from, to) =>
          supabase
            .from("products")
            .select("configurator_id")
            .eq("organization_id", organizationId)
            .eq("is_active", true)
            .order("id")
            .range(from, to),
        { max: 20000 },
      );
      const counts = new Map<string, number>();
      for (const row of rows) counts.set(row.configurator_id, (counts.get(row.configurator_id) ?? 0) + 1);
      catalogFrom = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      if (!catalogFrom) fail("Aucun catalogue produit dans l’organisation : synchronisez WooCommerce / Shopify ou importez un CSV d’abord.");
    } else {
      catalogFrom = (await loadFunnel(supabase, organizationId, input.from_catalog)).id;
    }
  }

  // Same parsing as the « Nouveau funnel » dialog (contact step forced, catalogue screens).
  const form = new FormData();
  form.set("name", input.name.trim());
  form.set("sector", templateId);
  form.set("kind", input.mode);
  for (const screen of input.screens ?? ["questions", "suggestions", "customize", "contact"]) form.append("screens", screen);
  if (catalogFrom) form.set("catalog_from", catalogFrom);
  const parsed = parseCreateFunnelForm(form);
  if (!parsed) fail("Nom du funnel trop court (2 caractères minimum).");

  const created = await insertFunnelFromTemplate(supabase, organizationId, { ...parsed, isActive: false });
  if (!created) fail("Création du funnel impossible.");
  touch(created.id);
  return apiGetFunnel(organizationId, created.id);
}

// --- steps

export async function apiUpdateFunnelSteps(
  organizationId: string,
  actor: FunnelActor,
  input: { funnel_id: string; steps: StepInput[]; confirm_published?: boolean },
) {
  await assertFunnelAdmin(organizationId, actor);
  const supabase = createServiceClient();
  const funnel = await loadFunnel(supabase, organizationId, input.funnel_id);
  assertEditable(funnel, input.confirm_published);
  const current = await loadStructure(supabase, organizationId, funnel.id);
  const planned = planStepsReplace(input.steps, current, kindOf(funnel));
  if (!planned.ok) fail(planned.errors);
  const { plan } = planned;

  const fresh = plan.steps.filter((step) => !step.id);
  const stepIdByOrder = new Map(plan.steps.filter((step) => step.id).map((step) => [step.sort_order, step.id!]));
  if (fresh.length) {
    const { data, error } = await supabase
      .from("wizard_steps")
      .insert(
        fresh.map((step) => ({
          organization_id: organizationId,
          configurator_id: funnel.id,
          sort_order: step.sort_order,
          title: step.title,
          subtitle: step.subtitle,
          screen_type: step.screen_type,
        })),
      )
      .select("id, sort_order");
    if (error) fail(`Écriture interrompue (étapes) : ${error.message}. Relisez get_funnel.`);
    for (const row of data ?? []) stepIdByOrder.set(row.sort_order, row.id);
  }

  for (const step of plan.steps.filter((item) => item.id)) {
    const { error } = await supabase
      .from("wizard_steps")
      .update({ sort_order: step.sort_order, title: step.title, subtitle: step.subtitle, screen_type: step.screen_type })
      .eq("id", step.id!)
      .eq("organization_id", organizationId)
      .eq("configurator_id", funnel.id);
    if (error) fail(`Écriture interrompue (étape ${step.sort_order + 1}) : ${error.message}. Relisez get_funnel.`);
  }

  const inserts: {
    organization_id: string;
    step_id: string;
    key: string;
    label: string;
    help_text: string | null;
    type: string;
    required: boolean;
    sort_order: number;
    options: Json;
  }[] = [];
  for (const step of plan.steps) {
    const stepId = stepIdByOrder.get(step.sort_order);
    if (!stepId) fail("Écriture interrompue : étape non créée. Relisez get_funnel.");
    for (const question of step.questions) {
      const row = {
        step_id: stepId,
        key: question.key,
        label: question.label,
        help_text: question.help_text,
        type: question.type,
        required: question.required,
        sort_order: question.sort_order,
        options: question.options as unknown as Json,
      };
      if (!question.id) {
        inserts.push({ organization_id: organizationId, ...row });
        continue;
      }
      const { error } = await supabase
        .from("wizard_questions")
        .update(row)
        .eq("id", question.id)
        .eq("organization_id", organizationId);
      if (error) fail(`Écriture interrompue (question « ${question.label} ») : ${error.message}. Relisez get_funnel.`);
    }
  }
  if (inserts.length) {
    const { error } = await supabase.from("wizard_questions").insert(inserts);
    if (error) fail(`Écriture interrompue (questions) : ${error.message}. Relisez get_funnel.`);
  }
  if (plan.deleteQuestionIds.length) {
    await supabase.from("wizard_questions").delete().eq("organization_id", organizationId).in("id", plan.deleteQuestionIds);
  }
  if (plan.deleteStepIds.length) {
    await supabase
      .from("wizard_steps")
      .delete()
      .eq("organization_id", organizationId)
      .eq("configurator_id", funnel.id)
      .in("id", plan.deleteStepIds);
  }
  touch(funnel.id);

  const rules = await loadRules(supabase, organizationId, funnel.id);
  const broken = rules
    .filter((rule) =>
      (((rule.conditions ?? {}) as RuleConditions).all ?? []).some((c) => plan.removedKeys.includes(c.key)),
    )
    .map((rule) => rule.name);
  return {
    funnel: await apiGetFunnel(organizationId, funnel.id),
    warnings: broken.length
      ? [`Règles qui utilisent une clé supprimée (${plan.removedKeys.join(", ")}) et ne matcheront plus : ${broken.join(", ")}. Mettez-les à jour avec set_suggestion_rules.`]
      : [],
  };
}

// --- suggestion rules

export async function apiSetSuggestionRules(
  organizationId: string,
  actor: FunnelActor,
  input: { funnel_id: string; rules: RuleInput[]; mode?: "replace" | "upsert"; confirm_published?: boolean },
) {
  await assertFunnelAdmin(organizationId, actor);
  const supabase = createServiceClient();
  const funnel = await loadFunnel(supabase, organizationId, input.funnel_id);
  assertEditable(funnel, input.confirm_published);
  const [structure, existing, orgProducts, { data: funnels }] = await Promise.all([
    loadStructure(supabase, organizationId, funnel.id),
    loadRules(supabase, organizationId, funnel.id),
    loadOrgProducts(supabase, organizationId),
    supabase.from("configurators").select("id, name").eq("organization_id", organizationId),
  ]);
  const funnelProducts = orgProducts.filter((product) => product.configurator_id === funnel.id);
  const funnelNames = new Map((funnels ?? []).map((row) => [row.id, row.name]));
  const existingById = new Map(existing.map((rule) => [rule.id, rule]));
  const existingByName = new Map(existing.map((rule) => [rule.name.trim().toLowerCase(), rule]));

  const errors: string[] = [];
  const names = new Set<string>();
  const rows = input.rules.map((rule, index) => {
    const prefix = `Règle ${index + 1} « ${rule.name} »`;
    const lower = rule.name.trim().toLowerCase();
    if (names.has(lower)) errors.push(`${prefix} : nom en double.`);
    names.add(lower);
    if (rule.id && !existingById.has(rule.id)) errors.push(`${prefix} : id ${rule.id} inconnu pour ce funnel.`);
    if (rule.price_min != null && rule.price_max != null && rule.price_min > rule.price_max) {
      errors.push(`${prefix} : price_min supérieur à price_max.`);
    }
    const conditions = normalizeConditions(rule.conditions, structure.questions, prefix);
    const products = resolveProductRefs(rule.products, funnelProducts, orgProducts, funnelNames);
    errors.push(...conditions.errors, ...products.errors.map((error) => `${prefix} : ${error}`));
    const target = rule.id ? existingById.get(rule.id) : existingByName.get(lower);
    return {
      targetId: target?.id ?? null,
      row: {
        name: rule.name.trim(),
        headline: rule.headline?.trim() || null,
        description: rule.description?.trim() || null,
        priority: rule.priority ?? 0,
        is_active: rule.is_active ?? true,
        price_min: rule.price_min ?? null,
        price_max: rule.price_max ?? null,
        conditions: { all: conditions.conditions } as unknown as Json,
        product_ids: products.ids,
      },
      resolved: products.resolved,
    };
  });
  if (input.rules.length > 50) errors.push("50 règles maximum par funnel.");
  if (errors.length) fail(errors);

  const kept = new Set<string>();
  for (const item of rows) {
    if (item.targetId) {
      kept.add(item.targetId);
      const { error } = await supabase
        .from("suggestion_rules")
        .update(item.row)
        .eq("id", item.targetId)
        .eq("organization_id", organizationId)
        .eq("configurator_id", funnel.id);
      if (error) fail(`Écriture interrompue (« ${item.row.name} ») : ${error.message}. Relisez get_funnel.`);
    }
  }
  const inserts = rows.filter((item) => !item.targetId);
  if (inserts.length) {
    const { error } = await supabase.from("suggestion_rules").insert(
      inserts.map((item) => ({ organization_id: organizationId, configurator_id: funnel.id, ...item.row })),
    );
    if (error) fail(`Écriture interrompue (nouvelles règles) : ${error.message}. Relisez get_funnel.`);
  }
  const removed = (input.mode ?? "replace") === "replace" ? existing.filter((rule) => !kept.has(rule.id)) : [];
  if (removed.length) {
    await supabase
      .from("suggestion_rules")
      .delete()
      .eq("organization_id", organizationId)
      .eq("configurator_id", funnel.id)
      .in("id", removed.map((rule) => rule.id));
  }
  touch(funnel.id);
  try {
    revalidatePath("/produits/regles");
  } catch {
    // Outside a Next request.
  }
  return {
    funnel: await apiGetFunnel(organizationId, funnel.id),
    resolved_products: rows.flatMap((item) => item.resolved.map((hit) => ({ rule: item.row.name, ...hit }))),
    removed_rules: removed.map((rule) => rule.name),
  };
}

// --- chat agent

export async function apiSetChatAgent(
  organizationId: string,
  actor: FunnelActor,
  input: { funnel_id: string; instructions?: string; greeting?: string; confirm_published?: boolean },
) {
  await assertFunnelAdmin(organizationId, actor);
  const supabase = createServiceClient();
  const funnel = await loadFunnel(supabase, organizationId, input.funnel_id);
  if (!funnel.chat_enabled) fail("Ce funnel n’est pas en mode chat : les réglages de l’agent ne s’y appliquent pas.");
  assertEditable(funnel, input.confirm_published);
  const current = parseFunnelAgentSettings(funnel.theme);
  if ((input.instructions?.length ?? 0) > AGENT_INSTRUCTIONS_MAX) fail(`instructions : ${AGENT_INSTRUCTIONS_MAX} caractères maximum.`);
  if ((input.greeting?.length ?? 0) > AGENT_GREETING_MAX) fail(`greeting : ${AGENT_GREETING_MAX} caractères maximum.`);
  const theme = mergeFunnelAgentSettings(funnel.theme, {
    instructions: input.instructions ?? current.instructions,
    greeting: input.greeting ?? current.greeting,
  });
  const { error } = await supabase
    .from("configurators")
    .update({ theme })
    .eq("id", funnel.id)
    .eq("organization_id", organizationId);
  if (error) fail(error.message);
  touch(funnel.id);
  return apiGetFunnel(organizationId, funnel.id);
}

// --- tracking

export async function apiSetFunnelTracking(
  organizationId: string,
  actor: FunnelActor,
  input: { funnel_id: string; ga4_id?: string; gtm_id?: string; meta_pixel_id?: string },
) {
  await assertFunnelAdmin(organizationId, actor);
  const supabase = createServiceClient();
  const funnel = await loadFunnel(supabase, organizationId, input.funnel_id);
  const next = applyTrackingPatch(parseFunnelTracking(funnel.theme), input);
  if (!next.ok) fail(next.errors);
  const { error } = await supabase
    .from("configurators")
    .update({ theme: mergeFunnelTracking(funnel.theme, next.tracking) })
    .eq("id", funnel.id)
    .eq("organization_id", organizationId);
  if (error) fail(error.message);
  touch(funnel.id);
  return apiGetFunnel(organizationId, funnel.id);
}

// --- publish

export async function apiPublishFunnel(
  organizationId: string,
  actor: FunnelActor,
  input: { funnel_id: string; publish: boolean; confirm?: boolean },
) {
  await assertFunnelAdmin(organizationId, actor);
  if (input.confirm !== true) {
    fail(
      input.publish
        ? "Publication non confirmée : le funnel deviendra accessible à tous les visiteurs. Demandez l’accord explicite du marchand puis relancez avec confirm=true."
        : "Dépublication non confirmée : le lien public et les intégrations cesseront de fonctionner. Demandez l’accord explicite du marchand puis relancez avec confirm=true.",
    );
  }
  const supabase = createServiceClient();
  const funnel = await loadFunnel(supabase, organizationId, input.funnel_id);
  if (input.publish) {
    const before = await apiGetFunnel(organizationId, funnel.id);
    if (before.publish_check.blockers.length) fail(before.publish_check.blockers);
  }
  if (funnel.is_active !== input.publish) {
    const { error } = await supabase
      .from("configurators")
      .update({ is_active: input.publish })
      .eq("id", funnel.id)
      .eq("organization_id", organizationId);
    if (error) fail(error.message);
    touch(funnel.id);
    try {
      revalidatePath("/accueil");
    } catch {
      // Outside a Next request.
    }
  }
  return apiGetFunnel(organizationId, funnel.id);
}
