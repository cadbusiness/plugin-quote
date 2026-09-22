import { rootJsonLd } from "@/lib/marketing/site";

/** Product schema stays on the marketing site, not on a merchant devis or embed. */
export function MarketingJsonLd() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd()) }} />;
}
