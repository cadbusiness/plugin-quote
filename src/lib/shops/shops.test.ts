import assert from "node:assert/strict";
import { emptyBlock, parseBlock, parseBlocks } from "./blocks";
import { executeShopTool } from "./agent/executor";
import { buildShopBlueprint, requiredShopSlugs } from "./templates";
import { mentionsLegalesBody } from "./legal";
import { clipDescription, pageTitle, productJsonLd, shopMetadata, sitemapEntries } from "./seo";
import { findProductBySlug, productSlug, shopBasePath } from "./urls";
import type { ShopDocument } from "./types";

const blueprint = buildShopBlueprint({
  name: "Atelier Nord",
  sector: "racking",
  orgName: "Atelier Nord",
  legal: { company: "Atelier Nord", siret: "123", city: "Lyon", email: "devis@atelier.test" },
});

assert.deepEqual(requiredShopSlugs().sort(), blueprint.pages.map((page) => page.slug).sort());
assert.ok(blueprint.pages.every((page) => page.blocks.length > 0));
assert.ok(blueprint.nav.some((item) => item.location === "header" && item.href === "/catalogue"));
assert.ok(blueprint.nav.some((item) => item.href.includes("mentions-legales")));
assert.match(mentionsLegalesBody(blueprint.legal, blueprint.name), /Atelier Nord/);
assert.match(mentionsLegalesBody(blueprint.legal, blueprint.name), /pas une boutique de paiement/i);

const hero = emptyBlock("hero");
assert.equal(hero.type, "hero");
assert.equal(parseBlock({ type: "unknown" }), null);
assert.equal(parseBlocks([{ type: "text", heading: "A" }])[0]?.heading, "A");

assert.equal(pageTitle("Catalogue", "Atelier Nord"), "Catalogue · Atelier Nord");
assert.equal(clipDescription("a".repeat(200)).endsWith("…"), true);
assert.equal(shopBasePath("demo", "atelier"), "/b/demo/atelier");

const product = {
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  name: "Rayonnage lourd",
  description: "<p>Charge 800 kg</p>",
  image_url: null,
  price_min: 400,
  price_max: 900,
  currency: "EUR",
  category: "Rayonnage",
  sku: "R-1",
};
assert.ok(productSlug(product).startsWith("rayonnage-lourd--"));
assert.equal(findProductBySlug([product], productSlug(product))?.id, product.id);

const meta = shopMetadata({
  origin: "https://app.example",
  orgSlug: "demo",
  shopSlug: "atelier",
  shopName: "Atelier Nord",
  seo: blueprint.seo,
  legal: blueprint.legal,
  path: "/",
  title: "Accueil",
  description: blueprint.seo.description,
});
assert.equal(meta.alternates?.canonical, "https://app.example/b/demo/atelier");

const jsonLd = productJsonLd(
  {
    origin: "https://app.example",
    orgSlug: "demo",
    shopSlug: "atelier",
    shopName: "Atelier Nord",
    seo: blueprint.seo,
    legal: blueprint.legal,
    path: "/p/x",
    title: product.name,
    description: "",
  },
  product,
  "/c/demo/devis",
);
assert.equal(jsonLd["@type"], "Product");
assert.equal((jsonLd.potentialAction as { name: string }).name, "Demander un devis");

const urls = sitemapEntries({
  origin: "https://app.example",
  orgSlug: "demo",
  shopSlug: "atelier",
  pages: blueprint.pages,
  products: [product],
  updatedAt: "2026-09-10T00:00:00.000Z",
});
assert.ok(urls.some((row) => row.loc.endsWith("/b/demo/atelier")));
assert.ok(urls.some((row) => row.loc.includes("/catalogue")));
assert.ok(urls.some((row) => row.loc.includes("/mentions-legales")));
assert.ok(urls.some((row) => row.loc.includes("/p/")));

const now = new Date().toISOString();
const doc: ShopDocument = {
  shop: {
    id: "shop-1",
    organization_id: "org-1",
    configurator_id: null,
    name: "Atelier Nord",
    slug: "atelier",
    sector: "racking",
    status: "draft",
    theme: { accent: "#E85D04", background: "#fff", text: "#111" },
    seo: { title: "Atelier Nord", description: "", language: "fr-FR", geo: { locality: "", region: "", country: "FR", postalCode: "" } },
    legal: { company: "Atelier Nord", siret: "", address: "", city: "", postalCode: "", email: "", phone: "", director: "" },
    published_at: null,
    created_at: now,
    updated_at: now,
  },
  pages: [
    {
      id: "p1",
      organization_id: "org-1",
      shop_id: "shop-1",
      kind: "home",
      slug: "accueil",
      title: "Accueil",
      seo: { title: "Accueil", description: "", noindex: false },
      blocks: [{ id: "b1", type: "hero", heading: "Hello" }],
      is_published: true,
      sort_order: 0,
      created_at: now,
      updated_at: now,
    },
  ],
  nav: [],
};

const added = executeShopTool(doc, "add_block", { slug: "accueil", type: "text", heading: "Notre atelier" });
assert.equal(added.ok, true);
const blocks = doc.pages[0]!.blocks as { id: string; type: string; heading?: string }[];
assert.equal(blocks.some((block) => block.heading === "Notre atelier"), true);

const updated = executeShopTool(doc, "update_block", { slug: "accueil", id: "b1", heading: "Rayonnage industriel" });
assert.equal(updated.ok, true);
assert.equal((doc.pages[0]!.blocks as { id: string; heading?: string }[]).find((block) => block.id === "b1")?.heading, "Rayonnage industriel");

const seo = executeShopTool(doc, "set_seo", { description: "Vitrine devis rayonnage à Lyon.", locality: "Lyon" });
assert.equal(seo.ok, true);

const published = executeShopTool(doc, "set_status", { status: "published" });
assert.equal(published.ok, true);
assert.equal(doc.shop.status, "published");

const missing = executeShopTool(doc, "update_block", { slug: "nope", id: "b1", heading: "x" });
assert.equal(missing.ok, false);

console.log("shops tests ok");
