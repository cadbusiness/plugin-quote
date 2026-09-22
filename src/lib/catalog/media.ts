import { parseMediaRole, type ProductMediaRole } from "@/lib/catalog/media-roles";
import type { ProductImage } from "@/lib/integrations/types";

export function parseGallery(value: unknown, fallback?: string | null): ProductImage[] {
  const fromJson = Array.isArray(value)
    ? value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const src = "src" in item && typeof item.src === "string" ? item.src.trim() : "";
        if (!src) return [];
        const alt = "alt" in item && typeof item.alt === "string" ? item.alt : null;
        const role = parseMediaRole("role" in item ? item.role : null) ?? undefined;
        const image: ProductImage = { src, alt };
        if (role) image.role = role;
        return [image];
      })
    : [];
  if (fromJson.length) return fromJson;
  if (fallback) return [{ src: fallback, alt: null }];
  return [];
}

/**
 * La synchro Woo remplace la galerie, pas un rôle saisi à la main
 * quand l'image entrante n'a aucun signal (alt, fichier, meta).
 */
export function mergeImageRoles(incoming: ProductImage[], existing?: unknown): ProductImage[] {
  const prior = new Map(
    parseGallery(existing).flatMap((image) => (image.role ? [[image.src, image.role] as const] : [])),
  );
  return incoming.map((image) => {
    const explicit = image.roleExplicit === true && image.role;
    const role = (explicit ? image.role : prior.get(image.src) ?? image.role) as ProductMediaRole | undefined;
    const next: ProductImage = { src: image.src, alt: image.alt ?? null };
    if (role) next.role = role;
    return next;
  });
}

/** Photo produit pour les cartes. Sans rôle, on garde la couverture déjà enregistrée. */
export function productCover(images: ProductImage[], fallback?: string | null): string | null {
  const product = images.find((image) => image.role === "product");
  if (product) return product.src;
  if (!images.some((image) => image.role)) return fallback || images[0]?.src || null;
  return images[0]?.src || fallback || null;
}

export function withCover(images: ProductImage[], src: string) {
  const match = images.find((image) => image.src === src);
  if (!match) return images;
  return [match, ...images.filter((image) => image.src !== src)];
}

export function withoutImage(images: ProductImage[], src: string) {
  return images.filter((image) => image.src !== src);
}
