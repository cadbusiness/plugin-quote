export type QuoteWidgetMode = "catalog" | "request" | "both";

/** Dual-mode embed: known products, free text, or both. AI is opt-in. */
export type QuoteWidgetSettings = {
  mode: QuoteWidgetMode;
  aiRequestText: boolean;
};

export const DEFAULT_QUOTE_WIDGET: QuoteWidgetSettings = {
  mode: "both",
  aiRequestText: false,
};

export function parseQuoteWidget(value: unknown): QuoteWidgetSettings {
  const raw =
    value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const mode: QuoteWidgetMode = raw.mode === "catalog" || raw.mode === "request" ? raw.mode : "both";
  const ai =
    raw.aiRequestText === true ||
    raw.aiRequestText === "1" ||
    raw.aiRequestText === "true" ||
    raw.aiRequestText === "on";
  return { mode, aiRequestText: ai };
}

/** What the plugin pairing payload exposes so a shortcode can post with the site key. */
export function widgetPairing(publicKey: string, settings: QuoteWidgetSettings) {
  return {
    mode: settings.mode,
    aiRequestText: settings.aiRequestText,
    site_key: publicKey,
    public_submit: {
      method: "POST" as const,
      path: `/api/public/sites/${publicKey}/quotes`,
      auth: "X-QuoteBuilder-Site-Key",
    },
  };
}
