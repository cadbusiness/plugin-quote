import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ShopProduct } from "@/lib/shops/types";
import { cx, SHOP_CARD, SHOP_CARD_LINK } from "@/lib/shops/storefront-style";
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
      <div className="aspect-[4/3] overflow-hidden bg-black/5">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-[color-mix(in_srgb,var(--shop-accent)_10%,transparent)]" />
        )}
      </div>
      <div className="space-y-1.5 px-5 py-4">
        <p className="font-semibold leading-snug tracking-tight">{product.name}</p>
        <p className="text-sm font-medium" style={{ color: "var(--shop-accent)" }}>
          {formatPrice(product.price_min, product.price_max, product.currency)}
        </p>
      </div>
    </>
  );
  const className = cx(SHOP_CARD, SHOP_CARD_LINK);
  if (editing) {
    return <div className={className}>{inner}</div>;
  }
  return (
    <Link href={`/b/${orgSlug}/${shopSlug}${productPath(product)}`} className={className}>
      {inner}
    </Link>
  );
}
