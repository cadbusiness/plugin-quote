import type { QuoteActivityView, QuoteDetail, QuoteMessageView } from "@/lib/crm/quote-detail";

export type QuoteNextAction = {
  kicker: string;
  title: string;
  body: string;
  automationNote: string;
  quoted: boolean;
};

export type DossierJournalItem = {
  id: string;
  title: string;
  meta: string;
  hot: boolean;
};

export type QuoteInboxCue = {
  kicker: string;
  title: string;
  quoted: boolean;
  hot: boolean;
};

export function firstNameOf(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

export function wantHeading(name: string) {
  const first = firstNameOf(name);
  return first ? `Ce que ${first} veut` : "Le projet";
}

export function funnelContext(answers: { value: string }[]) {
  const parts = answers.map((row) => row.value).filter(Boolean).slice(0, 4);
  return parts.length ? parts.join(" · ") : null;
}

export function dossierWhy(scoreReasons: string[], answers: { value: string }[]) {
  if (scoreReasons.length) return scoreReasons;
  return answers
    .map((row) => row.value.trim())
    .filter((value) => value.length > 0 && value.length <= 42)
    .slice(0, 4);
}

export function quoteInboxCue(
  input: {
    statusSlug: string;
    createdAt: string;
    firstItem: string | null;
    lastProspect: { content: string; sent_at: string } | null;
    lastTeamAt: string | null;
  },
  now = Date.now(),
): QuoteInboxCue | null {
  if (input.statusSlug === "won" || input.statusSlug === "lost") return null;

  if (input.lastProspect && (!input.lastTeamAt || input.lastProspect.sent_at > input.lastTeamAt)) {
    return {
      kicker: `Sans réponse depuis ${sincePhrase(input.lastProspect.sent_at, now)}`,
      title: input.lastProspect.content,
      quoted: true,
      hot: true,
    };
  }

  if (!input.lastTeamAt) {
    if (input.statusSlug === "new") {
      return {
        kicker: "Dossier non traité",
        title: input.firstItem ?? "Nouvelle demande",
        quoted: Boolean(input.firstItem),
        hot: true,
      };
    }
  }

  const lastTouch = input.lastTeamAt ?? input.createdAt;
  if (daysBetween(lastTouch, now) >= 3 && input.statusSlug !== "waiting") {
    return {
      kicker: `Sans suivi depuis ${sincePhrase(lastTouch, now)}`,
      title: input.firstItem ?? "Dossier sans suivi",
      quoted: Boolean(input.firstItem),
      hot: true,
    };
  }

  return null;
}

export function validationHint(company: string | null | undefined) {
  const label = (company ?? "").toLowerCase();
  if (/(hôtel|hotel|rivage)/.test(label)) {
    return "Un hôtel décide rarement seul. Invitez le chef ou la direction : ils valident sans PDF.";
  }
  if (/(resto|restaurant|cuisine)/.test(label)) {
    return "Une cuisine se décide rarement seul. Invitez le chef ou la direction : ils valident sans PDF.";
  }
  return "Un projet B2B se décide rarement seul. Invitez le chef ou la direction : ils valident sans PDF.";
}

export function statusUnchangedLabel(iso: string, now = Date.now()) {
  const days = daysBetween(iso, now);
  if (days < 1) return "Changé aujourd’hui";
  if (days === 1) return "Inchangé depuis 1 jour";
  return `Inchangé depuis ${days} jours`;
}

export function lastStatusChangeAt(detail: QuoteDetail) {
  const last = detail.activities.find((act) => act.type === "status_changed");
  return last?.created_at ?? detail.quote.created_at;
}

export function quoteNextAction(detail: QuoteDetail, now = Date.now()): QuoteNextAction | null {
  const slug = detail.status?.slug ?? detail.quote.status;
  if (slug === "won" || slug === "lost") return null;

  const live = detail.automations.find((flow) => flow.state === "waiting" || flow.state === "running");
  const automationNote = live
    ? `${live.title} · ${live.stateLabel}`.toUpperCase()
    : "AUCUN FLUX AUTOMATIQUE NE COUVRE CE CAS";

  const lastProspect = lastMessage(detail.messages, "prospect");
  const lastTeam = lastMessage(detail.messages, "team");
  const lastCall = detail.activities.find((act) => act.type === "call_logged");
  const lastTeamAt = laterOf(lastTeam?.sent_at, lastCall?.created_at);
  const name = detail.quote.contact_name;

  if (lastProspect && (!lastTeamAt || lastProspect.sent_at > lastTeamAt)) {
    return {
      kicker: `À faire maintenant · sans réponse depuis ${sincePhrase(lastProspect.sent_at, now)}`,
      title: lastProspect.content,
      body: unansweredBody(name, lastProspect, now),
      automationNote,
      quoted: true,
    };
  }

  const contacted = Boolean(lastTeam || lastCall);
  if (!contacted) {
    const first = detail.items[0]?.name;
    const context = funnelContext(detail.answers);
    const count = detail.totals?.count ?? detail.items.length;
    const price = detail.totals?.label;
    const bits = [
      `${name}, reçu ${agoLower(detail.quote.created_at, now)}.`,
      count ? `${count} produit${count > 1 ? "s" : ""}${price ? ` · ${price}` : ""}.` : null,
      context,
      "Aucun échange pour l’instant.",
    ].filter(Boolean);
    return {
      kicker: `À faire maintenant · demande reçue depuis ${sincePhrase(detail.quote.created_at, now)}`,
      title: first ?? context ?? "Nouvelle demande à traiter",
      body: bits.join(" "),
      automationNote,
      quoted: Boolean(first || context),
    };
  }

  const lastTouch = laterOf(lastTeamAt, detail.activities[0]?.created_at) ?? detail.quote.created_at;
  if (daysBetween(lastTouch, now) >= 3 && slug !== "waiting") {
    return {
      kicker: `À relancer · sans suivi depuis ${sincePhrase(lastTouch, now)}`,
      title: detail.items[0]?.name ?? "Dossier sans suivi",
      body: `${name}, dernier contact ${agoLower(lastTouch, now)}. Relancez avant que le projet refroidisse.`,
      automationNote,
      quoted: false,
    };
  }

  if (slug === "waiting") {
    return {
      kicker: "En attente · le prospect doit revenir",
      title: "Le dossier attend une réponse côté client",
      body: `${name}. Relancez si le délai dépasse ce que vous acceptez.`,
      automationNote,
      quoted: false,
    };
  }

  return null;
}

export function dossierJournal(detail: QuoteDetail): DossierJournalItem[] {
  const items: DossierJournalItem[] = [];
  const lastProspect = lastMessage(detail.messages, "prospect");
  const lastTeam = lastMessage(detail.messages, "team");
  const unanswered = Boolean(lastProspect && (!lastTeam || lastProspect.sent_at > lastTeam.sent_at));

  if (lastProspect) {
    items.push({
      id: `msg-${lastProspect.id}`,
      title: "Question du prospect",
      meta: unanswered ? `${lastProspect.when} · sans réponse` : lastProspect.when,
      hot: unanswered,
    });
  }

  for (const act of detail.activities) {
    if (items.length >= 6) break;
    if (act.type === "note_added") continue;
    if (lastProspect && act.type === "message_sent" && unanswered) continue;
    items.push({
      id: act.id,
      title: journalTitle(act),
      meta: journalMeta(act),
      hot: false,
    });
  }

  return items.slice(0, 6);
}

function lastMessage(messages: QuoteMessageView[], sender: "prospect" | "team") {
  return [...messages].reverse().find((row) =>
    sender === "prospect" ? row.sender === "prospect" : row.sender !== "prospect",
  );
}

function unansweredBody(name: string, message: QuoteMessageView, now: number) {
  const when = agoLower(message.sent_at, now);
  const text = message.content.toLowerCase();
  if (/(visite|passer|sur site|rdv|rendez-vous|mercredi|date)/.test(text)) {
    return `${name}, ${when}. Demande une visite, pas un devis, et attend une date.`;
  }
  if (/(prix|tarif|budget|devis|chiffrage)/.test(text)) {
    return `${name}, ${when}. Une question sur le chiffrage, sans réponse de l’équipe.`;
  }
  return `${name}, ${when}. Message en attente d’une réponse.`;
}

function journalTitle(act: QuoteActivityView) {
  if (act.type === "status_changed") {
    const label = act.detail ?? "";
    const to = label.includes("→") ? label.split("→").at(-1)?.trim() : label;
    if (to) {
      const lower = to.toLowerCase();
      return lower.startsWith("en ") ? `Passée ${lower}` : `Passée en ${lower}`;
    }
    return "Statut modifié";
  }
  if (act.type === "email_sent" && /confirmation/i.test(act.detail ?? "")) return "Confirmation envoyée";
  if (act.type === "submitted") return "Demande reçue";
  if (act.type === "message_sent") return "Email au prospect";
  if (act.type === "call_logged") return "Appel";
  return act.label;
}

function journalMeta(act: QuoteActivityView) {
  if (act.type === "submitted") return act.detail ? `${act.when}` : act.when;
  if (act.type === "email_sent" && !act.actor_id) return `${act.when} · automatique`;
  if (act.type === "email_sent") return `${act.when} · automatique`;
  if (act.type === "status_changed") return `${act.when} · Commercial`;
  if (act.detail && act.type === "submitted") return act.when;
  return act.when;
}

function laterOf(a?: string | null, b?: string | null) {
  if (a && b) return a > b ? a : b;
  return a ?? b ?? null;
}

function daysBetween(iso: string, now: number) {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 86_400_000));
}

function sincePhrase(iso: string, now: number) {
  const hours = Math.max(1, Math.round((now - new Date(iso).getTime()) / 3_600_000));
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 jour" : `${days} jours`;
}

function agoLower(iso: string, now: number) {
  const hours = Math.max(0, Math.round((now - new Date(iso).getTime()) / 3_600_000));
  if (hours < 1) return "à l’instant";
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "il y a 1 jour";
  if (days < 60) return `il y a ${days} jours`;
  return new Date(iso).toLocaleDateString("fr-FR");
}
