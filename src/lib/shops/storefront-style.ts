import type { CSSProperties } from "react";
import { boxStyle, type BoxStyleInput } from "@/lib/shops/layout";

const ZERO_SPACING = /^(0(px|rem|em|%)?)(\s+0(px|rem|em|%)?)*$/i;
const OVERLAY_POSITIONS = new Set(["absolute", "fixed", "sticky"]);

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function isMeaningfulCss(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return false;
  return !ZERO_SPACING.test(trimmed);
}

export function publicBoxInput(input: BoxStyleInput): BoxStyleInput {
  const position = input.position?.trim().toLowerCase();
  const overlay = position ? OVERLAY_POSITIONS.has(position) : false;
  return {
    ...input,
    padding: isMeaningfulCss(input.padding) ? input.padding : undefined,
    margin: isMeaningfulCss(input.margin) ? input.margin : undefined,
    position: overlay ? undefined : input.position,
    top: overlay ? undefined : input.top,
    left: overlay ? undefined : input.left,
    zIndex: overlay ? undefined : input.zIndex,
  };
}

export function renderBoxStyle(
  input: BoxStyleInput,
  extra?: CSSProperties,
  opts?: { sanitize?: boolean },
): CSSProperties {
  const source = opts?.sanitize === false ? input : publicBoxInput(input);
  return { ...boxStyle(source), ...extra };
}

export function sectionPadClass(padding?: string) {
  return isMeaningfulCss(padding) ? "" : "py-12 md:py-16";
}

export function heroPadClass(padding?: string) {
  return isMeaningfulCss(padding) ? "" : "py-16 md:py-20 lg:py-24";
}

export function isShopCta(item: { label: string; href: string }) {
  return /devis/i.test(item.label) || /\/devis(?:\/|$|\?)/.test(item.href) || /\/c\//.test(item.href);
}

export const SHOP_CONTAINER = "mx-auto w-full max-w-6xl px-4 lg:px-6";

export const SHOP_HEADING = {
  h1: "font-semibold tracking-tight text-4xl sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]",
  h2: "font-semibold tracking-tight text-2xl md:text-3xl",
  h3: "font-semibold tracking-tight text-lg md:text-xl",
} as const;

export const SHOP_BODY =
  "max-w-3xl text-base leading-7 text-[color-mix(in_srgb,var(--shop-text)_78%,var(--shop-bg))]";

export const SHOP_CTA =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90";

export const SHOP_CTA_SECONDARY =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold ring-1 ring-inset ring-black/15 transition hover:bg-black/5";

export const SHOP_CARD =
  "rounded-2xl border border-black/10 bg-[color-mix(in_srgb,var(--shop-bg)_88%,white)] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_rgba(15,23,42,0.05)]";

export const SHOP_CARD_LINK =
  "group block overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(15,23,42,0.10)]";
