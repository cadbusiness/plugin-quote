import assert from "node:assert/strict";
import { formatPrice } from "@/lib/format";
import {
  displayedQuoteRange,
  formatLineAmount,
  lineRange,
  orderPriceBounds,
  quoteHeadlineRange,
  readQuotePrice,
  resolveDisplayCurrency,
  stampQuotePrice,
  suggestionCardRange,
  sumLineRanges,
} from "./price-range";

assert.equal(formatPrice(null, null), "Sur devis");
assert.equal(formatPrice(undefined, undefined), "Sur devis");

const fixed = formatPrice(1800, 1800);
assert.equal(fixed, formatPrice(1800, null));
assert.equal(fixed.includes("à"), false);
assert.equal(fixed.includes("–"), false);
assert.equal(fixed.includes("—"), false);

assert.equal(formatPrice(420, 189), formatPrice(189, 420));

const ranged = formatPrice(1000, 2400);
assert.equal(ranged.includes("à"), true);
assert.equal(ranged.includes("–"), false);
assert.equal(ranged.includes("—"), false);
assert.equal(formatPrice(18.2, 18.4).includes("à"), false);

const usd = formatPrice(10, 20, "USD");
assert.equal(usd.includes("€"), false);
assert.equal(usd.includes("à"), true);
const chf = formatPrice(10, null, "chf");
assert.equal(chf.includes("€"), false);
assert.match(chf, /CHF/i);

assert.deepEqual(orderPriceBounds(420, 189), { min: 189, max: 420 });
assert.deepEqual(orderPriceBounds(10, null), { min: 10, max: null });
assert.deepEqual(orderPriceBounds(null, null), { min: null, max: null });

assert.deepEqual(lineRange({ price_min: 100, price_max: 150, quantity: 4 }), { min: 400, max: 600 });
assert.deepEqual(lineRange({ priceMin: 18, priceMax: 18, quantity: 2 }), { min: 36, max: 36 });
assert.deepEqual(lineRange({ price_min: 420, price_max: 189, quantity: 3 }), { min: 567, max: 1260 });
assert.equal(formatLineAmount({ priceMin: 100, priceMax: 100, quantity: 6 }, "EUR").includes("à"), false);

assert.deepEqual(
  sumLineRanges([
    { price_min: 100, price_max: 150, quantity: 2 },
    { price_min: 40, price_max: null, quantity: 1 },
  ]),
  { min: 240, max: 340 },
);

assert.deepEqual(
  quoteHeadlineRange({
    ruleMin: 4500,
    ruleMax: 24000,
    lines: [{ price_min: 100, price_max: 150, quantity: 6 }],
  }),
  { min: 4500, max: 24000 },
);
assert.deepEqual(
  quoteHeadlineRange({
    ruleMin: null,
    ruleMax: null,
    lines: [{ price_min: 100, price_max: 150, quantity: 6 }],
  }),
  { min: 600, max: 900 },
);
assert.deepEqual(quoteHeadlineRange({ lines: [] }), { min: null, max: null });
assert.deepEqual(quoteHeadlineRange({ ruleMin: 800, ruleMax: 200 }), { min: 200, max: 800 });

const card = suggestionCardRange(
  {
    priceMin: 900,
    priceMax: 7500,
    products: [{ id: "a", priceMin: 100, priceMax: 200 }],
  },
  { a: 8 },
);
assert.deepEqual(card, { min: 900, max: 7500 });

const summed = suggestionCardRange(
  {
    priceMin: null,
    priceMax: null,
    products: [
      { id: "a", priceMin: 100, priceMax: 200 },
      { id: "b", priceMin: 50, priceMax: 50 },
    ],
  },
  { a: 2, b: 4 },
);
assert.deepEqual(summed, { min: 400, max: 600 });

assert.deepEqual(
  displayedQuoteRange({
    stored: { min: null, max: null },
    lines: [{ price_min: 10, price_max: 20, quantity: 1 }],
  }),
  { min: null, max: null },
);
assert.deepEqual(
  displayedQuoteRange({
    stored: null,
    lines: [{ price_min: 10, price_max: 20, quantity: 3 }],
  }),
  { min: 30, max: 60 },
);

const stamped = stampQuotePrice({ source: "wordpress", viewed_at: "2026-01-01" }, { min: 4500, max: 24000 }, "gbp");
assert.equal((stamped as { source: string }).source, "wordpress");
assert.deepEqual(readQuotePrice(stamped), { min: 4500, max: 24000, currency: "GBP" });
assert.equal(readQuotePrice({}), null);
assert.equal(readQuotePrice(null), null);

assert.equal(resolveDisplayCurrency(["chf", " CHF "]), "CHF");
assert.equal(resolveDisplayCurrency([]), "EUR");
assert.equal(resolveDisplayCurrency([null, ""]), "EUR");
assert.equal(resolveDisplayCurrency(["USD", "CHF"]), "EUR");
assert.equal(resolveDisplayCurrency(["GBP"]), "GBP");
assert.equal(resolveDisplayCurrency(["usd", "USD"], "EUR"), "USD");

console.log("quotes/price-range ok");
