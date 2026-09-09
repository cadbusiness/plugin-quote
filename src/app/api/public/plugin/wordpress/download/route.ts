import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { wordpressPluginRelease } from "@/lib/integrations/plugin-release";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const zip = await readFile(join(process.cwd(), "public", "quotebuilder-wp.zip"));
    const version = wordpressPluginRelease().version;
    return new Response(new Uint8Array(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="quotebuilder-wp-${version}.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Plugin introuvable", { status: 404 });
  }
}
