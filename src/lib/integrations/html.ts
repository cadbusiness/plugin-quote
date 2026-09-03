const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  agrave: "à",
  ccedil: "ç",
  ugrave: "ù",
  ocirc: "ô",
  icirc: "î",
  euro: "€",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  rsquo: "’",
  ndash: "–",
  mdash: "—",
  deg: "°",
};

function decodeEntities(text: string) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) {
      const n = Number.parseInt(code.slice(2), 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    if (code.startsWith("#")) {
      const n = Number.parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/**
 * Les descriptions WooCommerce et Shopify arrivent en HTML.
 * Le devis (PDF, email, écran prospect) attend du texte lisible :
 * on garde les sauts de ligne et les puces, on jette le balisage.
 */
export function htmlToText(html: string | null | undefined, maxLength = 4000) {
  if (!html) return null;
  const text = decodeEntities(
    html
      .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
      .replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\s*\/\s*(p|div|h[1-6]|tr)\s*>/gi, "\n\n")
      .replace(/<\s*li[^>]*>/gi, "• ")
      .replace(/<\s*\/\s*li\s*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!text) return null;
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

export function parsePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
