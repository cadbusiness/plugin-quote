import assert from "node:assert/strict";
import {
  DEFAULT_EMAIL_TEMPLATES,
  ensureDefaultEmailTemplates,
  missingDefaultEmailTemplates,
} from "./email-templates";
import { QUOTE_STATUSES, missingQuoteStatuses } from "./seed";
import {
  defaultDefinition,
  quoteSubmittedDefinition,
  sessionAbandonedDefinition,
} from "../workflows/defaults";

const kinds = DEFAULT_EMAIL_TEMPLATES.map((template) => template.kind);

assert.equal(new Set(kinds).size, kinds.length, "default template kinds must be unique");
assert.ok(kinds.includes("prospect_confirm"), "T+0 prospect_confirm must be seeded");
assert.ok(kinds.includes("sales_brief"), "T+0 sales_brief must be seeded");

const confirm = DEFAULT_EMAIL_TEMPLATES.find((template) => template.kind === "prospect_confirm");
assert.ok(confirm);
assert.match(confirm.body, /\{\{contact_name\}\}/);
assert.match(confirm.body, /récapitulatif/);
assert.match(confirm.body, /\{\{suivi_url\}\}/);
assert.match(confirm.body, /\{\{pin\}\}/);
assert.match(confirm.subject, /récapitulatif/);

const sales = DEFAULT_EMAIL_TEMPLATES.find((template) => template.kind === "sales_brief");
assert.ok(sales);
assert.match(sales.body, /\{\{contact_name\}\}/);
assert.match(sales.body, /\{\{answers_text\}\}/);
assert.match(sales.body, /\{\{score_label\}\}/);
assert.match(sales.subject, /\{\{contact_company\}\}/);

function templateKindsIn(definition: ReturnType<typeof defaultDefinition>) {
  return definition.nodes
    .filter((node) => node.type === "send_email")
    .map((node) => node.data.templateKind)
    .filter((kind): kind is string => Boolean(kind));
}

for (const kind of [
  ...templateKindsIn(quoteSubmittedDefinition()),
  ...templateKindsIn(sessionAbandonedDefinition()),
]) {
  assert.ok(kinds.includes(kind as (typeof kinds)[number]), `default workflow uses unseeded kind ${kind}`);
}

const alreadyCustomized = missingDefaultEmailTemplates(["prospect_confirm", "sales_unprocessed"]);
assert.deepEqual(
  alreadyCustomized.map((template) => template.kind),
  kinds.filter((kind) => kind !== "prospect_confirm" && kind !== "sales_unprocessed"),
);
assert.equal(missingDefaultEmailTemplates(kinds).length, 0);

const statusSlugs = QUOTE_STATUSES.map((status) => status.slug);
assert.equal(new Set(statusSlugs).size, statusSlugs.length);
assert.deepEqual(statusSlugs, ["new", "contacted", "in_progress", "won", "lost", "waiting"]);
assert.equal(missingQuoteStatuses(statusSlugs).length, 0);
assert.deepEqual(
  missingQuoteStatuses(["new", "won"]).map((status) => status.slug),
  ["contacted", "in_progress", "lost", "waiting"],
);

function fakeTemplatesClient(existingKinds: string[]) {
  const inserted: { organization_id: string; kind: string; subject: string; body: string }[] = [];
  const client = {
    inserted,
    from(table: string) {
      assert.equal(table, "email_templates");
      return {
        select() {
          return {
            eq() {
              return Promise.resolve({
                data: existingKinds.map((kind) => ({ kind })),
                error: null,
              });
            },
          };
        },
        insert(rows: typeof inserted) {
          inserted.push(...rows);
          return Promise.resolve({ error: null });
        },
      };
    },
  };
  return client;
}

async function testEnsureDefaultEmailTemplates() {
  const emptyOrg = fakeTemplatesClient([]);
  const seeded = await ensureDefaultEmailTemplates(emptyOrg as never, "org-new");
  assert.deepEqual(seeded.inserted, kinds);
  assert.equal(emptyOrg.inserted.length, kinds.length);
  assert.ok(emptyOrg.inserted.every((row) => row.organization_id === "org-new"));
  assert.ok(emptyOrg.inserted.some((row) => row.kind === "prospect_confirm" && row.body.includes("{{suivi_url}}")));
  assert.ok(emptyOrg.inserted.some((row) => row.kind === "sales_brief" && row.body.includes("{{answers_text}}")));

  const customized = fakeTemplatesClient(["prospect_confirm", "sales_brief"]);
  const healed = await ensureDefaultEmailTemplates(customized as never, "org-custom");
  assert.ok(!healed.inserted.includes("prospect_confirm"));
  assert.ok(!healed.inserted.includes("sales_brief"));
  assert.ok(customized.inserted.every((row) => row.kind !== "prospect_confirm" && row.kind !== "sales_brief"));

  const complete = fakeTemplatesClient(kinds);
  const noop = await ensureDefaultEmailTemplates(complete as never, "org-done");
  assert.deepEqual(noop.inserted, []);
  assert.equal(complete.inserted.length, 0);
}

testEnsureDefaultEmailTemplates().then(() => {
  console.log("crm/seed ok");
}).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
