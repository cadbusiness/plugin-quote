import { contentTokens, foldText, type ChatSource } from "@/lib/chat-agent/sources";

export type ChatReason =
  | "greeting"
  | "grounded"
  | "missing_price"
  | "missing_lead_time"
  | "missing_feasibility"
  | "out_of_knowledge"
  | "human_requested"
  | "pricing_exception";

export type ChatOutcome = "answer" | "refuse" | "escalate";

export type ChatIntent = {
  asksHuman: boolean;
  pricingException: boolean;
  asksFirmPrice: boolean;
  asksPrice: boolean;
  asksLeadTime: boolean;
  asksFeasibility: boolean;
  greetingOnly: boolean;
};

export type ChatDecision = {
  outcome: ChatOutcome;
  escalate: boolean;
  reason: ChatReason;
  /** Firm claims the sources do not support. */
  gaps: ChatReason[];
  citations: ChatSource[];
};

const GREETING = /^(bonjour|bonsoir|salut|hello|merci|coucou|bonjours)( a vous| beaucoup)?[.! ]*$/;

export function classifyChatIntent(message: string): ChatIntent {
  const text = foldText(message).replace(/['’]/g, " ").replace(/\s+/g, " ").trim();
  const asksHuman = /\b(humain|humaine|responsable|conseiller|interlocuteur|manager|quelqu un|rappeler|rappelez|appeler|appelez)\b/.test(text)
    || /parler a/.test(text);
  const pricingException = /\b(exception|remise|negoci|hors catalogue|geste commercial|tarif special|prix special)\b/.test(text);
  const asksFirmPrice = /\b(prix ferme|tarif ferme|prix net|prix exact|prix definitif|prix fixe)\b/.test(text);
  const asksPrice = asksFirmPrice || /\b(prix|tarif|coute|cout|combien)\b/.test(text);
  const asksLeadTime = /\b(delai|livraison|lead time)\b/.test(text);
  const asksFeasibility = /\b(faisab|convient|possible|possib|supporte|supporter|adapte)\b/.test(text)
    || /peut on|pouvez vous/.test(text);
  const tokens = contentTokens(message);
  const greetingOnly = tokens.length === 0 || GREETING.test(text);
  return { asksHuman, pricingException, asksFirmPrice, asksPrice, asksLeadTime, asksFeasibility, greetingOnly };
}

function hasPrice(source: ChatSource) {
  return source.priceMin != null || source.priceMax != null;
}

function hasExactPrice(source: ChatSource) {
  return source.priceMin != null && source.priceMax != null && source.priceMin === source.priceMax;
}

function hasLeadTime(source: ChatSource) {
  if (source.kind === "spec" && source.specKey === "delai") return true;
  if (source.kind !== "qa") return false;
  return /\b(delai|livraison)\b/.test(foldText(source.text)) && /\d/.test(source.text);
}

function qaConfirmsFeasibility(source: ChatSource, message: string) {
  if (source.kind !== "qa") return false;
  const text = foldText(source.text);
  if (!/\b(oui|faisable|adapte|convient|possible)\b/.test(text)) return false;
  const messageTokens = new Set(contentTokens(message));
  const shared = contentTokens(source.text).filter((token) => messageTokens.has(token));
  return shared.length >= 2;
}

function prefers(kind: ChatSource["kind"]) {
  if (kind === "spec") return 0;
  if (kind === "sheet") return 1;
  if (kind === "qa") return 2;
  return 3;
}

/** Server-owned decision. Firm price, lead time and feasibility require a source. */
export function decideChatTurn(message: string, retrieved: ChatSource[]): ChatDecision {
  const intent = classifyChatIntent(message);
  const citations = [...retrieved].sort(
    (a, b) => prefers(a.kind) - prefers(b.kind) || a.label.localeCompare(b.label),
  );

  if (intent.asksHuman) {
    return { outcome: "escalate", escalate: true, reason: "human_requested", gaps: [], citations };
  }
  if (intent.pricingException) {
    return { outcome: "escalate", escalate: true, reason: "pricing_exception", gaps: [], citations };
  }
  if (intent.greetingOnly) {
    return { outcome: "answer", escalate: false, reason: "greeting", gaps: [], citations: [] };
  }

  const gaps: ChatReason[] = [];
  if (intent.asksFeasibility && !citations.some((source) => qaConfirmsFeasibility(source, message))) {
    gaps.push("missing_feasibility");
  }
  if (intent.asksLeadTime && !citations.some(hasLeadTime)) {
    gaps.push("missing_lead_time");
  }
  if (intent.asksFirmPrice && !citations.some(hasExactPrice)) {
    gaps.push("missing_price");
  } else if (intent.asksPrice && !citations.some(hasPrice)) {
    gaps.push("missing_price");
  }
  if (gaps.length) {
    return { outcome: "refuse", escalate: true, reason: gaps[0], gaps, citations };
  }
  if (!citations.length) {
    return { outcome: "escalate", escalate: true, reason: "out_of_knowledge", gaps: [], citations: [] };
  }
  return { outcome: "answer", escalate: false, reason: "grounded", gaps: [], citations };
}
