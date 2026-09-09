const ALLOWED = new Set(["p", "br", "strong", "b", "em", "i", "u", "a", "ul", "ol", "li", "img", "h2", "h3", "h4", "blockquote"]);

function pickAttr(attrs: string, name: string) {
  const match = attrs.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match?.[2] ?? match?.[3] ?? match?.[4] ?? null;
}

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function isSafeUrl(value: string | null) {
  if (!value) return false;
  const trimmed = value.trim();
  return /^(https?:\/\/|mailto:|\/)/i.test(trimmed) && !/^\s*javascript:/i.test(trimmed);
}

export function looksLikeHtml(value: string | null | undefined) {
  return Boolean(value && /<[a-z][\s\S]*>/i.test(value));
}

/** Autorise un sous-ensemble HTML pour la fiche produit (gras, liens, images). */
export function sanitizeProductHtml(input: string | null | undefined, maxLength = 20_000) {
  if (!input) return "";
  let html = input
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form)[^>]*\/?\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");

  html = html.replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (full, tag: string, attrs = "") => {
    const name = tag.toLowerCase();
    const closing = full.startsWith("</");
    if (!ALLOWED.has(name)) return "";
    if (closing) return `</${name}>`;
    if (name === "br") return "<br>";
    if (name === "img") {
      const src = pickAttr(attrs, "src");
      const alt = pickAttr(attrs, "alt") ?? "";
      if (!isSafeUrl(src) || src!.startsWith("mailto:")) return "";
      return `<img src="${escapeAttr(src!)}" alt="${escapeAttr(alt)}">`;
    }
    if (name === "a") {
      const href = pickAttr(attrs, "href");
      if (!isSafeUrl(href)) return "<a>";
      return `<a href="${escapeAttr(href!)}" target="_blank" rel="noopener noreferrer">`;
    }
    return `<${name}>`;
  });

  return html.length > maxLength ? html.slice(0, maxLength) : html;
}

export function htmlToPlainPreview(html: string | null | undefined, maxLength = 240) {
  if (!html) return "";
  const text = html
    .replace(/<\s*br\s*\/?\s*>/gi, " ")
    .replace(/<\s*\/\s*(p|div|h[1-6]|li)\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
