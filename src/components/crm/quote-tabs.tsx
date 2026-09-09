"use client";

import { LocalTabNav } from "@/components/ui/local-tabs";

export const QUOTE_TABS = [
  { id: "dossier", label: "Dossier" },
  { id: "projet", label: "Projet" },
  { id: "client", label: "Client" },
  { id: "echanges", label: "Échanges" },
  { id: "automations", label: "Automatisations" },
] as const;

export type QuoteTab = (typeof QUOTE_TABS)[number]["id"];
export type QuoteCompose = "mail" | "call";

export function parseQuoteTab(value: string | undefined): QuoteTab {
  return QUOTE_TABS.some((tab) => tab.id === value) ? (value as QuoteTab) : "dossier";
}

export function parseQuoteCompose(value: string | undefined): QuoteCompose | null {
  return value === "mail" || value === "call" ? value : null;
}

export function quoteTabHref(quoteId: string, tab: QuoteTab, compose?: QuoteCompose | null) {
  const params = new URLSearchParams();
  if (tab !== "dossier") params.set("tab", tab);
  if (compose) params.set("compose", compose);
  const qs = params.toString();
  return qs ? `/devis/${quoteId}?${qs}` : `/devis/${quoteId}`;
}

export function QuoteTabs({
  active,
  onSelect,
  counts = {},
}: {
  quoteId: string;
  active: QuoteTab;
  onSelect: (tab: QuoteTab) => void;
  counts?: Partial<Record<QuoteTab, number>>;
}) {
  return <LocalTabNav items={QUOTE_TABS} active={active} onSelect={onSelect} counts={counts} />;
}
