import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { salesRecipientDecision } from "@/lib/visitor-requests/brief";
import { linesFromQuantities } from "@/lib/visitor-requests/lines";
import {
  submitVisitorRequest,
  upsertVisitorRequest,
  type VisitorRequestDeps,
  type VisitorScope,
} from "@/lib/visitor-requests/service";
import type { VisitorQuoteInput, VisitorRequestStore } from "@/lib/visitor-requests/store";
import { hashVisitorToken, visitorCookieName } from "@/lib/visitor-requests/token";
import type { CatalogProduct, SalesNotice, VisitorLine, VisitorRequestRecord } from "@/lib/visitor-requests/types";

const ORG = "11111111-1111-4111-8111-111111111111";
const CFG = "22222222-2222-4222-8222-222222222222";
const PRODUCT = "33333333-3333-4333-8333-333333333333";

const scope: VisitorScope = { organizationId: ORG, configuratorId: CFG, connectionId: null };

function catalogProduct(): CatalogProduct {
  return { id: PRODUCT, name: "Rayonnage", priceMin: 120, priceMax: 240, active: true };
}

class MemoryStore implements VisitorRequestStore {
  identities: { id: string; organizationId: string; connectionId: string | null; tokenHash: string }[] = [];
  requests: VisitorRequestRecord[] = [];
  quotes: {
    id: string;
    contactName: string;
    contactEmail: string | null;
    contactPhone: string | null;
    lines: VisitorLine[];
  }[] = [];
  salesEmail: string | null = "sales@example.test";
  salesNotices = 0;

  async findIdentity(input: { organizationId: string; connectionId: string | null; tokenHash: string }) {
    const row = this.identities.find(
      (identity) =>
        identity.organizationId === input.organizationId &&
        identity.connectionId === input.connectionId &&
        identity.tokenHash === input.tokenHash,
    );
    return row ? { id: row.id } : null;
  }

  async createIdentity(input: { organizationId: string; connectionId: string | null; tokenHash: string }) {
    const row = { id: randomUUID(), ...input };
    this.identities.push(row);
    return { id: row.id };
  }

  async touchIdentity() {}

  async findRequestByIdentity(identityId: string) {
    return this.requests.find((request) => request.identityId === identityId) ?? null;
  }

  async saveRequest(record: VisitorRequestRecord) {
    const index = this.requests.findIndex((request) => request.identityId === record.identityId);
    if (index >= 0) {
      const id = this.requests[index].id;
      this.requests[index] = { ...record, id };
      return this.requests[index];
    }
    this.requests.push(record);
    return record;
  }

  async productsByIds(input: { organizationId: string; configuratorId: string; ids: string[] }) {
    if (input.organizationId !== ORG || input.configuratorId !== CFG) return [];
    return input.ids.includes(PRODUCT) ? [catalogProduct()] : [];
  }

  async createQuote(input: VisitorQuoteInput) {
    const id = randomUUID();
    this.quotes.push({
      id,
      contactName: input.contact.name,
      contactEmail: input.contact.email,
      contactPhone: input.contact.phone,
      lines: input.lines.map((line) => ({ ...line })),
    });
    return { id };
  }

  async syncQuote(input: VisitorQuoteInput & { quoteId: string }) {
    const quote = this.quotes.find((row) => row.id === input.quoteId);
    assert.ok(quote, "quote to sync");
    quote.contactName = input.contact.name;
    quote.contactEmail = input.contact.email;
    quote.contactPhone = input.contact.phone;
    quote.lines = input.lines.map((line) => ({ ...line }));
  }

  async salesContext() {
    return { salesEmail: this.salesEmail, salesName: "Ventes", template: null };
  }

  async recordSalesNotice() {
    this.salesNotices += 1;
  }
}

function harness(salesEmail: string | null = "sales@example.test") {
  const store = new MemoryStore();
  store.salesEmail = salesEmail;
  const notices: SalesNotice[] = [];
  const deps: VisitorRequestDeps = {
    store,
    notify: async (notice) => {
      notices.push(notice);
      return { sent: true };
    },
    now: () => "2026-09-22T12:00:00.000Z",
  };
  return { store, notices, deps };
}

const line = { productId: PRODUCT, quantity: 1 };

async function main() {
  assert.equal(visitorCookieName("Quickly"), visitorCookieName("quickly"));
  assert.notEqual(visitorCookieName("quickly"), visitorCookieName("autre"));
  assert.equal(visitorCookieName("ac me!"), "qb_vid_acme");
  assert.equal(hashVisitorToken("abc"), hashVisitorToken("abc"));
  assert.notEqual(hashVisitorToken("abc"), hashVisitorToken("abd"));
  assert.deepEqual(linesFromQuantities({ quantities: { a: 2, b: 0 } }), [
    { productId: "a", quantity: 2, options: undefined },
  ]);

  assert.equal(salesRecipientDecision("info@quickly-int.com", null).ok, false);
  assert.equal(salesRecipientDecision("Sales@Example.test", "buyer@example.test").ok, true);
  assert.equal(salesRecipientDecision("buyer@example.test", "buyer@example.test").ok, false);
  assert.equal(salesRecipientDecision(null, null).ok, false);

  const draft = harness();
  const created = await upsertVisitorRequest(draft.deps, scope, { presentedToken: null, strict: false }, { lines: [line] });
  assert.equal(created.ok, true);
  if (!created.ok || created.skipped) throw new Error("draft should be created");
  assert.equal(created.request.status, "draft");
  assert.equal(created.request.quoteId, null);
  assert.equal(created.request.recognized, true);
  assert.equal(created.request.needsChannel, true);
  assert.equal(created.request.lines[0]?.quantity, 1);
  assert.equal(JSON.stringify(created.request).includes("120"), false);
  assert.equal(draft.store.quotes.length, 0);
  assert.equal(draft.notices.length, 0);
  const token = created.token;

  const emailed = await submitVisitorRequest(draft.deps, scope, { presentedToken: token, strict: false }, {
    contact: { email: "buyer@example.test" },
  });
  assert.equal(emailed.ok, true);
  if (!emailed.ok || emailed.skipped) throw new Error("email submit");
  assert.equal(emailed.request.status, "submitted");
  assert.equal(emailed.request.needsChannel, false);
  assert.equal(emailed.request.channel, "email");
  assert.equal(emailed.request.recognized, true);
  assert.equal(emailed.request.contact.email, "buyer@example.test");
  assert.equal(emailed.request.contact.phone, null);
  assert.equal(draft.store.quotes.length, 1);
  assert.equal(draft.store.quotes[0]?.contactEmail, "buyer@example.test");
  assert.equal(draft.store.quotes[0]?.contactPhone, null);
  assert.equal(draft.notices.length, 1);
  assert.equal(draft.notices[0]?.to, "sales@example.test");
  assert.notEqual(draft.notices[0]?.to, "buyer@example.test");
  assert.equal(draft.notices[0]?.text.includes("120"), false);
  assert.equal(draft.notices[0]?.text.includes("Rayonnage"), true);
  assert.equal(draft.store.salesNotices, 1);

  const again = await submitVisitorRequest(draft.deps, scope, { presentedToken: token, strict: false }, { contact: {} });
  assert.equal(again.ok, true);
  if (!again.ok || again.skipped) throw new Error("recognized resubmit");
  assert.equal(again.request.needsChannel, false);
  assert.equal(again.request.contact.email, "buyer@example.test");
  assert.equal(draft.notices.length, 1);

  const added = await upsertVisitorRequest(draft.deps, scope, { presentedToken: token, strict: false }, {
    ops: [{ op: "add", productId: PRODUCT, quantity: 2 }],
  });
  assert.equal(added.ok, true);
  if (!added.ok || added.skipped) throw new Error("second add");
  assert.equal(added.request.id, emailed.request.id);
  assert.equal(added.request.status, "submitted");
  assert.equal(added.request.quoteId, emailed.request.quoteId);
  assert.equal(added.request.lines[0]?.quantity, 3);
  assert.equal(added.request.needsChannel, false);
  assert.equal(added.request.channel, "email");
  assert.equal(added.request.contact.email, "buyer@example.test");
  assert.equal(draft.notices.length, 1);
  assert.equal(draft.store.quotes.length, 1);
  assert.equal(draft.store.quotes[0]?.lines[0]?.quantity, 3);
  assert.equal(draft.store.quotes[0]?.contactEmail, "buyer@example.test");

  const emailedDraft = harness();
  const storedEmail = await upsertVisitorRequest(
    emailedDraft.deps,
    scope,
    { presentedToken: null, strict: false },
    { lines: [line], channel: "email", contact: { email: "buyer@example.test" } },
  );
  assert.equal(storedEmail.ok, true);
  if (!storedEmail.ok || storedEmail.skipped) throw new Error("email must be stored on the draft");
  assert.equal(storedEmail.request.status, "draft");
  assert.equal(storedEmail.request.channel, "email");
  assert.equal(storedEmail.request.contact.email, "buyer@example.test");
  assert.equal(storedEmail.request.contact.phone, null);
  assert.equal(storedEmail.request.needsChannel, false);
  assert.equal(emailedDraft.store.quotes.length, 0);
  assert.equal(emailedDraft.notices.length, 0);
  assert.equal(emailedDraft.store.requests[0]?.contact.email, "buyer@example.test");
  assert.equal(emailedDraft.store.requests[0]?.contactChannel, "email");
  const submittedFromDraft = await submitVisitorRequest(
    emailedDraft.deps,
    scope,
    { presentedToken: storedEmail.token, strict: false },
    { contact: {} },
  );
  assert.equal(submittedFromDraft.ok, true);
  if (!submittedFromDraft.ok || submittedFromDraft.skipped) throw new Error("submit keeps stored email");
  assert.equal(submittedFromDraft.request.contact.email, "buyer@example.test");
  assert.equal(submittedFromDraft.request.channel, "email");
  assert.equal(emailedDraft.notices.length, 1);
  assert.equal(emailedDraft.notices[0]?.to, "sales@example.test");

  const phoneOnDraft = harness();
  const storedPhone = await upsertVisitorRequest(
    phoneOnDraft.deps,
    scope,
    { presentedToken: null, strict: false },
    { lines: [line], channel: "phone", contact: { phone: "+33 6 12 34 56 78" } },
  );
  assert.equal(storedPhone.ok, true);
  if (!storedPhone.ok || storedPhone.skipped) throw new Error("phone must be stored on the draft");
  assert.equal(storedPhone.request.status, "draft");
  assert.equal(storedPhone.request.channel, "phone");
  assert.equal(storedPhone.request.contact.phone, "+33612345678");
  assert.equal(storedPhone.request.contact.email, null);
  assert.equal(storedPhone.request.needsChannel, false);
  assert.equal(phoneOnDraft.store.quotes.length, 0);
  assert.equal(phoneOnDraft.notices.length, 0);
  assert.equal(phoneOnDraft.store.requests[0]?.contactChannel, "phone");

  const emailRequired = await upsertVisitorRequest(
    harness().deps,
    scope,
    { presentedToken: null, strict: false },
    { lines: [line], channel: "email" },
  );
  assert.equal(emailRequired.ok, false);
  if (emailRequired.ok) throw new Error("email channel requires an email");
  assert.equal(emailRequired.code, "invalid_contact");

  const phoneRequired = await upsertVisitorRequest(
    harness().deps,
    scope,
    { presentedToken: null, strict: false },
    { lines: [line], channel: "phone" },
  );
  assert.equal(phoneRequired.ok, false);
  if (phoneRequired.ok) throw new Error("phone channel requires a phone");
  assert.equal(phoneRequired.code, "invalid_contact");

  const phone = harness();
  const phoneDraft = await upsertVisitorRequest(phone.deps, scope, { presentedToken: null, strict: false }, { lines: [line] });
  if (!phoneDraft.ok || phoneDraft.skipped) throw new Error("phone draft");
  const phoned = await submitVisitorRequest(phone.deps, scope, { presentedToken: phoneDraft.token, strict: false }, {
    contact: { phone: "06 12 34 56 78" },
  });
  assert.equal(phoned.ok, true);
  if (!phoned.ok || phoned.skipped) throw new Error("phone submit");
  assert.equal(phoned.request.channel, "phone");
  assert.equal(phoned.request.contact.email, null);
  assert.equal(phoned.request.contact.phone, "0612345678");
  assert.equal(phoned.request.needsChannel, false);
  assert.equal(phone.store.quotes[0]?.contactEmail, null);
  assert.equal(phone.store.quotes[0]?.contactPhone, "0612345678");
  assert.equal(phone.notices.length, 1);
  assert.equal(phone.notices[0]?.to, "sales@example.test");
  assert.equal(phone.notices[0]?.text.includes("0612345678"), true);
  assert.equal(phone.notices[0]?.contactEmail, null);

  const unknown = harness();
  const denied = await submitVisitorRequest(unknown.deps, scope, { presentedToken: null, strict: false }, {
    lines: [line],
    contact: {},
  });
  assert.equal(denied.ok, false);
  if (denied.ok) throw new Error("unknown visitor must provide a channel");
  assert.equal(denied.code, "needs_channel");
  assert.equal(denied.request?.lines.length, 1);
  assert.equal(denied.request?.status, "draft");
  assert.equal(denied.request?.recognized, true);
  assert.equal(denied.request?.needsChannel, true);
  assert.equal(unknown.notices.length, 0);
  assert.equal(unknown.store.quotes.length, 0);
  assert.equal(unknown.store.salesNotices, 0);

  const stranger = await submitVisitorRequest(draft.deps, scope, { presentedToken: null, strict: false }, {
    lines: [line],
  });
  assert.equal(stranger.ok, false);
  if (stranger.ok) throw new Error("stranger");
  assert.equal(stranger.code, "needs_channel");
  assert.equal(draft.notices.length, 1);
  assert.equal(draft.store.quotes.length, 1);

  const silent = harness("info@quickly-int.com");
  const silentDraft = await upsertVisitorRequest(silent.deps, scope, { presentedToken: null, strict: false }, { lines: [line] });
  if (!silentDraft.ok || silentDraft.skipped) throw new Error("silent draft");
  const silentSubmit = await submitVisitorRequest(silent.deps, scope, { presentedToken: silentDraft.token, strict: false }, {
    contact: { email: "buyer@example.test" },
  });
  assert.equal(silentSubmit.ok, true);
  assert.equal(silent.notices.length, 0);
  assert.equal(silent.store.salesNotices, 0);

  const sameInbox = harness("buyer@example.test");
  const sameDraft = await upsertVisitorRequest(sameInbox.deps, scope, { presentedToken: null, strict: false }, { lines: [line] });
  if (!sameDraft.ok || sameDraft.skipped) throw new Error("same inbox draft");
  await submitVisitorRequest(sameInbox.deps, scope, { presentedToken: sameDraft.token, strict: false }, {
    contact: { email: "buyer@example.test" },
  });
  assert.equal(sameInbox.notices.length, 0);

  const skipped = await upsertVisitorRequest(draft.deps, scope, { presentedToken: null, strict: false }, { lines: [] });
  assert.equal(skipped.ok, true);
  if (!skipped.ok || !skipped.skipped) throw new Error("empty cart must not mint a visitor");

  console.log("visitor request tests ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
