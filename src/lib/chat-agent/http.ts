import type { ChatDraft, ChatTurnMessage } from "@/lib/chat-agent/draft";
import { mergeVisitorContact } from "@/lib/chat-agent/draft";
import { buildChatEscalation, type MerchantInbox } from "@/lib/chat-agent/escalate";
import {
  findChatDraft,
  loadConnectionSources,
  loadMerchantInbox,
  recordChatEscalation,
  saveChatTranscript,
} from "@/lib/chat-agent/load";
import { phraseGroundedAnswer } from "@/lib/chat-agent/phrase";
import type { ChatSource } from "@/lib/chat-agent/sources";
import { composeChatReply } from "@/lib/chat-agent/reply";
import { runChatRetrieval, type ChatPhrase } from "@/lib/chat-agent/turn";
import type { PluginConnection } from "@/lib/integrations/plugin";
import { openPublicSite } from "@/lib/integrations/public-site-quote";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { sendSalesNotice } from "@/lib/visitor-requests/notify";
import { emptyContact, type SalesNotice, type VisitorContact } from "@/lib/visitor-requests/types";

export const PUBLIC_SITE_CHAT_METHODS = "POST, OPTIONS";
export const PUBLIC_SITE_CHAT_IP_LIMIT = 20;
export const PUBLIC_SITE_CHAT_WINDOW_MS = 60_000;

export function publicSiteChatPath(siteKey: string) {
  return `/api/public/sites/${siteKey}/chat`;
}

type ChatDeps = {
  load?: (publicKey: string) => Promise<PluginConnection | null>;
  loadSources?: (connection: PluginConnection) => Promise<ChatSource[]>;
  findDraft?: (input: {
    organizationId: string;
    visitorRequestId?: string | null;
    email?: string | null;
    phone?: string | null;
  }) => Promise<ChatDraft | null>;
  saveTranscript?: (draft: ChatDraft, messages: ChatTurnMessage[]) => Promise<void>;
  merchantInbox?: (organizationId: string, draft: ChatDraft | null) => Promise<MerchantInbox>;
  sendEscalation?: (notice: SalesNotice) => Promise<{ sent: boolean }>;
  recordEscalation?: (input: {
    organizationId: string;
    quoteId: string | null;
    assigneeUserId: string | null;
    note: string;
  }) => Promise<void>;
  phrase?: ChatPhrase;
};

function json(body: unknown, status: number, extra?: Headers) {
  const headers = extra ? new Headers(extra) : new Headers();
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("Vary", "Origin");
  return new Response(JSON.stringify(body), { status, headers });
}

function text(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function contactFrom(value: unknown): VisitorContact {
  if (!value || typeof value !== "object" || Array.isArray(value)) return emptyContact();
  const row = value as Record<string, unknown>;
  return {
    name: text(row.name, 120) || null,
    email: text(row.email, 200) || null,
    phone: text(row.phone, 40) || null,
    company: text(row.company, 160) || null,
  };
}

function historyFrom(value: unknown): ChatTurnMessage[] {
  if (!Array.isArray(value)) return [];
  const messages: ChatTurnMessage[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const record = row as Record<string, unknown>;
    const role = record.role === "assistant" ? "assistant" : record.role === "user" ? "user" : null;
    const content = text(record.content, 2000);
    if (!role || !content) continue;
    messages.push({ role, content });
    if (messages.length >= 20) break;
  }
  return messages;
}

/**
 * Site-key chat for the embed.
 * Answers from the shop catalog and manuals. Escalation mail goes to the merchant only.
 * An existing visitor draft is updated; a new dossier is never created here.
 */
export async function handlePublicSiteChat(req: Request, siteKey: string, deps: ChatDeps = {}) {
  const opened = await openPublicSite(req, siteKey, { load: deps.load, methods: PUBLIC_SITE_CHAT_METHODS });
  if (!opened.ok) return opened.response;
  const { connection, cors } = opened.access;

  const ipLimit = rateLimit(
    `public-site-chat:ip:${clientIp(req)}`,
    PUBLIC_SITE_CHAT_IP_LIMIT,
    PUBLIC_SITE_CHAT_WINDOW_MS,
  );
  if (!ipLimit.ok) {
    cors.set("Retry-After", String(ipLimit.retryAfterSec));
    return json({ error: "Trop de requêtes, réessayez plus tard." }, 429, cors);
  }

  const body = await req.json().catch(() => null);
  const record = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  const message = text(record.message, 4000);
  if (!message) return json({ error: "message est requis" }, 422, cors);

  const history = historyFrom(record.history);
  const contact = contactFrom(record.contact);
  const visitorRequestId = text(record.visitorRequestId, 80) || null;
  const retrievalQuery = [...history.filter((row) => row.role === "user").slice(-1).map((row) => row.content), message].join(
    "\n",
  );

  let sources: ChatSource[] = [];
  try {
    sources = await (deps.loadSources ?? loadConnectionSources)(connection);
  } catch (error) {
    console.error("chat agent catalog failed", error);
  }

  let draft: ChatDraft | null = null;
  try {
    draft = await (deps.findDraft ?? findChatDraft)({
      organizationId: connection.organization_id,
      visitorRequestId,
      email: contact.email,
      phone: contact.phone,
    });
  } catch (error) {
    console.error("chat agent draft lookup failed", error);
  }
  if (draft && draft.organizationId !== connection.organization_id) draft = null;

  const visitor = mergeVisitorContact(draft, contact);
  const hasContact = Boolean(visitor.email || visitor.phone || visitor.name);

  const turn = await runChatRetrieval({
    message: retrievalQuery,
    sources,
    delivered: false,
    hasContact,
    phrase: deps.phrase ?? phraseGroundedAnswer,
  });

  let delivered = false;
  let reply = turn.reply;
  if (turn.decision.escalate) {
    const planned = composeChatReply({
      message: retrievalQuery,
      decision: turn.decision,
      delivered: true,
      hasContact,
    });
    try {
      const inbox = await (deps.merchantInbox ?? loadMerchantInbox)(connection.organization_id, draft);
      const transcript = [
        ...history,
        { role: "user" as const, content: message },
        { role: "assistant" as const, content: planned },
      ];
      const notice = buildChatEscalation({
        inbox,
        organizationId: connection.organization_id,
        contact: visitor,
        transcript,
        reason: turn.decision.reason,
        quoteId: draft?.quoteId ?? null,
        visitorRequestId: draft?.id ?? null,
      });
      if (notice) {
        const send = deps.sendEscalation ?? sendSalesNotice;
        const result = await send(notice);
        delivered = result.sent;
        if (delivered) {
          const recordEscalation = deps.recordEscalation ?? recordChatEscalation;
          try {
            await recordEscalation({
              organizationId: connection.organization_id,
              quoteId: draft?.quoteId ?? null,
              assigneeUserId: inbox.assigneeUserId,
              note: `Assistant IA — ${turn.decision.reason}\nVisiteur : ${message}\n${planned}`,
            });
          } catch (error) {
            console.error("chat agent escalation note failed", error);
          }
        }
      }
    } catch (error) {
      console.error("chat agent escalation failed", error);
      delivered = false;
    }
    reply = composeChatReply({
      message: retrievalQuery,
      decision: turn.decision,
      delivered,
      hasContact,
    });
  }

  if (draft) {
    try {
      await (deps.saveTranscript ?? saveChatTranscript)(draft, [
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.error("chat agent draft update failed", error);
    }
  }

  return json(
    {
      reply,
      outcome: turn.decision.outcome,
      reason: turn.decision.reason,
      escalated: delivered,
      assistant: true,
      visitorRequestId: draft?.id ?? null,
      citations: turn.decision.citations.map((source) => ({
        productName: source.productName,
        kind: source.kind,
        label: source.label,
      })),
    },
    200,
    cors,
  );
}
