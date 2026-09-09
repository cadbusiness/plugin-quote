import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturePage } from "@/components/marketing/feature-page";
import { FEATURES, getFeature } from "@/lib/marketing/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) return { title: "Fonctionnalité · QuoteBuilder" };
  return {
    title: `${feature.title} · QuoteBuilder`,
    description: feature.lead,
  };
}

export default async function FeatureDetailPage({ params }: Props) {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) notFound();
  return <FeaturePage feature={feature} />;
}
