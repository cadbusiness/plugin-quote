import assert from "node:assert/strict";
import type { McpServer } from "@modelcontextprotocol/server";
import type { z } from "zod";
import { registerQuoteBuilderPrompts } from "./prompts";
import { FUNNEL_TOOL_NAMES, registerFunnelConfigTools } from "./funnel-tools";

type Annotations = { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean };
type ToolConfig = { title?: string; description: string; inputSchema: z.ZodType; annotations: Annotations };
type Handler = (args: unknown, ctx: unknown) => Promise<{ isError?: boolean; content: { text: string }[] }>;

const tools = new Map<string, { config: ToolConfig; handler: Handler }>();
const prompts = new Map<string, { config: unknown; handler: (args: Record<string, string>) => { messages: { content: { text: string } }[] } }>();
const stub = {
  registerTool(name: string, config: ToolConfig, handler: Handler) {
    assert.ok(!tools.has(name), `duplicate tool ${name}`);
    tools.set(name, { config, handler });
  },
  registerPrompt(name: string, config: unknown, handler: (args: Record<string, string>) => never) {
    prompts.set(name, { config, handler });
  },
} as unknown as McpServer;

// tools.ts registers these too; it is not imported here (its lead helpers pull @react-pdf).
registerFunnelConfigTools(stub);
registerQuoteBuilderPrompts(stub);

assert.deepEqual([...tools.keys()].sort(), [...FUNNEL_TOOL_NAMES].sort());
for (const [name, { config }] of tools) {
  assert.ok(config.annotations, `${name} has annotations`);
  assert.ok(config.description.length > 20, `${name} has a description`);
  assert.equal(typeof config.inputSchema.safeParse, "function", `${name} has a zod schema`);
}

const readOnly = ["get_funnel", "list_funnel_templates", "get_embed_code"];
for (const name of readOnly) assert.equal(tools.get(name)!.config.annotations.readOnlyHint, true, name);
for (const name of ["create_funnel", "update_funnel_steps", "set_suggestion_rules", "set_chat_agent", "set_funnel_tracking", "publish_funnel"]) {
  assert.equal(tools.get(name)!.config.annotations.readOnlyHint, false, name);
}
assert.equal(tools.get("update_funnel_steps")!.config.annotations.destructiveHint, true);
assert.equal(tools.get("set_suggestion_rules")!.config.annotations.destructiveHint, true);
assert.equal(tools.get("publish_funnel")!.config.annotations.destructiveHint, false);
assert.equal(tools.get("create_funnel")!.config.annotations.destructiveHint, false);

const schema = (name: string) => tools.get(name)!.config.inputSchema;
assert.equal(schema("publish_funnel").safeParse({ funnel_id: "f", publish: true }).success, false, "confirm is required");
assert.equal(schema("publish_funnel").safeParse({ funnel_id: "f", publish: true, confirm: true }).success, true);
assert.equal(schema("create_funnel").safeParse({ name: "Chat rayonnage", mode: "chat", from_catalog: "auto" }).success, true);
assert.equal(schema("create_funnel").safeParse({ name: "X", mode: "chat" }).success, false);
assert.equal(schema("create_funnel").safeParse({ name: "Funnel", mode: "wizard" }).success, false);
assert.equal(schema("set_funnel_tracking").safeParse({ funnel_id: "f", gtm_id: "GTM-ABC123" }).success, true);
assert.equal(
  schema("set_suggestion_rules").safeParse({
    funnel_id: "f",
    rules: [{ name: "Entrepôt", conditions: [{ question_key: "project_type", op: "eq", value: "entrepot" }], products: ["RML-2000"] }],
  }).success,
  true,
);
assert.equal(
  schema("set_suggestion_rules").safeParse({ funnel_id: "f", rules: [{ name: "Sans produit", conditions: [], products: [] }] }).success,
  false,
);
assert.equal(schema("set_chat_agent").safeParse({ funnel_id: "f", greeting: "x".repeat(281) }).success, false);

async function handlers() {
  // Handlers fail closed before touching the database.
  const noAuth = await tools.get("get_funnel")!.handler({ funnel_id: "f" }, {});
  assert.equal(noAuth.isError, true);
  assert.match(noAuth.content[0].text, /Organisation introuvable/);
  const auth = { http: { authInfo: { extra: { organizationId: "org-1" } } } };
  const unconfirmed = await tools.get("publish_funnel")!.handler({ funnel_id: "f", publish: true, confirm: false }, auth);
  assert.equal(unconfirmed.isError, true);
  assert.match(unconfirmed.content[0].text, /confirm=true/);
  const badTemplate = await tools.get("create_funnel")!.handler({ name: "Funnel", mode: "form", template: "nope" }, auth);
  assert.equal(badTemplate.isError, true);
  assert.match(badTemplate.content[0].text, /inconnu/);
  const templates = await tools.get("list_funnel_templates")!.handler({}, auth);
  assert.ok(JSON.parse(templates.content[0].text).templates.some((t: { id: string }) => t.id === "racking_chat"));
}

// Prompt guides: plan, wait, draft, embed, publish on explicit consent.
const prompt = prompts.get("configurer_mon_funnel");
assert.ok(prompt, "configurer_mon_funnel registered");
const text = prompt!.handler({ site: "https://exemple.fr", mode: "chat" }).messages[0].content.text;
assert.match(text, /https:\/\/exemple\.fr/);
assert.match(text, /mode chat/);
for (const needle of ["list_funnel_templates", "search_catalog", "attends ma validation", "create_funnel", "get_embed_code", "publish_funnel", "confirm=true"]) {
  assert.ok(text.includes(needle), `prompt mentions ${needle}`);
}

void handlers().then(() => {
  console.log(`mcp funnel tools ok (${tools.size} tools, ${prompts.size} prompts)`);
});
