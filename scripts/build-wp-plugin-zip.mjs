import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const extensionsDir = join(root, "extensions");
const pluginDir = join(extensionsDir, "quotebuilder-wp");
const zipPath = join(extensionsDir, "quotebuilder-wp.zip");
const publicZipPath = join(root, "public", "quotebuilder-wp.zip");
const publicMetaPath = join(root, "public", "quotebuilder-wp.json");

const php = await readFile(join(pluginDir, "quotebuilder.php"), "utf8");
const version = php.match(/^\s*\*\s*Version:\s*(\S+)/m)?.[1] ?? "0.0.0";
const requires = php.match(/^\s*\*\s*Requires at least:\s*(\S+)/m)?.[1] ?? "6.0";
const requiresPhp = php.match(/^\s*\*\s*Requires PHP:\s*(\S+)/m)?.[1] ?? "7.4";

await mkdir(extensionsDir, { recursive: true });
await mkdir(join(root, "public"), { recursive: true });
await rm(zipPath, { force: true });

const result = spawnSync("zip", ["-r", "-q", zipPath, "quotebuilder-wp", "-x", "*.zip"], {
  cwd: extensionsDir,
  stdio: "inherit",
});
if (result.status === 0) {
  await copyFile(zipPath, publicZipPath);
} else {
  await rm(zipPath, { force: true });
  await copyFile(publicZipPath, zipPath).catch(() => {});
}

await writeFile(
  publicMetaPath,
  JSON.stringify(
    {
      slug: "quotebuilder-wp",
      name: "QuoteBuilder",
      version,
      requires,
      requires_php: requiresPhp,
      tested: "6.8",
      author: "QuoteBuilder",
      changelog: `<h4>${version}</h4><ul><li>QuoteBuilder n’est pas dans le catalogue WordPress : bandeau de mise à jour + zip à téléverser.</li><li>Admin bord à bord, notification en bandeau.</li></ul>`,
    },
    null,
    2,
  ) + "\n",
);
