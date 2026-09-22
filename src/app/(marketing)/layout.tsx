import { MarketingJsonLd } from "@/components/marketing/marketing-jsonld";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingShell>
      <MarketingJsonLd />
      {children}
    </MarketingShell>
  );
}
