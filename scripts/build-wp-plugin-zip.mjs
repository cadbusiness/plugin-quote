import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const extensionsDir = join(root, "extensions");
const pluginDir = join(extensionsDir, "quotebuilder-wp");
const zipPath = join(extensionsDir, "quotebuilder-wp.zip");
// Servi tel quel depuis le dashboard : Boutiques → plugin WordPress.
const publicZipPath = join(root, "public", "quotebuilder-wp.zip");
const publicInfoDir = join(root, "public", "wp-plugin");
const publicInfoPath = join(publicInfoDir, "info.json");

const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://quotebuilder-weld.vercel.app").replace(
  /\/$/,
  "",
);
const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://spgskgtycqxjziwjpjol.supabase.co"
).replace(/\/$/, "");

await mkdir(extensionsDir, { recursive: true });
await mkdir(join(root, "public"), { recursive: true });
await mkdir(publicInfoDir, { recursive: true });
await rm(zipPath, { force: true });

const php = await readFile(join(pluginDir, "quotebuilder.php"), "utf8");
const versionMatch = php.match(/Version:\s*([0-9.]+)/);
const version = versionMatch?.[1] ?? "0.0.0";

const result = spawnSync("zip", ["-r", "-q", zipPath, "quotebuilder-wp"], {
  cwd: extensionsDir,
  stdio: "inherit",
});

if (result.status === 0) {
  await copyFile(zipPath, publicZipPath);
} else {
  // `zip` absent du runner : on garde la version committée dans public/
  await rm(zipPath, { force: true });
  await copyFile(publicZipPath, zipPath).catch(() => {});
}

const downloadFromSupabase = `${supabaseUrl}/storage/v1/object/public/wp-plugin/quotebuilder-wp.zip`;
const downloadFallback = `${appUrl}/quotebuilder-wp.zip`;

const info = {
  name: "QuoteBuilder",
  slug: "quotebuilder-wp",
  version,
  download_url: downloadFromSupabase,
  homepage: appUrl,
  requires: "6.0",
  tested: "6.7",
  requires_php: "8.0",
  last_updated: new Date().toISOString().slice(0, 10),
  sections: {
    description:
      "Embed QuoteBuilder (shortcode / bloc Gutenberg) et sync du catalogue WooCommerce. Les mises à jour sont poussées depuis le cloud QuoteBuilder.",
    changelog: `<h4>${version}</h4><ul><li>Release build ${new Date().toISOString().slice(0, 10)}.</li><li>Auto-update via bucket Supabase <code>wp-plugin</code>.</li></ul>`,
  },
  // Si le bucket n’a pas encore le zip, l’API / le plugin peut retomber sur le zip Vercel.
  download_url_fallback: downloadFallback,
};

await writeFile(publicInfoPath, `${JSON.stringify(info, null, 2)}\n`, "utf8");
console.log(`QuoteBuilder WP plugin ${version} → ${publicZipPath} + ${publicInfoPath}`);
