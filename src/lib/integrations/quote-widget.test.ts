import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { PluginConnection } from "@/lib/integrations/plugin";
import { parsePluginQuoteBody } from "@/lib/integrations/plugin-quotes";
import { PUBLIC_SITE_KEY_HEADER, publicSiteQuotePath } from "@/lib/integrations/public-site-quote";
import {
  PUBLIC_SITE_ASSIST_IP_LIMIT,
  buildWidgetQuote,
  handlePublicSiteAssist,
  handlePublicSiteWidget,
  rankWidgetCatalog,
  settleAssist,
  widgetLinesFromUnknown,
} from "@/lib/integrations/quote-widget";
import { parseQuoteWidget, widgetPairing } from "@/lib/integrations/quote-widget-settings";
import { resetRateLimitState } from "@/lib/security/rate-limit";

const SITE_KEY = "qb_site_mintcreamtestkeyvalue01";
const SHOP_ORIGIN = "https://shop.example";
const PREVIEW = "https://mintcream-mosquito-831101.hostingersite.com";

const defaults = parseQuoteWidget(undefined);
assert.equal(defaults.mode, "both");
assert.equal(defaults.aiRequestText, false);
assert.equal(parseQuoteWidget({ mode: "catalog", aiRequestText: "on" }).mode, "catalog");
assert.equal(parseQuoteWidget({ mode: "nope", aiRequestText: true }).aiRequestText, true);

const pairing = widgetPairing(SITE_KEY, { mode: "both", aiRequestText: true });
assert.equal(pairing.site_key, SITE_KEY);
assert.equal(pairing.public_submit.path, publicSiteQuotePath(SITE_KEY));
assert.equal(pairing.public_submit.auth, "X-QuoteBuilder-Site-Key");
assert.equal(pairing.public_submit.method, "POST");

const wooCart = widgetLinesFromUnknown([
  { id: "3292", variation_id: "4580", qty: 2, name: "RAYONNAGE UNIRACK", variation: "1200 mm" },
  { id: "8855", variation_id: 0, qty: 1, name: "SUPERBUILD" },
]);
assert.equal(wooCart[0]?.productId, "3292");
assert.equal(wooCart[0]?.variationId, "4580");
assert.equal(wooCart[0]?.qty, 2);
assert.equal(wooCart[1]?.variationId, "");

const catalogBody = buildWidgetQuote({
  externalId: "w-catalog-1",
  pageUrl: `${PREVIEW}/produit/unirack/`,
  contact: { name: "Jean Dupont", email: "jean@exemple.be", phone: "+32 470 00 00 00", company: "Dupont SRL" },
  items: wooCart,
});
assert.equal(catalogBody.ok, true);
if (!catalogBody.ok) throw new Error("catalog");
const catalogParsed = parsePluginQuoteBody(catalogBody.body);
assert.equal(catalogParsed.ok, true);
if (!catalogParsed.ok) throw new Error("catalog parse");
assert.equal(catalogParsed.quote.items[0]?.productId, "3292");
assert.equal(catalogParsed.quote.items[0]?.variationId, "4580");
assert.equal(catalogParsed.quote.items[0]?.qty, 2);
assert.equal(catalogParsed.quote.items[1]?.productId, "8855");
assert.equal(catalogParsed.quote.requestText, "");
assert.equal(catalogBody.body.source, "wordpress");

const requestBody = buildWidgetQuote({
  externalId: "w-need-1",
  pageUrl: `${SHOP_ORIGIN}/devis`,
  contact: { name: "Jean Dupont", email: "jean@exemple.be", phone: "+32 470 00 00 00" },
  requestText: "Palettes 250 x 110 cm, hauteur 450 cm, 4 travées",
  items: [],
});
assert.equal(requestBody.ok, true);
if (!requestBody.ok) throw new Error("request");
const requestParsed = parsePluginQuoteBody(requestBody.body);
assert.equal(requestParsed.ok, true);
if (!requestParsed.ok) throw new Error("request parse");
assert.equal(requestParsed.quote.requestText, "Palettes 250 x 110 cm, hauteur 450 cm, 4 travées");
assert.deepEqual(requestParsed.quote.items, []);
assert.equal(requestParsed.quote.externalId, "w-need-1");

const empty = buildWidgetQuote({
  externalId: "w-empty",
  contact: { name: "Jean", email: "jean@exemple.be", phone: "+32 4" },
});
assert.equal(empty.ok, false);

const catalog = [
  { externalId: "3292", name: "Rayonnage Unirack" },
  { externalId: "8855", name: "Superbuild" },
  { externalId: "1001", name: "Table" },
  { externalId: "1002", name: "Table" },
];

const invented = settleAssist({
  requestText: "Il me faut un pont roulant sur mesure",
  modelOutput: {
    brief: "Besoin d'un pont roulant, hors catalogue.",
    lines: [
      { productId: "SKU-INVENTED-96", name: "Pont roulant", qty: 1 },
      { productId: "3292", qty: 2 },
      { name: "Table", qty: 1 },
      { name: "Superbuild", qty: 4 },
    ],
  },
  catalog,
});
assert.equal(invented.requestText, "Il me faut un pont roulant sur mesure");
assert.equal(invented.brief, "Besoin d'un pont roulant, hors catalogue.");
assert.deepEqual(
  invented.items.map((line) => line.productId),
  ["3292", "8855"],
);
assert.equal(invented.items[0]?.name, "Rayonnage Unirack");
assert.equal(invented.items[0]?.qty, 2);
assert.equal(invented.items.some((line) => line.productId === "SKU-INVENTED-96"), false);
assert.equal(invented.items.some((line) => line.name === "Table"), false);

const degraded = settleAssist({
  requestText: "Juste un texte",
  modelOutput: null,
  catalog,
});
assert.equal(degraded.requestText, "Juste un texte");
assert.equal(degraded.brief, null);
assert.deepEqual(degraded.items, []);

const withBrief = buildWidgetQuote({
  externalId: "w-need-2",
  contact: { name: "Jean Dupont", email: "jean@exemple.be", phone: "+32 470 00 00 00" },
  requestText: degraded.requestText,
  brief: invented.brief,
  items: invented.items,
});
assert.equal(withBrief.ok, true);
if (!withBrief.ok) throw new Error("brief");
const briefParsed = parsePluginQuoteBody(withBrief.body);
assert.equal(briefParsed.ok, true);
if (!briefParsed.ok) throw new Error("brief parse");
assert.equal(briefParsed.quote.requestText, "Juste un texte");
assert.equal(briefParsed.quote.context, invented.brief);
assert.equal(briefParsed.quote.items.length, 2);

const ranked = rankWidgetCatalog(catalog, "unirack palettes");
assert.deepEqual(ranked.map((row) => row.externalId), ["3292"]);
assert.deepEqual(rankWidgetCatalog(catalog, "pont roulant inconnu"), []);

function connection(settings: unknown = { widget: { mode: "both", aiRequestText: true } }): PluginConnection {
  return {
    id: "conn-1",
    organization_id: "org-1",
    status: "active",
    store_domain: "https://shop.example/boutique",
    public_key: SITE_KEY,
    allowed_origins: [PREVIEW],
    webhook_secret: "plugin-bearer-secret",
    settings,
  } as PluginConnection;
}

function call(
  handler: typeof handlePublicSiteWidget,
  method: string,
  init: { key?: string; header?: string | null; origin?: string | null; body?: unknown; ip?: string; load?: (key: string) => Promise<PluginConnection | null> } = {},
  extra: {
    model?: (input: {
      requestText: string;
      catalog: { externalId: string; name: string }[];
    }) => Promise<{ brief: string; lines: { productId?: string; name?: string; qty?: number }[] } | null>;
    loadCatalog?: () => Promise<typeof catalog>;
  } = {},
) {
  const headers = new Headers();
  if (init.header !== null) headers.set(PUBLIC_SITE_KEY_HEADER, init.header ?? init.key ?? SITE_KEY);
  if (init.origin !== null) headers.set("origin", init.origin ?? SHOP_ORIGIN);
  if (init.ip) headers.set("x-forwarded-for", init.ip);
  const req = new Request("https://app.example/api/public/sites/widget", {
    method,
    headers,
    body: method === "GET" || method === "OPTIONS" ? undefined : JSON.stringify(init.body ?? {}),
  });
  return handler(req, init.key ?? SITE_KEY, {
    load: init.load ?? (async () => connection()),
    loadMatrices: async () => [],
    ...extra,
  });
}

async function main() {
  resetRateLimitState();

  {
    const res = await call(handlePublicSiteWidget, "GET", { header: null, ip: "198.51.100.1" });
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error, "Clé site manquante");
  }

  {
    const res = await call(handlePublicSiteWidget, "OPTIONS", {
      header: null,
      origin: "https://evil.example",
      ip: "198.51.100.2",
    });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).error, "Origine non autorisée");
    assert.equal(res.headers.get("access-control-allow-origin"), null);
  }

  {
    const res = await call(handlePublicSiteWidget, "OPTIONS", {
      header: null,
      origin: PREVIEW,
      ip: "198.51.100.3",
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-origin"), PREVIEW);
    assert.match(res.headers.get("access-control-allow-methods") ?? "", /GET/);
  }

  {
    const res = await call(handlePublicSiteWidget, "GET", { origin: SHOP_ORIGIN, ip: "198.51.100.4" });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), SHOP_ORIGIN);
    const body = await res.json();
    assert.equal(body.mode, "both");
    assert.equal(body.aiRequestText, true);
    assert.equal(body.submit.path, publicSiteQuotePath(SITE_KEY));
    assert.equal(body.assist.path, `/api/public/sites/${SITE_KEY}/assist`);
    assert.equal(body.webhook_secret, undefined);
  }

  {
    let called = false;
    const res = await call(
      handlePublicSiteAssist,
      "POST",
      {
        ip: "198.51.100.5",
        body: { requestText: "Quatre travées de rayonnage" },
        load: async () => connection({ widget: { mode: "request", aiRequestText: false } }),
      },
      {
        model: async () => {
          called = true;
          return { brief: "ne pas appeler", lines: [] };
        },
      },
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.degraded, true);
    assert.equal(body.requestText, "Quatre travées de rayonnage");
    assert.deepEqual(body.items, []);
    assert.equal(called, false);
  }

  {
    const res = await call(handlePublicSiteAssist, "POST", {
      header: null,
      ip: "198.51.100.6",
      body: { requestText: "besoin" },
    });
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error, "Clé site manquante");
  }

  {
    const res = await call(
      handlePublicSiteAssist,
      "POST",
      {
        origin: PREVIEW,
        ip: "198.51.100.7",
        body: { requestText: "Il me faut un Unirack" },
      },
      {
        loadCatalog: async () => catalog,
        model: async () => ({
          brief: "Rayonnage Unirack pour le visiteur.",
          lines: [{ productId: "SKU-INVENTED-96", qty: 3 }, { productId: "3292", qty: 1 }],
        }),
      },
    );
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), PREVIEW);
    const body = await res.json();
    assert.equal(body.degraded, false);
    assert.equal(body.requestText, "Il me faut un Unirack");
    assert.equal(body.brief, "Rayonnage Unirack pour le visiteur.");
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].productId, "3292");
    assert.equal(body.items[0].name, "Rayonnage Unirack");
  }

  {
    const res = await call(
      handlePublicSiteAssist,
      "POST",
      { ip: "198.51.100.8", body: { requestText: "Un texte libre sans catalogue" } },
      { model: async () => null, loadCatalog: async () => [] },
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.degraded, true);
    assert.equal(body.brief, null);
    assert.deepEqual(body.items, []);
    assert.equal(body.requestText, "Un texte libre sans catalogue");
  }

  {
    resetRateLimitState();
    for (let i = 0; i < PUBLIC_SITE_ASSIST_IP_LIMIT; i += 1) {
      const res = await call(handlePublicSiteAssist, "POST", {
        ip: "198.51.100.50",
        body: { requestText: "encore" },
        load: async () => connection({ widget: { mode: "request", aiRequestText: false } }),
      });
      assert.equal(res.status, 200);
    }
    const blocked = await call(handlePublicSiteAssist, "POST", {
      ip: "198.51.100.50",
      body: { requestText: "encore" },
      load: async () => connection({ widget: { mode: "request", aiRequestText: false } }),
    });
    assert.equal(blocked.status, 429);
  }

  const widgetJs = readFileSync(new URL("../../app/widget.js/route.ts", import.meta.url), "utf8");
  const client = readFileSync(new URL("./quote-widget-client.ts", import.meta.url), "utf8");
  assert.match(widgetJs, /data-module"\) === "quote"/);
  assert.match(client, /Cette combinaison n'existe pas/);
  assert.match(client, /variant\.sku/);
  assert.doesNotMatch(client, /sku:\s*selected/);
  assert.match(client, /x-quotebuilder-site-key/);
  assert.match(client, /source: "wordpress"/);
  assert.match(client, /requestText/);
  assert.match(client, /\/quotes/);
  assert.match(client, /\/assist/);
  assert.doesNotMatch(client, /Authorization/);
  assert.doesNotMatch(client, /webhook_secret/);
  assert.doesNotMatch(client, /Bearer /);

  const php = readFileSync(new URL("../../../extensions/quotebuilder-wp/includes/class-storefront.php", import.meta.url), "utf8");
  const pairingPhp = readFileSync(new URL("../../../extensions/quotebuilder-wp/includes/class-pairing.php", import.meta.url), "utf8");
  const pluginPhp = readFileSync(new URL("../../../extensions/quotebuilder-wp/quotebuilder.php", import.meta.url), "utf8");
  assert.match(php, /data-qb-widget/);
  assert.match(php, /data-site-key/);
  assert.match(php, /data-submit-path/);
  assert.match(pairingPhp, /site_key/);
  assert.match(pairingPhp, /public_submit/);
  assert.match(pluginPhp, /quotebuilder_widget/);
  assert.match(pluginPhp, /Version: 2\.3\.20/);

  const quotes = readFileSync(new URL("./plugin-quotes.ts", import.meta.url), "utf8");
  assert.match(quotes, /includeProspect:\s*false/);
  const assist = readFileSync(new URL("./quote-widget.ts", import.meta.url), "utf8");
  assert.doesNotMatch(assist, /sendQuoteEmails/);
  assert.doesNotMatch(assist, /includeProspect:\s*true/);

  console.log("quote-widget.test.ts ok");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
