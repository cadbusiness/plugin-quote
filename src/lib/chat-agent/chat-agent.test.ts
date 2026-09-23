import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { appendChatTranscript, pickExistingDraft, type ChatDraft } from "@/lib/chat-agent/draft";
import { handlePublicSiteChat, publicSiteChatPath } from "@/lib/chat-agent/http";
import { acceptModelReply } from "@/lib/chat-agent/reply";
import { sourcesFromCatalog } from "@/lib/chat-agent/sources";
import { runChatRetrieval } from "@/lib/chat-agent/turn";
import type { PluginConnection } from "@/lib/integrations/plugin";
import { PUBLIC_SITE_KEY_HEADER } from "@/lib/integrations/public-site-quote";
import { publicWidgetConfig } from "@/lib/integrations/quote-widget";
import { resetRateLimitState } from "@/lib/security/rate-limit";
import type { SalesNotice } from "@/lib/visitor-requests/types";
import type { ProductSheet } from "@/lib/catalog/sheet";
import type { Product } from "@/lib/wizard/types";

const SITE_KEY = "qb_site_chatagenttestkeyvalue1";
const SHOP_ORIGIN = "https://shop.example";

function sheet(manualText: string): ProductSheet {
  return { manualText, documents: [{ role: "manual", src: "https://cdn.example/notice.pdf", label: "Notice PDF" }] };
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "p-unirack",
    name: "Rayonnage Unirack",
    description: "Rayonnage à palettes pour entrepôt.",
    imageUrl: null,
    images: [],
    priceMin: null,
    priceMax: null,
    currency: "EUR",
    tags: ["palette"],
    category: "Rayonnage",
    options: [],
    specs: [{ key: "charge", label: "Charge", value: "800", unit: "kg" }],
    sheet: sheet("Assembler les échelles avant les lisses."),
    stockStatus: "in_stock",
    externalId: "3292",
    ...overrides,
  };
}

const sources = sourcesFromCatalog([product()]);

function connection(): PluginConnection {
  return {
    id: "conn-1",
    organization_id: "org-1",
    status: "active",
    store_domain: "https://shop.example/boutique",
    public_key: SITE_KEY,
    allowed_origins: [] as string[],
    webhook_secret: "plugin-bearer-secret",
    settings: {},
  } as unknown as PluginConnection;
}

function draft(overrides: Partial<ChatDraft> = {}): ChatDraft {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    organizationId: "org-1",
    quoteId: "22222222-2222-4222-8222-222222222222",
    contact: { name: "Jean Dupont", email: "jean@exemple.be", phone: "+32 470 00 00 00", company: "Dupont SRL" },
    answers: { usage: "stockage palettes" },
    ...overrides,
  };
}

function call(
  body: unknown,
  deps: Parameters<typeof handlePublicSiteChat>[2],
  init: { header?: string | null; origin?: string | null; ip?: string } = {},
) {
  const headers = new Headers();
  if (init.header !== null) headers.set(PUBLIC_SITE_KEY_HEADER, init.header ?? SITE_KEY);
  if (init.origin !== null) headers.set("origin", init.origin ?? SHOP_ORIGIN);
  if (init.ip) headers.set("x-forwarded-for", init.ip);
  const req = new Request(`https://app.example${publicSiteChatPath(SITE_KEY)}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return handlePublicSiteChat(req, SITE_KEY, {
    load: async () => connection(),
    loadSources: async () => sources,
    findDraft: async () => null,
    phrase: async () => null,
    merchantInbox: async () => ({
      assigneeEmail: null,
      assigneeUserId: null,
      salesEmail: "sales@merchant.test",
      salesName: "Léa",
      channelAddress: null,
      template: { subject: "Brief {{contact_name}}", body: "Brief commercial pour {{contact_name}}." },
      organizationName: "Atelier",
    }),
    sendEscalation: async () => ({ sent: true }),
    recordEscalation: async () => undefined,
    ...deps,
  });
}

async function main() {
  resetRateLimitState();

  {
    const turn = await runChatRetrieval({
      message: "Comment assembler le Unirack ?",
      sources,
      delivered: false,
      hasContact: false,
      phrase: async () => "Le prix ferme est 9999 euros et le délai est de 12 jours.",
    });
    assert.equal(turn.decision.outcome, "answer");
    assert.equal(turn.decision.escalate, false);
    assert.match(turn.reply, /assistant IA/i);
    assert.match(turn.reply, /échelles avant les lisses/);
    assert.doesNotMatch(turn.reply, /9999/);
    assert.doesNotMatch(turn.reply, /12 jours/);
    assert.equal(turn.decision.citations.some((source) => source.kind === "sheet"), true);
  }

  {
    const turn = await runChatRetrieval({
      message: "Quelle est la charge du Unirack ?",
      sources,
      delivered: false,
      hasContact: true,
    });
    assert.equal(turn.decision.outcome, "answer");
    assert.equal(turn.decision.reason, "grounded");
    assert.match(turn.reply, /800/);
    assert.match(turn.reply, /Unirack/);
    assert.doesNotMatch(turn.reply, /€/);
    assert.equal(turn.decision.citations.some((source) => source.specKey === "charge"), true);
  }

  {
    const priced = sourcesFromCatalog([product({ priceMin: 1200, priceMax: 1800 })]);
    const turn = await runChatRetrieval({
      message: "Quel est le prix du Unirack ?",
      sources: priced,
      delivered: false,
      hasContact: false,
    });
    assert.equal(turn.decision.outcome, "answer");
    assert.match(turn.reply, /fourchette/);
    assert.match(turn.reply, /pas un prix ferme/);
    assert.match(turn.reply, /1[\s\u202f]?200/);
    assert.match(turn.reply, /1[\s\u202f]?800/);
  }

  {
    const turn = await runChatRetrieval({
      message: "Quel est le prix ferme et le délai de livraison du Unirack ?",
      sources,
      delivered: true,
      hasContact: true,
    });
    assert.equal(turn.decision.outcome, "refuse");
    assert.equal(turn.decision.escalate, true);
    assert.equal(turn.decision.gaps.includes("missing_price"), true);
    assert.equal(turn.decision.gaps.includes("missing_lead_time"), true);
    assert.match(turn.reply, /ne confirme pas de prix ferme/);
    assert.match(turn.reply, /ne confirme pas de délai/);
    assert.match(turn.reply, /assistant IA/i);
    assert.doesNotMatch(turn.reply, /€/);
    assert.doesNotMatch(turn.reply, /\d+\s*jours/i);
    assert.match(turn.reply, /800/);
  }

  {
    const turn = await runChatRetrieval({
      message: "Est-ce que le Unirack supporte 2 tonnes ?",
      sources,
      delivered: false,
      hasContact: false,
    });
    assert.equal(turn.decision.outcome, "refuse");
    assert.equal(turn.decision.reason, "missing_feasibility");
    assert.match(turn.reply, /ne confirme pas la faisabilité/);
    assert.match(turn.reply, /800/);
    assert.doesNotMatch(turn.reply, /\boui\b/i);
  }

  {
    const answered = sourcesFromCatalog(
      [product()],
      [
        {
          id: "qa-delai",
          question: "Quel est le délai du Unirack ?",
          answer: "Délai annoncé : 5 jours, validé par l'atelier.",
          productName: "Rayonnage Unirack",
        },
      ],
    );
    const turn = await runChatRetrieval({
      message: "Quel est le délai de livraison du Unirack ?",
      sources: answered,
      delivered: false,
      hasContact: false,
    });
    assert.equal(turn.decision.outcome, "answer");
    assert.match(turn.reply, /5 jours/);
    assert.match(turn.reply, /validée|Réponse validée/);
  }

  {
    const invented = acceptModelReply("Le prix ferme est 9999 euros.", {
      outcome: "answer",
      escalate: false,
      reason: "grounded",
      gaps: [],
      citations: sources,
    });
    assert.equal(invented, null);
    const unbound = acceptModelReply("La charge est illimitée et le montage est libre.", {
      outcome: "answer",
      escalate: false,
      reason: "grounded",
      gaps: [],
      citations: sources,
    });
    assert.equal(unbound, null);
    const kept = acceptModelReply("Rayonnage Unirack : Charge 800 kg.", {
      outcome: "answer",
      escalate: false,
      reason: "grounded",
      gaps: [],
      citations: sources,
    });
    assert.match(kept ?? "", /800/);
    assert.match(kept ?? "", /assistant IA/i);
  }

  {
    const notices: SalesNotice[] = [];
    const saved: { draft: ChatDraft | null } = { draft: null };
    const existing = draft();
    const res = await call(
      {
        message: "Je veux parler à un humain pour une remise exceptionnelle.",
        contact: { name: "Jean Dupont", email: "jean@exemple.be", phone: "+32 470 00 00 00", company: "Dupont SRL" },
        visitorRequestId: existing.id,
        history: [{ role: "user", content: "Bonjour" }, { role: "assistant", content: "Je suis l'assistant IA." }],
      },
      {
        findDraft: async () => existing,
        saveTranscript: async (row, messages) => {
          saved.draft = { ...row, answers: appendChatTranscript(row.answers, messages) };
        },
        sendEscalation: async (notice) => {
          notices.push(notice);
          return { sent: true };
        },
      },
      { ip: "203.0.113.10" },
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.outcome, "escalate");
    assert.equal(body.escalated, true);
    assert.equal(body.assistant, true);
    assert.equal(body.visitorRequestId, existing.id);
    assert.match(body.reply, /assistant IA/i);
    assert.match(body.reply, /transmets/);
    assert.doesNotMatch(body.reply, /sales@merchant\.test/);
    assert.equal(notices.length, 1);
    assert.equal(notices[0]?.to, "sales@merchant.test");
    assert.notEqual(notices[0]?.to, "jean@exemple.be");
    assert.match(notices[0]?.text ?? "", /jean@exemple\.be/);
    assert.match(notices[0]?.text ?? "", /parler à un humain/);
    assert.match(notices[0]?.text ?? "", /Brief commercial/);
    assert.match(notices[0]?.text ?? "", /Dossier existant/);
    assert.equal(saved.draft?.id, existing.id);
    assert.equal(saved.draft?.answers.usage, "stockage palettes");
    const chat = saved.draft?.answers.chat;
    assert.equal(Array.isArray(chat), true);
    assert.equal(Array.isArray(chat) && chat.length, 2);
  }

  {
    const notices: SalesNotice[] = [];
    const res = await call(
      { message: "Pouvez-vous me rappeler ?", contact: { email: "jean@exemple.be" } },
      {
        merchantInbox: async () => ({
          assigneeEmail: "commercial@merchant.test",
          assigneeUserId: "user-1",
          salesEmail: "info@quickly-int.com",
          salesName: null,
          channelAddress: "info@quickly-int.com",
          template: null,
          organizationName: "Atelier",
        }),
        sendEscalation: async (notice) => {
          notices.push(notice);
          return { sent: true };
        },
      },
      { ip: "203.0.113.11" },
    );
    assert.equal(res.status, 200);
    assert.equal(notices.length, 1);
    assert.equal(notices[0]?.to, "commercial@merchant.test");
    assert.notEqual(notices[0]?.to, "info@quickly-int.com");
    assert.notEqual(notices[0]?.to, "jean@exemple.be");
  }

  {
    const notices: SalesNotice[] = [];
    const res = await call(
      { message: "Je veux un interlocuteur.", contact: { email: "jean@exemple.be" } },
      {
        merchantInbox: async () => ({
          assigneeEmail: null,
          assigneeUserId: null,
          salesEmail: "info@quickly-int.com",
          salesName: null,
          channelAddress: "jean@exemple.be",
          template: null,
          organizationName: "Atelier",
        }),
        sendEscalation: async (notice) => {
          notices.push(notice);
          return { sent: true };
        },
      },
      { ip: "203.0.113.12" },
    );
    const body = await res.json();
    assert.equal(notices.length, 0);
    assert.equal(body.escalated, false);
    assert.match(body.reply, /formulaire de devis/);
  }

  {
    let saved = false;
    const res = await call(
      {
        message: "Quelle est la couleur du pont roulant ?",
        visitorRequestId: "99999999-9999-4999-8999-999999999999",
      },
      {
        findDraft: async () => null,
        saveTranscript: async () => {
          saved = true;
        },
        sendEscalation: async (notice) => {
          assert.equal(notice.to, "sales@merchant.test");
          assert.match(notice.text, /Aucun devis ouvert/);
          return { sent: true };
        },
      },
      { ip: "203.0.113.13" },
    );
    const body = await res.json();
    assert.equal(body.outcome, "escalate");
    assert.equal(body.visitorRequestId, null);
    assert.equal(saved, false);
    assert.doesNotMatch(body.reply, /bleu|rouge|vert/i);
  }

  {
    const otherOrg = draft({ organizationId: "org-2" });
    let saved = false;
    const res = await call(
      { message: "Je veux parler à quelqu'un.", visitorRequestId: otherOrg.id },
      {
        findDraft: async () => otherOrg,
        saveTranscript: async () => {
          saved = true;
        },
      },
      { ip: "203.0.113.14" },
    );
    const body = await res.json();
    assert.equal(saved, false);
    assert.equal(body.visitorRequestId, null);
  }

  {
    const picked = pickExistingDraft(
      [draft(), draft({ id: "33333333-3333-4333-8333-333333333333", contact: { ...draft().contact, email: "autre@exemple.be" } })],
      { id: null, email: "jean@exemple.be" },
    );
    assert.equal(picked?.id, draft().id);
    assert.equal(pickExistingDraft([], { id: "absent" }), null);
  }

  {
    const res = await call({ message: "bonjour" }, {}, { header: null, ip: "203.0.113.15" });
    assert.equal(res.status, 401);
  }

  const config = publicWidgetConfig(connection());
  assert.equal(config.chat.path, publicSiteChatPath(SITE_KEY));
  assert.equal(config.chat.method, "POST");

  const loadSource = readFileSync(new URL("./load.ts", import.meta.url), "utf8");
  const httpSource = readFileSync(new URL("./http.ts", import.meta.url), "utf8");
  assert.doesNotMatch(loadSource, /from\("visitor_requests"\)\.insert/);
  assert.match(loadSource, /from\("visitor_requests"\)\s*\.update/);
  assert.doesNotMatch(httpSource, /sendQuoteEmails/);
  assert.doesNotMatch(httpSource, /includeProspect/);

  console.log("chat-agent.test.ts ok");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
