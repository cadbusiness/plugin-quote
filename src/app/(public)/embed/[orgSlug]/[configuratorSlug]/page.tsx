import type { Metadata } from "next";
import { ConfiguratorApp } from "@/components/configurator/configurator-app";
import { loadMerchantNames } from "@/lib/configurator/merchant-names";
import { merchantConfiguratorMetadata } from "@/lib/configurator/public-meta";

type Props = {
  params: Promise<{ orgSlug: string; configuratorSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, configuratorSlug } = await params;
  const path = `/c/${orgSlug}/${configuratorSlug}`;
  const names = await loadMerchantNames(orgSlug, configuratorSlug).catch(() => null);
  return merchantConfiguratorMetadata({
    orgName: names?.orgName || orgSlug,
    funnelName: names?.funnelName || "Devis",
    path,
    embedded: true,
  });
}

export default async function EmbedConfiguratorPage({ params }: Props) {
  const { orgSlug, configuratorSlug } = await params;
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <ConfiguratorApp orgSlug={orgSlug} configuratorSlug={configuratorSlug} embedded />
    </div>
  );
}
