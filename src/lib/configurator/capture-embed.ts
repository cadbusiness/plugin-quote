export function captureWidgetSnippet(origin: string, orgSlug: string, funnelSlug: string) {
  const base = origin.replace(/\/$/, "");
  return `<div data-quotebuilder data-module="capture" data-org="${orgSlug}" data-id="${funnelSlug}"></div>\n<script src="${base}/widget.js" async></script>`;
}

export function captureShortcode(orgSlug: string, funnelSlug: string) {
  return `[quotebuilder_capture org="${orgSlug}" id="${funnelSlug}"]`;
}

export function agentWidgetSnippet(origin: string, orgSlug: string, funnelSlug: string) {
  const base = origin.replace(/\/$/, "");
  return `<div data-quotebuilder data-module="agent" data-org="${orgSlug}" data-id="${funnelSlug}"></div>\n<script src="${base}/widget.js" async></script>`;
}

export function agentShortcode(orgSlug: string, funnelSlug: string) {
  return `[quotebuilder_agent org="${orgSlug}" id="${funnelSlug}"]`;
}

export type FunnelEmbedCodes = {
  publicUrl: string;
  embedUrl: string;
  widget: string;
  capture: string;
  agent: string;
  iframe: string;
  shortcode: string;
  captureShortcode: string;
  agentShortcode: string;
};

/**
 * Strings of the « Lien & embed » tab. `pageOrigin` serves the public page, `widgetOrigin`
 * serves widget.js and /embed (installed sites keep calling that host).
 */
export function funnelEmbedCodes(input: {
  pageOrigin: string;
  widgetOrigin: string;
  orgSlug: string;
  funnelSlug: string;
  funnelName: string;
}): FunnelEmbedCodes {
  const page = input.pageOrigin.replace(/\/$/, "");
  const widgetOrigin = input.widgetOrigin.replace(/\/$/, "");
  const path = `${input.orgSlug}/${input.funnelSlug}`;
  const embedUrl = `${widgetOrigin}/embed/${path}`;
  return {
    publicUrl: `${page}/c/${path}`,
    embedUrl,
    widget: `<div data-quotebuilder data-org="${input.orgSlug}" data-id="${input.funnelSlug}"></div>\n<script src="${widgetOrigin}/widget.js" async></script>`,
    capture: captureWidgetSnippet(widgetOrigin, input.orgSlug, input.funnelSlug),
    agent: agentWidgetSnippet(widgetOrigin, input.orgSlug, input.funnelSlug),
    iframe: `<iframe src="${embedUrl}" title="${input.funnelName}" style="width:100%;min-height:720px;border:0"></iframe>`,
    shortcode: `[quotebuilder org="${input.orgSlug}" id="${input.funnelSlug}"]`,
    captureShortcode: captureShortcode(input.orgSlug, input.funnelSlug),
    agentShortcode: agentShortcode(input.orgSlug, input.funnelSlug),
  };
}
