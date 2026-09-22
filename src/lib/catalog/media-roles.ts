/**
 * Rôles média produit pour le devis : photo, plan technique, usage.
 * La description HTML n'est pas une source. Le signal vient de l'alt, du titre,
 * du nom de fichier, ou de la meta Woo `_qb_media_role`.
 */

export const PRODUCT_MEDIA_ROLES = ["product", "plan", "usage"] as const;

export type ProductMediaRole = (typeof PRODUCT_MEDIA_ROLES)[number];

export type MediaRoleInput = {
  id?: number | string | null;
  src: string;
  alt?: string | null;
  name?: string | null;
};

const PLAN_TOKENS = new Set([
  "plan",
  "plans",
  "schema",
  "schemas",
  "schematic",
  "schematics",
  "blueprint",
  "blueprints",
  "drawing",
  "drawings",
  "cote",
  "cotes",
  "cotation",
  "cotations",
  "dimension",
  "dimensions",
  "coupe",
  "coupes",
  "elevation",
  "implantation",
  "dwg",
]);

const USAGE_TOKENS = new Set([
  "usage",
  "usages",
  "situation",
  "realisation",
  "realisations",
  "chantier",
  "chantiers",
  "installation",
  "installations",
  "pose",
  "application",
  "applications",
  "ambiance",
  "contexte",
]);

export function parseMediaRole(value: unknown): ProductMediaRole | null {
  if (typeof value !== "string") return null;
  const token = value.trim().toLowerCase();
  if (token === "product" || token === "produit" || token === "photo") return "product";
  if (token === "plan" || token === "schema" || token === "drawing") return "plan";
  if (token === "usage" || token === "situation" || token === "lifestyle") return "usage";
  return null;
}

function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function tokensOf(value: string) {
  return fold(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function fileNameOf(src: string) {
  const raw = src.split("?")[0]?.split("#")[0] ?? src;
  try {
    const path = decodeURIComponent(raw);
    return path.split("/").pop() ?? path;
  } catch {
    return raw.split("/").pop() ?? raw;
  }
}

function roleKeys(input: MediaRoleInput) {
  const file = fileNameOf(input.src);
  const stem = file.replace(/\.[a-z0-9]+$/i, "");
  return [input.id, input.src, file, stem, input.name]
    .filter((key) => key != null && String(key).trim())
    .map((key) => fold(String(key).trim()));
}

function countHits(text: string, vocabulary: Set<string>) {
  let hits = 0;
  for (const token of tokensOf(text)) {
    if (vocabulary.has(token)) hits += 1;
  }
  return hits;
}

/** Mots-clés alt / titre / fichier. `null` = pas de signal (reste une photo produit). */
export function guessMediaRole(text: string): ProductMediaRole | null {
  const plan = countHits(text, PLAN_TOKENS);
  const usage = countHits(text, USAGE_TOKENS);
  if (!plan && !usage) return null;
  if (plan === usage) return "plan";
  return plan > usage ? "plan" : "usage";
}

function bracketRole(text: string | null | undefined) {
  if (!text) return null;
  const match = text.match(/^\s*[\[(](product|produit|photo|plan|schema|schéma|usage|situation)[\])]\s*/i);
  return match ? parseMediaRole(match[1]) : null;
}

function readRolePayload(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** Meta `_qb_media_role` : objet `{ id|fichier: role }` ou liste `{ id?, src?, name?, role }`. */
export function mediaRoleMap(meta: Array<{ key?: string; value?: unknown }> | undefined) {
  const map = new Map<string, ProductMediaRole>();
  const row = (meta ?? []).find((item) => item.key === "_qb_media_role" || item.key === "qb_media_role");
  const payload = readRolePayload(row?.value);
  const assign = (key: unknown, role: ProductMediaRole | null) => {
    if (!role || key == null || !String(key).trim()) return;
    map.set(fold(String(key).trim()), role);
  };
  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (!item || typeof item !== "object") continue;
      const record = item as Record<string, unknown>;
      const role = parseMediaRole(record.role);
      assign(record.id, role);
      assign(record.src, role);
      assign(record.name, role);
      assign(record.file, role);
    }
    return map;
  }
  if (payload && typeof payload === "object") {
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      assign(key, parseMediaRole(value));
    }
  }
  return map;
}

export type ClassifiedMedia = {
  role: ProductMediaRole;
  /** Meta, préfixe `[plan]` ou mot-clé. Un défaut silencieux n'écrase pas un rôle déjà saisi. */
  explicit: boolean;
};

export function classifyProductImage(
  input: MediaRoleInput,
  roles: Map<string, ProductMediaRole> = new Map(),
): ClassifiedMedia {
  for (const key of roleKeys(input)) {
    const role = roles.get(key);
    if (role) return { role, explicit: true };
  }
  const marked = bracketRole(input.alt) ?? bracketRole(input.name);
  if (marked) return { role: marked, explicit: true };
  const guessed = guessMediaRole([input.alt, input.name, fileNameOf(input.src)].filter(Boolean).join(" "));
  if (guessed) return { role: guessed, explicit: true };
  return { role: "product", explicit: false };
}

/** Meta à renvoyer vers Woo pour les rôles autres que la photo produit. */
export function wooMediaRoleValue(images: Array<{ src: string; role?: ProductMediaRole | null }>) {
  const value: Record<string, ProductMediaRole> = {};
  for (const image of images) {
    if (!image.role || image.role === "product") continue;
    const file = fileNameOf(image.src);
    if (!file) continue;
    value[file] = image.role;
  }
  return Object.keys(value).length ? value : null;
}
