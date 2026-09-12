"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { cx, isShopCta, SHOP_CONTAINER, SHOP_CTA } from "@/lib/shops/storefront-style";

export type StorefrontNavItem = { label: string; href: string };

export function StorefrontHeader({
  shopName,
  home,
  items,
  accent,
  background,
  text,
  editing,
  selected,
  onSelect,
}: {
  shopName: string;
  home: string;
  items: StorefrontNavItem[];
  accent: string;
  background: string;
  text: string;
  editing?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const cta = [...items].reverse().find(isShopCta) ?? null;
  const links = cta ? items.filter((item) => item !== cta) : items;

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const drawer =
    open && mounted && !editing
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] md:hidden"
            role="presentation"
            style={{
              ["--shop-bg" as string]: background,
              ["--shop-text" as string]: text,
              ["--shop-accent" as string]: accent,
              color: text,
            }}
          >
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
              className="absolute top-0 right-0 flex h-dvh max-h-dvh w-[min(calc(100vw-0.75rem),22rem)] max-w-[calc(100vw-0.75rem)] flex-col border-l border-black/10 shadow-2xl"
              style={{
                background,
                color: text,
                paddingTop: "env(safe-area-inset-top, 0px)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                paddingRight: "env(safe-area-inset-right, 0px)",
              }}
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 px-4">
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
              <nav
                aria-label="Navigation mobile"
                className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
              >
                {links.map((item) => (
                  <NavLink
                    key={`m-${item.href}-${item.label}`}
                    item={item}
                    pathname={pathname}
                    home={home}
                    stacked
                    inert={editing}
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
          </div>,
          document.body,
        )
      : null;

  return (
    <header
      className={cx(
        "relative sticky top-0 z-40 border-b border-black/10 backdrop-blur-md",
        editing && "cursor-pointer",
        editing && selected && "ring-2 ring-inset ring-[#E85D04]",
      )}
      style={{ background: "color-mix(in srgb, var(--shop-bg) 88%, transparent)" }}
      onClick={
        editing
          ? (event) => {
              event.preventDefault();
              onSelect?.();
            }
          : undefined
      }
    >
      {editing && selected ? (
        <span className="absolute top-1.5 left-3 z-10 rounded-full bg-[#E85D04] px-2 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">
          En-tête
        </span>
      ) : null}
      <div className={cx(SHOP_CONTAINER, "relative flex h-16 items-center gap-3")}>
        {editing ? (
          <span className="min-w-0 truncate text-base font-semibold tracking-tight">{shopName}</span>
        ) : (
          <Link href={home} className="min-w-0 truncate text-base font-semibold tracking-tight">
            {shopName}
          </Link>
        )}

        <nav aria-label="Navigation principale" className="ml-auto hidden items-center gap-0.5 md:flex">
          {links.map((item) => (
            <NavLink key={`${item.href}-${item.label}`} item={item} pathname={pathname} home={home} inert={editing} />
          ))}
          {cta ? (
            editing ? (
              <span className={cx(SHOP_CTA, "ml-2")} style={{ background: accent }}>
                {cta.label}
              </span>
            ) : (
              <Link href={cta.href} className={cx(SHOP_CTA, "ml-2")} style={{ background: accent }}>
                {cta.label}
              </Link>
            )
          ) : null}
        </nav>

        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 md:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={
            editing
              ? (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelect?.();
                }
              : () => setOpen((value) => !value)
          }
        >
          <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
          <span className="flex flex-col gap-1.5" aria-hidden>
            <span className={cx("block h-0.5 w-4 bg-current transition", open && "translate-y-[7px] rotate-45")} />
            <span className={cx("block h-0.5 w-4 bg-current transition", open && "opacity-0")} />
            <span className={cx("block h-0.5 w-4 bg-current transition", open && "-translate-y-[7px] -rotate-45")} />
          </span>
        </button>
      </div>
      {drawer}
    </header>
  );
}

function NavLink({
  item,
  pathname,
  home,
  stacked,
  inert,
  onNavigate,
}: {
  item: StorefrontNavItem;
  pathname: string;
  home: string;
  stacked?: boolean;
  inert?: boolean;
  onNavigate?: () => void;
}) {
  const active = item.href === home ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const className = cx(
    "rounded-md text-sm transition",
    stacked ? "min-h-11 px-3 py-3" : "px-2.5 py-1.5",
    active ? "bg-black/10 font-medium" : "hover:bg-black/5",
  );
  if (inert) {
    return <span className={className}>{item.label}</span>;
  }
  return (
    <Link href={item.href} onClick={onNavigate} className={className}>
      {item.label}
    </Link>
  );
}
