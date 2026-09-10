import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ShopProduct } from "@/lib/shops/types";
import { productPath } from "@/lib/shops/urls";

export function ProductCard({
  orgSlug,
  shopSlug,
  product,
  editing,
}: {
  orgSlug: string;
  shopSlug: string;
  product: ShopProduct;
  editing?: boolean;
}) {
  const inner = (
    <>
      {product.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image_url} alt={product.name} className="h-44 w-full object-cover" />
      ) : (
        <div className="h-44 bg-black/5" />
      )}
      <div className="px-4 py-3">
        <p className="font-medium">{product.name}</p>
        <p className="mt-1 text-sm opacity-70">{formatPrice(product.price_min, product.price_max, product.currency)}</p>
      </div>
    </>
  );
  if (editing) {
    return <div className="block overflow-hidden rounded-lg ring-1 ring-black/10">{inner}</div>;
  }
  return (
    <Link
      href={`/b/${orgSlug}/${shopSlug}${productPath(product)}`}
      className="block overflow-hidden rounded-lg ring-1 ring-black/10 hover:bg-black/5"
    >
      {inner}
    </Link>
  );
}
