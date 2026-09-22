import assert from "node:assert/strict";
import { captureAnswerPatch, planCaptureFollow } from "./capture-follow";
import type { Product } from "@/lib/wizard/types";

function product(partial: Partial<Product> & Pick<Product, "id" | "name">): Product {
  return {
    description: null,
    imageUrl: null,
    images: [],
    priceMin: null,
    priceMax: null,
    currency: "EUR",
    tags: [],
    category: null,
    options: [],
    specs: [],
    stockStatus: null,
    externalId: null,
    ...partial,
  };
}

const rack = product({
  id: "rack",
  name: "Rayonnage super",
  category: "Rayonnages",
  specs: [{ key: "load", label: "Charge", value: "400", unit: "kg" }],
  related: { upsellIds: ["stair"], crossSellIds: [] },
});
const stair = product({
  id: "stair",
  name: "Escalier d'accès",
  category: "Accès",
  externalId: "stair",
});

const open = planCaptureFollow("rayonnage 4 niveaux pour un entrepôt", [rack, stair]);
assert.equal(open.anchorId, "rack");
assert.equal(open.question?.key, "load");
assert.equal(open.complement?.id, "stair");
assert.match(open.complement?.reason ?? "", /Rayonnage super/);

const loaded = planCaptureFollow("rayonnage charge 400 kg, 4 niveaux", [rack, stair]);
assert.equal(loaded.question, null);
assert.equal(loaded.complement?.id, "stair");

const plain = planCaptureFollow("je veux un devis pour mon atelier", [product({ id: "a", name: "Table" })]);
assert.equal(plain.question?.key, "quantity");
assert.equal(plain.complement, null);

assert.deepEqual(captureAnswerPatch({ key: "load", label: "Quelle charge par niveau ?" }, " 400 kg "), { load: "400 kg" });
assert.deepEqual(captureAnswerPatch({ key: "quantity", label: "Combien d'exemplaires ?" }, "3"), { notes: "Quantité : 3" });

console.log("configurator/capture-follow ok");
