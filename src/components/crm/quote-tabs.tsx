import Link from "next/link";

export const QUOTE_TABS = [
  { id: "dossier", label: "Dossier" },
  { id: "projet", label: "Projet" },
  { id: "client", label: "Client" },
  { id: "echanges", label: "Échanges" },
  { id: "automations", label: "Automatisations" },
] as const;

export type QuoteTab = (typeof QUOTE_TABS)[number]["id"];

export function parseQuoteTab(value: string | undefined): QuoteTab {
  return QUOTE_TABS.some((tab) => tab.id === value) ? (value as QuoteTab) : "dossier";
}

export function quoteTabHref(quoteId: string, tab: QuoteTab) {
  return tab === "dossier" ? `/devis/${quoteId}` : `/devis/${quoteId}?tab=${tab}`;
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
    <nav className="flex flex-wrap items-center gap-4 border-b border-slate-200 px-4 lg:px-6">
      {QUOTE_TABS.map((tab) => {
        const on = tab.id === active;
        const count = counts[tab.id];
        return (
          <Link
            key={tab.id}
            href={quoteTabHref(quoteId, tab.id)}
            aria-current={on ? "page" : undefined}
            className={`-mb-px border-b-2 py-2.5 text-sm ${
              on
                ? "border-[#E85D04] font-medium text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
            {count !== undefined ? (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                  on ? "bg-orange-50 text-[#C2410C]" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
