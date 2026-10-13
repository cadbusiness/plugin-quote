import { readQuotePrice, sumLineRanges, type MoneyRange, type PricedLine } from "@/lib/quotes/price-range";
import type { Json } from "@/lib/db/database.types";

/**
 * Pure helpers for Google Ads conversion uploads: value, consent,
 * partial failure parsing and manager (MCC) account listing.
 */

export type AdsConversionValue = { value: number; currency: string };

export type UploadRowOutcome = { ok: true } | { ok: false; error: string };

export type AdsCustomer = {
  id: string;
  name: string;
  /** Manager account the client is reached through (login-customer-id header). */
  loginCustomerId?: string;
};

type Obj = Record<string, unknown>;

function obj(value: unknown): Obj | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Obj) : null;
}

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function normalizeCurrency(code: string | null | undefined) {
  const value = (code ?? "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(value) ? value : "EUR";
}

/** Midpoint of the range, or whichever bound is known. Null when unknown or not positive. */
export function rangeEstimate(range: MoneyRange | null | undefined): number | null {
  if (!range) return null;
  const min = range.min != null && Number.isFinite(range.min) ? range.min : null;
  const max = range.max != null && Number.isFinite(range.max) ? range.max : null;
  let value: number | null = null;
  if (min != null && max != null) value = (min + max) / 2;
  else value = min ?? max;
  return value != null && value > 0 ? roundMoney(value) : null;
}

/**
 * Value sent with a conversion. Won: real amount when known, else the estimate.
 * Submitted: estimate from the stamped quote price, else the quote lines.
 */
export function adsConversionValue(input: {
  kind: "quote" | "won";
  extractedParams?: Json | null;
  lines?: PricedLine[];
  actualAmount?: number | null;
  currency?: string | null;
}): AdsConversionValue | null {
  const stored = readQuotePrice(input.extractedParams);
  const currency = normalizeCurrency(input.currency ?? stored?.currency);
  if (input.kind === "won" && input.actualAmount != null && Number.isFinite(input.actualAmount) && input.actualAmount > 0) {
    return { value: roundMoney(input.actualAmount), currency };
  }
  const estimate = rangeEstimate(stored ?? sumLineRanges(input.lines ?? []));
  return estimate == null ? null : { value: estimate, currency };
}

export function adsConsent(consentAds: boolean | null | undefined) {
  if (consentAds === true) return { adUserData: "GRANTED" as const };
  if (consentAds === false) return { adUserData: "DENIED" as const };
  return undefined;
}

function errorIndex(error: Obj): number | null {
  const location = obj(error.location);
  const path = Array.isArray(location?.fieldPathElements) ? location.fieldPathElements : [];
  for (const element of path) {
    const el = obj(element);
    if (el?.fieldName === "conversions" && el.index != null && Number.isInteger(Number(el.index))) {
      return Number(el.index);
    }
  }
  return null;
}

/**
 * uploadClickConversions with partialFailure: HTTP 200 even when rows fail.
 * Failed rows come back as empty results and are located in partialFailureError.details.
 */
export function parseUploadResults(data: unknown, count: number): UploadRowOutcome[] {
  const body = obj(data) ?? {};
  const results = Array.isArray(body.results) ? body.results : [];
  const failure = obj(body.partialFailureError);
  const messages = new Map<number, string[]>();
  let unlocated: string | null = null;

  if (failure) {
    const details = Array.isArray(failure.details) ? failure.details : [];
    for (const detail of details) {
      const list = obj(detail)?.errors;
      const errors = Array.isArray(list) ? list : [];
      for (const raw of errors) {
        const error = obj(raw);
        if (!error) continue;
        const message = typeof error.message === "string" && error.message ? error.message : "Conversion refusée.";
        const index = errorIndex(error);
        if (index == null) {
          unlocated = unlocated ?? message;
          continue;
        }
        messages.set(index, [...(messages.get(index) ?? []), message]);
      }
    }
    if (!messages.size && !unlocated) {
      unlocated = typeof failure.message === "string" && failure.message ? failure.message : "Conversion refusée.";
    }
  }

  const outcomes: UploadRowOutcome[] = [];
  for (let i = 0; i < count; i += 1) {
    const located = messages.get(i);
    if (located?.length) {
      outcomes.push({ ok: false, error: located.join(" ; ") });
      continue;
    }
    const row = obj(results[i]);
    if (!row || Object.keys(row).length === 0) {
      outcomes.push({ ok: false, error: unlocated ?? "Conversion non acceptée par Google Ads." });
      continue;
    }
    outcomes.push({ ok: true });
  }
  return outcomes;
}

/** Conversion action resource names embed the customer id. */
export function resourceBelongsTo(resource: string | null | undefined, customerId: string) {
  return typeof resource === "string" && resource.startsWith(`customers/${customerId}/conversionActions/`);
}

/** Leaf accounts listed by a customer_client query run on a manager. */
export function parseCustomerClients(rows: unknown[], managerId: string): AdsCustomer[] {
  const out: AdsCustomer[] = [];
  for (const raw of rows) {
    const client = obj(obj(raw)?.customerClient);
    if (!client) continue;
    const id = String(client.id ?? "").replace(/[^0-9]/g, "");
    if (!id || id === managerId || client.manager === true) continue;
    const name = typeof client.descriptiveName === "string" && client.descriptiveName ? client.descriptiveName : `Compte ${id}`;
    out.push({ id, name, loginCustomerId: managerId });
  }
  return out;
}

/** Direct access wins over access through a manager; first manager wins otherwise. */
export function mergeCustomers(lists: AdsCustomer[][]): AdsCustomer[] {
  const byId = new Map<string, AdsCustomer>();
  for (const list of lists) {
    for (const customer of list) {
      const current = byId.get(customer.id);
      if (!current || (current.loginCustomerId && !customer.loginCustomerId)) byId.set(customer.id, customer);
    }
  }
  return [...byId.values()];
}

export function parsePendingCustomers(settings: unknown): AdsCustomer[] {
  const pending = obj(settings)?.pendingCustomers;
  if (!Array.isArray(pending)) return [];
  const out: AdsCustomer[] = [];
  for (const raw of pending) {
    const item = obj(raw);
    if (!item || typeof item.id !== "string") continue;
    const customer: AdsCustomer = { id: item.id, name: typeof item.name === "string" ? item.name : `Compte ${item.id}` };
    if (typeof item.loginCustomerId === "string" && item.loginCustomerId) customer.loginCustomerId = item.loginCustomerId;
    out.push(customer);
  }
  return out;
}
