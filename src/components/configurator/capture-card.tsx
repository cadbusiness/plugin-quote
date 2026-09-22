"use client";

import { useEffect, useRef, useState } from "react";
import { captureAnswerPatch, planCaptureFollow, type CaptureComplement, type CaptureFollow } from "@/lib/configurator/capture-follow";
import { parseAttribution, type Attribution } from "@/lib/stats/attribution";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import type { ConfiguratorDefinition, QuoteSession } from "@/lib/wizard/types";

const DEFAULT_PLACEHOLDER = "Ex. : dimensions, quantités, contraintes, délai.";
const DEFAULT_PROMISE = "Réponse sous 24h";

type Phase = "brief" | "qualify" | "complement" | "contact" | "done";

type Contact = { name: string; email: string; phone: string; company: string };

async function api<T>(url: string, init?: RequestInit & { token?: string }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("content-type", headers.get("content-type") ?? "application/json");
  if (init?.token) headers.set("x-session-token", init.token);
  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur");
  return data as T;
}

function visitorId() {
  try {
    const existing = localStorage.getItem("qb-vid");
    if (existing) return existing;
    const next = crypto.randomUUID();
    localStorage.setItem("qb-vid", next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

function readAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  return parseAttribution({
    search: params,
    referrer: params.get("qb_ref") || document.referrer || null,
    landingPath: params.get("qb_landing") || window.location.pathname + window.location.search,
    visitorId: params.get("qb_vid") || visitorId(),
  });
}

function attributionBody(attr: Attribution) {
  return {
    visitorId: attr.visitorId ?? undefined,
    utmSource: attr.utmSource ?? undefined,
    utmMedium: attr.utmMedium ?? undefined,
    utmCampaign: attr.utmCampaign ?? undefined,
    utmContent: attr.utmContent ?? undefined,
    utmTerm: attr.utmTerm ?? undefined,
    referrer: attr.referrer ?? undefined,
    landingPath: attr.landingPath ?? undefined,
  };
}

export function CaptureCard({
  orgSlug,
  configuratorSlug,
  placeholder,
  promise,
  phone,
}: {
  orgSlug: string;
  configuratorSlug: string;
  placeholder?: string;
  promise?: string;
  phone?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [definition, setDefinition] = useState<ConfiguratorDefinition | null>(null);
  const [session, setSession] = useState<QuoteSession | null>(null);
  const [phase, setPhase] = useState<Phase>("brief");
  const [follow, setFollow] = useState<CaptureFollow | null>(null);
  const [clarification, setClarification] = useState("");
  const [accepted, setAccepted] = useState<CaptureComplement | null>(null);
  const [need, setNeed] = useState("");
  const [contact, setContact] = useState<Contact>({ name: "", email: "", phone: "", company: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<ConfiguratorDefinition>(`/api/public/configurator/${orgSlug}/${configuratorSlug}`)
      .then((def) => {
        if (!cancelled) setDefinition(def);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orgSlug, configuratorSlug]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const send = () => {
      const height = Math.ceil(node.getBoundingClientRect().height);
      window.parent.postMessage({ source: "quotebuilder", type: "resize", height }, "*");
    };
    send();
    const observer = new ResizeObserver(send);
    observer.observe(node);
    return () => observer.disconnect();
  }, [phase, loading, missing, need, errors, busy]);

  const accent =
    typeof definition?.configurator.theme.accent === "string" && definition.configurator.theme.accent.trim()
      ? definition.configurator.theme.accent
      : "#E85D04";
  const hint = placeholder?.trim() || DEFAULT_PLACEHOLDER;
  const reply = promise?.trim() || DEFAULT_PROMISE;
  const replyPhone = phone?.trim() || definition?.organization.salesPhone?.trim() || "";

  function advanceAfterBrief() {
    if (!need.trim()) {
      setErrors({ need: "Décrivez votre besoin" });
      return;
    }
    setErrors({});
    const next = definition ? planCaptureFollow(need, definition.products) : { anchorId: null, question: null, complement: null };
    setFollow(next);
    setClarification("");
    setAccepted(null);
    if (next.question) setPhase("qualify");
    else if (next.complement) setPhase("complement");
    else setPhase("contact");
  }

  function continueAfterQuestion() {
    if (!clarification.trim()) {
      setErrors({ clarify: "Précisez pour qu’on puisse chiffrer" });
      return;
    }
    setErrors({});
    if (follow?.complement) setPhase("complement");
    else setPhase("contact");
  }

  async function submit() {
    const nextErrors: Record<string, string> = {};
    if (!need.trim()) nextErrors.need = "Décrivez votre besoin";
    if (contact.name.trim().length < 2) nextErrors.name = "Nom requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) nextErrors.email = "E-mail invalide";
    if (contact.phone.trim().length < 6) nextErrors.phone = "Téléphone requis";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      const attr = readAttribution();
      let current = session;
      if (!current) {
        current = await api<QuoteSession>("/api/public/sessions", {
          method: "POST",
          body: JSON.stringify({
            orgSlug,
            configuratorSlug,
            ...attributionBody(attr),
          }),
        });
        setSession(current);
        await fetch(`/api/public/sessions/${current.id}/events`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-session-token": current.token },
          body: JSON.stringify({ eventType: ANALYTICS_EVENTS.started, step: 0, visitorId: attr.visitorId }),
        }).catch(() => undefined);
      }
      await api(`/api/public/sessions/${current.id}`, {
        method: "PATCH",
        token: current.token,
        body: JSON.stringify({
          answers: {
            need: need.trim(),
            quote_mode: "rfq",
            ...(follow?.question && clarification.trim()
              ? captureAnswerPatch(follow.question, clarification)
              : {}),
            ...(accepted ? { added: accepted.name } : {}),
          },
          ...(accepted
            ? { customization: { quantities: { [accepted.id]: 1 }, options: {} } }
            : {}),
          contactDraft: {
            name: contact.name.trim(),
            email: contact.email.trim(),
            phone: contact.phone.trim(),
            company: contact.company.trim(),
          },
        }),
      });
      await api(`/api/public/sessions/${current.id}/submit`, {
        method: "POST",
        token: current.token,
        body: JSON.stringify({
          name: contact.name.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          company: contact.company.trim(),
          consentMarketing: false,
        }),
      });
      await fetch(`/api/public/sessions/${current.id}/events`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-session-token": current.token },
        body: JSON.stringify({ eventType: ANALYTICS_EVENTS.submitted, step: 0, visitorId: attr.visitorId }),
      }).catch(() => undefined);
      setPhase("done");
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Envoi impossible" });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <article ref={rootRef} className="qb-capture rounded-2xl border border-mk-border bg-white p-4 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-mk-band" />
        <div className="mt-3 h-20 animate-pulse rounded-xl bg-mk-band" />
      </article>
    );
  }

  if (missing || !definition) {
    return (
      <article ref={rootRef} className="qb-capture rounded-2xl border border-mk-border bg-white p-4 text-sm text-mk-faint shadow-sm">
        Ce module de devis est indisponible.
      </article>
    );
  }

  if (phase === "done") {
    return (
      <article ref={rootRef} className="qb-capture rounded-2xl border border-mk-border bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-mk-ink">Demande envoyée</p>
        <p className="mt-1 text-sm text-mk-faint">
          Merci{contact.name.trim() ? `, ${contact.name.trim()}` : ""}. L’équipe {definition.organization.name} vous recontacte.
        </p>
      </article>
    );
  }

  return (
    <article ref={rootRef} className="qb-capture rounded-2xl border border-mk-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white"
          style={{ background: accent }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <h2 className="text-sm font-semibold text-mk-ink">Une question sur votre projet ?</h2>
      </div>

      <div className={phase === "brief" ? "mt-3 flex items-stretch gap-2" : "mt-3"}>
        <textarea
          value={need}
          rows={phase === "brief" ? 3 : 2}
          placeholder={hint}
          onChange={(event) => {
            setNeed(event.target.value);
            if (errors.need) setErrors((current) => ({ ...current, need: "" }));
          }}
          className="min-w-0 flex-1 resize-none rounded-xl border border-dashed border-emerald-700/40 bg-white px-3 py-2 text-sm text-mk-ink outline-none placeholder:text-mk-faint focus:border-solid focus:border-emerald-700"
        />
        {phase === "brief" ? (
          <button
            type="button"
            onClick={advanceAfterBrief}
            className="shrink-0 self-center rounded-full px-3.5 py-2 text-sm font-semibold text-white"
            style={{ background: accent }}
          >
            Devis →
          </button>
        ) : null}
      </div>
      {errors.need ? <p className="mt-1.5 text-xs text-red-600">{errors.need}</p> : null}

      {phase === "qualify" && follow?.question ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-mk-ink">{follow.question.label}</p>
          <input
            value={clarification}
            onChange={(event) => {
              setClarification(event.target.value);
              if (errors.clarify) setErrors((current) => ({ ...current, clarify: "" }));
            }}
            className="mt-2 w-full rounded-xl border border-mk-border px-3 py-2 text-sm text-mk-ink outline-none focus:border-emerald-700"
          />
          {errors.clarify ? <p className="mt-1.5 text-xs text-red-600">{errors.clarify}</p> : null}
          <button
            type="button"
            onClick={continueAfterQuestion}
            className="mt-3 rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: accent }}
          >
            Continuer
          </button>
        </div>
      ) : null}

      {phase === "complement" && follow?.complement ? (
        <div className="mt-4 rounded-xl border border-mk-border p-3">
          <p className="text-xs font-medium text-emerald-700">{follow.complement.reason}</p>
          <p className="mt-1 text-sm font-semibold text-mk-ink">{follow.complement.name}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setAccepted(follow.complement);
                setPhase("contact");
              }}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ background: accent }}
            >
              Ajouter au devis
            </button>
            <button
              type="button"
              onClick={() => {
                setAccepted(null);
                setPhase("contact");
              }}
              className="text-sm font-semibold text-emerald-700"
            >
              Non, c’est tout
            </button>
          </div>
        </div>
      ) : null}

      {phase === "contact" ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-mk-ink">Où vous envoyer le devis ?</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field
              label="Nom et prénom"
              required
              value={contact.name}
              error={errors.name}
              onChange={(name) => setContact((current) => ({ ...current, name }))}
            />
            <Field
              label="Téléphone"
              required
              value={contact.phone}
              error={errors.phone}
              onChange={(value) => setContact((current) => ({ ...current, phone: value }))}
            />
            <Field
              label="E-mail"
              required
              type="email"
              value={contact.email}
              error={errors.email}
              onChange={(email) => setContact((current) => ({ ...current, email }))}
            />
            <Field
              label="Entreprise"
              value={contact.company}
              onChange={(company) => setContact((current) => ({ ...current, company }))}
            />
          </div>
          {errors.submit ? <p className="mt-2 text-xs text-red-600">{errors.submit}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: accent }}
            >
              {busy ? "Envoi…" : "Envoyer ma demande"}
            </button>
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setPhase("brief");
              }}
              className="text-sm font-semibold text-emerald-700"
            >
              Modifier ma demande
            </button>
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-xs font-medium text-emerald-700">
        {reply}
        {replyPhone ? <span> · {replyPhone}</span> : null}
      </p>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  error?: string;
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-medium text-mk-ink">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-mk-border px-2.5 py-1.5 text-sm text-mk-ink outline-none focus:border-emerald-700"
      />
      {error ? <span className="mt-1 block text-red-600">{error}</span> : null}
    </label>
  );
}
