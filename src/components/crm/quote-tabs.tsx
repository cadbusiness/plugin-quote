"use client";

import { LocalTabNav } from "@/components/ui/local-tabs";
import { QUOTE_TABS, type QuoteTab } from "@/lib/crm/quote-tabs";

export { QUOTE_TABS, parseQuoteCompose, parseQuoteTab, quoteTabHref } from "@/lib/crm/quote-tabs";
export type { QuoteCompose, QuoteTab } from "@/lib/crm/quote-tabs";

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
