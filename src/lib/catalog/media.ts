import type { ProductImage } from "@/lib/integrations/types";

export function parseGallery(value: unknown, fallback?: string | null): ProductImage[] {
  const fromJson = Array.isArray(value)
    ? value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const src = "src" in item && typeof item.src === "string" ? item.src.trim() : "";
        if (!src) return [];
        const alt = "alt" in item && typeof item.alt === "string" ? item.alt : null;
        return [{ src, alt }];
      })
    : [];
  if (fromJson.length) return fromJson;
  if (fallback) return [{ src: fallback, alt: null }];
  return [];
}

export function withCover(images: ProductImage[], src: string) {
  const match = images.find((image) => image.src === src);
  if (!match) return images;
  return [match, ...images.filter((image) => image.src !== src)];
}

export function withoutImage(images: ProductImage[], src: string) {
  return images.filter((image) => image.src !== src);
}
