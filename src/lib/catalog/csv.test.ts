import assert from "node:assert/strict";
import { inspectProductCsv, parseProductCsv } from "./csv";

const text = `nom,sku,categorie,prix_min,prix_max,tags
Rayonnage,RAY-1,Rayonnage,10,20,"a;b"
,SKIP,,
Bac,BAC-1,Bacs,18.42,18.42,plastique
`;

const inspected = inspectProductCsv(text);
assert.equal(inspected.ok, true);
assert.equal(inspected.rows.length, 2);
assert.equal(inspected.skipped, 1);
assert.equal(inspected.mapped.name, "nom");
assert.equal(inspected.rows[0].sku, "RAY-1");
assert.deepEqual(inspected.rows[0].tags, ["a", "b"]);
assert.equal(parseProductCsv(text).length, 2);

const bad = inspectProductCsv("foo,bar\n1,2");
assert.equal(bad.ok, false);
assert.equal(bad.missingNameColumn, true);

const empty = inspectProductCsv("");
assert.equal(empty.ok, false);

const swapped = inspectProductCsv("name,price_min,price_max\nBac,420,189\nFixe,18,18\n");
assert.equal(swapped.rows[0]?.price_min, 189);
assert.equal(swapped.rows[0]?.price_max, 420);
assert.equal(swapped.rows[1]?.price_min, 18);
assert.equal(swapped.rows[1]?.price_max, 18);

console.log("catalog/csv ok");
