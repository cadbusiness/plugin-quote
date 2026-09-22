"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { parseAttribution, type Attribution } from "@/lib/stats/attribution";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import { parseStorefrontCart, type StorefrontCartLine } from "@/lib/integrations/storefront";
import { applyStorefrontCart, suggestionFromProducts } from "@/lib/wizard/storefront-cart";
import { CatalogBrowse } from "@/components/configurator/catalog-browse";
import { RfqForm } from "@/components/configurator/rfq-form";
import { ProductHtml } from "@/components/catalog/product-html";
import { quoteLineCount } from "@/lib/funnels/kind";
import {
  FunnelBrandHeader,
  FunnelBrief,
  FunnelContinueIcon,
  FunnelCredit,
  VisualChoiceGrid,
  selectionStyle,
} from "@/components/configurator/funnel-chrome";
import {
  resolveConfiguratorTheme,
  type ConfiguratorThemeOverride,
} from "@/lib/configurator/theme";
import {
  briefLines,
  funnelDocumentTitle,
  resolveFunnelChrome,
} from "@/lib/configurator/public-funnel";
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
    if (!definition || embedded || shopSlug) return;
    document.title = funnelDocumentTitle(definition.organization.name, definition.configurator.name);
  }, [definition, embedded, shopSlug]);

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
      <div className="flex min-h-[28rem] items-center justify-center text-slate-500">
        {shopSlug ? "Chargement…" : "Chargement du devis…"}
      </div>
    );
  }
  if (!definition) {
    return (
      <div className="p-8 text-center text-slate-500">
        {shopSlug ? "Catalogue de cette boutique introuvable." : "Ce parcours de devis est introuvable."}
      </div>
    );
  }
  if (!session) {
    return <div className="p-8 text-center text-slate-500">Impossible de démarrer la session.</div>;
  }

  const theme = resolveConfiguratorTheme(definition.configurator.theme.accent, themeOverride);
  const chrome = resolveFunnelChrome(
    definition.configurator.theme,
    definition.organization.branding,
    themeOverride,
  );
  const premium = chrome.branded && !embedded && !themeOverride;
  const accent = premium ? chrome.accent : theme.accent;
  const cta = premium ? chrome.cta : accent;
  const premiumStyle = premium
    ? {
        ...chrome.style,
        fontFamily: "var(--font-funnel-display), var(--font-geist-sans), system-ui, sans-serif",
      }
    : undefined;
  const recap = premium ? briefLines(definition.steps, answers, session.currentStep) : [];
  const primaryButtonClass = premium
    ? "inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
    : theme.themed
      ? "rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      : "rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50";
  const primaryButtonStyle = premium || theme.themed ? { background: cta } : undefined;
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
    const thanks = (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p
          className={premium ? "text-sm font-semibold uppercase tracking-[0.16em]" : "text-sm font-medium uppercase tracking-wide text-amber-600"}
          style={premium ? { color: chrome.accent } : undefined}
        >
          Demande envoyée
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Merci, {contact.name || "nous avons bien reçu votre brief"}.</h1>
        <p className="mt-3" style={premium ? { color: chrome.muted } : undefined}>
          <span className={premium ? "" : "text-slate-600"}>
            Un récapitulatif vous est envoyé par email. L’équipe {definition.organization.name} vous recontacte rapidement.
          </span>
        </p>
      </div>
    );
    if (!premium) return thanks;
    return (
      <div className="min-h-full" style={premiumStyle} data-funnel="branded">
        <FunnelBrandHeader
          orgName={definition.organization.name}
          logoText={chrome.logoText}
          configuratorName={definition.configurator.name}
          phone={definition.organization.salesPhone}
          email={definition.organization.salesEmail}
          accent={chrome.accent}
          text={chrome.text}
          muted={chrome.muted}
          steps={[]}
          currentStep={0}
        />
        {thanks}
        <FunnelCredit muted={chrome.muted} />
      </div>
    );
  }

  if (isRfq) {
    return (
      <div
        className={premium || theme.themed ? "min-h-full" : "min-h-full bg-slate-50"}
        style={premium ? premiumStyle : theme.style}
        data-funnel={premium ? "branded" : undefined}
      >
        {premium ? (
          <FunnelBrandHeader
            orgName={definition.organization.name}
            logoText={chrome.logoText}
            configuratorName={definition.configurator.name}
            phone={definition.organization.salesPhone}
            email={definition.organization.salesEmail}
            accent={chrome.accent}
            text={chrome.text}
            muted={chrome.muted}
            steps={[]}
            currentStep={0}
          />
        ) : null}
        <RfqForm
          orgName={definition.organization.name}
          shopName={embedded ? undefined : definition.configurator.name}
          products={rfqProducts}
          customization={session.customization}
          contact={contact}
          need={need}
          accent={premium ? cta : accent}
          themed={premium || theme.themed}
          embedded={embedded}
          busy={busy}
          errors={errors}
          onNeedChange={setNeed}
          onContactChange={(patch) => setContact((current) => ({ ...current, ...patch }))}
          onCatalogChange={(customization) => void persist({ customization })}
          onSubmit={() => void submitRfq()}
        />
        {premium ? <FunnelCredit muted={chrome.muted} /> : null}
      </div>
    );
  }

  return (
    <div
      className={premium || theme.themed ? "min-h-full" : "min-h-full bg-slate-50"}
      style={premium ? premiumStyle : theme.style}
      data-funnel={premium ? "branded" : undefined}
    >
      {premium ? (
        <FunnelBrandHeader
          orgName={definition.organization.name}
          logoText={chrome.logoText}
          configuratorName={definition.configurator.name}
          phone={definition.organization.salesPhone}
          email={definition.organization.salesEmail}
          accent={chrome.accent}
          text={chrome.text}
          muted={chrome.muted}
          steps={definition.steps.map((item) => ({ id: item.id, title: item.title }))}
          currentStep={session.currentStep}
          showStepper={showWizard}
          canSwitch={canSwitch}
          mode={session.mode}
          onMode={switchMode}
          onJump={(index) => void persist({ currentStep: index })}
        />
      ) : (
      <header
        className={
          theme.themed
            ? "border-b border-black/10"
            : "border-b border-slate-200 bg-slate-950 text-white"
        }
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p
              className={
                theme.themed
                  ? "text-xs uppercase tracking-[0.16em]"
                  : "text-xs uppercase tracking-[0.16em] text-amber-400"
              }
              style={theme.themed ? { color: accent } : undefined}
            >
              {definition.organization.name}
            </p>
            <p className="text-lg font-medium">{definition.configurator.name}</p>
          </div>
          {isCatalog && !done ? (
            <p className={`rounded-full px-3 py-1 text-sm ${theme.themed ? "bg-black/5" : "bg-white/10"}`}>
              {quoteLineCount(session.customization)} au devis
            </p>
          ) : null}
          {canSwitch ? (
            <div className={`flex rounded-full p-1 text-sm ${theme.themed ? "bg-black/5" : "bg-white/10"}`}>
              <button
                type="button"
                onClick={() => switchMode("wizard")}
                className={`rounded-full px-3 py-1 ${
                  session.mode === "wizard"
                    ? theme.themed
                      ? "text-white"
                      : "bg-white text-slate-950"
                    : ""
                }`}
                style={theme.themed && session.mode === "wizard" ? { background: accent } : undefined}
              >
                Parcours
              </button>
              <button
                type="button"
                onClick={() => switchMode("chat")}
                className={`rounded-full px-3 py-1 ${
                  session.mode === "chat"
                    ? theme.themed
                      ? "text-white"
                      : "bg-white text-slate-950"
                    : ""
                }`}
                style={theme.themed && session.mode === "chat" ? { background: accent } : undefined}
              >
                Assistant
              </button>
            </div>
          ) : null}
        </div>
        {showWizard ? (
          <div className="mx-auto max-w-5xl px-5 pb-4">
            <div className="flex gap-2">
              {definition.steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1 flex-1 rounded-full ${theme.themed ? "bg-black/10" : "bg-white/15"}`}
                >
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
            <p className={theme.themed ? "mt-2 text-xs opacity-70" : "mt-2 text-xs text-slate-300"}>
              Étape {(session.currentStep ?? 0) + 1} / {definition.steps.length}, {step?.title}
            </p>
          </div>
        ) : null}
      </header>
      )}

      <main className={premium ? "mx-auto max-w-6xl px-4 py-8 lg:px-6" : "mx-auto max-w-5xl px-5 py-8"}>
        <div className={premium && showWizard ? "lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-10" : ""}>
        <div>
        {session.currentStep >= 1 && !session.submittedQuoteId ? (
          <ContactCapture
            draft={session.contactDraft}
            firstName={contact.name}
            accent={cta}
            themed={premium || theme.themed}
            premium={premium}
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
              accent={cta}
              themed={premium || theme.themed}
            />
            {showChatSuggestions ? (
              <SuggestionsPanel
                suggestions={suggestions}
                selectedId={session.selectedSuggestionId}
                onSelect={(id) => persist({ selectedSuggestionId: id })}
                onNeedLoad={() => loadSuggestions()}
                accent={premium || theme.themed ? accent : undefined}
                emphasis={premium}
              />
            ) : null}
          </div>
        ) : null}

        {showWizard && step ? (
          <section>
            {premium ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: chrome.accent }}>
                Étape {session.currentStep + 1} sur {definition.steps.length}
              </p>
            ) : null}
            <h1 className={premium ? "mt-1 text-3xl font-semibold tracking-tight sm:text-4xl" : "text-3xl font-semibold tracking-tight"}>
              {step.title}
            </h1>
            {step.subtitle ? (
              <p className={premium ? "mt-2 max-w-2xl text-base" : "mt-2 text-slate-600"} style={premium ? { color: chrome.muted } : undefined}>
                {step.subtitle}
              </p>
            ) : null}
            {premium && recap.length ? (
              <p className="mt-3 text-sm lg:hidden" style={{ color: chrome.muted }}>
                {recap[recap.length - 1]?.label} · {recap[recap.length - 1]?.value}
              </p>
            ) : null}

            {step.screenType === "questions" ? (
              <div className={premium ? "mt-8 grid gap-6 sm:grid-cols-2" : "mt-8 space-y-6"}>
                {step.questions.map((q) => (
                  <div
                    key={q.id}
                    className={
                      premium && q.type !== "number" && q.type !== "select" ? "sm:col-span-2" : undefined
                    }
                  >
                  <QuestionField
                    question={q}
                    value={answers[q.key]}
                    error={errors[q.key]}
                    accent={accent}
                    premium={premium}
                    text={premium ? chrome.text : undefined}
                    muted={premium ? chrome.muted : undefined}
                    onChange={(value) =>
                      setSession((s) =>
                        s ? { ...s, answers: { ...s.answers, [q.key]: value } } : s,
                      )
                    }
                  />
                  </div>
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
                accent={premium || theme.themed ? accent : undefined}
                emphasis={premium}
              />
            ) : null}

            {step.screenType === "customize" ? (
              <CustomizePanel
                suggestions={suggestions}
                catalog={definition.products}
                selectedId={session.selectedSuggestionId}
                customization={session.customization}
                canRemove={isCatalog}
                premium={premium}
                onChange={(customization) => persist({ customization })}
                onUpload={uploadPlan}
                fileError={errors.file}
              />
            ) : null}

            {step.screenType === "contact" ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Field premium={premium} label="Nom" value={contact.name} onChange={(v) => setContact({ ...contact, name: v })} />
                <Field premium={premium} label="Email" type="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
                <Field premium={premium} label="Téléphone" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
                <Field premium={premium} label="Société" value={contact.company} onChange={(v) => setContact({ ...contact, company: v })} />
                <label className="sm:col-span-2 flex items-start gap-2 text-sm text-slate-600">
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
            <div
              className={
                premium
                  ? "sticky bottom-0 z-20 -mx-4 mt-8 flex items-center justify-between border-t bg-white/95 px-4 py-3 backdrop-blur lg:static lg:mx-0 lg:mt-10 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0"
                  : "mt-10 flex items-center justify-between"
              }
              style={premium ? { borderColor: "#E1E7EC" } : undefined}
            >
              <button
                type="button"
                onClick={goBack}
                disabled={session.currentStep === 0}
                className="text-sm font-medium text-slate-500 disabled:opacity-40"
              >
                Retour
              </button>
              {step.screenType === "contact" ? (
                <button
                  type="button"
                  onClick={submit}
                  disabled={busy}
                  className={primaryButtonClass}
                  style={primaryButtonStyle}
                >
                  {busy ? "Envoi…" : isCatalog ? "Envoyer ma demande de devis" : premium ? "Recevoir mon devis" : "Envoyer ma demande"}
                  {premium && !busy ? <FunnelContinueIcon /> : null}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className={primaryButtonClass}
                  style={primaryButtonStyle}
                >
                  {isCatalog && step.screenType === "customize" ? "Demander un devis" : "Continuer"}
                  {premium ? <FunnelContinueIcon /> : null}
                </button>
              )}
            </div>
            )}
          </section>
        ) : null}
        </div>
        {premium && showWizard ? (
          <FunnelBrief
            lines={recap}
            phone={definition.organization.salesPhone}
            email={definition.organization.salesEmail}
            accent={chrome.accent}
            muted={chrome.muted}
          />
        ) : null}
        </div>
      </main>
      {premium ? <FunnelCredit muted={chrome.muted} /> : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  premium,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  premium?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          premium
            ? "w-full rounded-xl border border-[#E1E7EC] bg-white px-3 py-3 text-base outline-none"
            : "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-amber-500/30 focus:ring-4"
        }
      />
    </label>
  );
}

function QuestionField({
  question,
  value,
  error,
  onChange,
  accent,
  premium,
  text,
  muted,
}: {
  question: WizardQuestion;
  value: unknown;
  error?: string;
  onChange: (value: Answers[string]) => void;
  accent: string;
  premium?: boolean;
  text?: string;
  muted?: string;
}) {
  const choices = question.options.choices ?? [];
  const controlClass = premium
    ? "w-full rounded-xl border border-[#E1E7EC] bg-white px-3 py-3 text-base outline-none"
    : "w-full rounded-lg border border-slate-200 bg-white px-3 py-2";

  if (question.type === "visual_choice") {
    return (
      <VisualChoiceGrid
        label={question.label}
        helpText={question.helpText}
        choices={choices}
        value={value}
        error={error}
        accent={accent}
        text={text}
        muted={muted}
        onChange={(next) => onChange(next)}
      />
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
                aria-pressed={on}
                onClick={() =>
                  onChange(on ? selected.filter((v) => v !== choice.value) : [...selected, choice.value])
                }
                className="rounded-full border px-3 py-1.5 text-sm"
                style={
                  on
                    ? { borderColor: accent, background: accent, color: "#fff" }
                    : { borderColor: "#E1E7EC", background: "#fff", color: text }
                }
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
          className={controlClass}
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
            className={controlClass}
          />
          {question.options.unit ? (
            <span className={premium ? "shrink-0 text-sm font-medium" : "text-slate-500"} style={premium ? { color: muted } : undefined}>
              {question.options.unit}
            </span>
          ) : null}
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
        className={controlClass}
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
  accent,
  emphasis,
}: {
  suggestions: Suggestion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNeedLoad: () => void;
  accent?: string;
  emphasis?: boolean;
}) {
  useEffect(() => {
    if (!suggestions.length) onNeedLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!suggestions.length) {
    return (
      <p className="mt-8 text-slate-500">
        {emphasis ? "Préparation des configurations adaptées à votre brief…" : "Calcul des configurations…"}
      </p>
    );
  }

  return (
    <div className={emphasis ? "mt-8 grid gap-4 sm:grid-cols-2" : "mt-8 grid gap-4 md:grid-cols-3"}>
      {suggestions.map((s) => {
        const selected = selectedId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`overflow-hidden rounded-xl border text-left ${
              selected && !accent ? "border-amber-500 bg-amber-50 ring-4 ring-amber-500/15" : "border-slate-200 bg-white"
            } ${emphasis ? "" : "p-5"}`}
            style={accent ? selectionStyle(accent, selected) : undefined}
          >
            {emphasis ? (
              <SuggestionCover src={s.imageUrl ?? s.products.find((product) => product.imageUrl)?.imageUrl ?? null} />
            ) : null}
            <span className={emphasis ? "block p-5" : "block"}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent ?? "#b45309" }}>
              Adapté à votre brief
            </p>
            <h3 className="mt-1 text-lg font-semibold">{s.headline ?? s.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{s.description}</p>
            <p className="mt-4 text-sm font-medium">{formatPrice(s.priceMin, s.priceMax)}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {s.products.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-slate-200"
                    />
                  ) : null}
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                </li>
              ))}
            </ul>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SuggestionCover({ src }: { src: string | null }) {
  if (!src) return <span className="block aspect-[16/9] bg-[#E7EDF1]" />;
  return (
    <span className="block aspect-[16/9] overflow-hidden bg-[#E7EDF1]">
      {/* Photos catalogue déjà hébergées par le marchand. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </span>
  );
}

function CustomizePanel({
  suggestions,
  catalog,
  selectedId,
  customization,
  canRemove,
  premium,
  onChange,
  onUpload,
  fileError,
}: {
  suggestions: Suggestion[];
  catalog: Product[];
  selectedId: string | null;
  customization: Customization;
  canRemove?: boolean;
  premium?: boolean;
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
    <div className="mt-8 space-y-6">
      {products.map((product) => (
        <div key={product.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  className="h-20 w-20 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                />
              ) : null}
              <div className="min-w-0">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-slate-500">{formatPrice(product.priceMin, product.priceMax)}</p>
                {product.description ? (
                  <ProductHtml html={product.description} className="mt-1 text-slate-500" clamp />
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
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
                className="text-xs text-slate-400 hover:text-rose-700"
              >
                Retirer
              </button>
            ) : null}
            </div>
          </div>
          {product.images.length > 1 ? (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {product.images.slice(0, 6).map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt ?? ""}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-md object-cover ring-1 ring-slate-200"
                />
              ))}
            </div>
          ) : null}
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
      {extraLines.map((line) => (
        <div key={line.externalId} className="rounded-xl border border-dashed border-slate-200 bg-white p-5">
          <p className="font-medium">{line.name}</p>
          {line.variation ? <p className="mt-1 text-sm text-slate-500">{line.variation}</p> : null}
          <p className="mt-2 text-sm text-slate-500">Quantité {line.quantity}</p>
        </div>
      ))}
      {!products.length && !extraLines.length ? (
        <p className="text-sm text-slate-500">Aucun produit dans cette demande pour l’instant.</p>
      ) : null}
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">{premium ? "Plan de masse (PDF ou image)" : "Plan (PDF ou image)"}</span>
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
      <div className="min-h-[22rem] space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        {messages.length === 0 ? (
          <div className="space-y-2 text-slate-600">
            <p className="font-medium text-slate-900">
              Bonjour, décrivez-moi votre projet{orgName ? ` pour ${orgName}` : ""}.
            </p>
            <p className="text-sm text-slate-500">
              Une phrase suffit — surface, charges, hauteur, délai. Nous préparons le brief à partir du catalogue.
            </p>
          </div>
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
          placeholder="Décrivez votre besoin…"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2"
        />
        <button
          type="submit"
          disabled={busy}
          className={
            themed
              ? "rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              : "rounded-lg bg-[#E85D04] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
  premium,
}: {
  draft: ContactDraft;
  firstName: string;
  onSave: (draft: ContactDraft) => Promise<void>;
  accent: string;
  themed: boolean;
  premium?: boolean;
}) {
  const [name, setName] = useState(draft.name ?? firstName ?? "");
  const [email, setEmail] = useState(draft.email ?? "");
  const saved = Boolean(draft.email);

  return (
    <form
      className={
        premium
          ? "mb-6 rounded-2xl border bg-white px-4 py-4"
          : "mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
      }
      style={premium ? { borderColor: "#E1E7EC" } : undefined}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        await onSave({ name: name.trim(), email: email.trim() });
      }}
    >
      {saved ? (
        <p className="text-sm text-slate-700">
          {draft.name ? `Merci ${draft.name}, ` : "Merci, "}votre configuration est sauvegardée
          {draft.email ? ` (${draft.email})` : ""}. Vous pourrez la reprendre même si vous fermez l’onglet.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-sm">
            Prénom
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Email pour recevoir le récap
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5"
            />
          </label>
          <button
            type="submit"
            className={
              themed
                ? "rounded-md px-3 py-2 text-sm text-white"
                : "rounded-md bg-slate-950 px-3 py-2 text-sm text-white"
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
