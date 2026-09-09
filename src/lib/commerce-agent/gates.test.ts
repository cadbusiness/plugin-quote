import assert from "node:assert/strict";
import { searchCatalog } from "./catalog";
import { executeQuoteTool } from "./executor";
import {
  canHandoffQuote,
  canPresentConfigurations,
  clampSearchLimit,
  rememberIds,
} from "./gates";
import { emptyProvenance, type AgentSessionState } from "./types";
import type { Product } from "@/lib/wizard/types";

const products: Product[] = [
  {
    id: "p-heavy",
    name: "UNIRACK lourd 6m",
    description: "Rayonnage palette charge 800kg",
    imageUrl: null,
    images: [],
    priceMin: 12000,
    priceMax: 18000,
    currency: "EUR",
    tags: ["lourd", "palette"],
    category: "Rayonnage",
    options: [],
    stockStatus: "in_stock",
    externalId: null,
  },
  {
    id: "p-light",
    name: "Rayonnage léger atelier",
    description: "Stockage pièces légères",
    imageUrl: null,
    images: [],
    priceMin: 800,
    priceMax: 2000,
    currency: "EUR",
    tags: ["leger"],
    category: "Rayonnage",
    options: [],
    stockStatus: "in_stock",
    externalId: null,
  },
];

assert.equal(clampSearchLimit(99), 8);
assert.equal(clampSearchLimit(0), 1);

const found = searchCatalog(products, { query: "palette 800kg 6m" });
assert.equal(found.products[0]?.id, "p-heavy");

let provenance = emptyProvenance();
assert.equal(canPresentConfigurations(provenance).ok, false);
provenance = rememberIds(provenance, ["p-heavy"]);
assert.equal(canPresentConfigurations(provenance).ok, true);
assert.equal(canHandoffQuote(undefined).ok, false);
assert.equal(canHandoffQuote("a@b.com").ok, true);

let state: AgentSessionState = {
  answers: {},
  contactDraft: {},
  provenance: emptyProvenance(),
  goSuggestions: false,
  goContact: false,
  lastSuggestions: [],
};

{
  const blocked = executeQuoteTool({
    name: "present_configurations",
    args: { ready: true },
    state,
    products,
    rules: [],
  });
  assert.equal(blocked.outcome.status, "blocked");
  assert.equal(blocked.outcome.gate, "catalog_required");
}

{
  const search = executeQuoteTool({
    name: "search_catalog",
    args: { query: "unirack" },
    state,
    products,
    rules: [],
  });
  state = search.state;
  assert.equal(search.outcome.status, "ok");
  const present = executeQuoteTool({
    name: "present_configurations",
    args: { ready: true },
    state,
    products,
    rules: [],
  });
  assert.equal(present.outcome.status, "ok");
  assert.equal(present.state.goSuggestions, true);
  state = present.state;
}

{
  const handoff = executeQuoteTool({
    name: "handoff_quote",
    args: { ready: true },
    state,
    products,
    rules: [],
  });
  assert.equal(handoff.outcome.status, "blocked");
  assert.equal(handoff.outcome.gate, "contact_email_required");

  const contact = executeQuoteTool({
    name: "collect_contact",
    args: { name: "Jean", email: "jean@entrepot.be" },
    state,
    products,
    rules: [],
  });
  state = contact.state;
  const ok = executeQuoteTool({
    name: "handoff_quote",
    args: { ready: true },
    state,
    products,
    rules: [],
  });
  assert.equal(ok.outcome.status, "ok");
  assert.equal(ok.state.goContact, true);
}

console.log("commerce-agent gates/catalog ok");
