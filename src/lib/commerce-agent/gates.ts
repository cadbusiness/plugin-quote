import { COMMERCE_AGENT_CONFIG } from "./config";
import type { ProvenanceState } from "./types";

export function rememberIds(
  provenance: ProvenanceState,
  productIds: string[],
  suggestionIds: string[] = [],
): ProvenanceState {
  const nextProducts = [...provenance.productIds];
  for (const id of productIds) {
    if (!id || nextProducts.includes(id)) continue;
    nextProducts.push(id);
  }
  const nextSuggestions = [...provenance.suggestionIds];
  for (const id of suggestionIds) {
    if (!id || nextSuggestions.includes(id)) continue;
    nextSuggestions.push(id);
  }
  return {
    productIds: nextProducts.slice(-COMMERCE_AGENT_CONFIG.provenanceCap),
    suggestionIds: nextSuggestions.slice(-COMMERCE_AGENT_CONFIG.provenanceCap),
    catalogTouched: true,
  };
}

export function hasProvenance(provenance: ProvenanceState, productId: string): boolean {
  return provenance.productIds.includes(productId);
}

export function clampSearchLimit(limit: unknown): number {
  const n = typeof limit === "number" && Number.isFinite(limit) ? Math.floor(limit) : COMMERCE_AGENT_CONFIG.maxSearchResults;
  return Math.min(COMMERCE_AGENT_CONFIG.maxSearchResults, Math.max(1, n));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

/** Presenting configs requires at least one catalog tool result this session. */
export function canPresentConfigurations(provenance: ProvenanceState): {
  ok: boolean;
  gate?: string;
} {
  if (!provenance.catalogTouched) {
    return { ok: false, gate: "catalog_required" };
  }
  return { ok: true };
}

/** Quote handoff (contact step) needs an email — Claude proposes, host owns identity. */
export function canHandoffQuote(email: string | undefined): { ok: boolean; gate?: string } {
  if (!isValidEmail(email)) {
    return { ok: false, gate: "contact_email_required" };
  }
  return { ok: true };
}
