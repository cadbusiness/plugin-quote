export function slugify(input: string) {
  const slug = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "espace";
}

export async function uniqueSlug(
  exists: (slug: string) => Promise<boolean>,
  base: string,
) {
  let slug = slugify(base);
  let n = 2;
  while (await exists(slug)) {
    slug = `${slugify(base).slice(0, 44)}-${n}`;
    n += 1;
  }
  return slug;
}
