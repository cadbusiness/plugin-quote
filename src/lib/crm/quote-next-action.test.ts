import assert from "node:assert/strict";
import {
  dossierWhy,
  firstNameOf,
  funnelContext,
  quoteInboxCue,
  quoteNextAction,
  statusUnchangedLabel,
  validationHint,
  wantHeading,
} from "./quote-next-action";
import type { QuoteDetail } from "./quote-detail";

assert.equal(firstNameOf("Léa Moreau"), "Léa");
assert.equal(wantHeading("Léa Moreau"), "Ce que Léa veut");
assert.match(validationHint("Hôtel Rivage"), /hôtel/);
assert.equal(funnelContext([{ value: "Cuisine d'hôtel" }, { value: "420 m²" }]), "Cuisine d'hôtel · 420 m²");

const now = Date.parse("2026-09-10T10:00:00Z");
assert.equal(statusUnchangedLabel("2026-09-02T10:00:00Z", now), "Inchangé depuis 8 jours");

const unanswered = quoteNextAction(
  {
    quote: {
      contact_name: "Léa Moreau",
      created_at: "2026-09-02T17:10:00Z",
      status: "in_progress",
    },
    status: { slug: "in_progress" },
    items: [],
    messages: [
      {
        id: "m1",
        sender: "prospect",
        content: "Pouvez-vous passer sur site mercredi matin ?",
        sent_at: "2026-09-03T10:00:00Z",
        when: "Il y a 7 jours",
      },
    ],
    activities: [],
    automations: [],
  } as unknown as QuoteDetail,
  now,
);

assert.equal(unanswered?.quoted, true);
assert.match(unanswered?.kicker ?? "", /sans réponse depuis 7 jours/i);
assert.match(unanswered?.body ?? "", /visite/);
assert.match(unanswered?.automationNote ?? "", /AUCUN FLUX/);

const closed = quoteNextAction(
  {
    quote: { contact_name: "Léa Moreau", created_at: "2026-09-02T17:10:00Z", status: "won" },
    status: { slug: "won" },
    items: [],
    messages: [],
    activities: [],
    automations: [],
  } as unknown as QuoteDetail,
  now,
);
assert.equal(closed, null);

const fresh = quoteNextAction(
  {
    quote: {
      contact_name: "Claire Martin",
      created_at: "2026-09-10T08:00:00Z",
      status: "new",
    },
    status: { slug: "new" },
    items: [{ name: "Rayonnage mi-lourd 3 niveaux" }],
    answers: [{ value: "Entrepôt" }, { value: "1 200 m²" }],
    totals: { count: 2, label: "18 000 € – 24 000 €", min: 18000, max: 24000 },
    messages: [],
    activities: [],
    automations: [],
  } as unknown as QuoteDetail,
  now,
);

assert.equal(fresh?.quoted, true);
assert.match(fresh?.title ?? "", /Rayonnage/);
assert.match(fresh?.kicker ?? "", /demande reçue/i);
assert.match(fresh?.body ?? "", /Aucun échange/);

assert.deepEqual(dossierWhy([], [{ value: "Cuisine d'hôtel" }, { value: "420 m²" }]), [
  "Cuisine d'hôtel",
  "420 m²",
]);
assert.deepEqual(
  quoteInboxCue(
    {
      statusSlug: "new",
      createdAt: "2026-09-10T08:00:00Z",
      firstItem: "Rayonnage mi-lourd 3 niveaux",
      lastProspect: null,
      lastTeamAt: null,
    },
    now,
  )?.title,
  "Rayonnage mi-lourd 3 niveaux",
);
assert.equal(
  quoteInboxCue(
    {
      statusSlug: "contacted",
      createdAt: "2026-09-10T08:00:00Z",
      firstItem: "Rayonnage picking 2,50 m",
      lastProspect: null,
      lastTeamAt: null,
    },
    now,
  ),
  null,
);

console.log("quote-next-action ok");
