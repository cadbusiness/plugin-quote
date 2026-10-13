import assert from "node:assert/strict";
import {
  applyTrackingPatch,
  keyFromLabel,
  listTemplates,
  normalizeConditions,
  planStepsReplace,
  publishWarnings,
  resolveProductRefs,
  resolveTemplateId,
  stepsBody,
  structureIssues,
  type ResolvableProduct,
  type StepInput,
  type StoredQuestion,
  type StoredStep,
} from "./funnel-config-core";
import {
  mergeFunnelAgentSettings,
  parseFunnelAgentSettings,
  publicDefinitionTheme,
} from "@/lib/funnels/agent-settings";
import { funnelEmbedCodes } from "@/lib/configurator/capture-embed";
import { evaluateSuggestions } from "@/lib/wizard/suggestions";
import { buildQuoteAgentSystemPrompt } from "@/lib/commerce-agent/prompt";
import type { ConfiguratorDefinition, Product } from "@/lib/wizard/types";
import type { Tables } from "@/lib/db/database.types";

const S1 = "11111111-1111-4111-8111-111111111111";
const S2 = "22222222-2222-4222-8222-222222222222";
const Q1 = "33333333-3333-4333-8333-333333333333";
const Q2 = "44444444-4444-4444-8444-444444444444";

// --- keys
assert.equal(keyFromLabel("Type d’espace"), "type_d_espace");
assert.equal(keyFromLabel("2 niveaux"), "q_2_niveaux");
assert.equal(keyFromLabel("€€"), "q");

// --- steps plan
const currentSteps: StoredStep[] = [
  { id: S1, screen_type: "questions", sort_order: 0, title: "Projet", subtitle: null },
  { id: S2, screen_type: "contact", sort_order: 1, title: "Vos coordonnées", subtitle: null },
];
const currentQuestions: StoredQuestion[] = [
  { id: Q1, step_id: S1, key: "project_type", label: "Type", help_text: null, type: "select", required: true, sort_order: 0, options: { choices: [{ value: "a", label: "A" }] } },
  { id: Q2, step_id: S1, key: "surface", label: "Surface", help_text: null, type: "number", required: true, sort_order: 1, options: {} },
];
const current = { steps: currentSteps, questions: currentQuestions };

const desired: StepInput[] = [
  {
    id: S1,
    type: "questions",
    title: "Votre stockage",
    questions: [
      { id: Q1, label: "Type d’espace", type: "visual_choice", options: { choices: [{ label: "Entrepôt" }, { label: "Commerce" }, { label: "Entrepôt" }] } },
      { label: "Charge par niveau", type: "number", options: { unit: "kg", min: 0, max: 5000 } },
    ],
  },
  { type: "suggestions", title: "Gammes adaptées" },
  { id: S2, type: "contact", title: "Vos coordonnées" },
];
const plan = planStepsReplace(desired, current, "form");
assert.ok(plan.ok, JSON.stringify(plan));
if (plan.ok) {
  const [questions, suggestions, contact] = plan.plan.steps;
  assert.equal(questions.id, S1);
  assert.equal(questions.questions[0].key, "project_type", "kept question keeps its key");
  assert.deepEqual(
    questions.questions[0].options.choices?.map((c) => c.value),
    ["entrepot", "commerce", "entrepot_2"],
  );
  assert.equal(questions.questions[1].key, "charge_par_niveau");
  assert.equal(questions.questions[1].options.unit, "kg");
  assert.equal(questions.questions[1].options.step, 1, "number defaults from the editor");
  assert.equal(questions.questions[1].required, true);
  assert.equal(suggestions.id, null);
  assert.equal(suggestions.sort_order, 1);
  assert.equal(contact.sort_order, 2);
  assert.deepEqual(plan.plan.deleteQuestionIds, [Q2]);
  assert.deepEqual(plan.plan.deleteStepIds, []);
  assert.deepEqual(plan.plan.removedKeys, ["surface"]);
}

// contact must exist, once, last
const noContact = planStepsReplace([{ type: "questions", title: "Q", questions: [{ label: "Texte", type: "text" }] }], current, "form");
assert.ok(!noContact.ok && noContact.errors.some((e) => e.includes("exactement une étape contact")));
const contactFirst = planStepsReplace(
  [
    { type: "contact", title: "Contact" },
    { type: "questions", title: "Q", questions: [{ label: "Texte", type: "text" }] },
  ],
  current,
  "form",
);
assert.ok(!contactFirst.ok && contactFirst.errors.some((e) => e.includes("dernière")));

// unknown ids, duplicate keys, choice without options, questions on a non-question step
const bad = planStepsReplace(
  [
    {
      id: "99999999-9999-4999-8999-999999999999",
      type: "questions",
      title: "Q",
      questions: [
        { key: "budget", label: "Budget", type: "select", options: { choices: [] } },
        { key: "budget", label: "Budget 2", type: "text", options: { choices: [{ label: "x" }] } },
      ],
    },
    { type: "suggestions", title: "S", questions: [{ label: "Oups", type: "text" }] },
    { type: "contact", title: "C" },
  ],
  current,
  "form",
);
assert.ok(!bad.ok);
if (!bad.ok) {
  assert.ok(bad.errors.some((e) => e.includes("inconnu dans ce funnel")));
  assert.ok(bad.errors.some((e) => e.includes("déjà utilisée")));
  assert.ok(bad.errors.some((e) => e.includes("au moins une option")));
  assert.ok(bad.errors.some((e) => e.includes("options.choices n’est valable")));
  assert.ok(bad.errors.some((e) => e.includes("seules les étapes questions")));
}

// catalog funnels keep their browse + quote steps
const catalogIssues = structureIssues([{ screen_type: "contact", questions: [] }], "catalog");
assert.equal(catalogIssues.length, 2);
assert.deepEqual(
  structureIssues(
    [
      { screen_type: "suggestions", questions: [] },
      { screen_type: "customize", questions: [] },
      { screen_type: "contact", questions: [] },
    ],
    "catalog",
  ),
  [],
);

// zod body: limits and types
assert.equal(stepsBody.safeParse({ steps: [] }).success, false);
assert.equal(stepsBody.safeParse({ steps: [{ type: "contact", title: "C" }] }).success, true);
assert.equal(stepsBody.safeParse({ steps: [{ type: "video", title: "C" }] }).success, false);
assert.equal(
  stepsBody.safeParse({ steps: [{ type: "questions", title: "Q", questions: [{ label: "x", type: "slider" }] }] }).success,
  false,
);
assert.equal(stepsBody.safeParse({ steps: [{ id: "nope", type: "contact", title: "C" }] }).success, false);

// --- rule conditions
const ruleQuestions = [
  { key: "project_type", label: "Type", type: "visual_choice", options: { choices: [{ value: "entrepot", label: "Entrepôt" }, { value: "commerce", label: "Commerce" }] } },
  { key: "surface", label: "Surface", type: "number", options: {} },
  { key: "usages", label: "Usages", type: "multi_select", options: { choices: [{ value: "palettes", label: "Palettes" }] } },
];
const ok = normalizeConditions(
  [
    { question_key: "project_type", op: "eq", value: "Entrepôt" },
    { question_key: "surface", op: "gte", value: "200" },
    { question_key: "usages", op: "contains", value: "palettes" },
    { question_key: "project_type", op: "in", value: ["entrepot", "Commerce"] },
  ],
  ruleQuestions,
  "R1",
);
assert.deepEqual(ok.errors, []);
assert.deepEqual(ok.conditions, [
  { key: "project_type", op: "eq", value: "entrepot" },
  { key: "surface", op: "gte", value: 200 },
  { key: "usages", op: "contains", value: "palettes" },
  { key: "project_type", op: "in", value: ["entrepot", "commerce"] },
]);
const ko = normalizeConditions(
  [
    { question_key: "nope", op: "eq", value: "x" },
    { question_key: "project_type", op: "eq", value: "atelier" },
    { question_key: "surface", op: "lte", value: "beaucoup" },
    { question_key: "usages", op: "eq", value: "palettes" },
    { question_key: "project_type", op: "contains", value: "entrepot" },
  ],
  ruleQuestions,
  "R2",
);
assert.equal(ko.conditions.length, 0);
assert.equal(ko.errors.length, 5);
assert.match(ko.errors[0], /clé inconnue/);
assert.match(ko.errors[1], /option inconnue/);

// normalized conditions really match at runtime
const rule = {
  id: "r1",
  is_active: true,
  priority: 0,
  name: "Entrepôt",
  headline: null,
  description: null,
  image_url: null,
  price_min: null,
  price_max: null,
  product_ids: ["p1"],
  conditions: { all: ok.conditions.slice(0, 3) },
} as unknown as Tables<"suggestion_rules">;
const product = { id: "p1", name: "Rack" } as Product;
assert.equal(evaluateSuggestions({ project_type: "entrepot", surface: 250, usages: ["palettes"] }, [rule], [product]).length, 1);
assert.equal(evaluateSuggestions({ project_type: "commerce", surface: 250, usages: ["palettes"] }, [rule], [product]).length, 0);

// --- product resolution
const FUNNEL = "f-1";
const row = (over: Partial<ResolvableProduct>): ResolvableProduct => ({
  id: "x",
  name: "x",
  sku: null,
  category: null,
  tags: [],
  price_min: null,
  price_max: null,
  currency: "EUR",
  stock_status: null,
  external_url: null,
  configurator_id: FUNNEL,
  is_active: true,
  variants: [],
  ...over,
});
const funnelProducts = [
  row({ id: "p1", name: "Rayonnage mi-lourd 2000", sku: "RML-2000", variants: [{ sku: "RML-2000-B", title: "Bleu" }] }),
  row({ id: "p2", name: "Rayonnage léger", sku: "RL-1" }),
  row({ id: "p3", name: "Rayonnage léger", sku: "RL-2" }),
  row({ id: "p4", name: "Ancien rack", sku: "OLD", is_active: false }),
];
const other = row({ id: "p9", name: "Armoire forte", sku: "ARM", configurator_id: "f-2" });
const refs = resolveProductRefs(
  ["p1", "rml-2000", "RML-2000-B", "rayonnage mi lourd 2000", "Rayonnage léger", "OLD", "ARM", "mi-lourd", "Inexistant"],
  funnelProducts,
  [...funnelProducts, other],
  new Map([["f-2", "Funnel armoires"]]),
);
assert.deepEqual(refs.ids, ["p1"]);
assert.equal(refs.resolved.length, 4);
assert.equal(refs.errors.length, 5);
assert.match(refs.errors[0], /ambigu/);
assert.match(refs.errors[1], /inactif/);
assert.match(refs.errors[2], /Funnel armoires/);
assert.match(refs.errors[3], /Proches : Rayonnage mi-lourd 2000/);
assert.match(refs.errors[4], /introuvable/);

// --- tracking
const tracking = { ga: "G-OLD123", gtm: "", metaPixel: "123456789" };
assert.deepEqual(applyTrackingPatch(tracking, { gtm_id: " gtm-ab12cd " }), {
  ok: true,
  tracking: { ga: "G-OLD123", gtm: "GTM-AB12CD", metaPixel: "123456789" },
});
assert.deepEqual(applyTrackingPatch(tracking, { ga4_id: "", meta_pixel_id: "" }), {
  ok: true,
  tracking: { ga: "", gtm: "", metaPixel: "" },
});
const badTracking = applyTrackingPatch(tracking, { ga4_id: "UA-1234-1", gtm_id: "G-123", meta_pixel_id: "abc" });
assert.ok(!badTracking.ok && badTracking.errors.length === 3);

// --- publish warnings
assert.equal(publishWarnings({ kind: "chat", productCount: 0, ruleCount: 0, hasSuggestionsStep: false }).length, 1);
assert.equal(publishWarnings({ kind: "form", productCount: 5, ruleCount: 0, hasSuggestionsStep: true }).length, 1);
assert.equal(publishWarnings({ kind: "form", productCount: 0, ruleCount: 0, hasSuggestionsStep: false }).length, 0);

// --- templates
assert.equal(resolveTemplateId(undefined, "form"), "general");
assert.equal(resolveTemplateId(undefined, "catalog"), "custom_catalog");
assert.equal(resolveTemplateId("rayonnage", "form"), "racking");
assert.equal(resolveTemplateId("racking_chat", "chat"), "racking_chat");
assert.equal(resolveTemplateId("inconnu", "form"), null);
const templates = listTemplates();
assert.ok(templates.some((t) => t.id === "racking" && t.aliases.includes("rayonnage")));
assert.ok(templates.every((t) => t.description && t.steps.length));

// --- chat agent settings
const theme = mergeFunnelAgentSettings({ accent: "#000", kind: "x" }, { instructions: "  Vouvoiement. ", greeting: "Bonjour !" });
assert.deepEqual(parseFunnelAgentSettings(theme), { instructions: "Vouvoiement.", greeting: "Bonjour !" });
assert.deepEqual(mergeFunnelAgentSettings(theme, { instructions: "", greeting: "" }), { accent: "#000", kind: "x" });
assert.deepEqual(publicDefinitionTheme(theme as Record<string, unknown>), { accent: "#000", kind: "x", agent: { greeting: "Bonjour !" } });
const definition = {
  organization: { name: "Quickly" },
  configurator: { name: "Chat", sector: "racking", theme },
  steps: [],
  products: [],
} as unknown as ConfiguratorDefinition;
const prompt = buildQuoteAgentSystemPrompt(definition);
assert.match(prompt, /## Consignes du commerçant[\s\S]*Vouvoiement\.[\s\S]*## Safety/);
assert.doesNotMatch(
  buildQuoteAgentSystemPrompt({ ...definition, configurator: { ...definition.configurator, theme: {} } }),
  /Consignes du commerçant/,
);

// --- embed codes: same strings as the « Lien & embed » tab
const codes = funnelEmbedCodes({
  pageOrigin: "https://www.quotebuilder.co/",
  widgetOrigin: "https://quotebuilder-weld.vercel.app",
  orgSlug: "quickly",
  funnelSlug: "rayonnage",
  funnelName: "Rayonnage",
});
assert.equal(codes.publicUrl, "https://www.quotebuilder.co/c/quickly/rayonnage");
assert.equal(
  codes.widget,
  '<div data-quotebuilder data-org="quickly" data-id="rayonnage"></div>\n<script src="https://quotebuilder-weld.vercel.app/widget.js" async></script>',
);
assert.match(codes.iframe, /src="https:\/\/quotebuilder-weld\.vercel\.app\/embed\/quickly\/rayonnage"/);
assert.equal(codes.shortcode, '[quotebuilder org="quickly" id="rayonnage"]');
assert.equal(codes.agentShortcode, '[quotebuilder_agent org="quickly" id="rayonnage"]');

console.log("funnel-config ok");
