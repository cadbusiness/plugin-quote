import { rootJsonLd } from "@/lib/marketing/site";

/** Marketing schema stays on the QuoteBuilder site. Merchant embed and /c/ pages do not render it. */
export function MarketingJsonLd() {
  const jsonLd = rootJsonLd();
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
