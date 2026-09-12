import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { QuoteBuilderClient } from "../dist/client.js";
import { isMcpDevisV0Enabled } from "../dist/flags.js";
import { sliceQuoteStatus } from "../dist/quote-status.js";
import { registerLeadTools } from "../dist/tools/leads.js";
import { registerStatsTools } from "../dist/tools/stats.js";
import { registerFunnelTools } from "../dist/tools/funnels.js";
import { registerAutomationTools } from "../dist/tools/automation.js";

process.env.QB_API_KEY = "qb_live_test_key_for_smoke";
process.env.QB_API_URL = "http://localhost:3999";

if (isMcpDevisV0Enabled(undefined) || isMcpDevisV0Enabled("") || isMcpDevisV0Enabled("0")) {
  console.error("flag off expected for empty / 0");
  process.exit(1);
}
if (!isMcpDevisV0Enabled("1") || !isMcpDevisV0Enabled("true") || !isMcpDevisV0Enabled("ON")) {
  console.error("flag on expected for 1 / true / ON");
  process.exit(1);
}

const fatLead = {
  id: "lead-1",
  status: "waiting",
  status_label: "En attente",
  score: 70,
  score_label: "warm",
  assigned_to: [{ id: "u1", label: "Léa" }],
  created_at: "2026-09-11T10:00:00.000Z",
  funnel: { id: "f1", name: "Rayonnage", slug: "rayonnage" },
  answers: [{ key: "secret" }],
  notes: [{ content: "interne" }],
  suivi_url: "https://example.test/suivi",
  phone: "0600000000",
  email: "hidden@example.test",
};

/** @type {{ method: string; path: string; body?: unknown }[]} */
const calls = [];

globalThis.fetch = async (input, init) => {
  const url = String(input);
  const path = url.replace("http://localhost:3999", "");
  const method = init?.method ?? "GET";
  const body = init?.body ? JSON.parse(String(init.body)) : undefined;
  calls.push({ method, path, body });

  if (method === "POST" && path === "/api/leads") {
    return new Response(JSON.stringify({ lead: { id: "new-1", status: "new" } }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (method === "GET" && path.startsWith("/api/leads/") && path.includes("view=status")) {
    const sliced = sliceQuoteStatus(fatLead);
    return new Response(JSON.stringify({ quote: sliced }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (method === "GET" && (path.startsWith("/api/leads?") || path === "/api/leads")) {
    return new Response(JSON.stringify({ leads: [{ id: "1", score_label: "hot" }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (path === "/api/stats?period=week") {
    return new Response(JSON.stringify({ stats: { total_leads: 3, conversion_rate: 12 } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (path === "/api/automation/trigger") {
    return new Response(JSON.stringify({ followup: { status: "sent" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ error: `unexpected ${method} ${path}` }), { status: 500 });
};

const CORE_TOOLS = [
  "create_lead",
  "get_funnel_performance",
  "get_lead_detail",
  "get_leads",
  "get_pending_followups",
  "get_stats",
  "list_funnels",
  "trigger_followup",
  "update_lead_status",
];

const DEVIS_TOOLS = ["create_quote", "get_quote_status", "list_quotes"];

/**
 * @param {boolean} devisV0
 */
async function withClient(devisV0, fn) {
  const qb = new QuoteBuilderClient(process.env.QB_API_KEY, process.env.QB_API_URL);
  const server = new McpServer({ name: "quotebuilder-mcp", version: "1.1.0" });
  registerLeadTools(server, qb, { devisV0 });
  registerStatsTools(server, qb);
  registerFunnelTools(server, qb);
  registerAutomationTools(server, qb);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "smoke", version: "1.0.0" });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    await fn(client);
  } finally {
    await client.close();
    await server.close();
  }
}

await withClient(false, async (client) => {
  const tools = await client.listTools();
  const names = tools.tools.map((t) => t.name).sort();
  if (JSON.stringify(names) !== JSON.stringify(CORE_TOOLS)) {
    console.error("Tools mismatch (flag off)", names);
    process.exit(1);
  }
  if (names.some((name) => DEVIS_TOOLS.includes(name))) {
    console.error("Devis aliases leaked with flag off");
    process.exit(1);
  }
});

await withClient(true, async (client) => {
  const tools = await client.listTools();
  const names = tools.tools.map((t) => t.name).sort();
  const expected = [...CORE_TOOLS, ...DEVIS_TOOLS].sort();
  if (JSON.stringify(names) !== JSON.stringify(expected)) {
    console.error("Tools mismatch (flag on)", names, expected);
    process.exit(1);
  }

  const listed = await client.callTool({
    name: "list_quotes",
    arguments: { status: "waiting", score: "hot", days: 7 },
  });
  const created = await client.callTool({
    name: "create_quote",
    arguments: {
      name: "Jean Dupont",
      email: "jean@atelier.test",
      company: "Atelier Sud",
      funnel_id: "funnel-1",
    },
  });
  const createdAutopilot = await client.callTool({
    name: "create_quote",
    arguments: {
      name: "Claire Martin",
      email: "claire@dock.test",
      funnel_id: "funnel-1",
      run_autopilot: true,
    },
  });
  const status = await client.callTool({
    name: "get_quote_status",
    arguments: { quote_id: "lead-1" },
  });

  if (listed.isError || created.isError || createdAutopilot.isError || status.isError) {
    console.error({ listed, created, createdAutopilot, status });
    process.exit(1);
  }

  const statusText = status.content?.[0]?.text ?? "";
  const parsed = JSON.parse(statusText);
  const keys = Object.keys(parsed).sort();
  const expectedKeys = [
    "assigned_to",
    "created_at",
    "funnel",
    "id",
    "score",
    "score_label",
    "status",
    "status_label",
  ];
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
    console.error("get_quote_status keys", keys);
    process.exit(1);
  }
  if ("answers" in parsed || "notes" in parsed || "suivi_url" in parsed || "phone" in parsed) {
    console.error("get_quote_status leaked fields", parsed);
    process.exit(1);
  }

  const createCalls = calls.filter((c) => c.method === "POST" && c.path === "/api/leads");
  const silent = createCalls.find((c) => c.body?.email === "jean@atelier.test");
  const auto = createCalls.find((c) => c.body?.email === "claire@dock.test");
  if (!silent || silent.body.run_autopilot !== false || silent.body.company !== "Atelier Sud") {
    console.error("create_quote default body", silent);
    process.exit(1);
  }
  if (!auto || auto.body.run_autopilot !== true) {
    console.error("create_quote autopilot body", auto);
    process.exit(1);
  }
});

const leads = await withClient(false, async (client) => {
  const res = await client.callTool({
    name: "get_leads",
    arguments: { score: "hot", days: 7 },
  });
  const stats = await client.callTool({
    name: "get_stats",
    arguments: { period: "week" },
  });
  const followup = await client.callTool({
    name: "trigger_followup",
    arguments: { lead_id: "lead-1", template: "nudge_3d" },
  });
  if (res.isError || stats.isError || followup.isError) {
    console.error({ res, stats, followup });
    process.exit(1);
  }
});

void leads;

console.log(JSON.stringify({ tools_core: CORE_TOOLS.length, tools_devis: DEVIS_TOOLS.length, calls }, null, 2));
console.log("smoke ok");
