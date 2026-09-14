import assert from "node:assert/strict";
import { emptyBlock, parseBlock, parseBlocks } from "./blocks";
import { executeShopTool, ensureSeedTurnPublished } from "./agent/executor";
import { encodeShopAgentSse, parseShopAgentSse, shopAgentClosingText, shopChatChips, shopToolTouched } from "./agent/events";
import { parseShopAgentSelection, shopAgentSelectionPrompt, shouldSendChatOnEnter } from "./agent/selection";
import { historyForAgent, mergeShopChat, parseChatLog, plainShopChatText } from "./chat-store";
import { boxStyle, cssLength, cssSpacing, layoutsEqual, migrateBlocksToLayout, normalizeNodeId, parseLayout, resolveNodeId, summarizeLayout } from "./layout";
import { buildShopBlueprint, requiredShopSlugs } from "./templates";
import { mentionsLegalesBody } from "./legal";
import { clipDescription, footerNav, headerNav, pageTitle, productJsonLd, replaceNavLocation, shopMetadata, sitemapEntries } from "./seo";
import { resolveShopHref } from "./href";
import { findProductBySlug, productSlug, shopBasePath, shopQuotePath } from "./urls";
import type { ShopDocument } from "./types";

const blueprint = buildShopBlueprint({
  name: "Atelier Nord",
  sector: "racking",
  orgName: "Atelier Nord",
  legal: { company: "Atelier Nord", siret: "123", city: "Lyon", email: "devis@atelier.test" },
});

assert.deepEqual(requiredShopSlugs().sort(), blueprint.pages.map((page) => page.slug).sort());
assert.ok(blueprint.pages.every((page) => page.blocks.content.length > 0));
assert.equal(blueprint.pages[0]!.blocks.content[0]!.type, "Hero");
assert.ok(String(blueprint.pages[0]!.blocks.content[0]!.props.image).startsWith("https://"));
assert.ok(blueprint.pages[0]!.blocks.content.some((node) => node.type === "Features"));
assert.ok(blueprint.pages[0]!.blocks.content.some((node) => node.type === "QuoteCta"));
assert.equal(blueprint.pages[1]!.blocks.content.at(-1)?.type, "QuoteCta");
assert.ok(blueprint.nav.some((item) => item.location === "header" && item.href === "/catalogue"));
assert.ok(blueprint.nav.some((item) => item.href.includes("mentions-legales")));
assert.match(mentionsLegalesBody(blueprint.legal, blueprint.name), /Atelier Nord/);
assert.match(mentionsLegalesBody(blueprint.legal, blueprint.name), /pas une boutique de paiement/i);

const hero = emptyBlock("hero");
assert.equal(hero.type, "hero");
assert.equal(parseBlock({ type: "unknown" }), null);
assert.equal(parseBlocks([{ type: "text", heading: "A" }])[0]?.heading, "A");

const migrated = migrateBlocksToLayout([{ id: "b1", type: "hero", heading: "Hello" }]);
assert.equal(migrated.content[0]?.type, "Hero");
assert.equal(migrated.content[0]?.props.heading, "Hello");
assert.equal(blueprint.pages[0]!.blocks.content[0]!.props.padding, "80px 0");
assert.equal(blueprint.pages[0]!.blocks.content.find((node) => node.type === "Catalog")?.props.padding, "64px 0");
assert.equal(parseLayout([{ id: "b1", type: "faq", heading: "Q", faq: [{ q: "A", a: "B" }] }]).content[0]?.type, "Faq");
const same = parseLayout({ root: { props: {} }, content: [{ type: "Heading", props: { id: "h1", text: "A" } }] });
assert.equal(layoutsEqual(same, parseLayout(same)), true);
assert.equal(layoutsEqual(same, parseLayout({ root: { props: {} }, content: [{ type: "Heading", props: { id: "h1", text: "B" } }] })), false);

assert.equal(cssLength("2"), "2px");
assert.equal(cssLength("2px"), "2px");
assert.equal(cssLength("auto"), "auto");
assert.equal(cssLength("1.5rem"), "1.5rem");
assert.equal(cssSpacing("20 2 2 2"), "20px 2px 2px 2px");
assert.equal(cssSpacing("40px 0"), "40px 0px");
assert.deepEqual(boxStyle({ padding: "2" }), { padding: "2px", boxSizing: "border-box" });
assert.deepEqual(boxStyle({ margin: "20 2 2 2" }), { margin: "20px 2px 2px 2px" });
const lengths = boxStyle({ fontSize: "16", top: "8", left: "4", borderRadius: "8", minHeight: "120" });
assert.equal(lengths.fontSize, "16px");
assert.equal(lengths.top, "8px");
assert.equal(lengths.left, "4px");
assert.equal(lengths.borderRadius, "8px");
assert.equal(lengths.minHeight, "120px");
assert.equal(boxStyle({ background: "auto", color: "auto" }).background, undefined);
assert.equal(boxStyle({ background: "#E85D04", color: "#111111" }).background, "#E85D04");
assert.equal(boxStyle({ fontWeight: "700", textAlign: "center", zIndex: "3" }).fontWeight, "700");
assert.equal(boxStyle({ position: "relative", zIndex: "3" }).position, "relative");
assert.equal(boxStyle({ position: "static" }).position, undefined);

assert.equal(pageTitle("Catalogue", "Atelier Nord"), "Catalogue · Atelier Nord");
assert.equal(clipDescription("a".repeat(200)).endsWith("…"), true);
assert.equal(shopBasePath("demo", "atelier"), "/b/demo/atelier");
assert.equal(shopQuotePath("demo", "vitrine"), "/b/demo/vitrine/devis");
assert.equal(
  resolveShopHref("/devis", { orgSlug: "demo", shopSlug: "vitrine", funnelSlug: "rayonnage" }),
  "/b/demo/vitrine/devis",
);
assert.equal(
  resolveShopHref("devis", { orgSlug: "demo", shopSlug: "vitrine", funnelSlug: "rayonnage" }),
  "/b/demo/vitrine/devis",
);
assert.equal(
  resolveShopHref("/devis", { orgSlug: "demo", shopSlug: "vitrine", funnelSlug: null }),
  "/b/demo/vitrine/devis",
);
assert.equal(
  resolveShopHref("/c/demo/rayonnage", { orgSlug: "demo", shopSlug: "vitrine", funnelSlug: "rayonnage" }),
  "/b/demo/vitrine/devis",
);
assert.equal(
  resolveShopHref("/c/demo/rayonnage?product=sku-1", { orgSlug: "demo", shopSlug: "vitrine", funnelSlug: "rayonnage" }),
  "/b/demo/vitrine/devis?product=sku-1",
);
assert.equal(
  resolveShopHref("/c/demo/autre", { orgSlug: "demo", shopSlug: "vitrine", funnelSlug: "rayonnage" }),
  "/c/demo/autre",
);

const swapped = replaceNavLocation(
  [
    { location: "header", label: "Accueil", href: "/", sortOrder: 0 },
    { location: "footer", label: "CGV", href: "/cgv", sortOrder: 0 },
  ],
  "header",
  [
    { label: "Home", href: "/" },
    { label: "Devis", href: "/devis" },
  ],
);
assert.deepEqual(
  headerNav(swapped).map((item) => item.label),
  ["Home", "Devis"],
);
assert.equal(footerNav(swapped).length, 1);
assert.equal(footerNav(swapped)[0]?.label, "CGV");
assert.equal(
  resolveShopHref("/catalogue", { orgSlug: "demo", shopSlug: "vitrine", funnelSlug: "rayonnage" }),
  "/b/demo/vitrine/catalogue",
);
assert.equal(
  resolveShopHref("https://example.test/c/demo/rayonnage", { orgSlug: "demo", shopSlug: "vitrine", funnelSlug: "rayonnage" }),
  "https://example.test/c/demo/rayonnage",
);

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
  "https://app.example/b/demo/atelier/devis",
);
assert.equal(jsonLd["@type"], "Product");
assert.equal((jsonLd.potentialAction as { name: string; target: string }).name, "Demander un devis");
assert.equal((jsonLd.potentialAction as { name: string; target: string }).target, "https://app.example/b/demo/atelier/devis");

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
assert.ok(urls.some((row) => row.loc.endsWith("/b/demo/atelier/devis")));
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

const tree = executeShopTool(doc, "get_tree", { slug: "accueil" });
assert.equal(tree.ok, true);
if (tree.ok) assert.match(tree.summary, /Hero/);

const about = executeShopTool(doc, "insert_node", { slug: "a-propos", type: "about", heading: "L’atelier" });
assert.equal(about.ok, true);
const aboutLayout = parseLayout(doc.pages[0]!.blocks);
assert.equal(aboutLayout.content.some((node) => node.type === "Section"), true);
assert.match(summarizeLayout(aboutLayout), /L’atelier|atelier/i);
const aboutId = aboutLayout.content.find((node) => node.type === "Section")?.props.id ?? "";
assert.ok(aboutId.length > 8);
assert.equal(resolveNodeId(aboutLayout, aboutId.slice(0, 8)), aboutId);
assert.equal(normalizeNodeId(`Section:${aboutId}`), aboutId);
assert.equal(resolveNodeId(aboutLayout, `Section:${aboutId}`), aboutId);
assert.match(summarizeLayout(aboutLayout), /Section id=/);
assert.equal(executeShopTool(doc, "update_node", { slug: "accueil", id: `Section:${aboutId}`, padding: "80px 0" }).ok, true);
assert.equal(executeShopTool(doc, "insert_node", { slug: "accueil", type: "about", heading: "Notre atelier bois" }).ok, true);
assert.match(summarizeLayout(parseLayout(doc.pages[0]!.blocks)), /Notre atelier bois/);

const team = executeShopTool(doc, "insert_node", {
  slug: "accueil",
  type: "equipe",
  heading: "L’équipe",
  text: "Trois interlocuteurs pour le brief et le devis.",
  members: [
    { name: "Sophie Laroche", role: "Responsable commerciale", text: "Cadre le brief et le devis." },
    { name: "Marc Dubois", role: "Technicien logistique", text: "Vérifie les contraintes d’entrepôt." },
    { name: "Léa Martin", role: "Conseillère technique", text: "Suit le dossier jusqu’au chiffrage." },
  ],
});
assert.equal(team.ok, true);
const teamNode = parseLayout(doc.pages[0]!.blocks).content.find((node) => node.type === "Team");
assert.ok(teamNode);
assert.equal((teamNode?.props.members as { name: string }[])[0]?.name, "Sophie Laroche");
assert.match(summarizeLayout(parseLayout(doc.pages[0]!.blocks)), /Team id=/);

const added = executeShopTool(doc, "insert_node", { slug: "accueil", type: "Text", text: "Notre atelier" });
assert.equal(added.ok, true);
const layout = parseLayout(doc.pages[0]!.blocks);
assert.equal(layout.content.some((node) => node.type === "Text" && node.props.text === "Notre atelier"), true);

const updated = executeShopTool(doc, "update_node", { slug: "accueil", id: "b1", heading: "Rayonnage industriel" });
assert.equal(updated.ok, true);
assert.equal(parseLayout(doc.pages[0]!.blocks).content.find((node) => node.props.id === "b1")?.props.heading, "Rayonnage industriel");

const columns = executeShopTool(doc, "insert_node", { slug: "accueil", type: "Columns" });
assert.equal(columns.ok, true);
const columnId = parseLayout(doc.pages[0]!.blocks).content.find((node) => node.type === "Columns")?.props.id;
assert.ok(columnId);
const nested = executeShopTool(doc, "insert_node", {
  slug: "accueil",
  type: "Image",
  parentId: columnId,
  slot: "col2",
  image: "https://example.com/rack.jpg",
  imageAlt: "Rayonnage",
});
assert.equal(nested.ok, true);
const col2 = parseLayout(doc.pages[0]!.blocks).content.find((node) => node.type === "Columns")?.props.col2 as { type: string }[];
assert.equal(col2?.[0]?.type, "Image");

const seo = executeShopTool(doc, "set_seo", { description: "Vitrine devis rayonnage à Lyon.", locality: "Lyon" });
assert.equal(seo.ok, true);

assert.equal(ensureSeedTurnPublished(doc, false), false);
assert.equal(doc.shop.status, "draft");
assert.equal(ensureSeedTurnPublished(doc, true), true);
assert.equal(doc.shop.status, "published");
assert.equal(ensureSeedTurnPublished(doc, true), false);

const renamed = executeShopTool(doc, "set_name", { name: "Atelier Bois Nord" });
assert.equal(renamed.ok, true);
assert.equal(doc.shop.name, "Atelier Bois Nord");

const published = executeShopTool(doc, "set_status", { status: "published" });
assert.equal(published.ok, true);
assert.equal(doc.shop.status, "published");

const missing = executeShopTool(doc, "update_node", { slug: "nope", id: "b1", heading: "x" });
assert.equal(missing.ok, false);

assert.equal(shouldSendChatOnEnter({ key: "Enter", shiftKey: false }), true);
assert.equal(shouldSendChatOnEnter({ key: "Enter", shiftKey: true }), false);
assert.equal(shouldSendChatOnEnter({ key: "Enter", shiftKey: false, isComposing: true }), false);
assert.equal(shouldSendChatOnEnter({ key: "a", shiftKey: false }), false);

assert.equal(parseShopAgentSelection({ kind: "chrome", chrome: "header" })?.kind, "chrome");
assert.equal(parseShopAgentSelection({ kind: "node" }), null);
const nodeSel = parseShopAgentSelection({
  kind: "node",
  pageSlug: "accueil",
  pageTitle: "Accueil",
  id: "hero-1",
  type: "Hero",
});
assert.ok(nodeSel);
assert.match(shopAgentSelectionPrompt(nodeSel!), /update_node slug=accueil id=hero-1/);
assert.match(shopAgentSelectionPrompt(nodeSel!), /Bandeau/);
assert.match(shopAgentSelectionPrompt({ kind: "chrome", chrome: "header" }), /set_nav location=header/);

const sse = encodeShopAgentSse({ type: "tool", step: { name: "update_node", label: "Mise à jour du bloc", status: "ok" } });
const parsedSse = parseShopAgentSse(`${sse}partial`);
assert.equal(parsedSse.events[0]?.type, "tool");
assert.equal(parsedSse.rest, "partial");
assert.ok(shopChatChips({ kind: "node", pageSlug: "accueil", pageTitle: "Accueil", id: "h", type: "Hero" }).includes("Réécris le titre"));
assert.ok(shopChatChips().includes("Ajoute une section à propos"));
assert.equal(shopAgentClosingText("", [{ name: "insert_node", status: "error" }]), "Je n’ai pas pu modifier la page. Réessaie : « Ajoute une section à propos sous le bandeau ».");
assert.equal(shopAgentClosingText("", [{ name: "update_node", status: "ok" }]), "C’est mis à jour.");
assert.deepEqual(
  shopToolTouched("update_node", { slug: "accueil", id: "hero-1" }, "Nœud hero-1 mis à jour"),
  { pageSlug: "accueil", nodeId: "hero-1", mutated: true },
);
assert.equal(shopToolTouched("get_tree", { slug: "accueil" }, "").mutated, false);
assert.equal(plainShopChatText("✅ **Titre du bandeau réécrit** : « Menuiserie »"), "✅ Titre du bandeau réécrit : « Menuiserie »");
assert.equal(plainShopChatText("* item\n**gras**"), "item\ngras");
assert.equal(parseChatLog([{ role: "assistant", content: "**Fait.**" }])[0]?.content, "Fait.");
assert.equal(parseChatLog([{ role: "user", content: "ok" }, { role: "nope", content: "" }]).length, 1);
assert.equal(historyForAgent([{ role: "user", content: "brief", hidden: true }, { role: "assistant", content: "Fait." }]).length, 1);
assert.equal(mergeShopChat([{ role: "user", content: "a" }, { role: "assistant", content: "b" }], [{ role: "user", content: "a" }]).length, 2);

console.log("shops tests ok");
