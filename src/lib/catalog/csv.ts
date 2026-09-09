export type CsvProductRow = {
  name: string;
  sku: string | null;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  tags: string[];
  category: string | null;
};

export const CSV_TEMPLATE = `name,sku,category,price_min,price_max,tags,description
Rayonnage mi-lourd,RAY-ML-2010,Rayonnage,189,420,"entrepot,lourd","Echelles et lisses pour charges moyennes"
Bac gerbable,BAC-600,Bacs de rangement,18.42,18.42,"plastique,alimentaire","Bac blanc gerbable"
`;

export type CsvIssue = { line: number; message: string };

export type CsvInspection = {
  ok: boolean;
  headers: string[];
  mapped: Partial<Record<keyof CsvProductRow, string>>;
  unknownHeaders: string[];
  missingNameColumn: boolean;
  rows: CsvProductRow[];
  skipped: number;
  issues: CsvIssue[];
};

function parseNumber(value: string | undefined) {
  if (!value?.trim()) return null;
  const n = Number(value.replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function norm(header: string) {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const ALIASES: Record<string, keyof CsvProductRow | "skip"> = {
  name: "name",
  nom: "name",
  product_name: "name",
  sku: "sku",
  reference: "sku",
  ref: "sku",
  description: "description",
  price_min: "price_min",
  prix_min: "price_min",
  regular_price: "price_min",
  price: "price_min",
  price_max: "price_max",
  prix_max: "price_max",
  tags: "tags",
  etiquettes: "tags",
  category: "category",
  categorie: "category",
  categories: "category",
};

export function inspectProductCsv(text: string): CsvInspection {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) {
    return {
      ok: false,
      headers: [],
      mapped: {},
      unknownHeaders: [],
      missingNameColumn: true,
      rows: [],
      skipped: 0,
      issues: [{ line: 1, message: "Fichier vide." }],
    };
  }
  const rawHeaders = splitCsvLine(lines[0]);
  const headers = rawHeaders.map(norm);
  const mappedKeys = headers.map((h) => ALIASES[h] ?? null);
  const mapped: CsvInspection["mapped"] = {};
  const unknownHeaders: string[] = [];
  headers.forEach((header, index) => {
    const key = mappedKeys[index];
    if (key && key !== "skip") mapped[key] = rawHeaders[index]?.trim() || header;
    else if (header) unknownHeaders.push(rawHeaders[index]?.trim() || header);
  });
  const missingNameColumn = !mapped.name;
  const issues: CsvIssue[] = [];
  if (missingNameColumn) {
    issues.push({
      line: 1,
      message: "Colonne nom introuvable. Attendu : name, nom ou product_name.",
    });
  }
  if (lines.length < 2) {
    issues.push({ line: 1, message: "Aucune ligne produit sous l’en-tête." });
  }

  const rows: CsvProductRow[] = [];
  let skipped = 0;
  lines.slice(1).forEach((line, index) => {
    const lineNo = index + 2;
    const cells = splitCsvLine(line);
    const get = (key: keyof CsvProductRow) => {
      const idx = mappedKeys.findIndex((m) => m === key);
      return idx >= 0 ? cells[idx] ?? "" : "";
    };
    const name = get("name");
    if (!name) {
      skipped += 1;
      issues.push({ line: lineNo, message: "Ligne ignorée : nom manquant." });
      return;
    }
    const priceMinRaw = get("price_min");
    const priceMaxRaw = get("price_max");
    if (priceMinRaw && parseNumber(priceMinRaw) === null) {
      issues.push({ line: lineNo, message: `Prix min illisible (${priceMinRaw}).` });
    }
    if (priceMaxRaw && parseNumber(priceMaxRaw) === null) {
      issues.push({ line: lineNo, message: `Prix max illisible (${priceMaxRaw}).` });
    }
    rows.push({
      name,
      sku: get("sku") || null,
      description: get("description") || null,
      price_min: parseNumber(priceMinRaw),
      price_max: parseNumber(priceMaxRaw),
      tags: get("tags")
        .split(/[|,;]/)
        .map((t) => t.trim())
        .filter(Boolean),
      category: get("category") || null,
    });
  });

  return {
    ok: !missingNameColumn && rows.length > 0,
    headers: rawHeaders.map((header) => header.trim()).filter(Boolean),
    mapped,
    unknownHeaders,
    missingNameColumn,
    rows,
    skipped,
    issues,
  };
}

export function parseProductCsv(text: string): CsvProductRow[] {
  return inspectProductCsv(text).rows;
}
