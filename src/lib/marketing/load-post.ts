import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Drop QB Content YAML so `---` does not render as a rule. */
export function stripFrontmatter(source: string) {
  if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) return source;
  const match = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return match ? source.slice(match[0].length).replace(/^\r?\n+/, "") : source;
}

export function loadContentBody(slug: string, folder: "blog" | "secteurs" = "blog") {
  return stripFrontmatter(readFileSync(join(process.cwd(), "src/content", folder, `${slug}.md`), "utf8"));
}

export function loadPostBody(slug: string) {
  return loadContentBody(slug, "blog");
}
