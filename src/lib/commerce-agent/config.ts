/** Caps aligned with Anthropic commerce-agents harness patterns. */
export const COMMERCE_AGENT_CONFIG = {
  model: "claude-sonnet-4-5",
  maxTokens: 1400,
  /** Messages API tool rounds before a forced text-only close. */
  maxToolIterations: 6,
  maxSearchResults: 8,
  maxFencedChars: 6000,
  /** Product ids retained for provenance (cart / present gates). */
  provenanceCap: 64,
} as const;
