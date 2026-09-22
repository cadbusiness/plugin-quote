"use client";

import { useEffect, useRef, useState } from "react";
import { parseAttribution, type Attribution } from "@/lib/stats/attribution";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import type { ChatMessage, ConfiguratorDefinition, ContactDraft, QuoteSession } from "@/lib/wizard/types";

type Contact = { name: string; email: string; phone: string; company: string };

type AgentReply = {
  session: QuoteSession;
  message: string;
  goContact: boolean;
};

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

export function SiteAgent({
  orgSlug,
  configuratorSlug,
}: {
  orgSlug: string;
  configuratorSlug: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [definition, setDefinition] = useState<ConfiguratorDefinition | null>(null);
  const [session, setSession] = useState<QuoteSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<"chat" | "contact" | "done">("chat");
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
  }, [phase, loading, missing, messages, draft, errors, busy]);

  const accent =
    typeof definition?.configurator.theme.accent === "string" && definition.configurator.theme.accent.trim()
      ? definition.configurator.theme.accent
      : "#E85D04";

  function applyDraft(next: ContactDraft) {
    setContact((current) => ({
      name: next.name?.trim() || current.name,
      email: next.email?.trim() || current.email,
      phone: next.phone?.trim() || current.phone,
      company: next.company?.trim() || current.company,
    }));
  }

  async function ensureSession() {
    if (session) return session;
    const attr = readAttribution();
    const created = await api<QuoteSession>("/api/public/sessions", {
      method: "POST",
      body: JSON.stringify({ orgSlug, configuratorSlug, ...attributionBody(attr) }),
    });
    setSession(created);
    await fetch(`/api/public/sessions/${created.id}/events`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-session-token": created.token },
      body: JSON.stringify({ eventType: ANALYTICS_EVENTS.started, step: 0, visitorId: attr.visitorId }),
    }).catch(() => undefined);
    return created;
  }

  async function send() {
    const text = draft.trim();
    if (!text) return;
    setBusy(true);
    setErrors({});
    try {
      const current = await ensureSession();
      const turn = await api<AgentReply>(`/api/public/sessions/${current.id}/agent`, {
        method: "POST",
        token: current.token,
        body: JSON.stringify({ message: text }),
      });
      setSession(turn.session);
      setMessages(turn.session.chatMessages);
      applyDraft(turn.session.contactDraft);
      setDraft("");
      if (turn.goContact) setPhase("contact");
    } catch (error) {
      setErrors({ send: error instanceof Error ? error.message : "Agent indisponible" });
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    const nextErrors: Record<string, string> = {};
    const need = messages.find((message) => message.role === "user")?.content ?? "";
    if (!need.trim()) nextErrors.send = "Décrivez votre besoin";
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
      const current = await ensureSession();
      await api(`/api/public/sessions/${current.id}`, {
        method: "PATCH",
        token: current.token,
        body: JSON.stringify({
          answers: { need: need.trim(), quote_mode: "rfq" },
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
      <section ref={rootRef} className="qb-agent flex h-[420px] flex-col rounded-2xl border border-mk-border bg-white p-4 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-mk-band" />
        <div className="mt-3 h-24 animate-pulse rounded-xl bg-mk-band" />
      </section>
    );
  }

  if (missing || !definition) {
    return (
      <section ref={rootRef} className="qb-agent rounded-2xl border border-mk-border bg-white p-4 text-sm text-mk-faint shadow-sm">
        Ce module de devis est indisponible.
      </section>
    );
  }

  if (phase === "done") {
    return (
      <section ref={rootRef} className="qb-agent rounded-2xl border border-mk-border bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-mk-ink">Demande envoyée</p>
        <p className="mt-1 text-sm text-mk-faint">
          Merci{contact.name.trim() ? `, ${contact.name.trim()}` : ""}. L’équipe {definition.organization.name} vous recontacte.
        </p>
      </section>
    );
  }

  return (
    <section ref={rootRef} className="qb-agent flex max-h-[640px] flex-col rounded-2xl border border-mk-border bg-white shadow-sm">
      <header className="border-b border-mk-border px-4 py-3">
        <p className="text-sm font-semibold text-mk-ink">Discuter de votre projet</p>
        <p className="text-xs text-mk-faint">{definition.organization.name}</p>
      </header>
      <div className="flex min-h-[220px] flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="rounded-xl bg-mk-band px-3 py-2 text-sm text-mk-ink">
            Bonjour, décrivez-moi votre projet. Je cherche dans le catalogue et je prépare le devis.
          </p>
        ) : null}
        {messages.map((message, index) => (
          <p
            key={`${message.role}-${index}`}
            className={
              message.role === "assistant"
                ? "rounded-xl bg-mk-band px-3 py-2 text-sm text-mk-ink"
                : "self-end max-w-[85%] rounded-xl px-3 py-2 text-sm text-white"
            }
            style={message.role === "user" ? { background: accent } : undefined}
          >
            {message.content}
          </p>
        ))}
      </div>
      {phase === "chat" ? (
        <form
          className="flex items-end gap-2 border-t border-mk-border px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <textarea
            value={draft}
            rows={2}
            placeholder="Votre besoin"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            className="min-w-0 flex-1 resize-none rounded-xl border border-mk-border px-3 py-2 text-sm text-mk-ink outline-none focus:border-emerald-700"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: accent }}
          >
            {busy ? "…" : "Envoyer"}
          </button>
        </form>
      ) : null}
      {errors.send ? <p className="px-4 pb-3 text-xs text-red-600">{errors.send}</p> : null}
      {phase === "chat" && messages.length > 0 ? (
        <button
          type="button"
          onClick={() => setPhase("contact")}
          className="px-4 pb-3 text-left text-sm font-semibold text-emerald-700"
        >
          Passer aux coordonnées
        </button>
      ) : null}
      {phase === "contact" ? (
        <div className="border-t border-mk-border px-4 py-3">
          <p className="text-sm font-semibold text-mk-ink">Où vous envoyer le devis ?</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Nom et prénom" required value={contact.name} error={errors.name} onChange={(name) => setContact((current) => ({ ...current, name }))} />
            <Field label="Téléphone" required value={contact.phone} error={errors.phone} onChange={(phone) => setContact((current) => ({ ...current, phone }))} />
            <Field label="E-mail" required type="email" value={contact.email} error={errors.email} onChange={(email) => setContact((current) => ({ ...current, email }))} />
            <Field label="Entreprise" value={contact.company} onChange={(company) => setContact((current) => ({ ...current, company }))} />
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
            <button type="button" onClick={() => setPhase("chat")} className="text-sm font-semibold text-emerald-700">
              Continuer la discussion
            </button>
          </div>
        </div>
      ) : null}
    </section>
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
