/** Pure validation / shaping for the MCP / REST CRM write tools (notes, assignment, timeline). */

export const NOTE_MAX_LENGTH = 5000;
export const ASSIGN_MODES = ["add", "replace", "remove"] as const;
export type AssignMode = (typeof ASSIGN_MODES)[number];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined) {
  return Boolean(value && UUID.test(value.trim()));
}

export function cleanNote(value: unknown) {
  if (typeof value !== "string") throw new Error("content requis");
  const content = value.replace(/\r\n/g, "\n").trim();
  if (!content) throw new Error("La note est vide");
  if (content.length > NOTE_MAX_LENGTH) throw new Error(`Note trop longue (${NOTE_MAX_LENGTH} caractères max)`);
  return content;
}

export function parseAssignMode(value: unknown): AssignMode {
  if (value == null || value === "") return "add";
  if (typeof value === "string" && (ASSIGN_MODES as readonly string[]).includes(value)) return value as AssignMode;
  throw new Error("mode invalide : add, replace ou remove");
}

export type TeamMember = {
  user_id: string;
  email: string | null;
  role: string;
};

/** Finds an active member by user id or (case-insensitive) email. Ambiguity is an error. */
export function resolveTeamMember(members: TeamMember[], assignee: string) {
  const needle = assignee.trim().toLowerCase();
  if (!needle) throw new Error("assignee requis (email ou user_id d’un membre actif)");
  const byId = members.find((m) => m.user_id.toLowerCase() === needle);
  if (byId) return byId;
  const byEmail = members.filter((m) => m.email?.toLowerCase() === needle);
  if (byEmail.length === 1) return byEmail[0]!;
  throw new Error(`« ${assignee} » n’est pas un membre actif de l’organisation (voir list_team)`);
}

/** Next assignee list, first = primary (quotes.assigned_to). */
export function nextAssignees(current: string[], userId: string, mode: AssignMode) {
  if (mode === "replace") return [userId];
  if (mode === "remove") return current.filter((id) => id !== userId);
  return current.includes(userId) ? current : [...current, userId];
}

export type TimelineEvent = {
  at: string;
  kind: "activity" | "note" | "message" | "ads_conversion";
  type: string;
  label: string;
  detail: string | null;
};

export function buildTimeline(events: TimelineEvent[], limit = 100) {
  const max = Math.min(Math.max(Math.floor(limit), 1), 300);
  const sorted = [...events].sort((a, b) => b.at.localeCompare(a.at));
  return { events: sorted.slice(0, max), total: sorted.length, truncated: sorted.length > max };
}

export function truncate(value: string | null | undefined, max = 500) {
  if (!value) return null;
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
