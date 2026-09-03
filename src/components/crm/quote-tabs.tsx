import Link from "next/link";

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
  quoteId,
  active,
  counts = {},
}: {
  quoteId: string;
  active: QuoteTab;
  counts?: Partial<Record<QuoteTab, number>>;
}) {
  return (
    <nav className="flex items-end gap-6 overflow-x-auto border-b border-slate-200 px-4 lg:px-6">
      {QUOTE_TABS.map((tab) => {
        const on = tab.id === active;
        const count = counts[tab.id];
        return (
          <Link
            key={tab.id}
            href={quoteTabHref(quoteId, tab.id)}
            aria-current={on ? "page" : undefined}
            className={`relative flex shrink-0 items-center gap-1.5 py-2.5 text-sm ${
              on ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
            {count !== undefined ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                  on ? "bg-orange-50 text-[#C2410C]" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            ) : null}
            <span
              aria-hidden
              className={`absolute inset-x-0 -bottom-px h-0.5 ${on ? "bg-[#E85D04]" : "bg-transparent"}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
