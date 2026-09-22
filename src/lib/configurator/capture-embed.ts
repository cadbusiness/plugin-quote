export function captureWidgetSnippet(origin: string, orgSlug: string, funnelSlug: string) {
  const base = origin.replace(/\/$/, "");
  return `<div data-quotebuilder data-module="capture" data-org="${orgSlug}" data-id="${funnelSlug}"></div>\n<script src="${base}/widget.js" async></script>`;
}

export function captureShortcode(orgSlug: string, funnelSlug: string) {
  return `[quotebuilder_capture org="${orgSlug}" id="${funnelSlug}"]`;
}
