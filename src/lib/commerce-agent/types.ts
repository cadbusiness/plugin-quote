import type { Answers, ContactDraft, Product, Suggestion } from "@/lib/wizard/types";

export type AgentToolName =
  | "update_brief"
  | "search_catalog"
  | "match_configurations"
  | "collect_contact"
  | "present_configurations"
  | "handoff_quote";

export type ProvenanceState = {
  /** Product ids returned by catalog tools this session (server-owned). */
  productIds: string[];
  /** Suggestion pack ids returned by match_configurations. */
  suggestionIds: string[];
  /** Whether match_configurations or search_catalog ran this turn / session. */
  catalogTouched: boolean;
};

export type ToolOutcome = {
  status: "ok" | "blocked" | "error";
  gate?: string;
  result: Record<string, unknown>;
};

export type AgentSessionState = {
  answers: Answers;
  contactDraft: ContactDraft;
  provenance: ProvenanceState;
  goSuggestions: boolean;
  goContact: boolean;
  lastSuggestions: Suggestion[];
};

export type CompactProduct = {
  id: string;
  name: string;
  category: string | null;
  tags: string[];
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  stockStatus: string | null;
  description: string | null;
  /** Woo / Shopify id and SKU so the agent can match a prefilled line. */
  sku: string | null;
  externalId: string | null;
  specs: { label: string; value: string }[];
};

export function emptyProvenance(): ProvenanceState {
  return { productIds: [], suggestionIds: [], catalogTouched: false };
}

export function compactProduct(product: Product): CompactProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    tags: product.tags,
    priceMin: product.priceMin,
    priceMax: product.priceMax,
    currency: product.currency,
    stockStatus: product.stockStatus,
    description: product.description
      ? product.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280)
      : null,
    sku: product.sku ?? null,
    externalId: product.externalId ?? null,
    specs: Object.values(product.specs ?? {})
      .slice(0, 12)
      .map((spec) => ({
        label: spec.label,
        value: spec.unit ? `${spec.value} ${spec.unit}` : spec.value,
      })),
  };
}
