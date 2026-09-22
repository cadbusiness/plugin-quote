import type { Metadata } from "next";
import { CaptureCard } from "@/components/configurator/capture-card";
import { publicFunnelRouteMetadata } from "@/lib/configurator/public-funnel-meta";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orgSlug: string; configuratorSlug: string }>;
  searchParams: Promise<{ qb_placeholder?: string; qb_promise?: string; qb_phone?: string }>;
};

function clip(value: string | undefined, max: number) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, configuratorSlug } = await params;
  return publicFunnelRouteMetadata(orgSlug, configuratorSlug, "embed");
}

export default async function CaptureEmbedPage({ params, searchParams }: Props) {
  const { orgSlug, configuratorSlug } = await params;
  const query = await searchParams;
  return (
    <CaptureCard
      orgSlug={orgSlug}
      configuratorSlug={configuratorSlug}
      placeholder={clip(query.qb_placeholder, 240)}
      promise={clip(query.qb_promise, 120)}
      phone={clip(query.qb_phone, 40)}
    />
  );
}
