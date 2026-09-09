import type { Customization, Product, StorefrontLine, Suggestion } from "@/lib/wizard/types";
import type { StorefrontCartLine } from "@/lib/integrations/storefront";

export function applyStorefrontCart(
  products: Product[],
  cart: StorefrontCartLine[],
  current: Customization,
): { customization: Customization; matched: Product[] } {
  const byExternal = new Map(
    products.filter((p) => p.externalId).map((p) => [p.externalId as string, p]),
  );
  const quantities = { ...current.quantities };
  const options = { ...current.options };
  const unmatched: StorefrontLine[] = [];
  const matched: Product[] = [];

  for (const line of cart) {
    const product = byExternal.get(line.id);
    if (product) {
      quantities[product.id] = line.qty;
      if (line.options && Object.keys(line.options).length) {
        options[product.id] = { ...(options[product.id] ?? {}), ...line.options };
      } else if (line.variation) {
        options[product.id] = { ...(options[product.id] ?? {}), variation: line.variation };
      }
      matched.push(product);
    } else {
      unmatched.push({
        externalId: line.id,
        name: line.name || `Produit ${line.id}`,
        quantity: line.qty,
        sku: line.sku,
        variation: line.variation,
        options: line.options,
      });
    }
  }

  return {
    customization: {
      ...current,
      quantities,
      options,
      storefrontLines: unmatched.length ? unmatched : current.storefrontLines,
    },
    matched,
  };
}

export function suggestionFromProducts(products: Product[], id = "storefront"): Suggestion | null {
  if (!products.length) return null;
  const prices = products.flatMap((p) => [p.priceMin, p.priceMax]).filter((n): n is number => n != null);
  return {
    id,
    name: "Votre sélection",
    headline: "Produits de votre liste",
    description: null,
    imageUrl: products[0]?.imageUrl ?? null,
    priceMin: prices.length ? Math.min(...prices) : null,
    priceMax: prices.length ? Math.max(...prices) : null,
    products,
  };
}
