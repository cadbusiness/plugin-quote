import assert from "node:assert/strict";
import { mergeImageRoles, parseGallery, productCover } from "./media";
import {
  classifyProductImage,
  guessMediaRole,
  mediaRoleMap,
  wooMediaRoleValue,
} from "./media-roles";

assert.equal(guessMediaRole("Rayonnage Unirack vue studio"), null);
assert.equal(guessMediaRole("plan-technique-unirack.jpg"), "plan");
assert.equal(guessMediaRole("Photo chantier installation entrepôt"), "usage");
assert.equal(guessMediaRole("schéma de cote 2500"), "plan");

const roles = mediaRoleMap([
  {
    key: "_qb_media_role",
    value: { "42": "plan", "usage-entrepot.jpg": "usage" },
  },
]);

{
  const plan = classifyProductImage(
    { id: 42, src: "https://quickly-int.com/wp-content/uploads/photo.jpg", alt: "Unirack", name: "photo.jpg" },
    roles,
  );
  assert.deepEqual(plan, { role: "plan", explicit: true });
  const usage = classifyProductImage(
    { id: 7, src: "https://quickly-int.com/wp-content/uploads/usage-entrepot.jpg", alt: "Unirack", name: "usage-entrepot.jpg" },
    roles,
  );
  assert.equal(usage.role, "usage");
  const photo = classifyProductImage(
    { id: 8, src: "https://quickly-int.com/wp-content/uploads/unirack.jpg", alt: "Unirack galvanisé", name: "unirack.jpg" },
    roles,
  );
  assert.deepEqual(photo, { role: "product", explicit: false });
  const marked = classifyProductImage({ src: "https://cdn.example/a.jpg", alt: "[plan] élévation" });
  assert.deepEqual(marked, { role: "plan", explicit: true });
}

{
  const incoming = [
    {
      src: "https://cdn.example/plan.jpg",
      alt: "plan",
      role: "plan" as const,
      roleExplicit: true,
    },
    {
      src: "https://cdn.example/studio.jpg",
      alt: "studio",
      role: "product" as const,
      roleExplicit: false,
    },
  ];
  const merged = mergeImageRoles(incoming, [
    { src: "https://cdn.example/studio.jpg", alt: "studio", role: "usage" },
    { src: "https://cdn.example/plan.jpg", alt: "ancien", role: "product" },
  ]);
  assert.equal(merged.find((image) => image.src.endsWith("plan.jpg"))?.role, "plan");
  assert.equal(merged.find((image) => image.src.endsWith("studio.jpg"))?.role, "usage");
  assert.equal("roleExplicit" in merged[0], false);
  assert.equal(
    productCover([
      { src: "https://cdn.example/plan.jpg", alt: null, role: "plan" },
      { src: "https://cdn.example/studio.jpg", alt: null, role: "product" },
    ]),
    "https://cdn.example/studio.jpg",
  );
}

{
  const gallery = parseGallery(
    [
      { src: "https://cdn.example/plan.png", alt: "Plan", role: "plan" },
      { src: "https://cdn.example/photo.png", alt: null, role: "product" },
    ],
    "https://cdn.example/plan.png",
  );
  assert.equal(gallery[0]?.role, "plan");
  assert.equal(productCover(gallery, "https://cdn.example/plan.png"), "https://cdn.example/photo.png");
  assert.deepEqual(wooMediaRoleValue(gallery), { "plan.png": "plan" });
}

assert.equal(productCover([{ src: "a.jpg", alt: null }], "cover.jpg"), "cover.jpg");

console.log("catalog/media-roles ok");
