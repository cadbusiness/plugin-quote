export type CsvProductRow = {
  name: string;
  sku: string | null;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  tags: string[];
  category: string | null;
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

export function parseProductCsv(text: string): CsvProductRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map(norm);
  const mapped = headers.map((h) => ALIASES[h] ?? null);
  const rows: CsvProductRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const get = (key: keyof CsvProductRow) => {
      const idx = mapped.findIndex((m) => m === key);
      return idx >= 0 ? cells[idx] ?? "" : "";
    };
    const name = get("name");
    if (!name) continue;
    rows.push({
      name,
      sku: get("sku") || null,
      description: get("description") || null,
      price_min: parseNumber(get("price_min")),
      price_max: parseNumber(get("price_max")),
      tags: get("tags")
        .split(/[|,;]/)
        .map((t) => t.trim())
        .filter(Boolean),
      category: get("category") || null,
    });
  }
  return rows;
}
