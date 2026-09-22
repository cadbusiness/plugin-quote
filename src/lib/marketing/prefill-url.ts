const DEFAULT_BASE = "https://www.quotebuilder.co/c/quickly/rayonnage";

export type PrefillUrlInput = {
  baseUrl: string;
  besoin: string;
  add: string;
  product: string;
};

export type PrefillUrlResult = {
  url: string;
  query: string;
  shortcode: string;
  tip: string;
};

export function splitPrefillTokens(raw: string): string[] {
  return String(raw || "")
    .split(/[,;\n]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

/** Retire query et hash. Le générateur reconstruit la query, il ne la fusionne pas. */
export function stripPrefillQuery(url: string): string {
  const raw = String(url || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    parsed.search = "";
    parsed.hash = "";
    let path = parsed.pathname;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return parsed.origin + path;
  } catch {
    const queryAt = raw.indexOf("?");
    const base = queryAt >= 0 ? raw.slice(0, queryAt) : raw;
    return base.replace(/\/$/, "") || base;
  }
}

export function parsePrefillOrgSlug(base: string): { org: string; slug: string } {
  try {
    const parsed = new URL(base);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 3 && (parts[0] === "c" || parts[0] === "embed")) {
      return { org: parts[1]!, slug: parts[2]! };
    }
  } catch {
    /* URL relative ou invalide : shortcode d’exemple. */
  }
  return { org: "quickly", slug: "rayonnage" };
}

export function buildPrefillUrl(input: PrefillUrlInput): PrefillUrlResult {
  const baseRaw = input.baseUrl.trim() || DEFAULT_BASE;
  const base = stripPrefillQuery(baseRaw) || DEFAULT_BASE;
  const besoin = splitPrefillTokens(input.besoin);
  const add = splitPrefillTokens(input.add);
  const product = input.product.trim();

  const params = new URLSearchParams();
  if (besoin.length) params.set("besoin", besoin.join(","));
  if (add.length) params.set("add", add.join(","));
  if (product) params.set("product", product);

  const qs = params.toString();
  const url = qs ? `${base}?${qs}` : base;
  const { org, slug } = parsePrefillOrgSlug(base);

  let tip: string;
  if (!qs) {
    tip = "Renseignez au moins un token besoin, add ou product pour générer une query.";
  } else if (besoin.length && add.length) {
    tip = "Combinaison gamme + produit : utile pour un CTA fiche qui contextualise aussi la famille.";
  } else if (add.length || product) {
    tip = "Vérifiez que le SKU, l’id ou le nom exact existe dans le catalogue synchronisé avant mise en prod.";
  } else {
    tip = "Testez l’URL en navigation privée si une session a déjà été soumise (session soumise inchangée).";
  }

  return {
    url,
    query: qs ? `?${qs}` : "",
    shortcode: `[quotebuilder org="${org}" id="${slug}"]`,
    tip,
  };
}
