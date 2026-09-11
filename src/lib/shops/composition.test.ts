import assert from "node:assert/strict";
import { FUNNEL_FAMILY_IDS } from "@/lib/funnels/families";
import { buildShopAgentSystemPrompt } from "@/lib/shops/agent/prompt";
import {
  HOME_RHYTHM,
  SHOP_AGENT_FIRST_TURN_PLAYBOOK,
  buildCatalogLayout,
  buildHomeLayout,
  collectFilledImages,
  collectNodeTypes,
  hasCheckoutCtaLanguage,
  layoutTypeSequence,
  shopCopyForFamily,
} from "@/lib/shops/composition";
import { shopPlaceholders } from "@/lib/shops/placeholders";
import { homeRhythmFor, homeTypeSequence } from "@/lib/shops/sector-templates";
import { buildShopBlueprint } from "@/lib/shops/templates";
import type { ShopDocument } from "@/lib/shops/types";

for (const sector of FUNNEL_FAMILY_IDS) {
  const copy = shopCopyForFamily({ name: "Maison Test", sector, city: "Lyon" });
  const ctaBlob = [copy.heroCta, copy.quoteCta, copy.heroHeading, copy.quoteHeading, copy.aboutText].join(" ");
  assert.equal(hasCheckoutCtaLanguage(ctaBlob), false, sector);
  assert.match(copy.heroSub, /devis|chiffrage|chiffrons/i);
  assert.match(copy.seoDescription, /Lyon/);
  assert.equal(copy.features.length, 3);
  assert.equal(copy.proof.length, 3);
  assert.equal(copy.process.length, 3);
  assert.ok(copy.faq.length >= 3);
  assert.match(copy.faq.map((item) => item.a).join(" "), /pas de paiement|aucun paiement|n’est pas pris|n’encaisse|devis/i);

  const home = buildHomeLayout({ name: "Maison Test", sector, city: "Lyon" });
  assert.deepEqual(layoutTypeSequence(home), homeTypeSequence(homeRhythmFor(sector)));
  assert.ok(home.content.some((node) => node.type === "Categories"));
  assert.ok(home.content.some((node) => node.type === "Catalog"));
  assert.ok(home.content.some((node) => node.type === "QuoteCta"));
  const types = collectNodeTypes(home.content);
  assert.ok(types.includes("Columns"));
  assert.ok(types.includes("Image"));
  assert.ok(types.includes("Button"));
  const images = collectFilledImages(home.content);
  assert.ok(images.length >= 2, sector);
  assert.ok(images.every((item) => item.image.startsWith("https://images.unsplash.com/")));
  assert.ok(images.every((item) => item.imageAlt.length > 4));

  const catalog = buildCatalogLayout({ name: "Maison Test", sector, city: "Lyon" });
  assert.equal(catalog.content[0]?.type, "Hero");
  assert.equal(catalog.content.at(-1)?.type, "QuoteCta");
  assert.ok(catalog.content.some((node) => node.type === "Categories"));
  assert.ok(catalog.content.some((node) => node.type === "Catalog"));
  assert.ok(collectFilledImages(catalog.content).length >= 1);
}

const racking = shopCopyForFamily({ name: "Atelier Nord", sector: "racking", city: "Lyon" });
const habitat = shopCopyForFamily({ name: "Atelier Nord", sector: "habitat", city: "Lyon" });
const health = shopCopyForFamily({ name: "Atelier Nord", sector: "health", city: "Lyon" });
assert.match(racking.heroHeading, /rayonnage|stock B2B/i);
assert.match(habitat.heroHeading, /menuiserie|ouvrage/i);
assert.match(health.heroHeading, /soin|protocole/i);
assert.notEqual(racking.heroHeading, habitat.heroHeading);
assert.notEqual(habitat.heroHeading, health.heroHeading);
assert.equal(habitat.imageFirst, true);
assert.equal(health.imageFirst, true);
assert.equal(racking.imageFirst, false);
assert.notDeepEqual(homeTypeSequence(homeRhythmFor("habitat")), [...HOME_RHYTHM]);
assert.notDeepEqual(homeTypeSequence(homeRhythmFor("health")), homeTypeSequence(homeRhythmFor("racking")));

const placeholders = shopPlaceholders("racking");
assert.match(placeholders.hero.image, /unsplash/);
assert.match(placeholders.split.hint, /stockage|travées|allée/i);

assert.match(SHOP_AGENT_FIRST_TURN_PLAYBOOK, /get_tree/);
assert.match(SHOP_AGENT_FIRST_TURN_PLAYBOOK, /QuoteCta/);
assert.match(SHOP_AGENT_FIRST_TURN_PLAYBOOK, /set_status published/);
assert.match(SHOP_AGENT_FIRST_TURN_PLAYBOOK, /panier/);

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
    seo: {
      title: "Atelier Nord",
      description: "",
      language: "fr-FR",
      geo: { locality: "Lyon", region: "", country: "FR", postalCode: "" },
    },
    legal: {
      company: "Atelier Nord",
      siret: "",
      address: "",
      city: "Lyon",
      postalCode: "",
      email: "",
      phone: "",
      director: "",
    },
    published_at: null,
    created_at: now,
    updated_at: now,
  },
  pages: [],
  nav: [],
};

const seedPrompt = buildShopAgentSystemPrompt(doc, "Atelier Nord", { isSeedTurn: true });
assert.match(seedPrompt, /Premier tour/);
assert.match(seedPrompt, /images.unsplash.com/);
assert.match(seedPrompt, /rayonnage industriel|stock B2B|rayonnage/);
assert.match(seedPrompt, /jamais « acheter »/);
const laterPrompt = buildShopAgentSystemPrompt(doc, "Atelier Nord", { isSeedTurn: false });
assert.doesNotMatch(laterPrompt, /Premier tour \(création\)/);

const blueprint = buildShopBlueprint({
  name: "Atelier Nord",
  sector: "racking",
  orgName: "Atelier Nord",
  legal: { city: "Lyon" },
});
assert.deepEqual(layoutTypeSequence(blueprint.pages[0]!.blocks), homeTypeSequence(homeRhythmFor("racking")));
assert.equal(blueprint.theme.templateId, "stock-b2b");
assert.equal(blueprint.theme.accent, "#C2410C");
assert.ok(String(blueprint.pages[0]!.blocks.content[0]!.props.image).includes("unsplash"));
assert.equal(blueprint.pages[1]!.blocks.content.at(-1)?.type, "QuoteCta");
assert.match(blueprint.seo.description, /Lyon/);

console.log("composition tests ok");
