/**
 * QuoteBuilder commerce agent — B2B devis vertical on Anthropic commerce-agent patterns.
 *
 * Inspiration: https://github.com/anthropics/commerce-agents (Apache 2.0)
 * Claude = intelligence layer; catalogue, session and quote submit stay in QuoteBuilder/Supabase.
 */
export { COMMERCE_AGENT_CONFIG } from "./config";
export { runQuoteAgentTurn } from "./loop";
export type { QuoteAgentTurnResult } from "./loop";
export { searchCatalog } from "./catalog";
export {
  canHandoffQuote,
  canPresentConfigurations,
  clampSearchLimit,
  rememberIds,
} from "./gates";
export { executeQuoteTool } from "./executor";
export { emptyProvenance } from "./types";
