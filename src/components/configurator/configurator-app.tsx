"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { parseAttribution, type Attribution } from "@/lib/stats/attribution";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import { parseStorefrontCart, type StorefrontCartLine } from "@/lib/integrations/storefront";
import { applyStorefrontCart, suggestionFromProducts } from "@/lib/wizard/storefront-cart";
import { applyFunnelPrefill } from "@/lib/configurator/prefill";
import { CatalogBrowse } from "@/components/configurator/catalog-browse";
import { RfqForm } from "@/components/configurator/rfq-form";
import { ProductHtml } from "@/components/catalog/product-html";
import { ProductSheetLinks } from "@/components/catalog/product-sheet";
import { QuoteProductMedia } from "@/components/catalog/quote-media";
import { QuoteSpecSheets, SpecChips, SpecTable } from "@/components/catalog/spec-table";
import { quoteLineCount } from "@/lib/funnels/kind";
import {
  resolveConfiguratorTheme,
  type ConfiguratorThemeOverride,
} from "@/lib/configurator/theme";
import { shopConfiguratorApiPath, shopSuggestionsApiPath } from "@/lib/shops/catalog-scope";
import { isCatalogQuoteMode, isRfqQuoteMode, matchCatalogPrefill, scopeQuoteCatalog } from "@/lib/quotes/quote-mode";
import type {
  Answers,
  ConfiguratorDefinition,
  ContactDraft,
  Customization,
  Product,
  QuoteSession,
  Suggestion,
  WizardQuestion,
} from "@/lib/wizard/types";

export type { ConfiguratorThemeOverride };

type Props = {
  orgSlug: string;
  configuratorSlug: string;
  shopSlug?: string;
  /** Shop-linked catalog id. When set, definition/session must match this catalog. */
  shopConfiguratorId?: string;
  embedded?: boolean;
  themeOverride?: ConfiguratorThemeOverride;
  productPrefill?: string;
  /** Native shop list (or WP widget). Applied when the form actually starts. */
  initialCart?: StorefrontCartLine[];
};

const SESSION_KEY = (org: string, slug: string, shopSlug?: string) =>
  shopSlug ? `qb-session:${org}:shop:${shopSlug}` : `qb-session:${org}:${slug}`;

function definitionUrl(
  orgSlug: string,
  configuratorSlug: string,
  shopSlug?: string,
  shopConfiguratorId?: string,
) {
  if (shopSlug) return shopConfiguratorApiPath(orgSlug, shopSlug, shopConfiguratorId);
  return `/api/public/configurator/${orgSlug}/${configuratorSlug}`;
}

function suggestionsUrl(sessionId: string, orgSlug: string, shopSlug?: string) {
  if (!shopSlug) return `/api/public/sessions/${sessionId}/suggestions`;
  return shopSuggestionsApiPath(sessionId, orgSlug, shopSlug);
}

async function api<T>(url: string, init?: RequestInit & { token?: string }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("content-type", headers.get("content-type") ?? "application/json");
  if (init?.token) headers.set("x-session-token", init.token);
  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur");
  return data as T;
}

function pushGa(measurementId: string | null | undefined, event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...params });
  if (measurementId && w.gtag) w.gtag("event", event, params);
}

function visitorId() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("qb_vid")?.trim();
  if (fromQuery) {
    try {
      localStorage.setItem("qb-vid", fromQuery);
    } catch {
      /* ignore */
    }
    return fromQuery;
  }
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
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return parseAttribution({
    search: params,
    referrer: params.get("qb_ref") || document.referrer || null,
    landingPath: params.get("qb_landing") || window.location.pathname + window.location.search,
    visitorId: visitorId(),
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
    gclid: attr.gclid ?? undefined,
    gbraid: attr.gbraid ?? undefined,
    wbraid: attr.wbraid ?? undefined,
  };
}

async function trackPageView(
  orgSlug: string,
  configuratorSlug: string,
  attr: Attribution,
  shopSlug?: string,
  sessionId?: string,
) {
  await fetch("/api/public/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      orgSlug,
      configuratorSlug,
      shopSlug,
      sessionId,
      eventType: ANALYTICS_EVENTS.pageView,
      ...attributionBody(attr),
      search: typeof window !== "undefined" ? window.location.search : "",
      title:
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("qb_page") || undefined
          : undefined,
    }),
  }).catch(() => undefined);
}

async function track(
  session: QuoteSession | null,
  eventType: string,
  step?: number,
  extra?: Record<string, unknown>,
) {
  if (!session) return;
  await fetch(`/api/public/sessions/${session.id}/events`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-session-token": session.token },
    body: JSON.stringify({
      eventType,
      step,
      visitorId: visitorId(),
      payload: {
        path: typeof window !== "undefined" ? window.location.pathname + window.location.search : null,
        ...extra,
      },
    }),
  }).catch(() => undefined);
}

export function ConfiguratorApp({
  orgSlug,
  configuratorSlug,
  shopSlug,
  shopConfiguratorId,
  embedded,
  themeOverride,
  productPrefill,
  initialCart,
}: Props) {
  const [definition, setDefinition] = useState<ConfiguratorDefinition | null>(null);
  const [session, setSession] = useState<QuoteSession | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ score?: number; label?: string } | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", company: "", consentMarketing: false });
  const [need, setNeed] = useState("");

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
          definitionUrl(orgSlug, configuratorSlug, shopSlug, shopConfiguratorId),
        );
        if (cancelled) return;
        if (
          (shopConfiguratorId && def.configurator.id !== shopConfiguratorId) ||
          (shopSlug && def.configurator.slug !== configuratorSlug)
        ) {
          throw new Error("Ce catalogue n’appartient pas à cette boutique");
        }
        setDefinition(def);
        const stored = localStorage.getItem(SESSION_KEY(orgSlug, configuratorSlug, shopSlug));
        const attr = readAttribution();
        const fromWidget = new URLSearchParams(window.location.search).has("qb_vid");
        let next: QuoteSession | null = null;
        if (stored) {
          const parsed = JSON.parse(stored) as { id: string; token: string };
          next = await api<QuoteSession>(`/api/public/sessions/${parsed.id}`, {
            token: parsed.token,
          }).catch(() => null);
          if (next && shopSlug && next.configuratorId && next.configuratorId !== def.configurator.id) {
            next = null;
          }
        }
        if (!embedded || !fromWidget) {
          await trackPageView(orgSlug, configuratorSlug, attr, shopSlug, next?.id);
        }
        if (!next) {
          next = await api<QuoteSession>("/api/public/sessions", {
            method: "POST",
            body: JSON.stringify({
              orgSlug,
              configuratorSlug,
              configuratorId: shopConfiguratorId,
              shopSlug,
              ...attributionBody(attr),
            }),
          });
        } else {
          await api<QuoteSession>(`/api/public/sessions/${next.id}`, {
            method: "PATCH",
            token: next.token,
            body: JSON.stringify({ attribution: attr }),
          }).catch(() => null);
        }
        if (cancelled || !next) return;
        let sessionNext = next;
        const scoped = scopeQuoteCatalog(
          def.products.filter((product): product is typeof product & { configuratorId: string } =>
            Boolean(product.configuratorId),
          ),
          { shopSlug, shopConfiguratorId: shopConfiguratorId ?? def.configurator.id },
        );
        const catalog = shopSlug && scoped.length ? scoped : def.products;
        const cartFromUrl = parseStorefrontCart(new URLSearchParams(window.location.search).get("qb_cart"));
        const cart = cartFromUrl.length ? cartFromUrl : (initialCart ?? []);
        if (cart.length) {
          const applied = applyStorefrontCart(catalog, cart, sessionNext.customization);
          const customizeIndex = def.steps.findIndex((stepDef) => stepDef.screenType === "customize");
          const patched = await api<QuoteSession>(`/api/public/sessions/${sessionNext.id}`, {
            method: "PATCH",
            token: sessionNext.token,
            body: JSON.stringify({
              customization: applied.customization,
              currentStep: customizeIndex >= 0 ? customizeIndex : sessionNext.currentStep,
            }),
          }).catch(() => null);
          sessionNext = patched ?? { ...sessionNext, customization: applied.customization };
          const seeded = suggestionFromProducts(applied.matched);
          if (seeded) setSuggestions([seeded]);
        }
        if (productPrefill) {
          const match = matchCatalogPrefill(catalog, productPrefill);
          if (match && !(sessionNext.customization.quantities[match.id] > 0)) {
            const seeded = {
              ...sessionNext.customization,
              quantities: { ...sessionNext.customization.quantities, [match.id]: 1 },
            };
            const patched = await api<QuoteSession>(`/api/public/sessions/${sessionNext.id}`, {
              method: "PATCH",
              token: sessionNext.token,
              body: JSON.stringify({ customization: seeded }),
            }).catch(() => null);
            sessionNext = patched ?? { ...sessionNext, customization: seeded };
          }
        }
        if (!sessionNext.submittedQuoteId) {
          const prefilled = applyFunnelPrefill({
            search: window.location.search,
            steps: def.steps,
            products: catalog,
            answers: sessionNext.answers,
            customization: sessionNext.customization,
          });
          if (prefilled.changed) {
            const currentStep = prefilled.focusStep ?? sessionNext.currentStep;
            const patched = await api<QuoteSession>(`/api/public/sessions/${sessionNext.id}`, {
              method: "PATCH",
              token: sessionNext.token,
              body: JSON.stringify({
                answers: prefilled.answers,
                customization: prefilled.customization,
                currentStep,
              }),
            }).catch(() => null);
            sessionNext = patched ?? {
              ...sessionNext,
              answers: prefilled.answers,
              customization: prefilled.customization,
              currentStep,
            };
          }
        }
        if (
          sessionNext.configuratorId &&
          ((shopConfiguratorId && sessionNext.configuratorId !== shopConfiguratorId) ||
            sessionNext.configuratorId !== def.configurator.id)
        ) {
          throw new Error("Ce catalogue n’appartient pas à cette boutique");
        }
        localStorage.setItem(
          SESSION_KEY(orgSlug, configuratorSlug, shopSlug),
          JSON.stringify({ id: sessionNext.id, token: sessionNext.token }),
        );
        setSession(sessionNext);
        if (sessionNext.contactDraft) {
          setContact((c) => ({
            name: sessionNext.contactDraft.name || c.name,
            email: sessionNext.contactDraft.email || c.email,
            phone: sessionNext.contactDraft.phone || c.phone,
            company: sessionNext.contactDraft.company || c.company,
            consentMarketing: c.consentMarketing,
          }));
        }
        const savedNeed = String(sessionNext.answers?.need ?? sessionNext.answers?.besoin ?? "");
        if (savedNeed) setNeed(savedNeed);
        if (sessionNext.submittedQuoteId) setDone({});
        else {
          track(sessionNext, ANALYTICS_EVENTS.started, 0);
          pushGa(def.organization.gaMeasurementId, ANALYTICS_EVENTS.started, { step: 0 });
        }
      } catch {
        if (!cancelled) setDefinition(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, configuratorSlug, shopSlug, shopConfiguratorId, embedded, productPrefill, initialCart]);

  useEffect(() => {
    const gtm = definition?.organization.gtmContainerId?.trim();
    const ga = definition?.organization.gaMeasurementId?.trim();
    if (gtm) {
      if (document.getElementById("qb-gtm")) return;
      const w = window as Window & { dataLayer?: unknown[] };
      w.dataLayer = w.dataLayer ?? [];
      w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const script = document.createElement("script");
      script.id = "qb-gtm";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtm)}`;
      document.head.appendChild(script);
      return;
    }
    if (!ga || document.getElementById("qb-ga4")) return;
    const s = document.createElement("script");
    s.id = "qb-ga4";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`;
    document.head.appendChild(s);
    const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = (...args: unknown[]) => {
      w.dataLayer!.push(args);
    };
    w.gtag("js", new Date());
    w.gtag("config", ga);
  }, [definition?.organization.gtmContainerId, definition?.organization.gaMeasurementId]);

  useEffect(() => {
    if (!session || done) return;
    const onHide = () => {
      if (document.visibilityState === "hidden" && !done) {
        track(session, ANALYTICS_EVENTS.abandoned, session.currentStep);
        pushGa(definition?.organization.gaMeasurementId, ANALYTICS_EVENTS.abandoned, {
          step: session.currentStep,
        });
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [session, done, definition?.organization.gaMeasurementId]);

  useEffect(() => {
    if (!session || done || step?.screenType !== "contact") return;
    track(session, ANALYTICS_EVENTS.completed, session.currentStep);
    pushGa(definition?.organization.gaMeasurementId, ANALYTICS_EVENTS.completed, {
      step: session.currentStep,
    });
  }, [session?.id, step?.screenType, done, definition?.organization.gaMeasurementId]);

  async function persist(patch: Partial<QuoteSession>, wait = false) {
    if (!session) return session;
    const optimistic = { ...session, ...patch };
    setSession(optimistic);
    const req = api<QuoteSession>(`/api/public/sessions/${session.id}`, {
      method: "PATCH",
      token: session.token,
      body: JSON.stringify(patch),
    }).then((next) => {
      setSession(next);
      return next;
    });
    if (wait) {
      try {
        return await req;
      } catch (error) {
        setSession(session);
        throw error;
      }
    }
    void req.catch(() => setSession(session));
    return optimistic;
  }

  async function loadSuggestions(current = session) {
    if (!current) return;
    const data = await api<{ suggestions: Suggestion[] }>(
      suggestionsUrl(current.id, orgSlug, shopSlug),
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
      const needsSuggestions = definition.steps[nextStep]?.screenType === "suggestions";
      const next = await persist({ answers: nextAnswers, currentStep: nextStep }, needsSuggestions);
      track(session, `quotebuilder_step_${nextStep}`, nextStep, {
        title: definition.steps[nextStep]?.title,
      });
      pushGa(definition.organization.gaMeasurementId, `quotebuilder_step_${nextStep}`, { step: nextStep });
      if (needsSuggestions) {
        await loadSuggestions(next ?? undefined);
      }
      return;
    }
    if (step.screenType === "suggestions") {
      if (isCatalogQuoteMode(definition.configurator.quoteMode)) {
        if (quoteLineCount(session.customization) < 1) {
          setErrors({ catalog: "Ajoutez au moins un produit au devis." });
          return;
        }
        await persist({ currentStep: Math.min(session.currentStep + 1, definition.steps.length - 1) });
        return;
      }
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
      const data = await api<{
        session: QuoteSession;
        message: string;
        goSuggestions?: boolean;
        goContact?: boolean;
      }>(
        `/api/public/sessions/${session.id}/chat`,
        {
          method: "POST",
          token: session.token,
          body: JSON.stringify({ message: chatInput.trim() }),
        },
      );
      setChatInput("");
      setSession(data.session);
      if (data.session.contactDraft?.name || data.session.contactDraft?.email) {
        setContact((c) => ({
          ...c,
          name: data.session.contactDraft.name || c.name,
          email: data.session.contactDraft.email || c.email,
          phone: data.session.contactDraft.phone || c.phone,
          company: data.session.contactDraft.company || c.company,
        }));
      }
      if (data.session.currentStep !== session.currentStep || data.goSuggestions) {
        await loadSuggestions(data.session);
      }
    } catch (error) {
      setErrors({ chat: error instanceof Error ? error.message : "Chat indisponible" });
    } finally {
      setBusy(false);
    }
  }

  async function submitRfq() {
    if (!session) return;
    const nextErrors: Record<string, string> = {};
    if (!need.trim()) nextErrors.need = "Décrivez le besoin";
    if (!contact.name.trim()) nextErrors.name = "Champ requis";
    if (!contact.email.trim()) nextErrors.email = "Champ requis";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setBusy(true);
    try {
      await persist(
        {
          answers: { ...session.answers, need: need.trim(), quote_mode: "rfq" },
          contactDraft: {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
          },
        },
        true,
      );
      await submit();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Soumission impossible" });
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
          body: JSON.stringify({
            name: contact.name || session.contactDraft.name || "",
            email: contact.email || session.contactDraft.email || "",
            phone: contact.phone || session.contactDraft.phone || "",
            company: contact.company || session.contactDraft.company || "",
            consentMarketing: Boolean(contact.consentMarketing),
          }),
        },
      );
      setDone(result);
      track(session, ANALYTICS_EVENTS.submitted, session.currentStep);
      pushGa(definition?.organization.gaMeasurementId, ANALYTICS_EVENTS.submitted);
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
    return (
      <div className="flex min-h-[28rem] items-center justify-center">
        <div className="flex items-center gap-2.5 text-sm text-mk-faint">
          <span className="h-2 w-2 animate-pulse rounded-full bg-mk-accent" />
          Chargement…
        </div>
      </div>
    );
  }
  if (!definition) {
    return (
      <div className="p-8 text-center text-mk-faint">
        {shopSlug ? "Catalogue de cette boutique introuvable." : "Configurateur introuvable."}
      </div>
    );
  }
  if (!session) {
    return <div className="p-8 text-center text-mk-faint">Impossible de démarrer la session.</div>;
  }

  const theme = resolveConfiguratorTheme(definition.configurator.theme.accent, themeOverride);
  const accent = theme.accent;
  const isRfq = isRfqQuoteMode(definition.configurator.quoteMode);
  const rfqProducts = scopeQuoteCatalog(
    definition.products.map((product) => ({
      ...product,
      configuratorId: product.configuratorId ?? definition.configurator.id,
    })),
    { shopSlug, shopConfiguratorId: shopConfiguratorId ?? definition.configurator.id },
  );
  const isCatalog = isCatalogQuoteMode(definition.configurator.quoteMode);
  const chatOnly =
    definition.configurator.chatEnabled && !definition.configurator.wizardEnabled && !isCatalog;
  const showChat =
    definition.configurator.chatEnabled &&
    !isCatalog &&
    (session.mode === "chat" || chatOnly);
  const showWizard =
    session.mode === "wizard" && definition.configurator.wizardEnabled && !chatOnly;
  const canSwitch =
    !isCatalog && definition.configurator.wizardEnabled && definition.configurator.chatEnabled && !done;
  const showChatSuggestions =
    showChat &&
    suggestions.length > 0 &&
    (session.currentStep === definition.steps.findIndex((s) => s.screenType === "suggestions") ||
      Boolean(session.selectedSuggestionId));
  const catalogBrowse = isCatalog && step?.screenType === "suggestions";

  if (done) {
    return (
      <div className={`mx-auto max-w-xl px-6 py-20 text-center ${embedded ? "" : ""}`}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-mk-accent">Demande envoyée</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-mk-ink">Merci, {contact.name || "nous avons bien reçu votre brief"}.</h1>
        <p className="mt-3 text-mk-faint">
          Un récapitulatif PDF vous est envoyé. L’équipe {definition.organization.name} vous recontacte sous 24h.
        </p>
        {done.label ? (
          <p className="mt-6 text-sm text-mk-faint">Référence interne · qualification {done.label}</p>
        ) : null}
      </div>
    );
  }

  if (isRfq) {
    return (
      <div className={theme.themed ? "min-h-full" : "min-h-full bg-mk-bg"} style={theme.style}>
        <RfqForm
          orgName={definition.organization.name}
          shopName={embedded ? undefined : definition.configurator.name}
          products={rfqProducts}
          customization={session.customization}
          contact={contact}
          need={need}
          accent={accent}
          themed={theme.themed}
          embedded={embedded}
          busy={busy}
          errors={errors}
          onNeedChange={setNeed}
          onContactChange={(patch) => setContact((current) => ({ ...current, ...patch }))}
          onCatalogChange={(customization) => void persist({ customization })}
          onSubmit={() => void submitRfq()}
        />
      </div>
    );
  }

  return (
    <div className={theme.themed ? "min-h-full" : "min-h-full bg-mk-bg"} style={theme.style}>
      <header
        className={
          theme.themed
            ? "border-b border-black/10"
            : "border-b border-white/5 bg-mk-dark text-white"
        }
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <p
              className={
                theme.themed
                  ? "text-[11px] font-semibold uppercase tracking-[0.16em]"
                  : "text-[11px] font-semibold uppercase tracking-[0.16em] text-mk-accent"
              }
              style={theme.themed ? { color: accent } : undefined}
            >
              {definition.organization.name}
            </p>
            <p className="mt-0.5 text-lg font-medium tracking-tight">{definition.configurator.name}</p>
          </div>
          {isCatalog && !done ? (
            <p className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${theme.themed ? "bg-black/5" : "bg-white/10"}`}>
              {quoteLineCount(session.customization)} au devis
            </p>
          ) : null}
          {canSwitch ? (
            <div className={`flex rounded-full p-1 text-sm ${theme.themed ? "bg-black/5" : "bg-white/10"}`}>
              <button
                type="button"
                onClick={() => switchMode("wizard")}
                className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                  session.mode === "wizard"
                    ? theme.themed
                      ? "text-white"
                      : "bg-white text-mk-ink shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
                style={theme.themed && session.mode === "wizard" ? { background: accent } : undefined}
              >
                Funnel
              </button>
              <button
                type="button"
                onClick={() => switchMode("chat")}
                className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                  session.mode === "chat"
                    ? theme.themed
                      ? "text-white"
                      : "bg-white text-mk-ink shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
                style={theme.themed && session.mode === "chat" ? { background: accent } : undefined}
              >
                Chat IA
              </button>
            </div>
          ) : null}
        </div>
        {showWizard ? (
          <div className="mx-auto max-w-5xl px-5 pb-5">
            <div className="flex gap-1.5">
              {definition.steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1.5 flex-1 overflow-hidden rounded-full ${theme.themed ? "bg-black/10" : "bg-white/10"}`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: i < session.currentStep ? "100%" : i === session.currentStep ? "55%" : "0%",
                      background: accent,
                    }}
                  />
                </div>
              ))}
            </div>
            <p className={theme.themed ? "mt-2.5 text-xs opacity-70" : "mt-2.5 text-xs font-medium text-white/50"}>
              Étape {(session.currentStep ?? 0) + 1} / {definition.steps.length} · {step?.title}
            </p>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        {session.currentStep >= 1 && !session.submittedQuoteId ? (
          <ContactCapture
            draft={session.contactDraft}
            firstName={contact.name}
            accent={accent}
            themed={theme.themed}
            onSave={async (draft) => {
              const firstEmail = Boolean(draft.email && !session.contactDraft.email);
              setContact((c) => ({ ...c, ...draft }));
              await persist({ contactDraft: { ...session.contactDraft, ...draft } }, true);
              if (firstEmail) {
                track(session, ANALYTICS_EVENTS.email, session.currentStep);
                pushGa(definition?.organization.gaMeasurementId, ANALYTICS_EVENTS.email);
              }
            }}
          />
        ) : null}
        {showChat ? (
          <div className="space-y-6">
            <ChatPanel
              messages={session.chatMessages}
              value={chatInput}
              onChange={setChatInput}
              onSend={sendChat}
              busy={busy}
              error={errors.chat}
              orgName={definition.organization.name}
              accent={accent}
              themed={theme.themed}
            />
            {showChatSuggestions ? (
              <SuggestionsPanel
                suggestions={suggestions}
                selectedId={session.selectedSuggestionId}
                onSelect={(id) => persist({ selectedSuggestionId: id })}
                onNeedLoad={() => loadSuggestions()}
              />
            ) : null}
          </div>
        ) : null}

        {showWizard && step ? (
          <section>
            <h1 className="text-3xl font-semibold tracking-tight text-mk-ink">{step.title}</h1>
            {step.subtitle ? <p className="mt-2.5 text-mk-faint">{step.subtitle}</p> : null}
            {step.screenType !== "customize" ? (
              <QuoteSpecSheets
                products={definition.products.filter(
                  (product) => (session.customization.quantities[product.id] ?? 0) > 0,
                )}
              />
            ) : null}

            {step.screenType === "questions" ? (
              <div className="mt-9 space-y-7">
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

            {step.screenType === "suggestions" && isCatalog ? (
              <CatalogBrowse
                products={definition.products}
                customization={session.customization}
                accent={accent}
                themed={theme.themed}
                error={errors.catalog}
                onChange={(customization) => persist({ customization })}
                onContinue={() => void goNext()}
              />
            ) : null}

            {step.screenType === "suggestions" && !isCatalog ? (
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
                catalog={definition.products}
                selectedId={session.selectedSuggestionId}
                customization={session.customization}
                canRemove={isCatalog}
                onChange={(customization) => persist({ customization })}
                onUpload={uploadPlan}
                fileError={errors.file}
              />
            ) : null}

            {step.screenType === "contact" ? (
              <div className="mt-9 grid gap-5 sm:grid-cols-2">
                <Field label="Nom" value={contact.name} onChange={(v) => setContact({ ...contact, name: v })} />
                <Field label="Email" type="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
                <Field label="Téléphone" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
                <Field label="Société" value={contact.company} onChange={(v) => setContact({ ...contact, company: v })} />
                <label className="sm:col-span-2 flex items-start gap-2.5 text-sm text-mk-faint">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={Boolean(contact.consentMarketing)}
                    onChange={(e) => setContact({ ...contact, consentMarketing: e.target.checked })}
                  />
                  <span>
                    J’accepte d’être recontacté par email pour des offres liées à ma demande (consentement marketing,
                    facultatif). Vos données sont traitées pour établir ce devis.
                  </span>
                </label>
                {errors.submit ? <p className="sm:col-span-2 text-sm text-red-600">{errors.submit}</p> : null}
              </div>
            ) : null}

            {catalogBrowse ? null : (
            <div className="mt-12 flex items-center justify-between border-t border-mk-border pt-6">
              <button
                type="button"
                onClick={goBack}
                disabled={session.currentStep === 0}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-mk-faint transition hover:bg-mk-bg hover:text-mk-ink disabled:pointer-events-none disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Retour
              </button>
              {step.screenType === "contact" ? (
                <button
                  type="button"
                  onClick={submit}
                  disabled={busy}
                  className={
                    theme.themed
                      ? "rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                      : "rounded-full bg-mk-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-mk-accent-hover disabled:opacity-50"
                  }
                  style={theme.themed ? { background: accent } : undefined}
                >
                  {busy ? "Envoi…" : isCatalog ? "Envoyer ma demande de devis" : "Envoyer ma demande"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className={
                    theme.themed
                      ? "rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                      : "rounded-full bg-mk-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-mk-accent-hover"
                  }
                  style={theme.themed ? { background: accent } : undefined}
                >
                  {isCatalog && step.screenType === "customize" ? "Demander un devis" : "Continuer"}
                </button>
              )}
            </div>
            )}
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
      <span className="mb-1.5 block font-medium text-mk-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-mk-border bg-white px-3.5 py-2.5 text-mk-ink outline-none transition focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
      />
    </label>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
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
        <p className="text-sm font-semibold text-mk-ink">{question.label}</p>
        {question.helpText ? <p className="mt-1 text-sm text-mk-faint">{question.helpText}</p> : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {choices.map((choice) => {
            const selected = value === choice.value;
            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => onChange(choice.value)}
                className={`relative rounded-2xl border p-4 text-left shadow-sm transition-all duration-150 ${
                  selected
                    ? "border-mk-accent bg-mk-accent-soft ring-2 ring-mk-accent/20"
                    : "border-mk-border bg-white hover:-translate-y-0.5 hover:border-mk-ink/20 hover:shadow-md"
                }`}
              >
                {selected ? (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-mk-accent text-white">
                    <CheckIcon />
                  </span>
                ) : null}
                <p className="pr-6 font-medium text-mk-ink">{choice.label}</p>
                {choice.description ? <p className="mt-1 text-sm text-mk-faint">{choice.description}</p> : null}
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
        <p className="text-sm font-semibold text-mk-ink">{question.label}</p>
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
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-all duration-150 ${
                  on
                    ? "border-mk-accent bg-mk-accent-soft text-mk-accent ring-2 ring-mk-accent/15"
                    : "border-mk-border bg-white text-mk-ink hover:border-mk-ink/25 hover:-translate-y-0.5"
                }`}
              >
                {on ? <CheckIcon className="-ml-0.5" /> : null}
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
        <span className="mb-1.5 block font-semibold text-mk-ink">{question.label}</span>
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-mk-border bg-white px-3.5 py-2.5 text-mk-ink outline-none transition focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
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
        <span className="mb-1.5 block font-semibold text-mk-ink">{question.label}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={question.options.min}
            max={question.options.max}
            step={question.options.step}
            placeholder={question.options.placeholder}
            value={typeof value === "number" || typeof value === "string" ? String(value) : ""}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            className="w-full rounded-xl border border-mk-border bg-white px-3.5 py-2.5 text-mk-ink outline-none transition focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
          />
          {question.options.unit ? <span className="text-mk-faint">{question.options.unit}</span> : null}
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </label>
    );
  }

  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-semibold text-mk-ink">{question.label}</span>
      <input
        value={typeof value === "string" ? value : ""}
        placeholder={question.options.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-mk-border bg-white px-3.5 py-2.5 text-mk-ink outline-none transition focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
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
    return (
      <div className="mt-8 flex items-center gap-2.5 text-sm text-mk-faint">
        <span className="h-2 w-2 animate-pulse rounded-full bg-mk-accent" />
        Calcul des configurations…
      </div>
    );
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
            className={`rounded-2xl border p-5 text-left shadow-sm transition-all duration-150 ${
              selected
                ? "border-mk-accent bg-mk-accent-soft ring-2 ring-mk-accent/20"
                : "border-mk-border bg-white hover:-translate-y-0.5 hover:shadow-md"
            }`}
          >
            <span className="inline-flex rounded-full bg-mk-accent-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-mk-accent">
              Recommandé
            </span>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-mk-ink">{s.headline ?? s.name}</h3>
            <p className="mt-2 text-sm text-mk-faint">{s.description}</p>
            <p className="mt-4 text-sm font-semibold text-mk-ink">{formatPrice(s.priceMin, s.priceMax)}</p>
            <ul className="mt-3 space-y-2 text-sm text-mk-faint">
              {s.products.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-mk-border"
                    />
                  ) : null}
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                </li>
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
  catalog,
  selectedId,
  customization,
  canRemove,
  onChange,
  onUpload,
  fileError,
}: {
  suggestions: Suggestion[];
  catalog: Product[];
  selectedId: string | null;
  customization: Customization;
  canRemove?: boolean;
  onChange: (c: Customization) => void;
  onUpload: (file: File) => void;
  fileError?: string;
}) {
  const selected = suggestions.find((s) => s.id === selectedId) ?? suggestions[0];
  const fromSuggestion = selected?.products ?? [];
  const fromCart = catalog.filter(
    (product) => (customization.quantities[product.id] ?? 0) > 0 && !fromSuggestion.some((p) => p.id === product.id),
  );
  const products = [...fromSuggestion, ...fromCart];
  const extraLines = customization.storefrontLines ?? [];

  return (
    <div className="mt-8 space-y-4">
      {products.map((product) => (
        <div key={product.id} className="rounded-2xl border border-mk-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <QuoteProductMedia name={product.name} images={product.images} imageUrl={product.imageUrl} compact />
              <div className="min-w-0">
                <p className="font-medium text-mk-ink">{product.name}</p>
                <p className="text-sm text-mk-faint">{formatPrice(product.priceMin, product.priceMax)}</p>
                <div className="mt-2">
                  <SpecChips specs={product.specs} />
                  <ProductSheetLinks sheet={product.sheet} compact />
                </div>
                {product.description ? (
                  <ProductHtml html={product.description} className="mt-1 text-mk-faint" clamp />
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
            <label className="text-sm text-mk-faint">
              Qté
              <input
                type="number"
                min={1}
                className="ml-2 w-20 rounded-xl border border-mk-border px-2 py-1.5 text-mk-ink outline-none focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
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
            {canRemove ? (
              <button
                type="button"
                onClick={() => {
                  const quantities = { ...customization.quantities };
                  delete quantities[product.id];
                  const options = { ...customization.options };
                  delete options[product.id];
                  onChange({ ...customization, quantities, options });
                }}
                className="text-xs font-medium text-mk-faint transition hover:text-rose-600"
              >
                Retirer
              </button>
            ) : null}
            </div>
          </div>
          <SpecTable specs={product.specs} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {product.options.map((opt) => (
              <label key={opt.key} className="text-sm">
                <span className="mb-1 block text-mk-faint">{opt.label}</span>
                <select
                  className="w-full rounded-xl border border-mk-border px-2.5 py-2 text-mk-ink outline-none focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
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
      {extraLines.map((line) => (
        <div key={line.externalId} className="rounded-2xl border border-dashed border-mk-border bg-white p-5">
          <p className="font-medium text-mk-ink">{line.name}</p>
          {line.variation ? <p className="mt-1 text-sm text-mk-faint">{line.variation}</p> : null}
          <p className="mt-2 text-sm text-mk-faint">Quantité {line.quantity}</p>
        </div>
      ))}
      {!products.length && !extraLines.length ? (
        <p className="text-sm text-mk-faint">Aucun produit dans cette demande pour l’instant.</p>
      ) : null}
      <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-mk-border bg-white px-5 py-4 text-center text-sm transition hover:border-mk-accent">
        <span className="block font-medium text-mk-ink">Plan (PDF ou image)</span>
        <span className="mt-1 block text-mk-faint">Glissez un fichier ou cliquez pour choisir</span>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        {fileError ? <span className="mt-2 block text-red-600">{fileError}</span> : null}
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
  orgName,
  accent,
  themed,
}: {
  messages: { role: "user" | "assistant"; content: string }[];
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  error?: string;
  orgName: string;
  accent: string;
  themed: boolean;
}) {
  return (
    <section className="mx-auto max-w-2xl">
      <div className="min-h-[22rem] space-y-3 rounded-2xl border border-mk-border bg-white p-5 shadow-sm">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="font-medium text-mk-ink">
              Bonjour, décrivez-moi votre projet{orgName ? ` pour ${orgName}` : ""}.
            </p>
            <p className="text-sm text-mk-faint">
              Une phrase suffit — surface, charges, hauteur, budget, délai. L’agent consulte le
              catalogue et prépare votre brief devis.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "ml-auto bg-mk-dark text-white" : "bg-mk-bg text-mk-ink"
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
          placeholder="Décrivez votre besoin…"
          className="flex-1 rounded-full border border-mk-border bg-white px-4 py-2.5 text-mk-ink outline-none transition focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
        />
        <button
          type="submit"
          disabled={busy}
          className={
            themed
              ? "rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              : "rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-mk-accent-hover disabled:opacity-50"
          }
          style={themed ? { background: accent } : undefined}
        >
          {busy ? "…" : "Envoyer"}
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}

function ContactCapture({
  draft,
  firstName,
  onSave,
  accent,
  themed,
}: {
  draft: ContactDraft;
  firstName: string;
  onSave: (draft: ContactDraft) => Promise<void>;
  accent: string;
  themed: boolean;
}) {
  const [name, setName] = useState(draft.name ?? firstName ?? "");
  const [email, setEmail] = useState(draft.email ?? "");
  const saved = Boolean(draft.email);

  return (
    <form
      className="mb-8 rounded-2xl border border-mk-border bg-mk-accent-soft/60 px-5 py-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        await onSave({ name: name.trim(), email: email.trim() });
      }}
    >
      {saved ? (
        <p className="flex items-center gap-2 text-sm text-mk-ink">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckIcon />
          </span>
          {draft.name ? `Merci ${draft.name}, ` : "Merci, "}votre configuration est sauvegardée
          {draft.email ? ` (${draft.email})` : ""}. Vous pourrez la reprendre même si vous fermez l’onglet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-mk-ink">Prénom</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-mk-border bg-white px-3 py-2 text-mk-ink outline-none transition focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-mk-ink">Email pour recevoir le récap</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-mk-border bg-white px-3 py-2 text-mk-ink outline-none transition focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
            />
          </label>
          <button
            type="submit"
            className={
              themed
                ? "rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                : "rounded-full bg-mk-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-mk-accent-hover"
            }
            style={themed ? { background: accent } : undefined}
          >
            Sauvegarder
          </button>
        </div>
      )}
    </form>
  );
}
