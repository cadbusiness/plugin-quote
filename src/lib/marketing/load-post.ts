import { readFileSync } from "node:fs";
import { join } from "node:path";

export function loadPostBody(slug: string) {
  return readFileSync(join(process.cwd(), "src/content/blog", `${slug}.md`), "utf8");
}
