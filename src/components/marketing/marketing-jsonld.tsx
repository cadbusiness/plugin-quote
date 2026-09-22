import { rootJsonLd } from "@/lib/marketing/site";

/** Marketing schema stays on the product site, not on a merchant’s public devis. */
export function MarketingJsonLd() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd()) }} />
  );
}
