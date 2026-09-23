import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { PluginConnection } from "@/lib/integrations/plugin";
import { parsePluginQuoteBody } from "@/lib/integrations/plugin-quotes";
import {
  PUBLIC_SITE_KEY_HEADER,
  PUBLIC_SITE_QUOTE_IP_LIMIT,
  canonicalOrigin,
  handlePublicSiteQuote,
  isPublicSiteKey,
  matchingAllowedOrigin,
  parseAllowedOriginList,
  publicSiteQuotePath,
  siteAllowedOrigins,
} from "@/lib/integrations/public-site-quote";
import { resetRateLimitState } from "@/lib/security/rate-limit";

const SITE_KEY = "qb_site_mintcreamtestkeyvalue01";
const SHOP = "https://shop.example/boutique";
const SHOP_ORIGIN = "https://shop.example";
const PREVIEW = "https://mintcream-mosquito-831101.hostingersite.com";

assert.equal(isPublicSiteKey(SITE_KEY), true);
assert.equal(isPublicSiteKey("qb_live_not_a_site_key"), false);
assert.equal(isPublicSiteKey(""), false);
assert.equal(publicSiteQuotePath(SITE_KEY), `/api/public/sites/${SITE_KEY}/quotes`);
assert.equal(canonicalOrigin(SHOP), SHOP_ORIGIN);
assert.equal(canonicalOrigin("shop.example"), SHOP_ORIGIN);
assert.deepEqual(siteAllowedOrigins(SHOP, [PREVIEW, PREVIEW]), [SHOP_ORIGIN, PREVIEW]);
assert.equal(matchingAllowedOrigin(SHOP_ORIGIN, siteAllowedOrigins(SHOP, [])), SHOP_ORIGIN);
assert.equal(matchingAllowedOrigin("https://evil.example", siteAllowedOrigins(SHOP, [])), null);
assert.deepEqual(parseAllowedOriginList(` ${PREVIEW}\nnot a url, ${SHOP_ORIGIN} `), [PREVIEW, SHOP_ORIGIN]);

const quoteBody = {
  source: "wordpress",
  externalId: "9645",
  pageUrl: `${PREVIEW}/produit/unirack/`,
  contact: {
    name: "Jean Dupont",
    email: "jean@exemple.be",
    phone: "+32 470 00 00 00",
    company: "Dupont SRL",
  },
  items: [
    {
      productId: "3292",
      variationId: "4580",
      name: "RAYONNAGE UNIRACK",
      variation: "1200 mm",
      qty: 1,
    },
    { productId: "8855", variationId: "0", name: "SUPERBUILD (STANDARD)", qty: 2 },
  ],
};

assert.equal(parsePluginQuoteBody(quoteBody).ok, true);

const handlerSource = readFileSync("src/lib/integrations/public-site-quote.ts", "utf8");
assert.match(handlerSource, /receivePluginQuote/);
assert.doesNotMatch(handlerSource, /ingestPluginQuote/);
assert.doesNotMatch(handlerSource, /includeProspect:\s*true/);

function connection(overrides: Partial<PluginConnection> = {}): PluginConnection {
  return {
    id: "conn-1",
    organization_id: "org-quickly",
    configurator_id: "funnel-1",
    status: "active",
    store_domain: SHOP,
    public_key: SITE_KEY,
    allowed_origins: [PREVIEW],
    webhook_secret: "plugin-bearer-secret",
    ...overrides,
  } as PluginConnection;
}

function call(
  method: string,
  init: {
    key?: string;
    header?: string | null;
    origin?: string | null;
    body?: unknown;
    ip?: string;
    load?: (publicKey: string) => Promise<PluginConnection | null>;
    receive?: (row: PluginConnection, body: unknown) => Promise<
      | { ok: true; status: 200 | 201; id: string; url: string }
      | { ok: false; status: 422 | 500; error: string }
    >;
  } = {},
) {
  const headers = new Headers();
  if (init.header !== null) headers.set(PUBLIC_SITE_KEY_HEADER, init.header ?? init.key ?? SITE_KEY);
  if (init.origin !== null) headers.set("origin", init.origin ?? SHOP_ORIGIN);
  if (init.ip) headers.set("x-forwarded-for", init.ip);
  const req = new Request("https://app.example/api/public/sites/quotes", {
    method,
    headers,
    body: method === "POST" ? JSON.stringify(init.body ?? quoteBody) : undefined,
  });
  return handlePublicSiteQuote(req, init.key ?? SITE_KEY, {
    load: init.load ?? (async () => connection()),
    receive: init.receive,
  });
}

async function main() {
resetRateLimitState();

{
  const res = await call("POST", { header: null, ip: "203.0.113.1" });
  assert.equal(res.status, 401);
  assert.equal((await res.json()).error, "Clé site manquante");
  assert.equal(res.headers.get("access-control-allow-origin"), SHOP_ORIGIN);
}

{
  let loaded = false;
  const res = await call("POST", {
    key: "not-a-site-key",
    header: "not-a-site-key",
    ip: "203.0.113.2",
    load: async () => {
      loaded = true;
      return connection();
    },
  });
  assert.equal(res.status, 401);
  assert.equal((await res.json()).error, "Clé site invalide");
  assert.equal(loaded, false);
}

{
  let received = false;
  const res = await call("POST", {
    header: "qb_site_differentkeyvalue0001",
    ip: "203.0.113.3",
    receive: async () => {
      received = true;
      return { ok: true, status: 201, id: "q", url: "https://app.example/devis/q" };
    },
  });
  assert.equal(res.status, 401);
  assert.equal((await res.json()).error, "Clé site invalide");
  assert.equal(received, false);
}

{
  const res = await call("POST", {
    ip: "203.0.113.4",
    load: async () => null,
  });
  assert.equal(res.status, 401);
  assert.equal((await res.json()).error, "Clé site invalide");
}

{
  let received = false;
  const res = await call("POST", {
    ip: "203.0.113.5",
    load: async () => connection({ status: "disabled" }),
    receive: async () => {
      received = true;
      return { ok: true, status: 201, id: "q", url: "https://app.example/devis/q" };
    },
  });
  assert.equal(res.status, 401);
  assert.equal(received, false);
}

{
  const res = await call("POST", {
    header: "plugin-bearer-secret",
    key: "plugin-bearer-secret",
    ip: "203.0.113.6",
  });
  assert.equal(res.status, 401);
}

{
  let received = false;
  const res = await call("OPTIONS", {
    header: null,
    origin: SHOP_ORIGIN,
    ip: "203.0.113.7",
    receive: async () => {
      received = true;
      return { ok: true, status: 201, id: "q", url: "https://app.example/devis/q" };
    },
  });
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), SHOP_ORIGIN);
  assert.match(res.headers.get("access-control-allow-methods") ?? "", /POST/);
  assert.match(res.headers.get("access-control-allow-methods") ?? "", /OPTIONS/);
  assert.match(res.headers.get("access-control-allow-headers") ?? "", /X-QuoteBuilder-Site-Key/);
  assert.match(res.headers.get("access-control-allow-headers") ?? "", /Content-Type/);
  assert.equal(res.headers.get("vary"), "Origin");
  assert.equal(received, false);
}

{
  const res = await call("OPTIONS", {
    header: null,
    origin: PREVIEW,
    ip: "203.0.113.8",
  });
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), PREVIEW);
}

{
  const res = await call("OPTIONS", {
    header: null,
    origin: "https://evil.example",
    ip: "203.0.113.9",
  });
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error, "Origine non autorisée");
  assert.equal(res.headers.get("access-control-allow-origin"), null);
}

{
  const res = await call("POST", { origin: null, ip: "203.0.113.10" });
  assert.equal(res.status, 403);
}

{
  let seen: unknown = null;
  const res = await call("POST", {
    origin: PREVIEW,
    ip: "203.0.113.11",
    receive: async (row, body) => {
      seen = body;
      assert.equal(row.public_key, SITE_KEY);
      assert.notEqual(row.webhook_secret, SITE_KEY);
      const parsed = parsePluginQuoteBody(body);
      assert.equal(parsed.ok, true);
      return { ok: true, status: 201, id: "quote-1", url: "https://app.example/devis/quote-1" };
    },
  });
  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), { id: "quote-1", url: "https://app.example/devis/quote-1" });
  assert.equal(res.headers.get("access-control-allow-origin"), PREVIEW);
  assert.deepEqual(seen, quoteBody);
}

{
  const seen: string[] = [];
  const receive = async (_row: PluginConnection, body: unknown) => {
    const parsed = parsePluginQuoteBody(body);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) throw new Error("parse");
    seen.push(parsed.quote.externalId);
    const replay = seen.length > 1;
    return {
      ok: true as const,
      status: replay ? (200 as const) : (201 as const),
      id: "quote-1",
      url: "https://app.example/devis/quote-1",
    };
  };
  const first = await call("POST", { ip: "203.0.113.12", receive });
  const second = await call("POST", { ip: "203.0.113.12", receive });
  assert.equal(first.status, 201);
  assert.equal(second.status, 200);
  assert.equal((await first.json()).id, "quote-1");
  assert.equal((await second.json()).id, "quote-1");
  assert.deepEqual(seen, ["9645", "9645"]);
}

{
  resetRateLimitState();
  let calls = 0;
  const receive = async () => {
    calls += 1;
    return { ok: true as const, status: 201 as const, id: "quote-rl", url: "https://app.example/devis/quote-rl" };
  };
  for (let i = 0; i < PUBLIC_SITE_QUOTE_IP_LIMIT; i += 1) {
    const res = await call("POST", { ip: "203.0.113.50", receive });
    assert.equal(res.status, 201);
  }
  const blocked = await call("POST", { ip: "203.0.113.50", receive });
  assert.equal(blocked.status, 429);
  assert.equal((await blocked.json()).error, "Trop de requêtes, réessayez plus tard.");
  assert.equal(blocked.headers.get("access-control-allow-origin"), SHOP_ORIGIN);
  assert.ok(Number(blocked.headers.get("retry-after")) >= 1);
  assert.equal(calls, PUBLIC_SITE_QUOTE_IP_LIMIT);
}

console.log("public-site-quote.test.ts ok");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
