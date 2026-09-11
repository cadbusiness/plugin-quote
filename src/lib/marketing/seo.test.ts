import assert from "node:assert/strict";
import { BLOG_POSTS } from "./blog";
import { computeLostQuote } from "./lost-quote";
import { MARKETING_ROUTES } from "./routes";
import { SITE_URL, absoluteUrl, pageMetadata } from "./site";

assert.equal(SITE_URL, "https://quotebuilder.co");
assert.equal(absoluteUrl("/blog"), "https://quotebuilder.co/blog");
assert.doesNotMatch(SITE_URL, /vercel\.app/);

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const required of [
  "/",
  "/tarifs",
  "/blog",
  "/blog/pourquoi-les-devis-meurent-sans-relance",
  "/outils/cout-devis-non-relance",
  "/outils/generateur-sequence-relances",
  "/a-propos",
  "/secteurs/funnel-devis-rayonnage-stockage",
  "/legal/cgu",
  "/legal/confidentialite",
  "/fonctionnalites/funnel",
]) {
  assert.ok(paths.includes(required), `missing route ${required}`);
}

assert.equal(BLOG_POSTS.length, 4);

const meta = pageMetadata({
  title: "Connexion",
  description: "Accès",
  path: "/login",
  index: false,
});
assert.equal(meta.alternates?.canonical, "https://quotebuilder.co/login");
assert.deepEqual(meta.robots, { index: false, follow: false });

const lost = computeLostQuote({
  quotesPerMonth: 40,
  basket: 3500,
  currentRate: 12,
  targetRate: 22,
});
assert.equal(lost.monthlyCurrent, 40 * 3500 * 0.12);
assert.equal(lost.monthlyGap, 40 * 3500 * 0.1);
assert.equal(lost.annualGap, lost.monthlyGap * 12);

console.log("marketing seo tests ok");
