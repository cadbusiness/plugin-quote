import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { QuoteBuilderClient } from "../dist/client.js";
import { registerLeadTools } from "../dist/tools/leads.js";
import { registerStatsTools } from "../dist/tools/stats.js";
import { registerFunnelTools } from "../dist/tools/funnels.js";
import { registerAutomationTools } from "../dist/tools/automation.js";

process.env.QB_API_KEY = "qb_live_test_key_for_smoke";
process.env.QB_API_URL = "http://localhost:3999";

/** @type {{ method: string; path: string; body?: unknown }[]} */
const calls = [];

globalThis.fetch = async (input, init) => {
  const url = String(input);
  const path = url.replace("http://localhost:3999", "");
  const method = init?.method ?? "GET";
  const body = init?.body ? JSON.parse(String(init.body)) : undefined;
  calls.push({ method, path, body });

  if (path.startsWith("/api/leads?") || path === "/api/leads") {
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

const qb = new QuoteBuilderClient(process.env.QB_API_KEY, process.env.QB_API_URL);
const server = new McpServer({ name: "quotebuilder-mcp", version: "1.0.0" });
registerLeadTools(server, qb);
registerStatsTools(server, qb);
registerFunnelTools(server, qb);
registerAutomationTools(server, qb);

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
const client = new Client({ name: "smoke", version: "1.0.0" });
await server.connect(serverTransport);
await client.connect(clientTransport);

const tools = await client.listTools();
const names = tools.tools.map((t) => t.name).sort();
const expected = [
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
if (JSON.stringify(names) !== JSON.stringify(expected)) {
  console.error("Tools mismatch", names);
  process.exit(1);
}

const leads = await client.callTool({
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

if (leads.isError || stats.isError || followup.isError) {
  console.error({ leads, stats, followup });
  process.exit(1);
}

console.log(JSON.stringify({ tools: names.length, calls }, null, 2));
await client.close();
await server.close();
console.log("smoke ok");
