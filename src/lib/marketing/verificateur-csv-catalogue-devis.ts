/**
 * Vérificateur CSV catalogue. Copie locale des règles d'import
 * (src/lib/catalog/csv.ts au 14 octobre 2026), plus les constats
 * que la fenêtre d'import ne montre pas. Aucun appel réseau.
 */

export const CSV_TEMPLATE =
  'name,sku,category,price_min,price_max,tags,description\nRayonnage mi-lourd,RAY-ML-2010,Rayonnage,189,420,"entrepot,lourd","Echelles et lisses pour charges moyennes"\nBac gerbable,BAC-600,Bacs de rangement,18.42,18.42,"plastique,alimentaire","Bac blanc gerbable"\n';

export const EXEMPLE_EXCEL_FR =
  "Nom;Référence;Catégorie;Prix;Description\nNacelle ciseaux 8 m;NAC-08;Levage;145,00;Location à la journée, livraison en sus\nMini-pelle 2,5 t;MP-25;Terrassement;210,50;Avec godets 30 et 60 cm\nGroupe électrogène 20 kVA;GE-20;Énergie;95;\nGroupe électrogène 20 kVA;GE-20;Énergie;95;Doublon de la ligne précédente\n;BAR-01;Signalisation;12;Barrière sans nom\n";

export const IMPORT_KEYS = ["name", "sku", "category", "price_min", "price_max", "tags", "description"] as const;

export type ImportKey = (typeof IMPORT_KEYS)[number];

export const KEY_LABELS: Record<ImportKey, string> = {
  name: "nom",
  sku: "SKU",
  category: "catégorie",
  price_min: "prix min",
  price_max: "prix max",
  tags: "tags",
  description: "description",
};

export const COLUMN_ACCEPTED: Record<ImportKey, string> = {
  name: "name, nom, product_name",
  sku: "sku, reference, ref",
  category: "category, categorie, categories",
  price_min: "price_min, prix_min, price, regular_price",
  price_max: "price_max, prix_max",
  tags: "tags, etiquettes",
  description: "description",
};

export const FINDING_LEVELS = {
  bloquant: "Bloquant",
  a_corriger: "À corriger",
  info: "Info",
} as const;

export type FindingLevel = keyof typeof FINDING_LEVELS;

export const ALIASES: Record<string, ImportKey> = {
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

const HINTS: Record<string, string> = {
  prix: "prix_min",
  prix_ht: "prix_min",
  prix_unitaire: "prix_min",
  prix_unitaire_ht: "prix_min",
  tarif: "prix_min",
  prix_de_vente: "prix_min",
  pu_ht: "prix_min",
  prix_mini: "prix_min",
  prix_minimum: "prix_min",
  prix_maxi: "prix_max",
  prix_maximum: "prix_max",
  designation: "nom",
  libelle: "nom",
  produit: "nom",
  article: "nom",
  nom_produit: "nom",
  nom_du_produit: "nom",
  famille: "categorie",
  rayon: "categorie",
  gamme: "categorie",
  code: "sku",
  code_article: "sku",
  reference_produit: "sku",
  ref_produit: "sku",
  reference_article: "sku",
  mots_cles: "tags",
  mot_cle: "tags",
  tag: "tags",
  desc: "description",
  descriptif: "description",
};

const DELIM_LABELS: Record<string, string> = {
  ",": "virgule",
  ";": "point-virgule",
  "\t": "tabulation",
};

export type CatalogCsvIssue = { line: number; message: string };

export type CatalogCsvRow = {
  line: number;
  name: string;
  sku: string | null;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  rawMin: string;
  rawMax: string;
  swapped: boolean;
  tags: string[];
  category: string | null;
};

export type CatalogCsvInspection = {
  ok: boolean;
  headers: string[];
  mapped: Partial<Record<ImportKey, string>>;
  unknownHeaders: string[];
  missingNameColumn: boolean;
  rows: CatalogCsvRow[];
  skipped: number;
  issues: CatalogCsvIssue[];
};

export type CatalogFinding = { level: FindingLevel; code: string; text: string };

export type CatalogVerdictTone = "ok" | "warn" | "bad" | "neutral";

export type CatalogCsvStats = {
  lignes: number;
  prets: number;
  ignores: number;
  avecSku: number;
  sansSku: number;
  doublonsSku: string[];
  surDevis: number;
  prixFixe: number;
  fourchette: number;
  unSeulPrix: number;
  centimesMasques: number;
  inverses: number;
  signalements: number;
};

export type CatalogCsvPreview = {
  ligne: number;
  nom: string;
  sku: string | null;
  categorie: string | null;
  prix: string;
  tags: string[];
};

export type CatalogCsvCheck = {
  empty: boolean;
  delimiter: string;
  delimiterLabel: string;
  inspection: CatalogCsvInspection;
  findings: CatalogFinding[];
  stats: CatalogCsvStats;
  apercu: CatalogCsvPreview[];
  verdict: { tone: CatalogVerdictTone; text: string };
  recap: string;
};

function parseNumber(value: string | null | undefined) {
  if (value == null || !String(value).trim()) return null;
  const n = Number(String(value).replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function splitLine(line: string, delim: string) {
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
    } else if (ch === delim && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function splitCsvLine(line: string) {
  return splitLine(line, ",");
}

export function norm(header: string) {
  return String(header)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function finiteOrNull(n: number | null) {
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function orderPriceBounds(min: number | null, max: number | null) {
  const low = finiteOrNull(min);
  const high = finiteOrNull(max);
  if (low != null && high != null && high < low) return { min: high, max: low };
  return { min: low, max: high };
}

function nonEmptyLines(text: string | null | undefined) {
  return String(text == null ? "" : text)
    .split(/\r?\n/)
    .filter((line) => line.trim());
}

export function inspectProductCsv(text: string): CatalogCsvInspection {
  const lines = nonEmptyLines(text);
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
  const rawHeaders = splitCsvLine(lines[0] ?? "");
  const headers = rawHeaders.map(norm);
  const mappedKeys = headers.map((header) => (Object.prototype.hasOwnProperty.call(ALIASES, header) ? ALIASES[header] : null));
  const mapped: CatalogCsvInspection["mapped"] = {};
  const unknownHeaders: string[] = [];
  headers.forEach((header, index) => {
    const key = mappedKeys[index];
    const raw = rawHeaders[index] ? rawHeaders[index].trim() : "";
    if (key) mapped[key] = raw || header;
    else if (header) unknownHeaders.push(raw || header);
  });
  const missingNameColumn = !mapped.name;
  const issues: CatalogCsvIssue[] = [];
  if (missingNameColumn) {
    issues.push({ line: 1, message: "Colonne nom introuvable. Attendu : name, nom ou product_name." });
  }
  if (lines.length < 2) issues.push({ line: 1, message: "Aucune ligne produit sous l\u2019en-tête." });
  const rows: CatalogCsvRow[] = [];
  let skipped = 0;
  lines.slice(1).forEach((line, index) => {
    const lineNo = index + 2;
    const cells = splitCsvLine(line);
    const get = (key: ImportKey) => {
      const idx = mappedKeys.indexOf(key);
      return idx >= 0 ? (cells[idx] != null ? cells[idx] : "") : "";
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
    const ordered = orderPriceBounds(parseNumber(priceMinRaw), parseNumber(priceMaxRaw));
    const parsedMin = parseNumber(priceMinRaw);
    const parsedMax = parseNumber(priceMaxRaw);
    rows.push({
      line: lineNo,
      name,
      sku: get("sku") || null,
      description: get("description") || null,
      price_min: ordered.min,
      price_max: ordered.max,
      rawMin: priceMinRaw,
      rawMax: priceMaxRaw,
      swapped: parsedMin != null && parsedMax != null && parsedMax < parsedMin,
      tags: get("tags")
        .split(/[|,;]/)
        .map((tag) => tag.trim())
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

function countOutsideQuotes(line: string, ch: string) {
  let quoted = false;
  let n = 0;
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === '"') quoted = !quoted;
    else if (line[i] === ch && !quoted) n += 1;
  }
  return n;
}

export function detectDelimiter(text: string) {
  const first = nonEmptyLines(text)[0] || "";
  const counts: Record<string, number> = {
    ",": countOutsideQuotes(first, ","),
    ";": countOutsideQuotes(first, ";"),
    "\t": countOutsideQuotes(first, "\t"),
  };
  let best = ",";
  if ((counts[";"] ?? 0) > (counts[best] ?? 0)) best = ";";
  if ((counts["\t"] ?? 0) > (counts[best] ?? 0)) best = "\t";
  return best;
}

function quoteCell(cell: string) {
  return /[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

export function convertToComma(text: string, from?: string) {
  const delim = from || detectDelimiter(text);
  return (
    nonEmptyLines(text)
      .map((line) => splitLine(line, delim).map(quoteCell).join(","))
      .join("\n") + "\n"
  );
}

function groupe(entier: string | number) {
  return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

function fmtPrixAffiche(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const a = Math.abs(n);
  let txt: string;
  if (a > 0 && a < 1) txt = `0,${String(Math.round(a * 100)).padStart(2, "0")}`;
  else txt = groupe(Math.round(a));
  return `${n < 0 && txt !== "0" ? "-" : ""}${txt}\u00a0€`;
}

export function prixAffiche(min: number | null, max: number | null) {
  if (min == null && max == null) return "Sur devis";
  if (min != null && max != null) {
    const low = fmtPrixAffiche(Math.min(min, max));
    const high = fmtPrixAffiche(Math.max(min, max));
    return low === high ? low : `${low} à ${high}`;
  }
  return fmtPrixAffiche(min != null ? min : max);
}

function hasHiddenCents(n: number | null) {
  return n != null && Math.abs(n) >= 1 && Math.round(n) !== n;
}

function pl(n: number, sing: string, plur: string) {
  return n > 1 ? plur : sing;
}

function hintPhrase(hint: string) {
  if (hint === "nom") return "le nom";
  if (hint === "sku") return "la référence";
  if (hint === "categorie") return "la catégorie";
  if (hint === "tags") return "les étiquettes";
  if (hint === "description") return "la description";
  return "le prix";
}

const EMPTY_STATS: CatalogCsvStats = {
  lignes: 0,
  prets: 0,
  ignores: 0,
  avecSku: 0,
  sansSku: 0,
  doublonsSku: [],
  surDevis: 0,
  prixFixe: 0,
  fourchette: 0,
  unSeulPrix: 0,
  centimesMasques: 0,
  inverses: 0,
  signalements: 0,
};

export function checkCatalogCsv(text: string | null | undefined): CatalogCsvCheck {
  const source = String(text == null ? "" : text);
  const lines = nonEmptyLines(source);
  const delimiter = detectDelimiter(source);
  const inspection = inspectProductCsv(source);
  const findings: CatalogFinding[] = [];
  const add = (level: FindingLevel, code: string, msg: string) => {
    findings.push({ level, code, text: msg });
  };

  if (!lines.length) {
    return {
      empty: true,
      delimiter: ",",
      delimiterLabel: "virgule",
      inspection,
      findings: [],
      stats: EMPTY_STATS,
      apercu: [],
      verdict: {
        tone: "neutral",
        text: "Collez le contenu d'un fichier CSV ou choisissez un fichier pour lancer la vérification.",
      },
      recap: "",
    };
  }

  if (delimiter !== ",") {
    add(
      "bloquant",
      "separateur",
      `Séparateur détecté : ${DELIM_LABELS[delimiter]}. L'import QuoteBuilder ne découpe les colonnes qu'à la virgule : tout l'en-tête devient une seule colonne. Utilisez « Convertir en virgules » ci-dessous, ou réenregistrez le fichier avec la virgule comme séparateur.`,
    );
  } else if (inspection.missingNameColumn) {
    add("bloquant", "colonne_nom", "Colonne nom introuvable. Renommez la colonne des noms de produits en name, nom ou product_name.");
  }
  if (!inspection.missingNameColumn && !inspection.rows.length) {
    add("bloquant", "aucune_ligne", "Aucune ligne produit lisible sous l'en-tête.");
  }

  if (/\uFFFD|Ã[\u00a0-\u00bf]/.test(source)) {
    add(
      "a_corriger",
      "encodage",
      "Des caractères sont abîmés (é, è ou à remplacés par des symboles). Le fichier n'est pas en UTF-8 : réenregistrez-le au format CSV UTF-8, sinon les noms et les catégories arrivent tels quels, abîmés.",
    );
  }

  const lignesOuvertes: number[] = [];
  lines.forEach((line, i) => {
    const q = (line.match(/"/g) || []).length;
    if (q % 2 === 1) lignesOuvertes.push(i + 1);
  });
  if (lignesOuvertes.length) {
    add(
      "a_corriger",
      "retour_ligne",
      `Guillemets non refermés ${pl(lignesOuvertes.length, "à la ligne ", "aux lignes ")}${lignesOuvertes.join(", ")}. Une cellule qui contient un retour à la ligne (souvent une description) est coupée en deux par l'import : retirez les retours à la ligne des cellules.`,
    );
  }

  if (inspection.skipped && !inspection.missingNameColumn) {
    add(
      "a_corriger",
      "nom_manquant",
      `${inspection.skipped} ${pl(inspection.skipped, "ligne sera ignorée", "lignes seront ignorées")} : nom manquant.`,
    );
  }

  const illisibles = inspection.issues.filter((issue) => /illisible/.test(issue.message));
  if (illisibles.length) {
    add(
      "a_corriger",
      "prix_illisible",
      `${illisibles.length} ${pl(illisibles.length, "prix illisible", "prix illisibles")} (${illisibles.map((issue) => `ligne ${issue.line}`).join(", ")}). Le produit est importé sans ce prix. Écrivez 1234.50 ou 1234,50 entre guillemets, sans point des milliers.`,
    );
  }

  const rows = inspection.rows;
  const sansChiffre: number[] = [];
  const milliers: number[] = [];
  rows.forEach((row) => {
    [row.rawMin, row.rawMax].forEach((raw) => {
      if (raw && !/\d/.test(raw) && parseNumber(raw) === 0 && sansChiffre.indexOf(row.line) < 0) sansChiffre.push(row.line);
      if (raw && /^\d{1,3}\.\d{3}$/.test(raw.trim()) && milliers.indexOf(row.line) < 0) milliers.push(row.line);
    });
  });
  if (sansChiffre.length) {
    add(
      "a_corriger",
      "prix_texte",
      `Prix écrit en lettres (${sansChiffre.map((n) => `ligne ${n}`).join(", ")}) : l'import ne le signale pas et l'enregistre à 0 €. Videz la cellule pour afficher « Sur devis ».`,
    );
  }
  if (milliers.length) {
    add(
      "a_corriger",
      "prix_milliers",
      `Prix avec un point des milliers (${milliers.map((n) => `ligne ${n}`).join(", ")}) : 1.234 est lu 1,234 €. Écrivez 1234 sans séparateur.`,
    );
  }

  const compteSku: Record<string, number> = {};
  rows.forEach((row) => {
    if (row.sku) compteSku[row.sku] = (compteSku[row.sku] || 0) + 1;
  });
  const doublons = Object.keys(compteSku).filter((key) => (compteSku[key] ?? 0) > 1);
  if (doublons.length) {
    add(
      "a_corriger",
      "sku_doublon",
      `SKU en double dans le fichier : ${doublons.join(", ")}. Si le SKU existe déjà dans le funnel, la même fiche est réécrite plusieurs fois et la dernière ligne gagne. S'il n'existe pas, l'import crée plusieurs fiches avec ce SKU.`,
    );
  }

  const skuScientifiques = rows.filter((row) => row.sku && /^\d+([.,]\d+)?E\+\d+$/i.test(row.sku)).map((row) => row.sku);
  if (skuScientifiques.length) {
    add(
      "a_corriger",
      "sku_excel",
      `SKU en notation scientifique (${skuScientifiques.join(", ")}) : Excel a converti un code numérique long en nombre. Formatez la colonne en Texte avant d'exporter, sinon le SKU ne correspondra jamais à la fiche existante.`,
    );
  }

  inspection.unknownHeaders.forEach((header) => {
    const key = norm(header);
    if (Object.prototype.hasOwnProperty.call(HINTS, key)) {
      const hint = HINTS[key] ?? "";
      add(
        "a_corriger",
        "colonne_proche",
        `Colonne « ${header} » ignorée. Si elle contient ${hintPhrase(hint)}, renommez-la en ${hint}.${hint === "prix_min" ? " Pour un prix fixe, mettez la même valeur dans une colonne prix_max." : ""}`,
      );
    }
  });
  const autres = inspection.unknownHeaders.filter((header) => !Object.prototype.hasOwnProperty.call(HINTS, norm(header)));
  if (autres.length && delimiter === ",") {
    add(
      "info",
      "colonnes_ignorees",
      `Colonnes ignorées par l'import : ${autres.join(", ")}. Photos, options, variantes, stock et caractéristiques ne passent pas par le CSV.`,
    );
  }

  const avecSku = rows.filter((row) => row.sku).length;
  const sansSku = rows.length - avecSku;
  if (!inspection.missingNameColumn && rows.length) {
    if (!inspection.mapped.sku) {
      add("info", "sans_colonne_sku", "Pas de colonne SKU : chaque import crée de nouvelles fiches. Réimporter le même fichier crée des doublons.");
    } else {
      if (sansSku) {
        add(
          "info",
          "lignes_sans_sku",
          `${sansSku} ${pl(sansSku, "ligne sans SKU sera créée", "lignes sans SKU seront créées")} à chaque import, sans contrôle de doublon.`,
        );
      }
      const absentes = IMPORT_KEYS.filter((key) => key !== "name" && key !== "sku" && !inspection.mapped[key]);
      if (absentes.length) {
        add(
          "info",
          "colonnes_absentes",
          `Colonnes absentes : ${absentes.map((key) => KEY_LABELS[key]).join(", ")}. Pour un SKU déjà présent dans le funnel, l'import réécrit la fiche avec les valeurs du fichier : une colonne absente ou une cellule vide efface le champ.`,
        );
      }
    }
  }

  let surDevis = 0;
  let prixFixe = 0;
  let fourchette = 0;
  let unSeulPrix = 0;
  let centimes = 0;
  let inverses = 0;
  rows.forEach((row) => {
    if (row.price_min == null && row.price_max == null) surDevis += 1;
    else if (row.price_min != null && row.price_max != null) {
      if (row.price_min === row.price_max) prixFixe += 1;
      else fourchette += 1;
    } else unSeulPrix += 1;
    if (hasHiddenCents(row.price_min) || hasHiddenCents(row.price_max)) centimes += 1;
    if (row.swapped) inverses += 1;
  });
  if (surDevis) {
    add("info", "sur_devis", `${surDevis} ${pl(surDevis, "produit sans prix s'affichera", "produits sans prix s'afficheront")} « Sur devis ».`);
  }
  if (centimes) {
    add(
      "info",
      "centimes",
      `${centimes} ${pl(centimes, "produit a", "produits ont")} un prix avec centimes : QuoteBuilder affiche les montants d'un euro ou plus sans centimes (18,42 devient 18 €).`,
    );
  }
  if (inverses) {
    add(
      "info",
      "prix_inverses",
      `${inverses} ${pl(inverses, "ligne a", "lignes ont")} un prix min plus haut que le prix max : l'import remet les deux bornes dans l'ordre.`,
    );
  }

  if (inspection.issues.length > 6) {
    add(
      "info",
      "signalements",
      `La fenêtre d'import n'affiche que les 6 premiers signalements. Ce fichier en compte ${inspection.issues.length} : la liste complète est ci-dessous.`,
    );
  }

  const bloquants = findings.filter((finding) => finding.level === "bloquant");
  const aCorriger = findings.filter((finding) => finding.level === "a_corriger");
  let verdict: CatalogCsvCheck["verdict"];
  if (bloquants.length || !inspection.ok) {
    const first = bloquants[0] ? `${bloquants[0].text.split(". ")[0]}.` : "";
    verdict = {
      tone: "bad",
      text: `Fichier refusé en l'état : le bouton Importer restera grisé. ${first}`,
    };
  } else if (aCorriger.length) {
    verdict = {
      tone: "warn",
      text: `Import possible pour ${rows.length} ${pl(rows.length, "produit", "produits")}, mais ${aCorriger.length} ${pl(aCorriger.length, "point mérite", "points méritent")} une correction avant.`,
    };
  } else {
    verdict = {
      tone: "ok",
      text: `Fichier prêt : ${rows.length} ${pl(rows.length, "produit sera créé ou mis à jour", "produits seront créés ou mis à jour")}. Vérifiez l'aperçu dans la fenêtre d'import avant de valider.`,
    };
  }

  const stats: CatalogCsvStats = {
    lignes: Math.max(0, lines.length - 1),
    prets: rows.length,
    ignores: inspection.skipped,
    avecSku,
    sansSku,
    doublonsSku: doublons,
    surDevis,
    prixFixe,
    fourchette,
    unSeulPrix,
    centimesMasques: centimes,
    inverses,
    signalements: inspection.issues.length,
  };

  const apercu = rows.slice(0, 5).map((row) => ({
    ligne: row.line,
    nom: row.name,
    sku: row.sku,
    categorie: row.category,
    prix: prixAffiche(row.price_min, row.price_max),
    tags: row.tags,
  }));

  const reconnues = IMPORT_KEYS.filter((key) => inspection.mapped[key]).map(
    (key) => `${inspection.mapped[key]} = ${KEY_LABELS[key]}`,
  );
  const recap = [
    "Vérification d'un CSV catalogue avant import QuoteBuilder.",
    `Séparateur : ${DELIM_LABELS[delimiter]}.`,
    `Colonnes reconnues : ${reconnues.length ? reconnues.join(", ") : "aucune"}.`,
    `Colonnes ignorées : ${inspection.unknownHeaders.length ? inspection.unknownHeaders.join(", ") : "aucune"}.`,
    `Produits prêts : ${rows.length}. Lignes ignorées : ${inspection.skipped}.`,
    `SKU : ${avecSku} avec, ${sansSku} sans, ${doublons.length} en double.`,
    `Prix : ${prixFixe} fixe${prixFixe > 1 ? "s" : ""}, ${fourchette} fourchette${fourchette > 1 ? "s" : ""}, ${unSeulPrix} avec une seule borne, ${surDevis} sur devis.`,
    `Points bloquants : ${bloquants.length}. À corriger : ${aCorriger.length}.`,
    `Verdict : ${verdict.text}`,
    "Vérifié sur : quotebuilder.co/outils/verificateur-csv-catalogue-devis",
  ].join("\n");

  return {
    empty: false,
    delimiter,
    delimiterLabel: DELIM_LABELS[delimiter] ?? delimiter,
    inspection,
    findings,
    stats,
    apercu,
    verdict,
    recap,
  };
}

export function buildRecap(text: string) {
  return checkCatalogCsv(text).recap;
}
