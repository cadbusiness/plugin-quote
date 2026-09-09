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

console.log("catalog/csv ok");
