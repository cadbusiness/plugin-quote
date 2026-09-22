/**
 * Fiche B2B hors galerie : mode d'emploi, conformité, garantie.
 * La description produit n'est jamais copiée dans le mode d'emploi.
 */

import { htmlToText } from "@/lib/integrations/html";
import { fileNameOf } from "@/lib/catalog/media-roles";

export const SHEET_DOCUMENT_ROLES = ["manual", "certificate", "warranty"] as const;

export type SheetDocumentRole = (typeof SHEET_DOCUMENT_ROLES)[number];

export type SheetDocument = {
  role: SheetDocumentRole;
  src: string;
  label: string;
};

export type ProductSheet = {
  manualText: string;
  documents: SheetDocument[];
};

export const EMPTY_PRODUCT_SHEET: ProductSheet = { manualText: "", documents: [] };

const MAX_MANUAL_TEXT = 4000;
const MAX_DOCUMENTS = 8;
const MAX_LABEL = 120;

const MANUAL_TOKENS = new Set([
  "notice",
  "notices",
  "emploi",
  "manuel",
  "manual",
  "manuals",
  "montage",
  "assemblage",
  "assembly",
  "installation",
  "installations",
  "instruction",
  "instructions",
  "guide",
  "guides",
]);

const CERTIFICATE_TOKENS = new Set([
  "conformite",
  "declaration",
  "certificat",
  "certificate",
  "attestation",
  "dop",
  "doc",
  "ce",
]);

const WARRANTY_TOKENS = new Set(["garantie", "garanties", "warranty", "warrant"]);

const DOCUMENT_FILE = /\.(pdf|docx?|odt)(?:$|[?#])/i;

const ROLE_LABEL: Record<SheetDocumentRole, string> = {
  manual: "Mode d'emploi",
  certificate: "Conformité",
  warranty: "Garantie",
};

export function defaultSheetLabel(role: SheetDocumentRole) {
  return ROLE_LABEL[role];
}

export function parseSheetRole(value: unknown): SheetDocumentRole | null {
  if (typeof value !== "string") return null;
  const token = fold(value).replace(/[\s-]+/g, "_");
  if (token === "manual" || token === "mode_emploi" || token === "notice" || token === "manuel") return "manual";
  if (token === "certificate" || token === "conformite" || token === "certificat" || token === "ce") return "certificate";
  if (token === "warranty" || token === "garantie") return "warranty";
  return null;
}

export function sheetIsEmpty(sheet: ProductSheet) {
  return !sheet.manualText.trim() && sheet.documents.length === 0;
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

function countHits(text: string, vocabulary: Set<string>) {
  let hits = 0;
  for (const token of tokensOf(text)) {
    if (vocabulary.has(token)) hits += 1;
  }
  return hits;
}

export function isSheetFile(src: string) {
  return DOCUMENT_FILE.test(src.trim());
}

/** Rôle document depuis un nom de fichier, un alt ou un libellé de téléchargement. */
export function sheetRoleFromText(text: string): SheetDocumentRole | null {
  const warranty = countHits(text, WARRANTY_TOKENS);
  const certificate = countHits(text, CERTIFICATE_TOKENS);
  const manual = countHits(text, MANUAL_TOKENS);
  if (!warranty && !certificate && !manual) return null;
  if (warranty > manual && warranty >= certificate) return "warranty";
  if (manual > 0 && manual >= certificate) return "manual";
  if (certificate) return "certificate";
  if (warranty) return "warranty";
  return "manual";
}

function plain(value: string | null | undefined) {
  return (htmlToText(value ?? "", 20_000) ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Texte court de notice. Le HTML de description (ou le même texte) est rejeté.
 * Un peu de HTML léger est aplati ; le markdown sans balises est conservé.
 */
export function acceptManualText(raw: string | null | undefined, description?: string | null): string {
  const source = (raw ?? "").trim();
  if (!source) return "";
  const tags = source.match(/<\/?[a-z][^>]*>/gi) ?? [];
  if (tags.length >= 8) return "";
  const text = plain(source);
  if (!text) return "";
  const described = [description]
    .filter((part): part is string => Boolean(part && part.trim()))
    .map((part) => plain(part))
    .filter(Boolean);
  for (const body of described) {
    if (text === body) return "";
    const shorter = text.length < body.length ? text : body;
    const longer = text.length < body.length ? body : text;
    if (shorter.length >= 180 && longer.includes(shorter) && shorter.length / longer.length >= 0.6) return "";
  }
  return text.length > MAX_MANUAL_TEXT ? text.slice(0, MAX_MANUAL_TEXT).trimEnd() : text;
}

export function httpDocumentUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!/^https?:\/\//i.test(text)) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function readPayload(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text) return null;
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }
  return text;
}

function metaValue(meta: Array<{ key?: string; value?: unknown }> | undefined, key: string) {
  const row = (meta ?? []).find((item) => item.key === key);
  return row ? readPayload(row.value) : undefined;
}

function labelOf(value: unknown, role: SheetDocumentRole) {
  const text = typeof value === "string" ? value.trim() : "";
  return (text || defaultSheetLabel(role)).slice(0, MAX_LABEL);
}

function pushDocument(documents: SheetDocument[], role: SheetDocumentRole, src: string, label?: unknown) {
  if (documents.length >= MAX_DOCUMENTS) return;
  if (documents.some((doc) => doc.src === src && doc.role === role)) return;
  documents.push({ role, src, label: labelOf(label, role) });
}

function documentFromUnknown(value: unknown, role: SheetDocumentRole, description?: string | null) {
  const payload = readPayload(value);
  let text = "";
  let src: string | null = null;
  let label: unknown;
  if (typeof payload === "string") {
    src = httpDocumentUrl(payload);
    if (!src) text = acceptManualText(payload, description);
  } else if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;
    src = httpDocumentUrl(record.url ?? record.src ?? record.file ?? record.href);
    label = record.label ?? record.name ?? record.title;
    const body = record.text ?? record.manual ?? record.content;
    if (typeof body === "string") text = acceptManualText(body, description);
    else if (!src && typeof record.value === "string") text = acceptManualText(record.value, description);
  }
  return { text, src, label };
}

export type WooSheetSource = {
  description?: string | null;
  short_description?: string | null;
  meta_data?: Array<{ key?: string; value?: unknown }>;
  downloads?: Array<{ id?: string; name?: string; file?: string }>;
  /** PDF déjà sortis de la galerie images. */
  documents?: SheetDocument[];
};

/** Notice, conformité et garantie depuis meta, téléchargements et fichiers nommés. */
export function mapWooProductSheet(source: WooSheetSource): ProductSheet {
  const description = [source.description, source.short_description].filter(Boolean).join("\n");
  const documents: SheetDocument[] = [];
  let manualText = "";

  const manual = documentFromUnknown(metaValue(source.meta_data, "_qb_manual"), "manual", description);
  if (manual.text) manualText = manual.text;
  if (manual.src) pushDocument(documents, "manual", manual.src, manual.label);

  for (const key of ["_qb_certificate", "_qb_warranty"] as const) {
    const role: SheetDocumentRole = key === "_qb_certificate" ? "certificate" : "warranty";
    const parsed = documentFromUnknown(metaValue(source.meta_data, key), role, description);
    if (parsed.src) pushDocument(documents, role, parsed.src, parsed.label);
  }

  for (const download of source.downloads ?? []) {
    const src = httpDocumentUrl(download.file);
    if (!src) continue;
    const role = sheetRoleFromText([download.name, fileNameOf(src)].filter(Boolean).join(" "));
    if (!role) continue;
    pushDocument(documents, role, src, download.name);
  }

  for (const document of source.documents ?? []) {
    const src = httpDocumentUrl(document.src);
    const role = parseSheetRole(document.role);
    if (!src || !role) continue;
    pushDocument(documents, role, src, document.label);
  }

  return { manualText, documents };
}

export function parseProductSheet(value: unknown): ProductSheet {
  const payload = readPayload(value);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { ...EMPTY_PRODUCT_SHEET };
  const record = payload as Record<string, unknown>;
  const manualText = acceptManualText(
    typeof record.manualText === "string" ? record.manualText : typeof record.text === "string" ? record.text : "",
  );
  const documents: SheetDocument[] = [];
  if (Array.isArray(record.documents)) {
    for (const item of record.documents) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const role = parseSheetRole(row.role) ?? "manual";
      const src = httpDocumentUrl(row.src ?? row.url ?? row.file);
      if (!src) continue;
      pushDocument(documents, role, src, row.label ?? row.name);
    }
  }
  return { manualText, documents };
}

/**
 * Un pull vide ne remplace pas une notice déjà saisie.
 * Un rôle présent dans l'entrée remplace ce rôle ; les autres restent.
 */
export function storedSheetForSync(incoming: unknown, existing?: unknown): ProductSheet | null {
  const next = parseProductSheet(incoming);
  const prior = parseProductSheet(existing);
  if (sheetIsEmpty(next)) return sheetIsEmpty(prior) ? null : prior;
  const roles = new Set(next.documents.map((doc) => doc.role));
  const documents: SheetDocument[] = [];
  for (const doc of prior.documents) {
    if (!roles.has(doc.role)) pushDocument(documents, doc.role, doc.src, doc.label);
  }
  for (const doc of next.documents) pushDocument(documents, doc.role, doc.src, doc.label);
  const sheet = { manualText: next.manualText || prior.manualText, documents };
  return sheetIsEmpty(sheet) ? null : sheet;
}

export function readSheetField(formData: FormData): ProductSheet | null {
  if (!formData.has("manual_text") && !formData.has("sheet_doc_url")) return null;
  const manualText = acceptManualText(String(formData.get("manual_text") ?? ""));
  const roles = formData.getAll("sheet_doc_role");
  const urls = formData.getAll("sheet_doc_url");
  const labels = formData.getAll("sheet_doc_label");
  const documents: SheetDocument[] = [];
  for (let index = 0; index < urls.length; index += 1) {
    const src = httpDocumentUrl(urls[index]);
    if (!src) continue;
    const role = parseSheetRole(roles[index]) ?? "manual";
    pushDocument(documents, role, src, labels[index]);
  }
  return { manualText, documents };
}

/** Lignes du formulaire : un champ par rôle, puis les documents en trop. */
export function sheetFormRows(sheet: ProductSheet): SheetDocument[] {
  const rows: SheetDocument[] = [];
  const seen = new Set<string>();
  for (const role of SHEET_DOCUMENT_ROLES) {
    const found = sheet.documents.find((doc) => doc.role === role);
    if (found) seen.add(`${found.role}:${found.src}`);
    rows.push(found ?? { role, src: "", label: "" });
  }
  for (const doc of sheet.documents) {
    const key = `${doc.role}:${doc.src}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(doc);
  }
  return rows;
}

export function wooSheetMeta(sheet: ProductSheet): Array<{ key: string; value: unknown }> {
  const meta: Array<{ key: string; value: unknown }> = [];
  const manual = sheet.documents.find((doc) => doc.role === "manual");
  if (sheet.manualText || manual) {
    meta.push({
      key: "_qb_manual",
      value: {
        ...(manual ? { url: manual.src, label: manual.label } : {}),
        ...(sheet.manualText ? { text: sheet.manualText } : {}),
      },
    });
  }
  const certificate = sheet.documents.find((doc) => doc.role === "certificate");
  if (certificate) meta.push({ key: "_qb_certificate", value: { url: certificate.src, label: certificate.label } });
  const warranty = sheet.documents.find((doc) => doc.role === "warranty");
  if (warranty) meta.push({ key: "_qb_warranty", value: { url: warranty.src, label: warranty.label } });
  return meta;
}
