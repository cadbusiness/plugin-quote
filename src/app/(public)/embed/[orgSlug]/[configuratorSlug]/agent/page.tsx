import type { Metadata } from "next";
import { SiteAgent } from "@/components/configurator/site-agent";
import { publicFunnelRouteMetadata } from "@/lib/configurator/public-funnel-meta";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orgSlug: string; configuratorSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, configuratorSlug } = await params;
  return publicFunnelRouteMetadata(orgSlug, configuratorSlug, "embed");
}

export default async function AgentEmbedPage({ params }: Props) {
  const { orgSlug, configuratorSlug } = await params;
  return <SiteAgent orgSlug={orgSlug} configuratorSlug={configuratorSlug} />;
}
