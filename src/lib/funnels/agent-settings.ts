import type { Json } from "@/lib/db/database.types";

/** Per-funnel chat agent settings, stored in `configurators.theme.agent` (no dedicated column). */
export type FunnelAgentSettings = {
  /** Merchant guidance added to the commerce agent system prompt (tone, priorities, wording). */
  instructions: string;
  /** First message shown to the prospect before any exchange. */
  greeting: string;
};

export const AGENT_INSTRUCTIONS_MAX = 2000;
export const AGENT_GREETING_MAX = 280;

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function parseFunnelAgentSettings(
  theme: Json | Record<string, unknown> | null | undefined,
): FunnelAgentSettings {
  if (!theme || typeof theme !== "object" || Array.isArray(theme)) return { instructions: "", greeting: "" };
  const raw = (theme as { agent?: unknown }).agent;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { instructions: "", greeting: "" };
  const row = raw as Record<string, unknown>;
  return {
    instructions: clip(row.instructions, AGENT_INSTRUCTIONS_MAX),
    greeting: clip(row.greeting, AGENT_GREETING_MAX),
  };
}

export function mergeFunnelAgentSettings(
  theme: Json | Record<string, unknown> | null | undefined,
  settings: FunnelAgentSettings,
): Json {
  const base =
    theme && typeof theme === "object" && !Array.isArray(theme) ? { ...(theme as Record<string, unknown>) } : {};
  const instructions = clip(settings.instructions, AGENT_INSTRUCTIONS_MAX);
  const greeting = clip(settings.greeting, AGENT_GREETING_MAX);
  if (!instructions && !greeting) {
    delete base.agent;
    return base as Json;
  }
  return {
    ...base,
    agent: {
      ...(instructions ? { instructions } : {}),
      ...(greeting ? { greeting } : {}),
    },
  } as Json;
}

/** Public definition payloads keep the greeting but never the merchant's private instructions. */
export function publicDefinitionTheme(theme: Record<string, unknown>): Record<string, unknown> {
  if (!("agent" in theme)) return theme;
  const { greeting } = parseFunnelAgentSettings(theme);
  const rest = { ...theme };
  delete rest.agent;
  return greeting ? { ...rest, agent: { greeting } } : rest;
}
