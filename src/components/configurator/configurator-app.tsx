"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type {
  Answers,
  ConfiguratorDefinition,
  Customization,
  QuoteSession,
  Suggestion,
  WizardQuestion,
} from "@/lib/wizard/types";

type Props = {
  orgSlug: string;
  configuratorSlug: string;
  embedded?: boolean;
};

const SESSION_KEY = (org: string, slug: string) => `qb-session:${org}:${slug}`;

async function api<T>(url: string, init?: RequestInit & { token?: string }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("content-type", headers.get("content-type") ?? "application/json");
  if (init?.token) headers.set("x-session-token", init.token);
  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur");
  return data as T;
}

export function ConfiguratorApp({ orgSlug, configuratorSlug, embedded }: Props) {
  const [definition, setDefinition] = useState<ConfiguratorDefinition | null>(null);
  const [session, setSession] = useState<QuoteSession | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ score?: number; label?: string } | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", company: "" });

  const step = definition?.steps[session?.currentStep ?? 0];
  const answers = useMemo(
    () => ({ ...(session?.extractedParams ?? {}), ...(session?.answers ?? {}) }),
    [session],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const def = await api<ConfiguratorDefinition>(
          `/api/public/configurator/${orgSlug}/${configuratorSlug}`,
        );
        if (cancelled) return;
        setDefinition(def);
        const stored = localStorage.getItem(SESSION_KEY(orgSlug, configuratorSlug));
        let next: QuoteSession | null = null;
        if (stored) {
          const parsed = JSON.parse(stored) as { id: string; token: string };
          next = await api<QuoteSession>(`/api/public/sessions/${parsed.id}`, {
            token: parsed.token,
          }).catch(() => null);
        }
        if (!next) {
          next = await api<QuoteSession>("/api/public/sessions", {
            method: "POST",
            body: JSON.stringify({ orgSlug, configuratorSlug }),
          });
        }
        if (cancelled || !next) return;
        localStorage.setItem(
          SESSION_KEY(orgSlug, configuratorSlug),
          JSON.stringify({ id: next.id, token: next.token }),
        );
        setSession(next);
        if (next.submittedQuoteId) setDone({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, configuratorSlug]);

  async function persist(patch: Partial<QuoteSession>) {
    if (!session) return session;
    const next = await api<QuoteSession>(`/api/public/sessions/${session.id}`, {
      method: "PATCH",
      token: session.token,
      body: JSON.stringify(patch),
    });
    setSession(next);
    return next;
  }

  async function loadSuggestions(current = session) {
    if (!current) return;
    const data = await api<{ suggestions: Suggestion[] }>(
      `/api/public/sessions/${current.id}/suggestions`,
      { token: current.token },
    );
    setSuggestions(data.suggestions);
  }

  async function goNext() {
    if (!definition || !session || !step) return;
    setErrors({});
    if (step.screenType === "questions") {
      const nextAnswers = { ...session.answers };
      for (const q of step.questions) {
        const value = nextAnswers[q.key] ?? answers[q.key];
        if (q.required && (value == null || value === "" || (Array.isArray(value) && !value.length))) {
          setErrors((e) => ({ ...e, [q.key]: "Champ requis" }));
          return;
        }
        if (value !== undefined) nextAnswers[q.key] = value;
      }
      const nextStep = Math.min(session.currentStep + 1, definition.steps.length - 1);
      const next = await persist({ answers: nextAnswers, currentStep: nextStep });
      if (definition.steps[nextStep]?.screenType === "suggestions") {
        await loadSuggestions(next ?? undefined);
      }
      return;
    }
    if (step.screenType === "suggestions") {
      if (!session.selectedSuggestionId && suggestions[0]) {
        await persist({
          selectedSuggestionId: suggestions[0].id,
          currentStep: session.currentStep + 1,
        });
        return;
      }
    }
    await persist({ currentStep: Math.min(session.currentStep + 1, definition.steps.length - 1) });
  }

  async function goBack() {
    if (!session) return;
    await persist({ currentStep: Math.max(0, session.currentStep - 1) });
  }

  async function switchMode(mode: "wizard" | "chat") {
    await persist({ mode });
  }

  async function sendChat() {
    if (!session || !chatInput.trim()) return;
    setBusy(true);
    try {
      const data = await api<{ session: QuoteSession; message: string }>(
        `/api/public/sessions/${session.id}/chat`,
        {
          method: "POST",
          token: session.token,
          body: JSON.stringify({ message: chatInput.trim() }),
        },
      );
      setChatInput("");
      setSession(data.session);
      if (data.session.currentStep !== session.currentStep) {
        await loadSuggestions(data.session);
      }
    } catch (error) {
      setErrors({ chat: error instanceof Error ? error.message : "Chat indisponible" });
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!session) return;
    setBusy(true);
    try {
      const result = await api<{ score?: number; label?: string }>(
        `/api/public/sessions/${session.id}/submit`,
        {
          method: "POST",
          token: session.token,
          body: JSON.stringify(contact),
        },
      );
      setDone(result);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Soumission impossible" });
    } finally {
      setBusy(false);
    }
  }

  async function uploadPlan(file: File) {
    if (!session) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/public/sessions/${session.id}/upload`, {
      method: "POST",
      headers: { "x-session-token": session.token },
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrors({ file: data.error || "Upload impossible" });
    }
  }

  if (loading) {
    return <div className="flex min-h-[28rem] items-center justify-center text-slate-500">Chargement…</div>;
  }
  if (!definition || !session) {
    return <div className="p-8 text-center text-slate-500">Configurateur introuvable.</div>;
  }

  const accent = String(definition.configurator.theme.accent ?? "#d97706");
  const showChat = session.mode === "chat" && definition.configurator.chatEnabled;
  const showWizard = session.mode === "wizard" && definition.configurator.wizardEnabled;
  const canSwitch =
    definition.configurator.wizardEnabled && definition.configurator.chatEnabled && !done;

  if (done) {
    return (
      <div className={`mx-auto max-w-xl px-6 py-16 text-center ${embedded ? "" : ""}`}>
        <p className="text-sm font-medium uppercase tracking-wide text-amber-600">Demande envoyée</p>
        <h1 className="mt-2 text-3xl font-semibold">Merci, {contact.name || "nous avons bien reçu votre brief"}.</h1>
        <p className="mt-3 text-slate-600">
          Un récapitulatif PDF vous est envoyé. L’équipe {definition.organization.name} vous recontacte sous 24h.
        </p>
        {done.label ? (
          <p className="mt-6 text-sm text-slate-500">Référence interne · qualification {done.label}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-amber-400">
              {definition.organization.name}
            </p>
            <p className="text-lg font-medium">{definition.configurator.name}</p>
          </div>
          {canSwitch ? (
            <div className="flex rounded-full bg-white/10 p-1 text-sm">
              <button
                type="button"
                onClick={() => switchMode("wizard")}
                className={`rounded-full px-3 py-1 ${session.mode === "wizard" ? "bg-white text-slate-950" : ""}`}
              >
                Wizard
              </button>
              <button
                type="button"
                onClick={() => switchMode("chat")}
                className={`rounded-full px-3 py-1 ${session.mode === "chat" ? "bg-white text-slate-950" : ""}`}
              >
                Chat IA
              </button>
            </div>
          ) : null}
        </div>
        {showWizard ? (
          <div className="mx-auto max-w-5xl px-5 pb-4">
            <div className="flex gap-2">
              {definition.steps.map((s, i) => (
                <div key={s.id} className="h-1 flex-1 rounded-full bg-white/15">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: i < session.currentStep ? "100%" : i === session.currentStep ? "55%" : "0%",
                      background: accent,
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Étape {(session.currentStep ?? 0) + 1} / {definition.steps.length} — {step?.title}
            </p>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {showChat ? (
          <ChatPanel
            messages={session.chatMessages}
            value={chatInput}
            onChange={setChatInput}
            onSend={sendChat}
            busy={busy}
            error={errors.chat}
          />
        ) : null}

        {showWizard && step ? (
          <section>
            <h1 className="text-3xl font-semibold tracking-tight">{step.title}</h1>
            {step.subtitle ? <p className="mt-2 text-slate-600">{step.subtitle}</p> : null}

            {step.screenType === "questions" ? (
              <div className="mt-8 space-y-6">
                {step.questions.map((q) => (
                  <QuestionField
                    key={q.id}
                    question={q}
                    value={answers[q.key]}
                    error={errors[q.key]}
                    onChange={(value) =>
                      setSession((s) =>
                        s ? { ...s, answers: { ...s.answers, [q.key]: value } } : s,
                      )
                    }
                  />
                ))}
              </div>
            ) : null}

            {step.screenType === "suggestions" ? (
              <SuggestionsPanel
                suggestions={suggestions}
                selectedId={session.selectedSuggestionId}
                onSelect={(id) => persist({ selectedSuggestionId: id })}
                onNeedLoad={() => loadSuggestions()}
              />
            ) : null}

            {step.screenType === "customize" ? (
              <CustomizePanel
                suggestions={suggestions}
                selectedId={session.selectedSuggestionId}
                customization={session.customization}
                onChange={(customization) => persist({ customization })}
                onUpload={uploadPlan}
                fileError={errors.file}
              />
            ) : null}

            {step.screenType === "contact" ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Field label="Nom" value={contact.name} onChange={(v) => setContact({ ...contact, name: v })} />
                <Field label="Email" type="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
                <Field label="Téléphone" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
                <Field label="Société" value={contact.company} onChange={(v) => setContact({ ...contact, company: v })} />
                {errors.submit ? <p className="sm:col-span-2 text-sm text-red-600">{errors.submit}</p> : null}
              </div>
            ) : null}

            <div className="mt-10 flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={session.currentStep === 0}
                className="text-sm text-slate-500 disabled:opacity-40"
              >
                Retour
              </button>
              {step.screenType === "contact" ? (
                <button
                  type="button"
                  onClick={submit}
                  disabled={busy}
                  className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {busy ? "Envoi…" : "Envoyer ma demande"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Continuer
                </button>
              )}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-amber-500/30 focus:ring-4"
      />
    </label>
  );
}

function QuestionField({
  question,
  value,
  error,
  onChange,
}: {
  question: WizardQuestion;
  value: unknown;
  error?: string;
  onChange: (value: Answers[string]) => void;
}) {
  const choices = question.options.choices ?? [];

  if (question.type === "visual_choice") {
    return (
      <div>
        <p className="text-sm font-medium">{question.label}</p>
        {question.helpText ? <p className="mt-1 text-sm text-slate-500">{question.helpText}</p> : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {choices.map((choice) => {
            const selected = value === choice.value;
            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => onChange(choice.value)}
                className={`rounded-xl border p-4 text-left transition ${
                  selected ? "border-amber-500 bg-amber-50 ring-4 ring-amber-500/15" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="font-medium">{choice.label}</p>
                {choice.description ? <p className="mt-1 text-sm text-slate-500">{choice.description}</p> : null}
              </button>
            );
          })}
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  if (question.type === "multi_select") {
    const selected = Array.isArray(value) ? value.map(String) : [];
    return (
      <div>
        <p className="text-sm font-medium">{question.label}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {choices.map((choice) => {
            const on = selected.includes(choice.value);
            return (
              <button
                key={choice.value}
                type="button"
                onClick={() =>
                  onChange(on ? selected.filter((v) => v !== choice.value) : [...selected, choice.value])
                }
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  on ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white"
                }`}
              >
                {choice.label}
              </button>
            );
          })}
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  if (question.type === "select") {
    return (
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">{question.label}</span>
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
        >
          <option value="">Choisir…</option>
          {choices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </label>
    );
  }

  if (question.type === "number") {
    return (
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">{question.label}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={question.options.min}
            max={question.options.max}
            step={question.options.step}
            placeholder={question.options.placeholder}
            value={typeof value === "number" || typeof value === "string" ? String(value) : ""}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
          />
          {question.options.unit ? <span className="text-slate-500">{question.options.unit}</span> : null}
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </label>
    );
  }

  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{question.label}</span>
      <input
        value={typeof value === "string" ? value : ""}
        placeholder={question.options.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </label>
  );
}

function SuggestionsPanel({
  suggestions,
  selectedId,
  onSelect,
  onNeedLoad,
}: {
  suggestions: Suggestion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNeedLoad: () => void;
}) {
  useEffect(() => {
    if (!suggestions.length) onNeedLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!suggestions.length) {
    return <p className="mt-8 text-slate-500">Calcul des configurations…</p>;
  }

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {suggestions.map((s) => {
        const selected = selectedId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`rounded-xl border p-5 text-left ${
              selected ? "border-amber-500 bg-amber-50 ring-4 ring-amber-500/15" : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-amber-700">Recommandé</p>
            <h3 className="mt-1 text-lg font-semibold">{s.headline ?? s.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{s.description}</p>
            <p className="mt-4 text-sm font-medium">{formatPrice(s.priceMin, s.priceMax)}</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-500">
              {s.products.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}

function CustomizePanel({
  suggestions,
  selectedId,
  customization,
  onChange,
  onUpload,
  fileError,
}: {
  suggestions: Suggestion[];
  selectedId: string | null;
  customization: Customization;
  onChange: (c: Customization) => void;
  onUpload: (file: File) => void;
  fileError?: string;
}) {
  const selected = suggestions.find((s) => s.id === selectedId) ?? suggestions[0];
  const products = selected?.products ?? [];

  return (
    <div className="mt-8 space-y-6">
      {products.map((product) => (
        <div key={product.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-slate-500">{formatPrice(product.priceMin, product.priceMax)}</p>
            </div>
            <label className="text-sm">
              Qté
              <input
                type="number"
                min={1}
                className="ml-2 w-20 rounded-lg border border-slate-200 px-2 py-1"
                value={customization.quantities[product.id] ?? 1}
                onChange={(e) =>
                  onChange({
                    ...customization,
                    quantities: {
                      ...customization.quantities,
                      [product.id]: Number(e.target.value) || 1,
                    },
                  })
                }
              />
            </label>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {product.options.map((opt) => (
              <label key={opt.key} className="text-sm">
                <span className="mb-1 block text-slate-600">{opt.label}</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
                  value={customization.options[product.id]?.[opt.key] ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...customization,
                      options: {
                        ...customization.options,
                        [product.id]: {
                          ...(customization.options[product.id] ?? {}),
                          [opt.key]: e.target.value,
                        },
                      },
                    })
                  }
                >
                  <option value="">Standard</option>
                  {opt.values.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      ))}
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Plan (PDF ou image)</span>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        {fileError ? <p className="mt-2 text-red-600">{fileError}</p> : null}
      </label>
    </div>
  );
}

function ChatPanel({
  messages,
  value,
  onChange,
  onSend,
  busy,
  error,
}: {
  messages: { role: "user" | "assistant"; content: string }[];
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  error?: string;
}) {
  return (
    <section className="mx-auto max-w-2xl">
      <div className="min-h-[22rem] space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        {messages.length === 0 ? (
          <p className="text-slate-500">
            Décrivez votre projet en une phrase — par exemple « j’ai un entrepôt de 600 m², palettes jusqu’à 800 kg ».
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "ml-auto bg-slate-950 text-white" : "bg-slate-100 text-slate-800"
              }`}
            >
              {m.content}
            </div>
          ))
        )}
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Votre besoin…"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {busy ? "…" : "Envoyer"}
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
