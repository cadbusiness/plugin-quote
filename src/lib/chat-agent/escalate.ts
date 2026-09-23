import { fill } from "@/lib/email/fill";
import { salesRecipientDecision } from "@/lib/visitor-requests/brief";
import type { SalesNotice } from "@/lib/visitor-requests/types";
import type { ChatReason } from "@/lib/chat-agent/policy";

export type MerchantInbox = {
  assigneeEmail: string | null;
  assigneeUserId: string | null;
  salesEmail: string | null;
  salesName: string | null;
  channelAddress: string | null;
  template: { subject: string; body: string } | null;
  organizationName: string | null;
};

export type EscalationContact = {
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
};

const REASONS: Record<ChatReason, string> = {
  greeting: "accueil",
  grounded: "réponse catalogue",
  missing_price: "prix absent des sources",
  missing_lead_time: "délai absent des sources",
  missing_feasibility: "faisabilité non confirmée",
  out_of_knowledge: "hors catalogue",
  human_requested: "demande d'un interlocuteur",
  pricing_exception: "exception tarifaire",
};

export function resolveMerchantRecipient(input: {
  assigneeEmail?: string | null;
  salesEmail?: string | null;
  channelAddress?: string | null;
  contactEmail?: string | null;
}): { ok: true; to: string; via: "assignee" | "sales_email" | "channel" } | { ok: false; reason: string } {
  const chain = [
    { via: "assignee" as const, email: input.assigneeEmail },
    { via: "sales_email" as const, email: input.salesEmail },
    { via: "channel" as const, email: input.channelAddress },
  ];
  let reason = "missing";
  for (const row of chain) {
    const decision = salesRecipientDecision(row.email, input.contactEmail ?? null);
    if (decision.ok) return { ok: true, to: decision.to, via: row.via };
    if (row.email?.trim()) reason = decision.reason;
  }
  return { ok: false, reason };
}

function transcriptBlock(messages: { role: "user" | "assistant"; content: string }[]) {
  return messages
    .map((message) => `${message.role === "user" ? "Visiteur" : "Assistant IA"} : ${message.content}`)
    .join("\n");
}

/** Internal merchant mail. The visitor is never the recipient. */
export function buildChatEscalation(input: {
  inbox: MerchantInbox;
  organizationId: string;
  contact: EscalationContact;
  transcript: { role: "user" | "assistant"; content: string }[];
  reason: ChatReason;
  quoteId: string | null;
  visitorRequestId: string | null;
}): (SalesNotice & { via: "assignee" | "sales_email" | "channel"; assigneeUserId: string | null }) | null {
  const recipient = resolveMerchantRecipient({
    assigneeEmail: input.inbox.assigneeEmail,
    salesEmail: input.inbox.salesEmail,
    channelAddress: input.inbox.channelAddress,
    contactEmail: input.contact.email,
  });
  if (!recipient.ok) return null;

  const name = input.contact.name?.trim() || input.contact.email || input.contact.phone || "Prospect";
  const vars: Record<string, string> = {
    contact_name: name,
    contact_email: input.contact.email ?? "",
    contact_company: input.contact.company ?? "",
    contact_phone: input.contact.phone ?? "",
    score: "",
    score_label: "",
    sales_name: input.inbox.salesName ?? "",
    answers_text: transcriptBlock(input.transcript),
    suggestion_name: "Question assistant IA",
    price_range: "Sur devis",
    suivi_url: "",
    membres_url: "",
    pin: "",
  };
  const subject = input.inbox.template
    ? fill(input.inbox.template.subject, vars)
    : `[QuoteBuilder] Question assistant IA — ${name}`;
  const intro = input.inbox.template
    ? fill(input.inbox.template.body, vars)
    : `Question transmise par l'assistant IA${input.inbox.organizationName ? ` (${input.inbox.organizationName})` : ""}.`;
  const dossier = input.visitorRequestId
    ? `Dossier existant : ${input.visitorRequestId}`
    : "Aucun devis ouvert. Pas de nouveau dossier créé.";
  const identity = [
    `Visiteur : ${name}`,
    input.contact.email ? `E-mail : ${input.contact.email}` : "",
    input.contact.phone ? `Téléphone : ${input.contact.phone}` : "",
    input.contact.company ? `Société : ${input.contact.company}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const text = [
    intro,
    "Message interne — ne pas transférer au prospect comme un e-mail commercial.",
    `Motif : ${REASONS[input.reason]}`,
    dossier,
    identity,
    `Conversation :\n${transcriptBlock(input.transcript)}`,
  ].join("\n\n");

  return {
    to: recipient.to,
    via: recipient.via,
    subject,
    text,
    organizationId: input.organizationId,
    quoteId: input.quoteId ?? "",
    contactEmail: input.contact.email,
    assigneeUserId: input.inbox.assigneeUserId,
  };
}
