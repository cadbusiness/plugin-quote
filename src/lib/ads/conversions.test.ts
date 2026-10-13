import assert from "node:assert/strict";
import {
  adsConsent,
  adsConversionValue,
  mergeCustomers,
  normalizeCurrency,
  parseCustomerClients,
  parsePendingCustomers,
  parseUploadResults,
  rangeEstimate,
  resourceBelongsTo,
} from "./conversions";
import { stampQuotePrice } from "@/lib/quotes/price-range";

// Partial failure: HTTP 200 with a located error and an empty result row.
{
  const failed = parseUploadResults(
    {
      partialFailureError: {
        code: 3,
        message: "The click is too old.",
        details: [
          {
            "@type": "type.googleapis.com/google.ads.googleads.v24.errors.GoogleAdsFailure",
            errors: [
              {
                errorCode: { conversionUploadError: "EXPIRED_CLICK" },
                message: "The click is too old.",
                location: { fieldPathElements: [{ fieldName: "conversions", index: 1 }, { fieldName: "gclid" }] },
              },
            ],
          },
        ],
      },
      results: [{ gclid: "a", conversionAction: "customers/1/conversionActions/2" }, {}],
    },
    2,
  );
  assert.deepEqual(failed[0], { ok: true });
  assert.deepEqual(failed[1], { ok: false, error: "The click is too old." });
}
{
  const ok = parseUploadResults({ results: [{ gclid: "a", conversionDateTime: "x" }] }, 1);
  assert.deepEqual(ok, [{ ok: true }]);
  const unlocated = parseUploadResults({ partialFailureError: { message: "Bad" }, results: [{}] }, 1);
  assert.deepEqual(unlocated, [{ ok: false, error: "Bad" }]);
  const empty = parseUploadResults({}, 1);
  assert.equal(empty[0]?.ok, false);
}

// Value: midpoint, single bound, nothing when unknown, never 0.
assert.equal(rangeEstimate({ min: 1000, max: 2000 }), 1500);
assert.equal(rangeEstimate({ min: 800, max: null }), 800);
assert.equal(rangeEstimate({ min: null, max: 300 }), 300);
assert.equal(rangeEstimate({ min: null, max: null }), null);
assert.equal(rangeEstimate({ min: 0, max: 0 }), null);
{
  const params = stampQuotePrice({}, { min: 1000, max: 3000 }, "CHF");
  assert.deepEqual(adsConversionValue({ kind: "quote", extractedParams: params }), { value: 2000, currency: "CHF" });
  assert.deepEqual(
    adsConversionValue({ kind: "won", extractedParams: params, actualAmount: 2450.5 }),
    { value: 2450.5, currency: "CHF" },
  );
  assert.deepEqual(adsConversionValue({ kind: "won", extractedParams: params, actualAmount: 0 }), {
    value: 2000,
    currency: "CHF",
  });
  assert.deepEqual(
    adsConversionValue({ kind: "quote", lines: [{ price_min: 100, price_max: 200, quantity: 2 }] }),
    { value: 300, currency: "EUR" },
  );
  assert.equal(adsConversionValue({ kind: "quote", lines: [{ price_min: null, price_max: null }] }), null);
  assert.equal(adsConversionValue({ kind: "won" }), null);
}
assert.equal(normalizeCurrency("eur"), "EUR");
assert.equal(normalizeCurrency(""), "EUR");
assert.equal(normalizeCurrency("euro"), "EUR");

// Consent only when known.
assert.deepEqual(adsConsent(true), { adUserData: "GRANTED" });
assert.deepEqual(adsConsent(false), { adUserData: "DENIED" });
assert.equal(adsConsent(undefined), undefined);

// Conversion actions from another account are not reused.
assert.equal(resourceBelongsTo("customers/123/conversionActions/9", "123"), true);
assert.equal(resourceBelongsTo("customers/456/conversionActions/9", "123"), false);
assert.equal(resourceBelongsTo(undefined, "123"), false);

// Manager accounts: children carry the manager as loginCustomerId; direct access wins.
{
  const children = parseCustomerClients(
    [
      { customerClient: { id: "999", descriptiveName: "MCC", manager: true } },
      { customerClient: { id: "111", descriptiveName: "Client A", manager: false } },
      { customerClient: { id: "222", manager: false } },
    ],
    "999",
  );
  assert.deepEqual(children, [
    { id: "111", name: "Client A", loginCustomerId: "999" },
    { id: "222", name: "Compte 222", loginCustomerId: "999" },
  ]);
  const merged = mergeCustomers([[{ id: "222", name: "Direct" }], children]);
  assert.deepEqual(merged, [
    { id: "222", name: "Direct" },
    { id: "111", name: "Client A", loginCustomerId: "999" },
  ]);
  assert.deepEqual(parsePendingCustomers({ pendingCustomers: merged, quoteActionResource: "x" }), merged);
  assert.deepEqual(parsePendingCustomers(null), []);
}

console.log("ads/conversions.test.ts: ok");
