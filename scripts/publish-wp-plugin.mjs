/**
 * Publie le zip + info.json dans le bucket Supabase `wp-plugin`.
 * Dès que c’est en ligne, les sites WordPress voient la mise à jour (updater.php).
 *
 * Usage :
 *   SUPABASE_SERVICE_ROLE_KEY=… npm run publish:wp-plugin
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://spgskgtycqxjziwjpjol.supabase.co"
).replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY manquant — impossible d’uploader le plugin.");
  process.exit(1);
}

const build = spawnSync("node", ["scripts/build-wp-plugin-zip.mjs"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const zipPath = join(root, "public", "quotebuilder-wp.zip");
const infoPath = join(root, "public", "wp-plugin", "info.json");

const zipBuf = await readFile(zipPath);
const infoRaw = await readFile(infoPath, "utf8");
const info = JSON.parse(infoRaw);

// download_url pointe vers Supabase (source de vérité BeautyHub-style).
info.download_url = `${supabaseUrl}/storage/v1/object/public/wp-plugin/quotebuilder-wp.zip`;
const infoBody = `${JSON.stringify(info, null, 2)}\n`;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function upload(path, body, contentType) {
  const { error } = await supabase.storage.from("wp-plugin").upload(path, body, {
    upsert: true,
    contentType,
    cacheControl: path.endsWith(".json") ? "300" : "3600",
  });
  if (error) {
    throw new Error(`${path}: ${error.message}`);
  }
}

await upload("quotebuilder-wp.zip", zipBuf, "application/zip");
await upload("info.json", infoBody, "application/json");

console.log(`Publié QuoteBuilder WP ${info.version}`);
console.log(`  info : ${supabaseUrl}/storage/v1/object/public/wp-plugin/info.json`);
console.log(`  zip  : ${info.download_url}`);
