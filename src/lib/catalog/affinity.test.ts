import assert from "node:assert/strict";
import {
  clampComplementsLimit,
  parseRelated,
  recommendComplements,
  type AffinityProduct,
} from "./affinity";

function product(partial: Partial<AffinityProduct> & Pick<AffinityProduct, "id" | "name">): AffinityProduct {
  return {
    externalId: partial.externalId ?? partial.id,
    category: partial.category ?? null,
    related: partial.related ?? { upsellIds: [], crossSellIds: [] },
    ...partial,
  };
}

const rayonnage = product({
  id: "uuid-rayo",
  name: "Rayonnage lourd",
  externalId: "10",
  category: "Rayonnage",
  related: { upsellIds: ["20", "30"], crossSellIds: ["40"] },
});
const lisse = product({ id: "uuid-lisse", name: "Lisse de 2m", externalId: "20", category: "Rayonnage" });
const echelle = product({ id: "uuid-echelle", name: "Échelle", externalId: "30", category: "Accessoires" });
const bac = product({ id: "uuid-bac", name: "Bac de rangement", externalId: "40", category: "Accessoires" });
const palette = product({ id: "uuid-palette", name: "Palette", externalId: "50", category: "Rayonnage" });
const horsCatalogue = product({
  id: "uuid-hors",
  name: "Produit orphelin",
  externalId: "99",
  category: "Autre",
});

const catalog = [rayonnage, lisse, echelle, bac, palette, horsCatalogue];

{
  const ranked = recommendComplements(["10"], catalog);
  assert.equal(ranked[0]?.id, "uuid-lisse");
  assert.equal(ranked[1]?.id, "uuid-echelle");
  assert.equal(ranked[2]?.id, "uuid-bac");
  assert.equal(ranked[3]?.id, "uuid-palette");
  assert.equal(ranked.length, 4);
}

{
  const ranked = recommendComplements(["uuid-rayo"], catalog, { limit: 2 });
  assert.deepEqual(
    ranked.map((p) => p.id),
    ["uuid-lisse", "uuid-echelle"],
  );
}

{
  const ranked = recommendComplements(["10", "20"], catalog);
  assert.ok(!ranked.some((p) => p.id === "uuid-rayo" || p.id === "uuid-lisse"));
}

{
  const ranked = recommendComplements(["10"], catalog, { limit: 8 });
  assert.ok(!ranked.some((p) => p.id === "uuid-rayo"));
}

{
  const empty = recommendComplements(["10"], [rayonnage]);
  assert.deepEqual(empty, []);
}

{
  const parsed = parseRelated({ upsell_ids: [20, "30", "30"], crossSellIds: ["40", ""] });
  assert.deepEqual(parsed.upsellIds, ["20", "30"]);
  assert.deepEqual(parsed.crossSellIds, ["40"]);
  assert.deepEqual(parseRelated(null), { upsellIds: [], crossSellIds: [] });
}

{
  assert.equal(clampComplementsLimit("4"), 4);
  assert.equal(clampComplementsLimit(0), 1);
  assert.equal(clampComplementsLimit(99), 8);
  assert.equal(clampComplementsLimit("nope"), 4);
  assert.equal(clampComplementsLimit(undefined), 4);
}

console.log("catalog/affinity ok");
