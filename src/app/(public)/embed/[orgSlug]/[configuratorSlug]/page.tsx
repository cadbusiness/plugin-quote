import { ConfiguratorApp } from "@/components/configurator/configurator-app";

export default async function EmbedConfiguratorPage({
  params,
}: {
  params: Promise<{ orgSlug: string; configuratorSlug: string }>;
}) {
  const { orgSlug, configuratorSlug } = await params;
  return <ConfiguratorApp orgSlug={orgSlug} configuratorSlug={configuratorSlug} embedded />;
}
