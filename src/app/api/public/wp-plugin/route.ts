import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const SUPABASE_INFO =
  "https://spgskgtycqxjziwjpjol.supabase.co/storage/v1/object/public/wp-plugin/info.json";

type PluginInfo = {
  name: string;
  slug: string;
  version: string;
  download_url: string;
  homepage?: string;
  requires?: string;
  tested?: string;
  requires_php?: string;
  last_updated?: string;
  sections?: { description?: string; changelog?: string };
};

async function fromSupabase(): Promise<PluginInfo | null> {
  try {
    const res = await fetch(SUPABASE_INFO, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = (await res.json()) as PluginInfo;
    if (!data?.version || !data?.download_url) return null;
    return data;
  } catch {
    return null;
  }
}

async function fromPublicFile(): Promise<PluginInfo | null> {
  try {
    const raw = await readFile(join(process.cwd(), "public", "wp-plugin", "info.json"), "utf8");
    return JSON.parse(raw) as PluginInfo;
  } catch {
    return null;
  }
}

function localFallback(appUrl: string): PluginInfo {
  return {
    name: "QuoteBuilder",
    slug: "quotebuilder-wp",
    version: "1.2.0",
    download_url: `${appUrl}/quotebuilder-wp.zip`,
    homepage: appUrl,
    requires: "6.0",
    tested: "6.7",
    requires_php: "8.0",
    last_updated: new Date().toISOString().slice(0, 10),
    sections: {
      description:
        "Embed QuoteBuilder (shortcode / bloc Gutenberg) et sync du catalogue WooCommerce.",
      changelog: "<h4>1.2.0</h4><ul><li>Mises à jour automatiques via Supabase / cloud QuoteBuilder.</li></ul>",
    },
  };
}

export async function GET() {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://quotebuilder-weld.vercel.app").replace(
    /\/$/,
    "",
  );

  const info = (await fromSupabase()) ?? (await fromPublicFile()) ?? localFallback(appUrl);

  return NextResponse.json(info, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
