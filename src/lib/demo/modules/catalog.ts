import type { Json } from "@/lib/db/database.types";
import type { SeedModule } from "@/lib/demo/types";

type DemoProduct = {
  sku: string;
  name: string;
  description: string;
  category: string;
  price_min: number;
  price_max: number;
  tags: string[];
  options: Json;
};

type DemoRule = {
  name: string;
  priority: number;
  projectType: string | null;
  productSkus: string[];
  price_min: number;
  price_max: number;
  headline: string;
  description: string;
};

function choices(values: { value: string; label: string }[]) {
  return values;
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    sku: "QB-DEMO-RACK-HEAVY",
    name: "Rayonnage palettes lourd",
    description: "Échelles et lisses pour palettes jusqu’à 1000 kg / niveau. Idéal entrepôt.",
    category: "Rayonnage lourd",
    price_min: 4500,
    price_max: 18000,
    tags: ["entrepot", "lourd", "palettes"],
    options: [
      {
        key: "color",
        label: "Couleur",
        values: choices([
          { value: "ral5010", label: "Bleu RAL 5010" },
          { value: "ral3000", label: "Rouge RAL 3000" },
          { value: "galva", label: "Galvanisé" },
        ]),
      },
      {
        key: "levels",
        label: "Niveaux",
        values: choices([
          { value: "3", label: "3 niveaux" },
          { value: "4", label: "4 niveaux" },
          { value: "5", label: "5 niveaux" },
        ]),
      },
    ],
  },
  {
    sku: "QB-DEMO-RACK-MID",
    name: "Rayonnage mi-lourd",
    description: "Polyvalent pour cartons, bacs et palettes légères. Commerce et atelier.",
    category: "Rayonnage mi-lourd",
    price_min: 1800,
    price_max: 7500,
    tags: ["commerce", "atelier", "moyen"],
    options: [
      {
        key: "color",
        label: "Couleur",
        values: choices([
          { value: "ral5010", label: "Bleu RAL 5010" },
          { value: "ral7035", label: "Gris RAL 7035" },
          { value: "galva", label: "Galvanisé" },
        ]),
      },
    ],
  },
  {
    sku: "QB-DEMO-RACK-PICK",
    name: "Rayonnage picking",
    description: "Accès fréquent, petites pièces, réserve magasin.",
    category: "Picking",
    price_min: 900,
    price_max: 4200,
    tags: ["commerce", "picking", "leger"],
    options: [
      {
        key: "color",
        label: "Couleur",
        values: choices([
          { value: "ral5010", label: "Bleu RAL 5010" },
          { value: "ral7035", label: "Gris RAL 7035" },
        ]),
      },
    ],
  },
  {
    sku: "QB-DEMO-RACK-FOOD",
    name: "Rayonnage alimentaire inox",
    description: "Inox et finitions lessivables pour cuisines et chambres froides.",
    category: "Agroalimentaire",
    price_min: 3200,
    price_max: 14000,
    tags: ["cuisine_pro", "alimentaire", "humidite"],
    options: [
      {
        key: "finish",
        label: "Finition",
        values: choices([
          { value: "inox304", label: "Inox 304" },
          { value: "epoxy_blanc", label: "Époxy blanc alimentaire" },
        ]),
      },
    ],
  },
  {
    sku: "QB-DEMO-CANTILEVER",
    name: "Cantilever",
    description: "Bras en porte-à-faux pour charges longues (tubes, bois, profilés).",
    category: "Cantilever",
    price_min: 2800,
    price_max: 12000,
    tags: ["atelier", "long"],
    options: [
      {
        key: "color",
        label: "Couleur",
        values: choices([
          { value: "ral3000", label: "Rouge RAL 3000" },
          { value: "galva", label: "Galvanisé" },
        ]),
      },
    ],
  },
  {
    sku: "QB-DEMO-MEZZANINE",
    name: "Mezzanine de stockage",
    description: "Plateforme pour doubler la surface sans agrandir le bâtiment.",
    category: "Mezzanine",
    price_min: 8900,
    price_max: 24000,
    tags: ["entrepot", "surface"],
    options: [
      {
        key: "floor",
        label: "Plancher",
        values: choices([
          { value: "bois", label: "Panneau bois" },
          { value: "caillebotis", label: "Caillebotis" },
        ]),
      },
    ],
  },
];

export const DEMO_RULES: DemoRule[] = [
  {
    name: "Entrepôt palettes",
    priority: 100,
    projectType: "entrepot",
    productSkus: ["QB-DEMO-RACK-HEAVY", "QB-DEMO-RACK-MID", "QB-DEMO-MEZZANINE"],
    price_min: 4500,
    price_max: 24000,
    headline: "Solution entrepôt palettisé",
    description: "Configuration lourde pour palettes, avec mezzanine si la hauteur le permet.",
  },
  {
    name: "Commerce / réserve",
    priority: 90,
    projectType: "commerce",
    productSkus: ["QB-DEMO-RACK-PICK", "QB-DEMO-RACK-MID"],
    price_min: 900,
    price_max: 7500,
    headline: "Réserve magasin & picking",
    description: "Priorité à l’accès fréquent, mi-lourd pour la zone de réserve.",
  },
  {
    name: "Atelier",
    priority: 80,
    projectType: "atelier",
    productSkus: ["QB-DEMO-RACK-MID", "QB-DEMO-CANTILEVER"],
    price_min: 1800,
    price_max: 12000,
    headline: "Atelier polyvalent",
    description: "Mi-lourd pour bacs et pièces, cantilever pour les charges longues.",
  },
  {
    name: "Solution mixte",
    priority: 10,
    projectType: null,
    productSkus: DEMO_PRODUCTS.map((product) => product.sku),
    price_min: 900,
    price_max: 24000,
    headline: "Configuration sur mesure",
    description: "Mix de gammes pour cadrer le besoin en attendant le passage commercial.",
  },
];

export const catalogModule: SeedModule = {
  id: "catalog",
  title: "Catalogue et règles Si/Alors",
  async run(ctx) {
    if (!ctx.funnel) throw new Error("Funnel démo requis avant le catalogue");

    const { data: existing } = await ctx.supabase
      .from("products")
      .select("id, sku, name")
      .eq("organization_id", ctx.org.id)
      .eq("configurator_id", ctx.funnel.id);
    const bySku = new Map((existing ?? []).filter((row) => row.sku).map((row) => [row.sku as string, row.id]));

    let created = 0;
    let updated = 0;
    for (const product of DEMO_PRODUCTS) {
      const payload = {
        organization_id: ctx.org.id,
        configurator_id: ctx.funnel.id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        category: product.category,
        price_min: product.price_min,
        price_max: product.price_max,
        tags: product.tags,
        options: product.options,
        currency: "EUR",
        is_active: true,
        source: "manual",
      };
      const id = bySku.get(product.sku);
      if (id) {
        const { error } = await ctx.supabase.from("products").update(payload).eq("id", id);
        if (error) throw error;
        updated += 1;
      } else {
        const { data, error } = await ctx.supabase.from("products").insert(payload).select("id, sku").single();
        if (error || !data) throw error ?? new Error(`Produit ${product.sku}`);
        bySku.set(product.sku, data.id);
        created += 1;
      }
    }

    const { data: rules } = await ctx.supabase
      .from("suggestion_rules")
      .select("id, name")
      .eq("organization_id", ctx.org.id)
      .eq("configurator_id", ctx.funnel.id);
    const ruleByName = new Map((rules ?? []).map((row) => [row.name, row.id]));

    for (const rule of DEMO_RULES) {
      const product_ids = rule.productSkus.map((sku) => bySku.get(sku)).filter((id): id is string => Boolean(id));
      const payload = {
        organization_id: ctx.org.id,
        configurator_id: ctx.funnel.id,
        name: rule.name,
        priority: rule.priority,
        conditions: rule.projectType
          ? { all: [{ key: "project_type", op: "eq", value: rule.projectType }] }
          : { all: [] },
        product_ids,
        price_min: rule.price_min,
        price_max: rule.price_max,
        headline: rule.headline,
        description: rule.description,
        is_active: true,
      };
      const id = ruleByName.get(rule.name);
      if (id) {
        const { error } = await ctx.supabase.from("suggestion_rules").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await ctx.supabase.from("suggestion_rules").insert(payload);
        if (error) throw error;
      }
    }

    return {
      module: "catalog",
      action: created ? "created" : "updated",
      detail: `${DEMO_PRODUCTS.length} produits (${created} créés, ${updated} mis à jour), ${DEMO_RULES.length} règles`,
    };
  },
};
