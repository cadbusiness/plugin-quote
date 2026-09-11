"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { cx, isShopCta, SHOP_CONTAINER, SHOP_CTA } from "@/lib/shops/storefront-style";

export type StorefrontNavItem = { label: string; href: string };

export function StorefrontHeader({
  shopName,
  home,
  items,
  accent,
}: {
  shopName: string;
  home: string;
  items: StorefrontNavItem[];
  accent: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const cta = [...items].reverse().find(isShopCta) ?? null;
  const links = cta ? items.filter((item) => item !== cta) : items;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className="sticky top-0 z-40 border-b border-black/10 backdrop-blur-md"
      style={{ background: "color-mix(in srgb, var(--shop-bg) 88%, transparent)" }}
    >
      <div className={cx(SHOP_CONTAINER, "flex h-16 items-center gap-3")}>
        <Link href={home} className="min-w-0 truncate text-base font-semibold tracking-tight">
          {shopName}
        </Link>

        <nav aria-label="Navigation principale" className="ml-auto hidden items-center gap-0.5 md:flex">
          {links.map((item) => (
            <NavLink key={`${item.href}-${item.label}`} item={item} pathname={pathname} home={home} />
          ))}
          {cta ? (
            <Link href={cta.href} className={cx(SHOP_CTA, "ml-2")} style={{ background: accent }}>
              {cta.label}
            </Link>
          ) : null}
        </nav>

        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 md:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
          <span className="flex flex-col gap-1.5" aria-hidden>
            <span className={cx("block h-0.5 w-4 bg-current transition", open && "translate-y-[7px] rotate-45")} />
            <span className={cx("block h-0.5 w-4 bg-current transition", open && "opacity-0")} />
            <span className={cx("block h-0.5 w-4 bg-current transition", open && "-translate-y-[7px] -rotate-45")} />
          </span>
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col border-l border-black/10 shadow-2xl"
            style={{ background: "var(--shop-bg)" }}
          >
            <div className="flex h-16 items-center justify-between border-b border-black/10 px-4">
              <p className="truncate text-sm font-semibold">{shopName}</p>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/10"
                onClick={() => setOpen(false)}
              >
                <span className="sr-only">Fermer le menu</span>
                <span aria-hidden className="text-xl leading-none">
                  ×
                </span>
              </button>
            </div>
            <nav aria-label="Navigation mobile" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              {links.map((item) => (
                <NavLink
                  key={`m-${item.href}-${item.label}`}
                  item={item}
                  pathname={pathname}
                  home={home}
                  stacked
                  onNavigate={() => setOpen(false)}
                />
              ))}
              {cta ? (
                <Link
                  href={cta.href}
                  className={cx(SHOP_CTA, "mt-3")}
                  style={{ background: accent }}
                  onClick={() => setOpen(false)}
                >
                  {cta.label}
                </Link>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function NavLink({
  item,
  pathname,
  home,
  stacked,
  onNavigate,
}: {
  item: StorefrontNavItem;
  pathname: string;
  home: string;
  stacked?: boolean;
  onNavigate?: () => void;
}) {
  const active = item.href === home ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cx(
        "rounded-md text-sm transition",
        stacked ? "px-3 py-3" : "px-2.5 py-1.5",
        active ? "bg-black/10 font-medium" : "hover:bg-black/5",
      )}
    >
      {item.label}
    </Link>
  );
}
