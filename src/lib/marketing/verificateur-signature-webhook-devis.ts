export const SIGNATURE_HEADER = "X-QuoteBuilder-Signature";
export const EXPECTED_EVENT = "quote.submitted";
export const MIN_KEY_BYTES = 32;

export const SIGNATURE_DEFAULT_SECRET = "secret-de-test-quotebuilder-a-remplacer-2026";
export const SIGNATURE_DEFAULT_RECEIVED =
  "fe5026ad0d4ae02b87d0cbd83533350afc0e59cdfffe46b97961a7f514f149ce";
export const SIGNATURE_DEFAULT_BODY =
  '{"event":"quote.submitted","quote":{"id":"7f1c2e4a-0b9d-4c61-9a52-3d8e6f1b2c90","status":"new","contact_name":"Camille Martin","contact_email":"camille.martin@example.com","contact_phone":"+33 6 00 00 00 00","contact_company":"Atelier Exemple","consent_marketing":false,"answers":{"project_type":"intra","timeline":"quarter"},"score":30,"score_label":"cold","utm_source":"google","created_at":"2026-10-07T15:00:00.000Z"},"answers":{"project_type":"intra","timeline":"quarter"},"items":[{"product_id":"2b6d9f10-5c3e-4a7b-8e21-9f0c4d6a1b37","name":"Formation exemple (2 jours)","quantity":8,"options":{},"price_min":350,"price_max":450}],"files":[],"suggestion":null}';

const encoder = new TextEncoder();

export type SignatureInput = {
  body?: string;
  secret?: string;
  received?: string;
};

export type NormalizedSignature = {
  value: string;
  empty: boolean;
  valid: boolean;
  notes: string[];
};

export type BodyAnalysis = {
  text: string;
  bytes: number;
  jsonValid: boolean;
  compact: string | null;
  isCompact: boolean;
  trailingWhitespace: boolean;
  event: string | null;
  quoteId: string | null;
};

export type SignatureVariant = "compact" | "trimmed_body" | "trimmed_secret" | null;

export type SignatureResult = {
  bytes: number;
  jsonValid: boolean;
  isCompact: boolean;
  trailingWhitespace: boolean;
  event: string | null;
  quoteId: string | null;
  secretBytes: number;
  secretShort: boolean;
  secretSpaces: boolean;
  receivedNotes: string[];
  receivedValid: boolean;
  received: string;
  computed: string | null;
  match: boolean;
  variant: SignatureVariant;
  state: string;
};

export type SignatureTone = "ok" | "bad" | "warn" | "neutral";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return toHex(signature);
}

function sameHex(a: string, b: string) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function normalizeSignature(raw: string | null | undefined): NormalizedSignature {
  let value = String(raw == null ? "" : raw).trim();
  const notes: string[] = [];
  const header = value.match(/^x-quotebuilder-signature\s*:\s*/i);
  if (header) {
    value = value.slice(header[0].length);
    notes.push("header");
  }
  if (/^sha256=/i.test(value)) {
    value = value.slice(7);
    notes.push("prefix");
  }
  value = value.trim();
  const lower = value.toLowerCase();
  if (lower !== value) notes.push("uppercase");
  return { value: lower, empty: lower.length === 0, valid: /^[0-9a-f]{64}$/.test(lower), notes };
}

export function analyzeBody(raw: string | null | undefined): BodyAnalysis {
  const text = String(raw == null ? "" : raw);
  const bytes = encoder.encode(text).length;
  let parsed: unknown = null;
  let jsonValid = false;
  try {
    parsed = JSON.parse(text);
    jsonValid = true;
  } catch {
    jsonValid = false;
  }
  const compact = jsonValid ? JSON.stringify(parsed) : null;
  const isObject = jsonValid && parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
  const record = isObject ? (parsed as Record<string, unknown>) : null;
  const quote = record && record.quote && typeof record.quote === "object" ? (record.quote as Record<string, unknown>) : null;
  return {
    text,
    bytes,
    jsonValid,
    compact,
    isCompact: jsonValid && compact === text,
    trailingWhitespace: /\s$/.test(text),
    event: record && typeof record.event === "string" ? record.event : null,
    quoteId: quote && typeof quote.id === "string" ? quote.id : null,
  };
}

export async function verifySignature(input: SignatureInput | null | undefined): Promise<SignatureResult> {
  const body = String(input && input.body != null ? input.body : "");
  const secret = String(input && input.secret != null ? input.secret : "");
  const info = analyzeBody(body);
  const sig = normalizeSignature(input ? input.received : "");
  const secretBytes = encoder.encode(secret).length;
  const result: SignatureResult = {
    bytes: info.bytes,
    jsonValid: info.jsonValid,
    isCompact: info.isCompact,
    trailingWhitespace: info.trailingWhitespace,
    event: info.event,
    quoteId: info.quoteId,
    secretBytes,
    secretShort: secretBytes > 0 && secretBytes < MIN_KEY_BYTES,
    secretSpaces: secret !== secret.trim(),
    receivedNotes: sig.notes,
    receivedValid: sig.valid,
    received: sig.value,
    computed: null,
    match: false,
    variant: null,
    state: "",
  };
  if (!secret.length) {
    result.state = "missing_secret";
    return result;
  }
  if (!body.length) {
    result.state = "empty_body";
    return result;
  }
  result.computed = await hmacHex(secret, body);
  if (sig.empty) {
    result.state = "computed";
    return result;
  }
  if (!sig.valid) {
    result.state = "bad_format";
    return result;
  }
  result.match = sameHex(result.computed, sig.value);
  if (result.match) {
    result.state = "match";
    return result;
  }
  if (info.trailingWhitespace && sameHex(await hmacHex(secret, body.replace(/\s+$/, "")), sig.value)) {
    result.variant = "trimmed_body";
  } else if (info.jsonValid && !info.isCompact && info.compact && sameHex(await hmacHex(secret, info.compact), sig.value)) {
    result.variant = "compact";
  } else if (result.secretSpaces && secret.trim().length && sameHex(await hmacHex(secret.trim(), body), sig.value)) {
    result.variant = "trimmed_secret";
  }
  result.state = "mismatch";
  return result;
}

const VARIANT_TEXT: Record<Exclude<SignatureVariant, null>, string> = {
  compact:
    "le corps collé est réindenté, et sa version compacte correspond à l'en-tête. Le JSON a été reformaté entre la réception et la vérification : signez le corps brut, octet pour octet.",
  trimmed_body:
    "le corps collé finit par un espace ou un saut de ligne, et sans lui la signature correspond. Vérifiez sur le corps brut, sans ajout.",
  trimmed_secret:
    "le secret saisi commence ou finit par un espace, et sans lui la signature correspond. Retirez l'espace du secret côté serveur.",
};

export function describe(result: SignatureResult): { cls: SignatureTone; text: string } {
  if (result.state === "missing_secret")
    return { cls: "warn", text: "Secret manquant · saisissez le secret HMAC enregistré avec le webhook." };
  if (result.state === "empty_body") return { cls: "warn", text: "Corps vide · collez le corps brut de la requête reçue." };
  if (result.state === "computed")
    return {
      cls: "neutral",
      text: "Signature calculée. Collez la valeur de l'en-tête " + SIGNATURE_HEADER + " reçue pour comparer.",
    };
  if (result.state === "bad_format")
    return {
      cls: "warn",
      text: "Format inattendu · l'en-tête doit contenir 64 caractères hexadécimaux (HMAC SHA-256), sans préfixe.",
    };
  if (result.state === "match")
    return { cls: "ok", text: "Signature valide · ce corps et ce secret donnent exactement l'en-tête reçu." };
  if (result.variant) return { cls: "bad", text: "Signature différente · " + VARIANT_TEXT[result.variant] };
  return {
    cls: "bad",
    text: "Signature différente · le corps, le secret ou l'en-tête ne correspondent pas. Vérifiez le corps brut, puis le secret enregistré avec ce webhook.",
  };
}

export function hints(result: SignatureResult): string[] {
  const out: string[] = [];
  if (result.receivedNotes.indexOf("header") >= 0) out.push("Le nom de l'en-tête a été retiré de la valeur collée.");
  if (result.receivedNotes.indexOf("prefix") >= 0)
    out.push("Le préfixe « sha256= » a été retiré : QuoteBuilder n'en ajoute pas, ne le cherchez pas côté serveur.");
  if (result.receivedNotes.indexOf("uppercase") >= 0)
    out.push("La valeur reçue était en majuscules : QuoteBuilder envoie de l'hexadécimal en minuscules.");
  if (result.secretShort)
    out.push(
      "Secret de " +
        result.secretBytes +
        " octets : la RFC 2104 déconseille fortement une clé plus courte que la sortie du hachage, soit 32 octets pour SHA-256.",
    );
  if (result.secretSpaces && result.variant !== "trimmed_secret")
    out.push("Le secret commence ou finit par un espace : vérifiez qu'il est identique des deux côtés.");
  if (result.bytes > 0 && !result.jsonValid)
    out.push("Le corps n'est pas un JSON valide : QuoteBuilder envoie du JSON (Content-Type application/json).");
  if (result.jsonValid && result.event !== EXPECTED_EVENT)
    out.push(
      "Le champ « event » vaut " +
        (result.event ? "« " + result.event + " »" : "rien") +
        " : QuoteBuilder envoie « " +
        EXPECTED_EVENT +
        " ».",
    );
  if (result.jsonValid && !result.isCompact && result.variant !== "compact")
    out.push(
      "Le corps collé n'est pas du JSON compact : QuoteBuilder envoie le JSON sans indentation. Un corps copié depuis un outil qui réindente ne se vérifie pas.",
    );
  return out;
}

export function formatBodySummary(result: SignatureResult) {
  return (
    result.bytes +
    " octets · " +
    (result.jsonValid ? "JSON valide" : "pas un JSON valide") +
    (result.jsonValid ? (result.isCompact ? " · compact" : " · réindenté") : "") +
    (result.event ? " · " + result.event : "")
  );
}

export function buildRecap(result: SignatureResult, status: string) {
  return [
    "Récap vérification webhook QuoteBuilder (calcul local)",
    "Événement : " + (result.event || "-") + " · dossier (quote.id) : " + (result.quoteId || "-"),
    "Corps : " +
      result.bytes +
      " octets · JSON valide : " +
      (result.jsonValid ? "oui" : "non") +
      " · JSON compact : " +
      (result.isCompact ? "oui" : "non"),
    "Secret : " + result.secretBytes + " octets (non recopié ici)",
    "Signature calculée : " + (result.computed || "-"),
    "Signature reçue : " + (result.received || "-"),
    "Résultat : " + status,
    "",
    "Checklist côté récepteur :",
    "- Lire le corps brut avant tout parsing JSON",
    "- Calculer le HMAC SHA-256 du corps brut avec le secret, en hexadécimal minuscule",
    "- Comparer à l'en-tête " + SIGNATURE_HEADER + " en temps constant",
    "- Refuser la requête (401) si l'en-tête manque ou diffère",
    "- Répondre 2xx rapidement et traiter ensuite : un envoi en échec n'est pas renvoyé",
    "- Dédoublonner sur quote.id avant de créer une fiche dans le CRM",
    "- Rapprocher chaque jour avec GET /api/leads (clé API qb_live_...)",
    "- Secret aléatoire d'au moins 32 octets, rangé hors du code",
    "",
    "Calcul local · aucune donnée envoyée · utilisez un secret de test.",
  ].join("\n");
}
