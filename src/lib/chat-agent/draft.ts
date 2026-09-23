import type { Json } from "@/lib/db/database.types";
import type { VisitorContact } from "@/lib/visitor-requests/types";

export type ChatTurnMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatDraft = {
  id: string;
  organizationId: string;
  quoteId: string | null;
  contact: VisitorContact;
  answers: Record<string, Json>;
};

function asMessages(value: Json | undefined): ChatTurnMessage[] {
  if (!Array.isArray(value)) return [];
  const messages: ChatTurnMessage[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const record = row as Record<string, unknown>;
    const role = record.role === "assistant" ? "assistant" : record.role === "user" ? "user" : null;
    const content = typeof record.content === "string" ? record.content.trim() : "";
    if (!role || !content) continue;
    messages.push({ role, content: content.slice(0, 2000) });
  }
  return messages;
}

/** Append the turn on the existing dossier. Does not create a request. */
export function appendChatTranscript(
  answers: Record<string, Json>,
  messages: ChatTurnMessage[],
): Record<string, Json> {
  const next = [...asMessages(answers.chat), ...messages]
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 2000),
    }))
    .filter((message) => message.content)
    .slice(-40);
  return { ...answers, chat: next };
}

export function phoneKey(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length < 8) return "";
  return digits.slice(-9);
}

export function pickExistingDraft(
  candidates: ChatDraft[],
  query: { id?: string | null; email?: string | null; phone?: string | null },
): ChatDraft | null {
  const id = query.id?.trim();
  if (id) {
    const byId = candidates.find((draft) => draft.id === id);
    if (byId) return byId;
  }
  const email = query.email?.trim().toLowerCase();
  if (email) {
    const byEmail = candidates.find((draft) => draft.contact.email?.trim().toLowerCase() === email);
    if (byEmail) return byEmail;
  }
  const phone = phoneKey(query.phone);
  if (phone) {
    const byPhone = candidates.find((draft) => phoneKey(draft.contact.phone) === phone);
    if (byPhone) return byPhone;
  }
  return null;
}

export function mergeVisitorContact(draft: ChatDraft | null, incoming: VisitorContact): VisitorContact {
  return {
    name: draft?.contact.name?.trim() || incoming.name,
    email: draft?.contact.email?.trim() || incoming.email,
    phone: draft?.contact.phone?.trim() || incoming.phone,
    company: draft?.contact.company?.trim() || incoming.company,
  };
}
