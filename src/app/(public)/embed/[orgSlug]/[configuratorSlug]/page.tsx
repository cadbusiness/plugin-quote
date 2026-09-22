import type { Metadata } from "next";
import { ConfiguratorApp } from "@/components/configurator/configurator-app";
import { publicFunnelDocumentTitle, publicFunnelRouteMetadata } from "@/lib/configurator/public-funnel-meta";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orgSlug: string; configuratorSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, configuratorSlug } = await params;
  return publicFunnelRouteMetadata(orgSlug, configuratorSlug, "embed");
}

export default async function EmbedConfiguratorPage({ params }: Props) {
  const { orgSlug, configuratorSlug } = await params;
  const title = await publicFunnelDocumentTitle(orgSlug, configuratorSlug);
  return (
    <>
      {title ? <p className="sr-only">{title}</p> : null}
      <ConfiguratorApp orgSlug={orgSlug} configuratorSlug={configuratorSlug} embedded />
    </>
  );
}
