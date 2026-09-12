/** Devis-named MCP tools (create_quote / list_quotes / get_quote_status). */
export const MCP_DEVIS_V0_ENV = "MCP_DEVIS_V0";

const TRUTHY = new Set(["1", "true", "on", "yes"]);

export function isMcpDevisV0Enabled(value = process.env[MCP_DEVIS_V0_ENV]): boolean {
  return TRUTHY.has(value?.trim().toLowerCase() ?? "");
}
