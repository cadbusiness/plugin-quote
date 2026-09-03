import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const extensionsDir = join(root, "extensions");
const zipPath = join(extensionsDir, "quotebuilder-wp.zip");
// Servi tel quel depuis le dashboard : Boutiques → plugin WordPress.
const publicZipPath = join(root, "public", "quotebuilder-wp.zip");

await mkdir(extensionsDir, { recursive: true });
await mkdir(join(root, "public"), { recursive: true });
await rm(zipPath, { force: true });

const result = spawnSync("zip", ["-r", "-q", zipPath, "quotebuilder-wp"], {
  cwd: extensionsDir,
  stdio: "inherit",
});
if (result.status === 0) {
  await copyFile(zipPath, publicZipPath);
} else {
  // `zip` absent du runner : on garde la version committée dans public/
  // plutôt que de servir un fichier vide au téléchargement.
  await rm(zipPath, { force: true });
  await copyFile(publicZipPath, zipPath).catch(() => {});
}
