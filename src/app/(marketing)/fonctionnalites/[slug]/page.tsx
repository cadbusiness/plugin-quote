import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturePage } from "@/components/marketing/feature-page";
import { FEATURES, getFeature } from "@/lib/marketing/content";
import { pageMetadata } from "@/lib/marketing/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) return { title: "Fonctionnalité" };
  return pageMetadata({
    title: feature.title,
    description: feature.lead,
    path: `/fonctionnalites/${feature.slug}`,
  });
}

export default async function FeatureDetailPage({ params }: Props) {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) notFound();
  return <FeaturePage feature={feature} />;
}
