import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { funnelDocumentTitle, funnelPageMetadata } from "@/lib/configurator/public-title";
import type { Database } from "@/lib/db/database.types";
import { pickPreferredBySlug, publicConfiguratorSlugs } from "@/lib/demo/public-slugs";
import { requireSupabaseEnv } from "@/lib/supabase/env";

export type PublicFunnelMeta = {
  orgName: string;
  configuratorName: string;
  sector: string | null;
  slug: string;
};

function anonClient() {
  const env = requireSupabaseEnv();
  return createClient<Database>(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Public name of an active funnel. Anon RLS already exposes this catalog. */
export const loadPublicFunnelMeta = cache(async function loadPublicFunnelMeta(
  orgSlug: string,
  configuratorSlug: string,
): Promise<PublicFunnelMeta | null> {
  const supabase = anonClient();
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", orgSlug)
    .maybeSingle();
  if (orgError || !org?.name?.trim()) return null;

  const slugs = publicConfiguratorSlugs(org.slug, configuratorSlug);
  const { data: matches, error: funnelError } = await supabase
    .from("configurators")
    .select("name, slug, sector")
    .eq("organization_id", org.id)
    .in("slug", slugs)
    .eq("is_active", true);
  if (funnelError) return null;
  const configurator = pickPreferredBySlug(matches, slugs);
  if (!configurator?.name?.trim()) return null;
  return {
    orgName: org.name.trim(),
    configuratorName: configurator.name.trim(),
    sector: configurator.sector?.trim() || null,
    slug: configurator.slug,
  };
});

export async function publicFunnelDocumentTitle(orgSlug: string, configuratorSlug: string) {
  try {
    const loaded = await loadPublicFunnelMeta(orgSlug, configuratorSlug);
    if (!loaded) return null;
    return funnelDocumentTitle({
      orgName: loaded.orgName,
      configuratorName: loaded.configuratorName,
      subject: loaded.sector || loaded.slug,
    });
  } catch {
    return null;
  }
}

const EMBED_NOINDEX: Metadata = { robots: { index: false, follow: false } };

export async function publicFunnelRouteMetadata(
  orgSlug: string,
  configuratorSlug: string,
  surface: "public" | "embed",
): Promise<Metadata> {
  try {
    const loaded = await loadPublicFunnelMeta(orgSlug, configuratorSlug);
    const meta = funnelPageMetadata(
      loaded
        ? {
            orgName: loaded.orgName,
            configuratorName: loaded.configuratorName,
            subject: loaded.sector || loaded.slug,
            canonicalPath: `/c/${orgSlug}/${configuratorSlug}`,
            index: surface === "public",
          }
        : null,
    );
    if (meta) return meta;
  } catch {
    // Unreachable catalog: leave the site default title in place.
  }
  return surface === "embed" ? EMBED_NOINDEX : {};
}
