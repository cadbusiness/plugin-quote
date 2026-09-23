import type { ChatDecision, ChatIntent } from "@/lib/chat-agent/policy";
import { classifyChatIntent } from "@/lib/chat-agent/policy";
import { foldText, type ChatSource } from "@/lib/chat-agent/sources";

export const ASSISTANT_DISCLOSURE =
  "Je suis l'assistant IA du commerçant. Je réponds uniquement à partir du catalogue, des modes d'emploi et des réponses validées.";

const KIND_RANK: Record<ChatSource["kind"], number> = {
  spec: 0,
  sheet: 1,
  qa: 2,
  catalog: 3,
};

function euros(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function numbersOf(text: string) {
  const compact = text.replace(/(\d)\s+(?=\d{3}\b)/g, "$1");
  const found = compact.match(/\d+(?:[.,]\d+)?/g) ?? [];
  return found.map((raw) => {
    const n = Number(raw.replace(",", "."));
    return Number.isFinite(n) ? String(n) : raw;
  });
}

function factSentence(source: ChatSource) {
  if (source.kind === "sheet") {
    return `Mode d'emploi de ${source.productName} : ${source.text}`;
  }
  if (source.kind === "qa") {
    return `Réponse validée (${source.productName}) : ${source.text}`;
  }
  if (source.kind === "spec") {
    return `${source.productName} : ${source.text}`;
  }
  return `${source.productName} : ${source.text}`;
}

function priceSentence(source: ChatSource, intent: ChatIntent) {
  if (!intent.asksPrice && !intent.asksFirmPrice) return null;
  const min = source.priceMin;
  const max = source.priceMax;
  if (min == null && max == null) return null;
  if (min != null && max != null && min !== max) {
    return `Le catalogue indique une fourchette de ${euros(min)} à ${euros(max)} pour ${source.productName}. Ce n'est pas un prix ferme.`;
  }
  const value = (min ?? max) as number;
  return `Le catalogue indique ${euros(value)} pour ${source.productName}. Le commerçant confirme le devis.`;
}

function refusalLine(decision: ChatDecision) {
  const lines: string[] = [];
  if (decision.gaps.includes("missing_price")) {
    lines.push("Je ne confirme pas de prix ferme : cette information n'est pas dans le catalogue.");
  }
  if (decision.gaps.includes("missing_lead_time")) {
    lines.push("Je ne confirme pas de délai : aucun délai n'est indiqué dans le catalogue ni dans les documents.");
  }
  if (decision.gaps.includes("missing_feasibility")) {
    lines.push("Je ne confirme pas la faisabilité. Seul le commerçant peut la valider.");
  }
  return lines.join(" ") || "Je ne confirme pas cette information en dehors des sources.";
}

function handoffLine(delivered: boolean, hasContact: boolean) {
  if (!delivered) {
    return "Je n'ai pas pu joindre l'équipe depuis ici. Laissez vos coordonnées dans le formulaire de devis.";
  }
  if (hasContact) {
    return "Je transmets cet échange et vos coordonnées à l'équipe du commerçant.";
  }
  return "Je transmets cet échange à l'équipe du commerçant.";
}

function cite(decision: ChatDecision, intent: ChatIntent) {
  const lines: string[] = [];
  const ranked = [...decision.citations].sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind]);
  const seen = new Set<string>();
  let priced = false;
  for (const source of ranked) {
    if (source.kind === "catalog" && ranked.some((row) => row.kind !== "catalog" && row.id === source.id)) {
      continue;
    }
    if (decision.reason === "missing_price" && source.kind === "catalog" && !source.text) continue;
    const key = `${source.kind}:${source.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (
      decision.gaps.includes("missing_lead_time") &&
      (source.specKey === "delai" || /\b(delai|livraison)\b/.test(foldText(source.text)))
    ) {
      continue;
    }
    lines.push(factSentence(source));
    const price = priceSentence(source, intent);
    const ranged =
      source.priceMin != null && source.priceMax != null && source.priceMin !== source.priceMax;
    if (price && !priced && (!decision.gaps.includes("missing_price") || ranged)) {
      lines.push(price);
      priced = true;
    }
    if (lines.length >= 4) break;
  }
  return lines;
}

export function composeChatReply(input: {
  message: string;
  decision: ChatDecision;
  delivered: boolean;
  hasContact: boolean;
}) {
  const intent = classifyChatIntent(input.message);
  if (input.decision.reason === "greeting") {
    return `${ASSISTANT_DISCLOSURE} Décrivez le produit ou la question.`;
  }
  const parts = [ASSISTANT_DISCLOSURE];
  if (input.decision.outcome === "answer") {
    parts.push(...cite(input.decision, intent));
  } else if (input.decision.outcome === "refuse") {
    parts.push(refusalLine(input.decision));
    parts.push(...cite(input.decision, intent));
    parts.push(handoffLine(input.delivered, input.hasContact));
  } else {
    if (input.decision.reason === "out_of_knowledge") {
      parts.push("Je n'ai pas cette information dans le catalogue ni dans les documents.");
    }
    parts.push(handoffLine(input.delivered, input.hasContact));
  }
  return parts.filter(Boolean).join("\n\n");
}

function allowedNumbers(sources: ChatSource[]) {
  const allowed = new Set<string>();
  for (const source of sources) {
    for (const n of numbersOf(source.text)) allowed.add(n);
    if (source.priceMin != null) allowed.add(String(source.priceMin));
    if (source.priceMax != null) allowed.add(String(source.priceMax));
  }
  return allowed;
}

/**
 * Keep a model phrase only when every number is already in the passages
 * and the turn was cleared to answer.
 */
export function acceptModelReply(text: string, decision: ChatDecision): string | null {
  if (decision.outcome !== "answer" || decision.reason === "greeting") return null;
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  const allowed = allowedNumbers(decision.citations);
  for (const n of numbersOf(trimmed)) {
    if (!allowed.has(n)) return null;
  }
  const folded = foldText(trimmed);
  const intent = { asksPrice: false, asksLead: false, asksFeasibility: false };
  if (/\b(prix|tarif|€|eur)\b/.test(folded) && !decision.citations.some((source) => source.priceMin != null || source.priceMax != null)) {
    intent.asksPrice = true;
  }
  if (/\b(delai|livraison)\b/.test(folded) && !decision.citations.some((source) => source.specKey === "delai" || source.kind === "qa")) {
    intent.asksLead = true;
  }
  if (/\bfaisab/.test(folded) && !decision.citations.some((source) => source.kind === "qa")) {
    intent.asksFeasibility = true;
  }
  if (intent.asksPrice || intent.asksLead || intent.asksFeasibility) return null;
  const body = trimmed.replace(/^je suis l['’]assistant ia\b[^.]*\.\s*/i, "");
  const foldedReply = foldText(body);
  const overlapsSource = decision.citations.some((source) => {
    const passage = foldText(source.text);
    if (passage.length >= 16 && foldedReply.includes(passage.slice(0, 16))) return true;
    return numbersOf(source.text).some((n) => n !== "0" && foldedReply.includes(n));
  });
  if (!overlapsSource) return null;
  return `${ASSISTANT_DISCLOSURE}\n\n${body}`.slice(0, 1600);
}
